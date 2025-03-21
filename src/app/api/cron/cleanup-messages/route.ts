import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { lt } from "drizzle-orm";
import { env } from "@/lib/env";

// This endpoint can be called by a CRON job (e.g., using Vercel Cron)
// to delete messages older than the configured expiration time
export async function POST(req: NextRequest) {
  try {
    // Create date for expiration threshold
    const expirationHours = env.MESSAGE_EXPIRATION_HOURS;
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - expirationHours);

    // Delete expired messages
    const result = await db.delete(messages)
      .where(lt(messages.timestamp, expirationDate));

    return NextResponse.json({ 
      message: "Message cleanup completed successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("Error during message cleanup:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 