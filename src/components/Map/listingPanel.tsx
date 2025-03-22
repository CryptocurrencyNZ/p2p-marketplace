"use client";

import React from "react";
import { TradeListing, TradeType } from "./types";

interface CustomListingsPanelProps {
  isLoading: boolean;
  listings: TradeListing[];
  selectedListing: TradeListing | null;
  onSelectListing: (listing: TradeListing) => void;
  getCryptoColor: (cryptoType: string) => string;
  formatDate: (dateString: string) => string;
}

const CustomListingsPanel: React.FC<CustomListingsPanelProps> = ({
  isLoading,
  listings,
  selectedListing,
  onSelectListing,
  getCryptoColor,
  formatDate,
}) => {
  // No need to filter listings here, as they come pre-filtered from the container
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="animate-pulse">Loading listings...</div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No listings found. Please try different filters.
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {listings.map((listing) => {
        const tradeTypeColor = listing.tradeType === TradeType.Buy ? "#22c55e" : "#ef4444";
        const tradeTypeText = listing.tradeType === TradeType.Buy ? "Buying" : "Selling";
        
        return (
          <div
            key={listing.id}
            className={`mx-4 bg-gray-700 rounded-lg cursor-pointer transition-all hover:bg-gray-600 ${
              selectedListing?.id === listing.id ? "ring-2 ring-green-500" : ""
            }`}
            onClick={() => onSelectListing(listing)}
          >
            <div className="p-3 w-full">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-base font-bold text-white line-clamp-1">
                  {listing.title}
                </h3>
                <div className="flex gap-1">
                  <div
                    className="inline-block px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: getCryptoColor(listing.cryptoType),
                      color: "#000",
                    }}
                  >
                    {listing.cryptoType}
                  </div>
                  <div
                    className="inline-block px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: tradeTypeColor,
                      color: "white",
                    }}
                  >
                    {tradeTypeText}
                  </div>
                </div>
              </div>

              <div className="flex mb-2 gap-2">
                <div className="p-2 rounded-lg text-white flex-1">
                  <div className="flex items-baseline">
                    <div className="font-semibold text-base mr-2">
                      ${parseInt(listing.nzValue).toFixed(2)} {listing.currency}
                    </div>
                    <div className="text-green-500 font-medium text-xs">
                      (+{listing.marginRate}%)
                    </div>
                  </div>
                  
                  <div className="text-xs mt-1">
                    <div>
                      Vol: {listing.price} {listing.cryptoType}
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded-lg bg-gray-600 text-xs text-gray-100 flex-1 line-clamp-3 overflow-hidden">
                  {listing.description}
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <div>
                  {listing.trader.name} ({listing.trader.rating}★)
                </div>
                <div>{formatDate(listing.createdAt)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomListingsPanel;