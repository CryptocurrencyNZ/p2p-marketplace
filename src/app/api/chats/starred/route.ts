import { auth } from "@/auth";
import { db } from "@/db";
import { users, messages, userProfile, starredChats } from "@/db/schema";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET handler to fetch all starred chats for the current user
export async function GET() {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const userId = session.user.id;

    // Get all starred conversations for this user
    const starredUserChats = await db
      .select()
      .from(starredChats)
      .where(eq(starredChats.userId, userId));

    if (starredUserChats.length === 0) {
      return NextResponse.json([]);
    }

    // Get the conversation IDs
    const conversationIds = starredUserChats.map(chat => chat.conversationId);

    // Get the most recent message from each conversation
    const recentMessages = await db
      .select({
        id: messages.conversationID,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
      })
      .from(messages)
      .where(
        and(
          inArray(messages.conversationID, conversationIds),
          or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
        )
      )
      .orderBy(desc(messages.createdAt));

    // Group messages by conversation and only keep the most recent
    const conversationsMap = new Map();
    
    for (const message of recentMessages) {
      const conversationId = message.id;
      
      // Skip messages without a conversation ID
      if (!conversationId) continue;
      
      // If we already have this conversation, skip (we're only interested in the most recent message)
      if (conversationsMap.has(conversationId)) continue;
      
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

      // Get other user profile
      const otherUserProfile = await db
        .select()
        .from(userProfile)
        .where(eq(userProfile.auth_id, otherUserId));
      
      const otherUser = await db
        .select()
        .from(users)
        .where(eq(users.id, otherUserId));

      conversationsMap.set(conversationId, {
        id: conversationId,
        user: {
          id: otherUserId,
          name: otherUserProfile[0]?.username || otherUser[0]?.name || "Unknown",
          address: otherUserId.substring(0, 6) + "..." + otherUserId.substring(otherUserId.length - 4),
          avatar: otherUserProfile[0]?.avatar || "/api/placeholder/40/40",
          status: "offline", // In a real app, this would come from a user status table
        },
        lastMessage: message.content,
        timestamp: formatTimestamp(message.createdAt),
        unread: message.receiverId === userId && !message.isRead ? 1 : 0,
        starred: true, // All conversations here are starred by definition
      });
    }

    return NextResponse.json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error("Error fetching starred chats:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// Helper function to format timestamps
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString();
  }
} 