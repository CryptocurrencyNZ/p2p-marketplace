import { auth } from "@/auth";
import { db } from "@/db";
import { tradeSession } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateTradeSessionSchema = z.object({
  listingId: z.string(),
  vendorId: z.string(),
  onChain: z.boolean(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const payload = await request.json();
    const data = CreateTradeSessionSchema.parse(payload);
    const customerId = session.user.id;

    // Create new trade session
    const [newSession] = await db
      .insert(tradeSession)
      .values({
        listingId: data.listingId,
        vendor_id: data.vendorId,
        customer_id: customerId,
        onChain: data.onChain,
        vendor_start: false,
        customer_start: false,
      })
      .returning();

    return NextResponse.json(newSession);
  } catch (error) {
    console.error("Error creating trade session:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
} 