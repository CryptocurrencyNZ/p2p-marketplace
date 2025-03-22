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
      .from(tradeSession)
      .where(eq(tradeSession.id, sessionId));

    if (!tradeSessionRecords || tradeSessionRecords.length === 0) {
      return NextResponse.json(
        { error: "Trade session not found" },
        { status: 404 },
      );
    }

    const tradeSessionData = tradeSessionRecords[0];
    
    // Check if the user is part of this trade session
    const isVendor = tradeSessionData.vendor_id === userId;
    const isCustomer = tradeSessionData.customer_id === userId;
    
    if (!isVendor && !isCustomer) {
      return NextResponse.json(
        { error: "You are not authorized to view this conversation" },
        { status: 403 },
      );
    }
    
    // Get the other participant's ID
    const otherUserId = isVendor ? tradeSessionData.customer_id : tradeSessionData.vendor_id;

    // Check if the conversation is starred
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
      const isFromMe = isVendor ? msg.fromVender : !msg.fromVender;
      
      return {
        id: msg.id,
        sender: isFromMe ? "me" : "other",
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
