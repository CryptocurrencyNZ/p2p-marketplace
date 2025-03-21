import React, { useState, useMemo } from "react";
import { TradeListing } from "./types";
import FiltersComponent, { FilterOptions } from "./filters";
import ListingsComponent from "./listings";

interface ListingsPanelProps {
  isLoading: boolean;
  listings: TradeListing[];
  selectedListing: TradeListing | null;
  onSelectListing: (listing: TradeListing) => void;
  isMobile: boolean;
  viewMode: "map" | "listings";
  getCryptoColor: (cryptoType: string) => string;
  formatDate: (dateString: string) => string;
}

const ListingsPanel: React.FC<ListingsPanelProps> = ({
  isLoading,
  listings,
  selectedListing,
  onSelectListing,
  isMobile,
  viewMode,
  getCryptoColor,
  formatDate,
}) => {
  // State for filters with added region property
  const [filters, setFilters] = useState<FilterOptions>({
    priceTier: "all",
    reputation: "all",
    coinType: [],
    region: "" // New property for NZ region filter
  });
  
  // Get unique coin types from listings
  const availableCoinTypes = useMemo(() => {
    return Array.from(new Set(listings.map(listing => listing.cryptoType.toLowerCase())));
  }, [listings]);
  
  // Updated coin groups with more specific cryptocurrencies
  const coinGroups = {
    bitcoin: ["btc"],
    ethereum: ["eth"],
    usdt: ["usdt"],
    stables: ["usdc", "dai", "busd", "usdt"],
    alts: ["sol", "bnb", "ada", "dot", "xrp", "doge", "shib"]
  };
  
  // Helper to determine if a coin is in a group
  const getCoinGroup = (coinType: string) => {
    const lowerCoin = coinType.toLowerCase();
    if (coinGroups.bitcoin.includes(lowerCoin)) return "bitcoin";
    if (coinGroups.ethereum.includes(lowerCoin)) return "ethereum";
    if (coinGroups.usdt.includes(lowerCoin)) return "usdt";
    if (coinGroups.stables.includes(lowerCoin)) return "stables";
    return "alts";
  };

  // Apply filters to listings
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      // Price tier filter
      if (filters.priceTier !== "all") {
        const price = listing.price;
        
        if (filters.priceTier === "low" && price > 1000) return false;
        if (filters.priceTier === "medium" && (price <= 1000 || price > 10000)) return false;
        if (filters.priceTier === "high" && price <= 10000) return false;
      }
      
      // Reputation filter
      if (filters.reputation !== "all") {
        const rating = listing.trader.rating;
        
        if (filters.reputation === "4+" && rating < 4) return false;
        if (filters.reputation === "4.5+" && rating < 4.5) return false;
        if (filters.reputation === "5" && rating < 5) return false;
      }
      
      // Coin type filter
      if (filters.coinType.length > 0) {
        const listingCoinType = listing.cryptoType.toLowerCase();
        const listingCoinGroup = getCoinGroup(listingCoinType);
        
        // Check if the specific coin or its group is in the filter
        const isCoinSelected = filters.coinType.includes(listingCoinType);
        const isGroupSelected = filters.coinType.includes(listingCoinGroup);
        
        if (!isCoinSelected && !isGroupSelected) {
          return false;
        }
      }
      
      // Region filter (new)
      if (filters.region && listing.location && listing.location.region) {
        if (listing.location.region !== filters.region) {
          return false;
        }
      }
      
      return true;
    });
  }, [listings, filters]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      priceTier: "all",
      reputation: "all",
      coinType: [],
      region: "" // Reset region too
    });
  };

  return (
    <div
      className={`
        ${
          isMobile
            ? viewMode === "listings"
              ? "block h-[50vh] min-h-[400px]"
              : "hidden"
            : "w-96 h-full bg-gray-800 border-l border-gray-700"
        } bg-gray-800 overflow-hidden
      `}
    >
      <div className="flex flex-col h-full">
        {/* Show different components based on mobile vs desktop */}
        <FiltersComponent 
          availableCoinTypes={availableCoinTypes}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          getCryptoColor={getCryptoColor}
          filteredCount={filteredListings.length}
          totalCount={listings.length}
          isMobile={isMobile}
        />
        
        <ListingsComponent 
          isLoading={isLoading}
          listings={filteredListings}
          selectedListing={selectedListing}
          onSelectListing={onSelectListing}
          getCryptoColor={getCryptoColor}
          formatDate={formatDate}
          resetFilters={resetFilters}
        />
      </div>
    </div>
  );
};

export default ListingsPanel;