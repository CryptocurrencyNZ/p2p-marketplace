import React from "react";
import { TradeListing } from "./types";

interface ListingsComponentProps {
  isLoading: boolean;
  listings: TradeListing[];
  selectedListing: TradeListing | null;
  onSelectListing: (listing: TradeListing) => void;
  getCryptoColor: (cryptoType: string) => string;
  formatDate: (dateString: string) => string;
  resetFilters: () => void;
}

const ListingsComponent: React.FC<ListingsComponentProps> = ({
  isLoading,
  listings,
  selectedListing,
  onSelectListing,
  getCryptoColor,
  formatDate,
  resetFilters
}) => {
  // Get color based on trade type (buy/sell)
  const getTradeTypeColor = (tradeType: string): string => {
    return tradeType === "buy" ? "#22c55e" : "#ef4444"; // Green for buy, red for sell
  };

  return (
    <div className="flex-grow overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading listings...</div>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-center p-4">
            <p>No listings match your filters</p>
            <button 
              className="mt-2 text-green-400 hover:text-green-300 text-sm"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className={`p-4 hover:bg-gray-700 cursor-pointer transition-colors ${
                selectedListing?.id === listing.id
                  ? "bg-gray-700 border-l-4 border-green-500"
                  : ""
              }`}
              onClick={() => onSelectListing(listing)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <h3 className="font-medium text-white">{listing.title}</h3>
                </div>
                <div 
                  className="text-xs px-2 py-1 rounded-full font-medium" 
                  style={{
                    backgroundColor: getTradeTypeColor(listing.tradeType),
                    color: 'white'
                  }}
                >
                  {listing.tradeType === "buy" ? "Buying" : "Selling"}
                </div>
              </div>

              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{
                      backgroundColor: getCryptoColor(listing.cryptoType),
                    }}
                  ></div>
                  <span className="text-gray-300">{listing.cryptoType}</span>
                </div>
                <div className="font-medium text-white">
                  {listing.price} {listing.currency}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="text-gray-400">
                  {listing.trader.name} ({listing.trader.rating}★)
                </div>
                <div className="text-gray-400">
                  {formatDate(listing.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsComponent;