// mockListings.ts
import { TradeListing } from "./types";

// Mock data for New Zealand locations
export const mockListings: TradeListing[] = [
  {
    id: "1",
    title: "Selling Bitcoin in Auckland CBD",
    location: { 
      lat: -36.8485, 
      lng: 174.7633,
      region: "Auckland",
      city: "Auckland"
    },
    price: 82000,
    currency: "NZD",
    cryptoType: "BTC",
    tradeType: "sell",
    trader: { name: "CryptoKiwi", rating: 4.8, completedTrades: 143 },
    description: "Trading in person at the central library. Cash only.",
    createdAt: "2025-03-15T14:30:00Z",
  },
  {
    id: "2",
    title: "Ethereum for Cash in Wellington",
    location: { 
      lat: -41.2865, 
      lng: 174.7762,
      region: "Wellington",
      city: "Wellington"
    },
    price: 3700,
    currency: "NZD",
    cryptoType: "ETH",
    tradeType: "sell",
    trader: { name: "WellyTrader", rating: 4.6, completedTrades: 87 },
    description: "Meet at Cuba Street cafes. Min trade 0.5 ETH.",
    createdAt: "2025-03-18T09:15:00Z",
  },
  {
    id: "3",
    title: "USDT trades in Christchurch",
    location: { 
      lat: -43.5321, 
      lng: 172.6362,
      region: "Canterbury",
      city: "Christchurch"
    },
    price: 1.62,
    currency: "NZD",
    cryptoType: "USDT",
    tradeType: "buy",
    trader: {
      name: "SouthIslandCrypto",
      rating: 5.0,
      completedTrades: 211,
    },
    description:
      "Buying USDT with NZD. Flexible meeting locations around Christchurch.",
    createdAt: "2025-03-19T16:45:00Z",
  },
  {
    id: "4",
    title: "Buying Solana in Hamilton",
    location: { 
      lat: -37.787, 
      lng: 175.2793,
      region: "Waikato",
      city: "Hamilton"
    },
    price: 290,
    currency: "NZD",
    cryptoType: "SOL",
    tradeType: "buy",
    trader: { name: "HamTownMiner", rating: 4.2, completedTrades: 43 },
    description: "Looking to buy SOL. Can meet anywhere in Hamilton area.",
    createdAt: "2025-03-17T11:20:00Z",
  },
  {
    id: "5",
    title: "Sell BNB in Queenstown",
    location: { 
      lat: -45.0302, 
      lng: 168.6612,
      region: "Otago",
      city: "Queenstown"
    },
    price: 930,
    currency: "NZD",
    cryptoType: "BNB",
    tradeType: "sell",
    trader: { name: "QTownCryptoGuru", rating: 4.9, completedTrades: 76 },
    description: "Selling BNB at market price. Meet in public places only.",
    createdAt: "2025-03-16T15:50:00Z",
  },
];

// Function to simulate API fetch with delay
export const fetchMockListings = async (): Promise<TradeListing[]> => {
  // Simulating API fetch delay
  
  const response = await fetch("/api/listings");
    
  if (!response.ok) {
    throw new Error(`Error fetching listings: ${response.status}`);
  }
  
  const rawData = await response.json();

  console.log(rawData);


  return mockListings;
};