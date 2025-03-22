import { auth } from "@/auth";
import { db } from "@/db";
import { messages, tradeSession } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SendMessageSchema = z.object({
  sessionId: z.string(),
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
    const userId = session.user.id;
    
    // Get the trade session to determine if user is vendor or customer
    const tradeSessionRecords = await db
      .select()
      .from(tradeSession)
      .where(eq(tradeSession.id, data.sessionId));
    
    if (!tradeSessionRecords || tradeSessionRecords.length === 0) {
      return NextResponse.json(
        { error: "Trade session not found" },
        { status: 404 }
      );
    }
    
    const tradeSessionRecord = tradeSessionRecords[0];
    
    // Check if user is part of this trade session
    const isVendor = tradeSessionRecord.vendor_id === userId;
    const isCustomer = tradeSessionRecord.customer_id === userId;
    
    if (!isVendor && !isCustomer) {
      return NextResponse.json(
        { error: "You are not authorized to send messages in this trade session" },
        { status: 403 }
      );
    }

    // Create the new message
    const newMessage = {
      session_id: data.sessionId,
      content: data.content,
      fromVender: isVendor, // Set based on whether the sender is the vendor
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
      sessionId: insertedMessage.session_id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
} 