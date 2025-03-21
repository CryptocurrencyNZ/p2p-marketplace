import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, blockedUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@/lib/auth";
import { AuthUser } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const { receiverId, message } = await req.json();
    
    if (!receiverId || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if receiver has blocked sender
    const isBlocked = await db.select()
      .from(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, receiverId),
          eq(blockedUsers.blockedId, user.userId)
        )
      );

    if (isBlocked.length > 0) {
      return NextResponse.json({ message: "Unable to send message" }, { status: 403 });
    }

    // Store the message
    const newMessage = await db.insert(messages)
      .values({
        senderId: user.userId,
        receiverId,
        message
      })
      .returning();

    return NextResponse.json({ 
      message: "Message sent successfully",
      data: newMessage[0]
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}); 