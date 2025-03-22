import { auth } from "@/auth";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SendMessageSchema = z.object({
  chatId: z.string().optional(),
  receiverId: z.string().optional(),
  content: z.string().min(1),
});

// POST handler to send a new message
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const payload = await request.json();
    const data = SendMessageSchema.parse(payload);
    const senderId = session.user.id;

    // Create a new conversation ID if one doesn't exist
    let conversationId = data.chatId;
    if (!conversationId) {
      if (!data.receiverId) {
        return NextResponse.json(
          { error: "Either chatId or receiverId must be provided" },
          { status: 400 }
        );
      }
      // Generate a new conversation ID that includes both user IDs to make it consistent
      // This ensures if the same two users chat again, we can find their conversation
      const sortedIds = [senderId, data.receiverId].sort();
      conversationId = `conv_${sortedIds[0]}_${sortedIds[1]}`;
    }

    // We need to ensure receiverId is defined before inserting
    if (!data.receiverId && !conversationId) {
      return NextResponse.json(
        { error: "Receiver ID is required when starting a new conversation" },
        { status: 400 }
      );
    }

    // If we have a conversationId but no receiverId, we need to find the receiver
    let receiverId = data.receiverId;
    if (!receiverId && conversationId) {
      // Find the most recent message in this conversation to determine the other party
      const existingMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationID, conversationId))
        .limit(1);
      
      if (existingMessages.length === 0) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      // Determine the receiver based on the existing message
      const existingMessage = existingMessages[0];
      receiverId = existingMessage.senderId === senderId 
        ? existingMessage.receiverId 
        : existingMessage.senderId;
    }

    // Now we can safely insert the new message
    const newMessage = {
      senderId,
      receiverId: receiverId!,  // We've ensured this is defined by now
      content: data.content,
      conversationID: conversationId!,  // We've ensured this is defined by now
      isRead: false,
    };

    const [insertedMessage] = await db.insert(messages).values(newMessage).returning();

    // Format the message for the response
    const formattedMessage = {
      id: insertedMessage.id,
      sender: "me",
      content: insertedMessage.content,
      timestamp: new Date(insertedMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    return NextResponse.json({
      success: true,
      message: formattedMessage,
      conversationId: insertedMessage.conversationID,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
} 