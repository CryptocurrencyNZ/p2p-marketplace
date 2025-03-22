import { auth } from "@/auth";
import { db } from "@/db";
import { starredChats } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const StarChatSchema = z.object({
  chatId: z.string(),
  starred: z.boolean(),
});

// POST handler to star/unstar a conversation
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const payload = await request.json();
    const data = StarChatSchema.parse(payload);
    const userId = session.user.id;

    if (data.starred) {
      // Star the conversation
      try {
        await db.insert(starredChats).values({
          userId: userId,
          conversationId: data.chatId,
        });
      } catch (error) {
        // If there's a unique constraint error, that's fine - the conversation is already starred
        console.log("Conversation might already be starred:", error);
      }
    } else {
      // Unstar the conversation
      await db
        .delete(starredChats)
        .where(
          and(
            eq(starredChats.userId, userId),
            eq(starredChats.conversationId, data.chatId)
          )
        );
    }

    return NextResponse.json({
      success: true,
      chatId: data.chatId,
      starred: data.starred,
    });
  } catch (error) {
    console.error("Error updating star status:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
} 