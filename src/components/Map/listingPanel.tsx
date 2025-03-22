"use client";

import React from "react";
import { TradeListing } from "./types";

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
      {listings.map((listing) => (
        <div
          key={listing.id}
          className={`mx-4 bg-gray-700 rounded-lg cursor-pointer transition-all hover:bg-gray-600 ${
            selectedListing?.id === listing.id ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => onSelectListing(listing)}
        >
          <div className="p-3">
            {/* Listing Header */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-medium text-white mr-2">
                {listing.title}
              </h3>
              <div
                className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: getCryptoColor(listing.cryptoType),
                  color: "#000",
                }}
              >
                {listing.cryptoType}
              </div>
            </div>

            {/* Price and Type */}
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-white">
                {listing.price} {listing.currency}
              </div>
              <div
                className="inline-block px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: listing.tradeType === "buy" ? "#22c55e" : "#ef4444",
                  color: "white",
                }}
              >
                {listing.tradeType === "buy" ? "Buying" : "Selling"}
              </div>
            </div>

            {/* Description - Truncated */}
            <div className="text-gray-300 text-sm mb-2 line-clamp-2">
              {listing.description}
            </div>

            {/* Trader Info */}
            <div className="flex justify-between items-center text-xs text-gray-400">
              <div>
                {listing.trader.name} ({listing.trader.rating}★)
              </div>
              <div>{formatDate(listing.createdAt)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomListingsPanel;