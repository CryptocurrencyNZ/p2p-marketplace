import { auth } from "@/auth";
import { db } from "@/db";
import { users, messages, userProfile, starredChats, tradeSession } from "@/db/schema";
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

    // Get the conversation IDs (which are trade session IDs)
    const sessionIds = starredUserChats.map(chat => chat.conversationId);

    // Get the trade sessions for these conversations
    const tradeSessions = await db
      .select()
      .from(tradeSession)
      .where(inArray(tradeSession.id, sessionIds));
      
    if (tradeSessions.length === 0) {
      return NextResponse.json([]);
    }

    // Build the conversations list
    const conversations = [];
    
    for (const tradeData of tradeSessions) {
      // Get the latest message for this trade session
      const latestMessage = await db
        .select()
        .from(messages)
        .where(eq(messages.session_id, tradeData.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
        
      if (latestMessage.length === 0) continue;
      
      // Determine the other user in the conversation
      const otherUserId = tradeData.vendor_id === userId 
        ? tradeData.customer_id 
        : tradeData.vendor_id;
      
      // Get profile info for the other user
      const [otherUserProfile, otherUser] = await Promise.all([
        db.select().from(userProfile).where(eq(userProfile.auth_id, otherUserId)),
        db.select().from(users).where(eq(users.id, otherUserId))
      ]);
      
      // Count unread messages
      const unreadMessages = await db
        .select({ count: messages })
        .from(messages)
        .where(
          and(
            eq(messages.session_id, tradeData.id),
            eq(messages.isRead, false),
            // Messages from the other user that current user hasn't read
            eq(messages.fromVender, tradeData.vendor_id === otherUserId)
          )
        );
        
      const unreadCount = unreadMessages.length;
      
      // Build conversation object
      conversations.push({
        id: tradeData.id,
        user: {
          id: otherUserId,
          name: otherUserProfile[0]?.username || otherUser[0]?.name || "Unknown",
          address: otherUserId.substring(0, 6) + "..." + otherUserId.substring(otherUserId.length - 4),
          avatar: otherUserProfile[0]?.avatar || "/api/placeholder/40/40",
          status: "offline", // In a real app, this would come from a user status table
        },
        lastMessage: latestMessage[0].content,
        timestamp: formatTimestamp(latestMessage[0].createdAt),
        unread: unreadCount,
        starred: true, // All conversations here are starred by definition
      });
    }

    return NextResponse.json(conversations);
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