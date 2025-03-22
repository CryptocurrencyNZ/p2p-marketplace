import { auth } from "@/auth";
import { db } from "@/db";
import { users, messages, userProfile, starredChats } from "@/db/schema";
import { and, asc, eq, gt, or, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const { id: conversationId } = await params;
  const url = new URL(request.url);
  const userId = session.user.id;
  
  // Get the 'since' parameter if it exists
  const sinceParam = url.searchParams.get('since');

  try {
    // Verify user is part of this conversation
    const userMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationID, conversationId),
          or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
        )
      )
      .limit(1);

    if (userMessages.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check if the conversation is starred
    const starredCheck = await db
      .select()
      .from(starredChats)
      .where(
        and(
          eq(starredChats.userId, userId),
          eq(starredChats.conversationId, conversationId)
        )
      )
      .limit(1);

    const isStarred = starredCheck.length > 0;

    // Determine the other user in the conversation
    const message = userMessages[0];
    const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

    // Get other user details
    const otherUserProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.auth_id, otherUserId));

    const otherUser = await db
      .select()
      .from(users)
      .where(eq(users.id, otherUserId));

    // Get all messages in the conversation
    let allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationID, conversationId))
      .orderBy(asc(messages.createdAt));
    
    // If 'since' parameter exists, filter messages after that timestamp
    if (sinceParam) {
      const sinceTimestamp = new Date(sinceParam);
      
      if (!isNaN(sinceTimestamp.getTime())) {
        // If valid timestamp, filter the messages in memory
        // This simplifies the query and avoids SQL typing issues
        allMessages = allMessages.filter(msg => 
          new Date(msg.createdAt) > sinceTimestamp
        );
      }
    }

    // Format messages for client
    const formattedMessages = allMessages.map((msg) => ({
      id: msg.id,
      sender: msg.senderId === userId ? "me" : "other",
      content: msg.content,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: msg.isRead ? "read" : "delivered",
    }));

    // Create response object
    const chatData = {
      id: conversationId,
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