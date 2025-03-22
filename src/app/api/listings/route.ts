import { db } from "@/db";
import { listings, userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const allListings = await db
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
        marginRate: listings.marginRate,
        onChainProof: listings.onChainProof,
      })
      .from(listings)
      .innerJoin(userProfile, eq(userProfile.auth_id, listings.user_auth_id));

    return NextResponse.json(allListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
};