import { auth } from "@/auth";
import { db } from "@/db";
import { users, messages, userProfile, starredChats } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET handler to fetch all chats for the current user
export async function GET() {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    // Find all messages where the current user is either the sender or receiver
    const userId = session.user.id;
    const userChats = await db
      .select({
        id: messages.conversationID,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
      })
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    // Get all starred conversations for this user
    const starredUserChats = await db
      .select()
      .from(starredChats)
      .where(eq(starredChats.userId, userId));

    // Create a set of starred conversation IDs for quick lookup
    const starredConversationIds = new Set(
      starredUserChats.map(chat => chat.conversationId)
    );

    // Group messages by conversation
    const conversationsMap = new Map();
    
    for (const message of userChats) {
      const conversationId = message.id;
      
      // Skip messages without a conversation ID
      if (!conversationId) continue;
      
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

      if (!conversationsMap.has(conversationId)) {
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
          unread: 0,
          starred: starredConversationIds.has(conversationId),
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        conversationsMap.get(conversationId).unread += 1;
      }
    }

    return NextResponse.json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error("Error fetching chats:", error);
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