import { auth } from "@/auth";
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {z} from "zod";

export const GET = async () => {
  // Get auth session
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    // Safely fetch listings with error handling
    const userListings = await db
      .select()
      .from(listings)
      .where(eq(listings.user_auth_id, session.user.id));
    
    // Return an empty array if no listings found to prevent null issues
    if (!userListings) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(userListings);
  } catch (error) {
    console.error("Error fetching user listings:", error);
    // Return empty array instead of error object to prevent client-side issues
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

    const newListing = {
      user_auth_id: session.user.id,
      title: data.title,
      marginRate: data.marginRate,
      location: data.location,
      onChainProof: data.onChainProof,
      currency: data.currency,
      price: data.price,
      isBuy: data.isBuy,
      descrption: data.descrption,
    };
    
    await db.insert(listings).values([newListing]);


    return NextResponse.json(newListing);
  } catch (error) {
    console.error("Error adding listing:", error);
    return NextResponse.json({ error: "Server Error", details: error }, { status: 500 });
  }
};