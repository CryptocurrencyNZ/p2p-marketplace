import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blockedUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@/lib/auth";
import { AuthUser } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    const { blockedId } = await req.json();
    
    if (!blockedId) {
      return NextResponse.json({ message: "Missing blockedId" }, { status: 400 });
    }

    // Check if already blocked
    const existing = await db.select()
      .from(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, user.userId),
          eq(blockedUsers.blockedId, blockedId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ message: "User already blocked" }, { status: 200 });
    }

    // Add to blocked list
    await db.insert(blockedUsers)
      .values({
        blockerId: user.userId,
        blockedId
      });

    return NextResponse.json({ message: "User blocked successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}); 