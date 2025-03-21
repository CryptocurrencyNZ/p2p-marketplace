import { NextRequest, NextResponse } from "next/server";
import { findOrCreateUser, getChatById } from "@/lib/db/utils";
import { db } from "@/lib/db";
import { chatMessages, ChatParticipant } from "@/lib/db/schema";
import { and, eq, ne } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  context: { params: { chatId: string } }
) {
  try {
    const { chatId } = context.params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await findOrCreateUser(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the chat
    const chat = await getChatById(Number(chatId));
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Make sure the user is part of this chat
    const isParticipant = chat.participants.some((p: ChatParticipant) => p.userId === user.id);
    if (!isParticipant) {
      return NextResponse.json(
        { error: "User is not a participant in this chat" },
        { status: 403 }
      );
    }

    // Update all messages from other users to "read" status
    const result = await db
      .update(chatMessages)
      .set({ status: "read" })
      .where(
        and(
          eq(chatMessages.chatId, Number(chatId)),
          ne(chatMessages.senderId, user.id), // Messages not sent by current user
          ne(chatMessages.status, "read") // Messages not already marked as read
        )
      )
      .returning();

    const messagesUpdated = result.length;

    return NextResponse.json({ 
      success: true,
      messagesUpdated
    }, { status: 200 });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}