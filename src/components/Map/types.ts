export interface TradeLocation {
  lat: number;
  lng: number;
  region?: string; // Added region field for New Zealand region filtering
  city?: string;   // Optional city field for more detailed location info
  address?: string; // Optional address field
}

export interface TradeListing {
  id: string;
  title: string;
  location: TradeLocation;
  price: number;
  currency: string;
  cryptoType: string;
  tradeType: "buy" | "sell"; // Added trade type to identify buying or selling listings
  trader: {
    name: string;
    rating: number;
    completedTrades: number;
  };
  description: string;
  createdAt: string;
}

// Additional types that might be useful
export type PriceTier = "all" | "low" | "medium" | "high";
export type ReputationTier = "all" | "4+" | "4.5+" | "5";
export type ViewMode = "map" | "listings";

// New Zealand regions enum for type safety
export enum NZRegion {
  Auckland = "Auckland",
  BayOfPlenty = "Bay of Plenty",
  Canterbury = "Canterbury",
  Gisborne = "Gisborne",
  HawkesBay = "Hawke's Bay",
  ManawatuWhanganui = "Manawatu-Whanganui",
  Marlborough = "Marlborough",
  Nelson = "Nelson",
  Northland = "Northland",
  Otago = "Otago",
  Southland = "Southland",
  Taranaki = "Taranaki",
  Tasman = "Tasman",
  Waikato = "Waikato",
  Wellington = "Wellington",
  WestCoast = "West Coast"
}

// Trade type enum for consistency
export enum TradeType {
  Buy = "buy",
  Sell = "sell"
}