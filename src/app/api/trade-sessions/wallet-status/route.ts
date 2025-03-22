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
  wallet: z.string(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { sessionId } = GetStatusSchema.parse(queryParams);

    // Create new trade session
    const [sessionData] = await db
      .select()
      .from(tradeSession)
      .where(eq(tradeSession.id, sessionId));

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error creating trade session:", error);
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
    const { sessionId, wallet } = SetStatusSchema.parse(payload);

    const [sessionData] = await db
      .select()
      .from(tradeSession)
      .where(eq(tradeSession.id, sessionId));

    const isVendor = sessionData.vendor_id === session.user.id;
    if (isVendor) {
      const res = await db
        .update(tradeSession)
        .set({ vendor_wallet: wallet })
        .where(eq(tradeSession.id, sessionId))
        .returning();
      return NextResponse.json(res);
    } else {
      const res = await db
        .update(tradeSession)
        .set({ customer_wallet: wallet })
        .where(eq(tradeSession.id, sessionId))
        .returning();
      return NextResponse.json(res);
    }
  } catch (error) {
    console.error("Error creating trade session:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
