import { auth } from "@/auth";
import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async () => {
  const session = await auth();
  if (!session || !session.user)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.auth_id, session.user.id!));

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};

const AddUserInput = z.object({
  username: z.string(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export const POST = async (request: Request) => {
  const session = await auth();
  if (!session || !session.user)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  try {
    const payload = await request.json();
    const data = AddUserInput.parse(payload);

    const newProfile = { auth_id: session.user.id!, ...data };

    await db.insert(userProfile).values([newProfile]);

    return NextResponse.json(newProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
