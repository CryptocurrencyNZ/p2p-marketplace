import { db } from "@/db";
import { listings, userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { convertRepToStar } from "@/lib/rep_system/repConversions";
import { fetchUserElo } from "@/lib/rep_system/updateRep";

// Properly typed dictionaries with index signatures
interface PriceMap {
  [key: string]: number;
}

interface IdMap {
  [key: string]: string;
}

// Fallback prices and rate (used if all APIs fail)
const FALLBACK_PRICES: PriceMap = {
  'btc': 82000,
  'eth': 5000,
  'bnb': 650,
  'xrp': 1.50,
  'ada': 1.20,
  'sol': 180,
  'doge': 0.20,
  'dot': 25,
  'ltc': 120,
  'link': 40,
  'usdt': 1,
  'usdc': 1,
};

const FALLBACK_NZD_RATE = 1.65;

// Common currency symbol mapping to CoinCap API IDs
const SYMBOL_TO_ID: IdMap = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bnb': 'binance-coin',
  'xrp': 'xrp',
  'ada': 'cardano',
  'sol': 'solana',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'ltc': 'litecoin',
  'link': 'chainlink',
  'usdt': 'tether',
  'usdc': 'usd-coin',
};

// Update the DbListing interface to match what's actually returned from the database
interface DbListing {
  id: string;
  userId: string | null;
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

/**
 * Gets crypto price from CoinCap API (free, higher rate limits)
 */
const getCryptoPriceFromCoinCap = async (currency: string): Promise<number | null> => {
  try {
    const symbol = currency.toLowerCase();
    
    // Get the proper ID for this coin
    let coinId: string;
    if (symbol in SYMBOL_TO_ID) {
      coinId = SYMBOL_TO_ID[symbol];
      console.log(`Mapped ${symbol} to ${coinId} for CoinCap API`);
    } else {
      coinId = symbol;
      console.log(`No mapping found for ${symbol}, using as is for CoinCap API`);
    }
    
    console.log(`Fetching from CoinCap API: ${coinId}`);
    const response = await fetch(`https://api.coincap.io/v2/assets/${coinId}`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      console.error(`CoinCap API error: ${response.status} for ${coinId}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.data && typeof data.data.priceUsd === 'string') {
      const price = parseFloat(data.data.priceUsd);
      if (!isNaN(price)) {
        console.log(`CoinCap price for ${currency}: $${price}`);
        return price;
      }
    }
    
    console.error(`Invalid data format from CoinCap for ${currency}`);
    return null;
  } catch (error) {
    console.error(`Error fetching ${currency} from CoinCap:`, error);
    return null;
  }
};

/**
 * Gets crypto price from Binance API (free, high rate limits)
 */
const getCryptoPriceFromBinance = async (currency: string): Promise<number | null> => {
  try {
    // Binance uses specific trading pairs
    const symbol = currency.toUpperCase() + 'USDT';
    
    console.log(`Fetching from Binance API: ${symbol}`);
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      console.error(`Binance API error: ${response.status} for ${symbol}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && typeof data.price === 'string') {
      const price = parseFloat(data.price);
      if (!isNaN(price)) {
        console.log(`Binance price for ${currency}: $${price}`);
        return price;
      }
    }
    
    console.error(`Invalid data format from Binance for ${currency}`);
    return null;
  } catch (error) {
    console.error(`Error fetching ${currency} from Binance:`, error);
    return null;
  }
};

/**
 * Gets NZD exchange rate
 */
const getNZDExchangeRate = async (): Promise<number> => {
  try {
    // Try ExchangeRate-API first
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.rates && typeof data.rates.NZD === 'number') {
        console.log(`Got NZD rate: ${data.rates.NZD}`);
        return data.rates.NZD;
      }
    }
    
    // Fallback to hardcoded rate
    console.log(`Using fallback NZD rate: ${FALLBACK_NZD_RATE}`);
    return FALLBACK_NZD_RATE;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    console.log(`Using fallback NZD rate: ${FALLBACK_NZD_RATE}`);
    return FALLBACK_NZD_RATE;
  }
};

/**
 * Get crypto price in USD using multiple APIs with fallbacks
 */
const getCryptoPrice = async (currency: string): Promise<number | null> => {
  // If currency is NZD, return 1 (1 NZD = 1 NZD)
  if (currency.toUpperCase() === 'NZD') {
    return 1;
  }
  
  const symbol = currency.toLowerCase();
  
  // Try CoinCap API first
  const coincapPrice = await getCryptoPriceFromCoinCap(currency);
  if (coincapPrice !== null) {
    return coincapPrice;
  }
  
  // Try Binance API as fallback
  const binancePrice = await getCryptoPriceFromBinance(currency);
  if (binancePrice !== null) {
    return binancePrice;
  }
  
  // Use our hardcoded fallback prices if available
  if (symbol in FALLBACK_PRICES) {
    const fallbackPrice = FALLBACK_PRICES[symbol];
    console.log(`Using fallback price for ${currency}: $${fallbackPrice}`);
    return fallbackPrice;
  }
  
  // If all else fails, return null
  console.error(`Could not get price for ${currency} from any source`);
  return null;
};

/**
 * Calculate NZ value based on price and currency
 */
const calculateNZValue = async (priceStr: string, currency: string): Promise<number | null> => {
  try {
    // Convert price string to number
    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      console.log(`Invalid price format: ${priceStr}`);
      return null;
    }
    
    // If the currency is already NZD, return the price directly
    if (currency.toUpperCase() === 'NZD') {
      return price;
    }
    
    console.log(`Calculating NZD value for ${price} ${currency}`);
    
    // Get USD price
    const usdPrice = await getCryptoPrice(currency);
    if (usdPrice === null) {
      console.error(`Failed to get USD price for ${currency}`);
      return null;
    }
    
    // Get NZD exchange rate
    const nzdRate = await getNZDExchangeRate();
    
    // Calculate NZD value
    const nzdValue = price * usdPrice * nzdRate;
    console.log(`Calculated: ${price} ${currency} = $${nzdValue} NZD (${price} x $${usdPrice} USD x ${nzdRate} NZD/USD rate)`);
    
    // Validate result
    if (isNaN(nzdValue)) {
      console.error('NaN value calculated', { price, usdPrice, nzdRate });
      return null;
    }
    
    return nzdValue;
  } catch (error) {
    console.error('Error calculating NZ value:', error);
    return null;
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
            return {
              ...listing,
              price: 0,
              userRep,
              starRating,
              nzValue: null,
              calculatedMarginRate: 0
            } as EnhancedListing;
          }
          
          // Calculate NZ value
          const nzValue = await calculateNZValue(listing.price, listing.currency);
          
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
            nzValue,
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