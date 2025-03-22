import { db } from "@/db";
import { listings, userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { convertRepToStar } from "@/lib/rep_system/repConversions";
import { fetchUserElo } from "@/lib/rep_system/updateRep";

// Define types for the price data
interface PriceData {
  [key: string]: number;
  nzd: number;
}

// Update the DbListing interface to match what's actually returned from the database
interface DbListing {
  id: string;
  userId: string | null; // Changed to allow null, matching the database structure
  username: string;
  createdAt: Date | null;
  title: string;
  location: string;
  price: string;
  isBuy: boolean;
  currency: string;
  description: string;
  marginRate: string | null;
  onChainProof: boolean | null;
}

// Define the enhanced listing type
interface EnhancedListing extends Omit<DbListing, 'price' | 'marginRate'> {
  price: number;
  marginRate: string | null;
  userRep: number;
  starRating: number;
  nzValue: number | null;
  calculatedMarginRate: number;
}

// Function to fetch cryptocurrency price data
const fetchCryptoPriceData = async (currency: string): Promise<PriceData> => {
  try {
    // Create a proper absolute URL for server-side API route calls
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    
    // Make sure the URL is absolute with proper protocol
    const apiUrl = new URL(`/api/crypto-price?currency=${currency.toLowerCase()}`, baseUrl);
    
    // Use the absolute URL for the fetch call
    const response = await fetch(apiUrl.toString());
    
    console.log(`Fetching price data from: ${apiUrl.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch price data');
    }
    
    const priceData: PriceData = await response.json();
    return priceData;
  } catch (error) {
    console.error('Error fetching price data:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch price data');
  }
};

// Function to calculate NZ value based on price and currency
const calculateNZValue = async (priceStr: string, currency: string): Promise<number | null> => {
  try {
    // Convert price string to number
    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      throw new Error('Invalid price format');
    }
    
    // If the currency is already NZD, return the price directly
    if (currency.toUpperCase() === 'NZD') {
      return price;
    }
    // Fetch the latest price data for the currency
    const priceData = await fetchCryptoPriceData(currency);
    
    // Calculate NZD value
    if (priceData && priceData.price_nzd !== undefined) {
      console.log(`Using conversion rate: 1 ${currency} = ${priceData.price_nzd} NZD`);
      return price * priceData.price_nzd;
    } else {
      throw new Error('NZD conversion rate not available');
    }
  } catch (error) {
    console.error('Error calculating NZ value:', error);
    return null; // Return null if calculation fails
  }
};

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

    // Enhance listings with user reputation, star ratings, and NZ values
    const enhancedListings = await Promise.all(
      allListings.map(async (listing) => { // Removed the type assertion since it was causing the error
        // Check if userId exists before calling fetchUserElo
        const userRep = listing.userId ? await fetchUserElo(listing.userId) : 0;
        const starRating = convertRepToStar(userRep);
        
        // Calculate NZ value
        const nzValue = await calculateNZValue(listing.price, listing.currency);
        
        // Convert margin rate from string to number (if available)
        const marginRateNum = listing.marginRate ? parseFloat(listing.marginRate) : 0;
        const calculatedMarginRate = isNaN(marginRateNum) ? 0 : marginRateNum;
        
// Convert price from string to integer
      const priceAsFloat = parseFloat(listing.price);
      const priceAsInteger = Math.round(priceAsFloat);

        return {
          ...listing,
          price: priceAsInteger, 
          userRep,
          starRating,
          nzValue,
          calculatedMarginRate
        } as EnhancedListing;
      })
    );

    console.log(enhancedListings);

    return NextResponse.json(enhancedListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
};