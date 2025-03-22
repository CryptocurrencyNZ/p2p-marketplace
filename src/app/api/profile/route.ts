import { auth } from "@/auth";
import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { updateUserElo } from "@/lib/rep_system/updateRep";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const AddUserInput = z.object({
  username: z.string(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  age: z.preprocess(
    // Convert to number if it's a string
    (val) => (val === "" ? null : Number(val)),
    z.number().optional(),
  ),
});

export const GET = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.auth_id, session.user.id!));

    if (profile.length === 0) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(profile[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const data = AddUserInput.parse(payload);

    // Check if profile exists using auth_id
    const existingProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.auth_id, session.user.id!));

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfile)
        .set({
          username: data.username,
          bio: data.bio,
          avatar: data.avatar,
          age: data.age,
        })
        .where(eq(userProfile.auth_id, session.user.id!));
    } else {
      // Insert new profile
      await updateUserElo(session.user.id!, "-1");
      await db.insert(userProfile).values([
        {
          auth_id: session.user.id!, // ✅ Correctly using auth_id
          username: data.username,
          bio: data.bio,
          avatar: data.avatar,
          age: data.age,
        },
      ]);
    }

    return NextResponse.json({ message: "Profile saved successfully" });
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
