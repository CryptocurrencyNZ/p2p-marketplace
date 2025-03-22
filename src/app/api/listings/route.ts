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
    const baseUrl = "https://p2p-marketplace-sigma.vercel.app";
    
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
      allListings.map(async (listing) => {
        try {
          // Check if userId exists before calling fetchUserElo
          const userRep = listing.userId ? await fetchUserElo(listing.userId) : 0;
          const starRating = convertRepToStar(userRep);
          
          // Parse price as float first
          const priceAsFloat = parseFloat(listing.price);
          
          // Handle invalid price formats
          if (isNaN(priceAsFloat)) {
            console.error(`Invalid price format for listing ${listing.id}: "${listing.price}"`);
            
            // Return listing with default/fallback values for invalid price
            return {
              ...listing,
              price: 0,
              userRep,
              starRating,
              nzValue: null,
              calculatedMarginRate: 0
            } as EnhancedListing;
          }
          
          // Calculate NZ value with additional error handling
          let nzValue = null;
          try {
            nzValue = await calculateNZValue(listing.price, listing.currency);
            
            // Extra validation to ensure nzValue is not NaN
            if (nzValue !== null && isNaN(nzValue)) {
              console.error(`NaN nzValue calculated for listing ${listing.id}`, {
                price: listing.price,
                currency: listing.currency
              });
              nzValue = null;
            }
          } catch (calcError) {
            console.error(`Error calculating NZ value for listing ${listing.id}:`, calcError);
            nzValue = null;
          }
          
          // Calculate margin rate with validation
          let calculatedMarginRate = 0;
          if (listing.marginRate) {
            const marginRateNum = parseFloat(listing.marginRate);
            calculatedMarginRate = isNaN(marginRateNum) ? 0 : marginRateNum;
          }
          
          // Round price to integer after all calculations
          const priceAsInteger = Math.round(priceAsFloat);
          
          return {
            ...listing,
            price: priceAsInteger,
            userRep,
            starRating,
            nzValue, // This might be null if calculation failed
            calculatedMarginRate
          } as EnhancedListing;
        } catch (error) {
          console.error(`Error processing listing ${listing.id}:`, error);
          
          // Return listing with default values if processing fails
          return {
            ...listing,
            price: parseFloat(listing.price) || 0,
            userRep: 0,
            starRating: 0,
            nzValue: null,
            calculatedMarginRate: 0
          } as EnhancedListing;
        }
      })
    );

    // Log the first few listings for debugging
    console.log("Sample of enhanced listings:", 
      enhancedListings.slice(0, 2).map(l => ({
        id: l.id,
        price: l.price,
        currency: l.currency,
        nzValue: l.nzValue
      }))
    );

    return NextResponse.json(enhancedListings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
};