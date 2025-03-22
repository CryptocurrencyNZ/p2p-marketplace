import { auth } from "@/auth";
import { db } from "@/db";
import { listings, userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = async () => {
  const session = await auth();
  if (!session || !session.user)
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );
    
  if (!session.user.id) {
    return NextResponse.json(
      { message: "User ID not found" },
      { status: 400 },
    );
  }
    
  try {
    const list = await db
      .select({
        id: listings.id,
        userId: userProfile.auth_id,
        username: userProfile.username,
        createdAt: listings.createdAt,
        title: listings.title,
        location: listings.location,
        price: listings.price,
        isBuy: listings.isBuy,
        currency: listings.currency,
        description: listings.descrption,
        onChainProof: listings.onChainProof,
        marginRate: listings.marginRate,
      })
      .from(listings)
      .where(eq(listings.user_auth_id, session.user.id))
      .innerJoin(userProfile, eq(userProfile.auth_id, listings.user_auth_id));

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching lists", error);
    return NextResponse.json([]);
  }
};

const AddListingInput = z.object({
  title: z.string(),
  location: z.string(),
  price: z.number().transform((x) => String(x)),
  isBuy: z.boolean(),
  currency: z.string(),
  descrption: z.string(),
  onChainProof: z.boolean(),
  marginRate: z.number().transform((x) => String(x)),
});

export const POST = async (request: Request) => {
  try {
    const session = await auth();
    if (!session || !session.user)
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );

    const payload = await request.json();
    const data = AddListingInput.parse(payload);

    const newListing = { user_auth_id: session.user.id, ...data };

    await db.insert(listings).values(newListing);

    return NextResponse.json(newListing);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
