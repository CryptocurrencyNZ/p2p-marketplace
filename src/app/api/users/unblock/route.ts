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

    // Remove from blocked list
    const result = await db.delete(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, user.userId),
          eq(blockedUsers.blockedId, blockedId)
        )
      );

    return NextResponse.json({ message: "User unblocked successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}); 