import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blockedUsers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/auth";
import { AuthUser } from "@/lib/auth";

export const GET = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    // Get list of blocked users with their usernames
    const blockedUsersList = await db
      .select({
        id: users.id,
        username: users.username
      })
      .from(blockedUsers)
      .innerJoin(users, eq(blockedUsers.blockedId, users.id))
      .where(eq(blockedUsers.blockerId, user.userId));

    return NextResponse.json({ 
      blockedUsers: blockedUsersList
    }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving blocked users list:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}); 