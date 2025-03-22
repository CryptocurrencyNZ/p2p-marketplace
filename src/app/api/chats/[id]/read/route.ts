import { auth } from "@/auth";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const { id: conversationId } = await params;
  const userId = session.user.id;

  try {
    // Mark all messages in the conversation where the user is the recipient as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationID, conversationId),
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
} 