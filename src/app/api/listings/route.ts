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

// Define the type for a listing as it comes from the database
interface DbListing {
  id: string;
  userId: string;
  username: string;
  createdAt: Date | null;
  title: string;
  location: string;
  price: string; // Price is a string from the DB
  isBuy: boolean;
  currency: string;
  description: string;
  marginRate: string | null; // MarginRate is a string from the DB
  onChainProof: boolean | null;
}

// Define the enhanced listing type
interface EnhancedListing extends Omit<DbListing, 'price' | 'marginRate'> {
  price: string; // Keep as string for display
  marginRate: string | null; // Keep original
  userRep: number;
  starRating: number;
  nzValue: number | null;
  calculatedMarginRate: number; // New calculated margin rate as a number
}



// Function to fetch cryptocurrency price data
// Fixed function to fetch cryptocurrency price data from within another API route
const fetchCryptoPriceData = async (currency: string): Promise<PriceData> => {
  try {
    // Create a proper absolute URL for server-side API route calls
    // Use the environment variable for the host or default to localhost in development
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
        userId: userProfile.id,
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
      allListings.map(async (listing: DbListing) => {
        // Get user reputation data
        const userRep = await fetchUserElo(listing.userId);
        const starRating = convertRepToStar(userRep);
        
        // Calculate NZ value
        const nzValue = await calculateNZValue(listing.price, listing.currency);
        
        // Convert margin rate from string to number (if available)
        const marginRateNum = listing.marginRate ? parseFloat(listing.marginRate) : 0;
        const calculatedMarginRate = isNaN(marginRateNum) ? 0 : marginRateNum;
        
        return {
          ...listing,
          userRep,
          starRating,
          nzValue,
          calculatedMarginRate
        } as EnhancedListing;
      })
    );

    return NextResponse.json(enhancedListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
};