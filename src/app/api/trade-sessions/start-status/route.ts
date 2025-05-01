import { auth } from "@/auth";
import { db } from "@/db";
import { tradeSession } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GetStatusSchema = z.object({
  sessionId: z.string(),
});

const SetStatusSchema = z.object({
  sessionId: z.string(),
  status: z.boolean(),
  userRole: z.enum(["vendor", "buyer"]).optional(),
  stage: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { sessionId } = GetStatusSchema.parse(queryParams);

    // Get trade session data
    const [sessionData] = await db
      .select()
      .from(tradeSession)
      .where(eq(tradeSession.id, sessionId));

    if (!sessionData) {
      return NextResponse.json({ error: "Trade session not found" }, { status: 404 });
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error getting trade session:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const payload = await request.json();
    const { sessionId, status, userRole = 'vendor', stage } = SetStatusSchema.parse(payload);

    // Get current trade session data
    const [sessionData] = await db
      .select()
      .from(tradeSession)
      .where(eq(tradeSession.id, sessionId));

    if (!sessionData) {
      return NextResponse.json({ error: "Trade session not found" }, { status: 404 });
    }

    // Determine if the current user is the vendor or buyer
    const isVendor = sessionData.vendor_id === session.user.id;
    const isBuyer = sessionData.customer_id === session.user.id;

    // Create update object
    const updateData: Record<string, any> = {};

    // Update the appropriate field based on user role
    if (userRole === 'vendor' && isVendor) {
      updateData.vendor_start = status;
    } else if (userRole === 'buyer' && isBuyer) {
      updateData.customer_start = status;
    } else {
      return NextResponse.json(
        { error: "You don't have permission to update this field" },
        { status: 403 }
      );
    }

    // If stage is provided, update the stage as well
    if (stage) {
      updateData.stage = stage;
    }

    // Update the trade session
    const res = await db
      .update(tradeSession)
      .set(updateData)
      .where(eq(tradeSession.id, sessionId))
      .returning();

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error updating trade session:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
