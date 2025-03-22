import { auth } from "@/auth";
import { db } from "@/db";
import { users, messages, userProfile, starredChats, tradeSession } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET handler to fetch all chats for the current user
export async function GET() {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    // Find all trade sessions where the current user is involved
    const userId = session.user.id;
    
    // Get trade sessions where the user is either vendor or customer
    const userTradeSessions = await db
      .select()
      .from(tradeSession)
      .where(or(eq(tradeSession.vendor_id, userId), eq(tradeSession.customer_id, userId)));
    
    // Get all starred conversations for this user
    const starredUserChats = await db
      .select()
      .from(starredChats)
      .where(eq(starredChats.userId, userId));

    // Create a set of starred conversation IDs for quick lookup
    const starredConversationIds = new Set(
      starredUserChats.map(chat => chat.conversationId)
    );

    // Create a result array to hold all conversations
    const conversations = [];
    
    for (const session of userTradeSessions) {
      const sessionId = session.id;
      const isVendor = session.vendor_id === userId;
      const otherUserId = isVendor ? session.customer_id : session.vendor_id;
      
      // Get the latest message for this session
      const latestMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.session_id, sessionId))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      if (latestMessages.length === 0) continue;
      
      const latestMessage = latestMessages[0];
      
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
      
      // Get other user profile
      const [otherUserProfile, otherUser] = await Promise.all([
        db.select().from(userProfile).where(eq(userProfile.auth_id, otherUserId)),
        db.select().from(users).where(eq(users.id, otherUserId))
      ]);
      
      conversations.push({
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
        starred: starredConversationIds.has(sessionId),
      });
    }

    return NextResponse.json(conversations);
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