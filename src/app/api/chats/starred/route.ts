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

    // Create a result array for starred conversations
    const starredSessions = [];

    // Process each starred session
    for (const starredChat of starredUserChats) {
      const sessionId = starredChat.conversationId;
      
      // Get the trade session info
      const tradeSessions = await db
        .select()
        .from(tradeSession)
        .where(eq(tradeSession.id, sessionId));
      
      if (tradeSessions.length === 0) continue;
      
      const tradeSessionData = tradeSessions[0];
      
      // Check if the user is part of this trade session
      const isVendor = tradeSessionData.vendor_id === userId;
      const isCustomer = tradeSessionData.customer_id === userId;
      
      if (!isVendor && !isCustomer) continue;
      
      // Get the other participant's ID
      const otherUserId = isVendor ? tradeSessionData.customer_id : tradeSessionData.vendor_id;
      
      // Get the latest message for this session
      const latestMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.session_id, sessionId))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      if (latestMessages.length === 0) continue;
      
      const latestMessage = latestMessages[0];
      
      // Get user profile info
      const [otherUserProfile, otherUser] = await Promise.all([
        db.select().from(userProfile).where(eq(userProfile.auth_id, otherUserId)),
        db.select().from(users).where(eq(users.id, otherUserId))
      ]);
      
      // Count unread messages where the current user is the recipient
      const unreadCount = await db
        .select({ count: messages })
        .from(messages)
        .where(
          and(
            eq(messages.session_id, sessionId),
            eq(messages.isRead, false),
            isVendor ? eq(messages.fromVender, false) : eq(messages.fromVender, true)
          )
        )
        .limit(1);
      
      starredSessions.push({
        id: sessionId,
        user: {
          id: otherUserId,
          name: otherUserProfile[0]?.username || otherUser[0]?.name || "Unknown",
          address: otherUserId.substring(0, 6) + "..." + otherUserId.substring(otherUserId.length - 4),
          avatar: otherUserProfile[0]?.avatar || "/api/placeholder/40/40",
          status: "offline", // In a real app, this would come from a user status table
        },
        lastMessage: latestMessage.content,
        timestamp: formatTimestamp(latestMessage.createdAt),
        unread: unreadCount[0]?.count || 0,
        starred: true, // All conversations here are starred by definition
      });
    }

    return NextResponse.json(starredSessions);
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