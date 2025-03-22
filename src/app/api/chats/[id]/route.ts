import { auth } from "@/auth";
import { db } from "@/db";
import { users, messages, userProfile, starredChats, tradeSession } from "@/db/schema";
import { and, desc, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const { id: sessionId } = await params;
  const userId = session.user.id;

  try {
    // First get the trade session to determine participants
    const tradeSessionRecords = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.session_id, sessionId),
          or(eq(messages.fromVender, true), eq(messages.fromVender, false)),
        ),
      )
      .limit(1);

    if (!tradeSessionRecords || tradeSessionRecords.length === 0) {
      return NextResponse.json(
        { error: "Trade session not found" },
        { status: 404 },
      );
    }

    const message = tradeSessionRecords[0];
    // In this schema, we don't have sender/receiver IDs like that
    // Instead use the trade session to identify parties
    const tradeInfo = await db
      .select()
      .from(tradeSession)
      .where(eq(tradeSession.id, message.session_id))
      .limit(1);
      
    if (tradeInfo.length === 0) {
      return NextResponse.json(
        { error: "Trade session not found" },
        { status: 404 },
      );
    }
    
    const session = tradeInfo[0];
    const otherUserId = session.vendor_id === userId ? session.customer_id : session.vendor_id;

    const starredCheck = await db
      .select()
      .from(starredChats)
      .where(
        and(
          eq(starredChats.userId, userId),
          eq(starredChats.conversationId, sessionId),
        ),
      )
      .limit(1);

    const isStarred = starredCheck.length > 0;

    // Get user profile and all messages
    const [otherUserProfile, otherUser, allMessages] = await Promise.all([
      db.select().from(userProfile).where(eq(userProfile.auth_id, otherUserId)),
      db.select().from(users).where(eq(users.id, otherUserId)),
      db
        .select()
        .from(messages)
        .where(eq(messages.session_id, sessionId))
        .orderBy(desc(messages.createdAt))
        .limit(32),
    ]);

    // Format messages for client
    const formattedMessages = allMessages.map((msg) => {
      // If the message is from vendor, check if current user is vendor
      const isFromCurrentUser = 
        (msg.fromVender && session.vendor_id === userId) || 
        (!msg.fromVender && session.customer_id === userId);
        
      return {
        id: msg.id,
        sender: isFromCurrentUser ? "me" : "other",
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: msg.isRead ? "read" : "delivered",
      };
    });

    // Create response object
    const chatData = {
      id: sessionId,
      user: {
        name: otherUserProfile[0]?.username || otherUser[0]?.name || "Unknown",
        address: otherUserId,
        avatar: otherUserProfile[0]?.avatar || "/api/placeholder/40/40",
        status: "online", // This would come from a real-time user status service
        lastSeen: "Just now", // This would be calculated based on last activity
        verified: true, // This would be based on user verification status
      },
      messages: formattedMessages,
      starred: isStarred,
      encrypted: true, // This would be based on your app's encryption settings
      verified: true, // This would be based on verification status of the conversation
    };

    return NextResponse.json(chatData);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
