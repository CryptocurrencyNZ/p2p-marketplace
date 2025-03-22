import { auth } from "@/auth";
import { db } from "@/db";
import { messages, tradeSession } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const { id: sessionId } = await params;
  const userId = session.user.id;

  try {
    // First, get the trade session to determine if user is vendor or customer
    const tradeSessionRecords = await db
      .select()
      .from(tradeSession)
      .where(eq(tradeSession.id, sessionId));
    
    if (!tradeSessionRecords || tradeSessionRecords.length === 0) {
      return NextResponse.json({ error: "Trade session not found" }, { status: 404 });
    }

    const tradeSessionRecord = tradeSessionRecords[0];
    const isVendor = tradeSessionRecord.vendor_id === userId;
    const isCustomer = tradeSessionRecord.customer_id === userId;

    if (!isVendor && !isCustomer) {
      return NextResponse.json({ error: "Not authorized for this trade session" }, { status: 403 });
    }

    // Mark messages as read where:
    // - If user is vendor: fromVender is false (messages from customer)
    // - If user is customer: fromVender is true (messages from vendor)
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.session_id, sessionId),
          isVendor ? eq(messages.fromVender, false) : eq(messages.fromVender, true),
          eq(messages.isRead, false)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
} 