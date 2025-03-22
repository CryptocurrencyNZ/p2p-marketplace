// Add this interface for the backend response structure
import { TradeListing, TradeType, NZRegion } from "./types";
import {convertRepToStar} from "@/lib/rep_system/repConversions"
 

// Add this interface for the backend response structure
export interface BackendListing {
  id: string;
  userId: string;
  username: string;
  createdAt: string;
  title: string;
  location: string;
  price: string;
  isBuy: boolean;
  currency: string;
  description: string;
  marginRate: string;
  onChainProof: boolean;
  userRep:string;
  nzValue:string;
}

// Location coordinates mapping for New Zealand regions
const regionCoordinates: Record<string, { lat: number; lng: number }> = {
  [NZRegion.Auckland]: { lat: -36.8509, lng: 174.7645 },
  [NZRegion.Wellington]: { lat: -41.2865, lng: 174.7762 },
  [NZRegion.Canterbury]: { lat: -43.5321, lng: 172.6362 },
  [NZRegion.Otago]: { lat: -45.8788, lng: 170.5028 },
  [NZRegion.Waikato]: { lat: -37.7870, lng: 175.2793 },
  [NZRegion.BayOfPlenty]: { lat: -37.6878, lng: 176.1651 },
  [NZRegion.ManawatuWhanganui]: { lat: -40.3523, lng: 175.6082 },
  [NZRegion.Northland]: { lat: -35.7275, lng: 174.3166 },
  [NZRegion.HawkesBay]: { lat: -39.4928, lng: 176.9120 },
  [NZRegion.Taranaki]: { lat: -39.0556, lng: 174.0752 },
  [NZRegion.Southland]: { lat: -46.4132, lng: 168.3538 },
  [NZRegion.Nelson]: { lat: -41.2706, lng: 173.2840 },
  [NZRegion.Marlborough]: { lat: -41.5134, lng: 173.9612 },
  [NZRegion.Tasman]: { lat: -41.2706, lng: 172.9211 },
  [NZRegion.WestCoast]: { lat: -42.4500, lng: 171.2100 },
  [NZRegion.Gisborne]: { lat: -38.6624, lng: 177.9829 }
};

// City mapping for each region (simplified version)
const regionToCityMap: Record<string, string> = {
  [NZRegion.Auckland]: "Auckland",
  [NZRegion.Wellington]: "Wellington",
  [NZRegion.Canterbury]: "Christchurch",
  [NZRegion.Otago]: "Dunedin",
  [NZRegion.Waikato]: "Hamilton",
  [NZRegion.BayOfPlenty]: "Tauranga",
  [NZRegion.ManawatuWhanganui]: "Palmerston North",
  [NZRegion.Northland]: "Whangarei",
  [NZRegion.HawkesBay]: "Napier",
  [NZRegion.Taranaki]: "New Plymouth",
  [NZRegion.Southland]: "Invercargill",
  [NZRegion.Nelson]: "Nelson",
  [NZRegion.Marlborough]: "Blenheim",
  [NZRegion.Tasman]: "Richmond",
  [NZRegion.WestCoast]: "Greymouth",
  [NZRegion.Gisborne]: "Gisborne"
};

// Generate number of completed trades
const generateCompletedTrades = (rating: number): number => {
  const baseCount = Math.floor(rating * 20);
  const randomFactor = Math.floor(Math.random() * 15);
  return baseCount + randomFactor;
};

export const fetchMockListings = async (): Promise<TradeListing[]> => {
  try {
    // Fetch data from API - this endpoint should include user reputation data
    const response = await fetch("/api/listings");
    
    if (!response.ok) {
      throw new Error(`Error fetching listings: ${response.status}`);
    }
    
    const backendListings: BackendListing[] = await response.json();
    
    // Transform the data to match frontend requirements
    const transformedListings = backendListings.map((item) => {
      // For each listing, get the user reputation from the backend
      // This assumes the backend sends reputation data or we fetch it separately
      // If userRep isn't available directly, you'll need a different approach
      const userRep = item.userRep
      const starRating = convertRepToStar(parseInt(userRep, 10));
      
      // Map backend location string to NZRegion enum value
      const region = item.location as keyof typeof NZRegion;
      
      // Get base coordinates for the region
      const baseCoordinates = regionCoordinates[region] || { lat: -41.0, lng: 174.0 }; // Default to NZ center
      
      // Create a random offset to scatter pins within the region
      // This creates pins that are visibly distinct but still in the same general area
      const latOffset = (Math.random() - 0.5) * 0.15; // Approx ±8km offset
      const lngOffset = (Math.random() - 0.5) * 0.15;
      
      // Apply the offset to create unique coordinates for each listing
      const coordinates = {
        lat: baseCoordinates.lat + latOffset,
        lng: baseCoordinates.lng + lngOffset
      };
      
      const city = regionToCityMap[region] || String(region);
      
      // Generate number of completed trades based on rating
      const completedTrades = generateCompletedTrades(starRating);

      const nzValue = item.nzValue
      
      // Create the transformed listing
      const transformedListing: TradeListing = {
        id: item.id,
        title: item.title,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          region: region,
          city: city
        },
        price: parseFloat(item.price),
        currency: "NZD", // Using NZD as the display currency
        cryptoType: item.currency, // Using the currency field as cryptoType
        tradeType: item.isBuy ? TradeType.Buy : TradeType.Sell,
        trader: {
          id: item.userId,
          name: item.username,
          rating: starRating,
          completedTrades: completedTrades
        },
        description: item.description,
        createdAt: item.createdAt,
        marginRate: item.marginRate,
        nzValue:item.nzValue
      };
      
      return transformedListing;
    });
    
    return transformedListings;
    
  } catch (error) {
    console.error("Error in fetchMockListings:", error);
    throw error;
  }
};