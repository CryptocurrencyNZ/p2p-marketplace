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
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
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
                  ? "bg-gray-700 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => onSelectListing(listing)}
            >
              <div className="flex items-center mb-2">
                <div
                  className="w-6 h-6 rounded-full mr-2"
                  style={{
                    backgroundColor: getCryptoColor(listing.cryptoType),
                  }}
                ></div>
                <h3 className="font-medium text-white">{listing.title}</h3>
              </div>

              <div className="flex justify-between mb-2">
                <div className="text-gray-300">{listing.cryptoType}</div>
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