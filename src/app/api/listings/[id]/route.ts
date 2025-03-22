// app/api/listings/[id]/route.ts
import { db } from "@/db";
import { listings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Use the ID directly from params
    const listingId = params.id;
    
    // Simplified query
    const result = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId));
    
    // If no result, return 404
    if (result.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    
    // Return the first result
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error:", error);
    // Simple error response
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}