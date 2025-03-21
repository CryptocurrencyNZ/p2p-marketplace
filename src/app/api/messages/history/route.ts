import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { withAuth } from "@/lib/auth";
import { AuthUser } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const url = new URL(req.url);
    const receiverId = parseInt(url.searchParams.get("receiverId") || "0");
    
    if (!receiverId) {
      return NextResponse.json({ message: "Missing receiverId parameter" }, { status: 400 });
    }

    // Get message history between users, ordered by most recent first
    const messageHistory = await db.select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user.userId),
            eq(messages.receiverId, receiverId)
          ),
          and(
            eq(messages.senderId, receiverId),
            eq(messages.receiverId, user.userId)
          )
        )
      )
      .orderBy(desc(messages.timestamp))
      .limit(50);

    return NextResponse.json({ 
      messages: messageHistory
    }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving message history:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}); 