import React, { useState } from "react";

// Filter types
export interface FilterOptions {
  priceTier: string; // "all" | "low" | "medium" | "high"
  reputation: string; // "all" | "4+" | "4.5+" | "5"
  coinType: string[]; // Array of selected coin types
  region: string; // New Zealand region filter
}

interface FiltersComponentProps {
  availableCoinTypes: string[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  getCryptoColor: (cryptoType: string) => string;
  filteredCount: number;
  totalCount: number;
  isMobile: boolean;
}

// New Zealand regions
export const NZ_REGIONS = [
  "All Regions",
  "Auckland",
  "Bay of Plenty",
  "Canterbury",
  "Gisborne",
  "Hawke's Bay",
  "Manawatu-Whanganui",
  "Marlborough",
  "Nelson",
  "Northland",
  "Otago",
  "Southland",
  "Taranaki",
  "Tasman",
  "Waikato",
  "Wellington",
  "West Coast"
];

// Popular cryptocurrencies
const POPULAR_CRYPTOS = ["bitcoin", "ethereum", "usdt"];

const FiltersComponent: React.FC<FiltersComponentProps> = ({
  availableCoinTypes,
  filters,
  setFilters,
  resetFilters,
  getCryptoColor,
  filteredCount,
  totalCount,
  isMobile
}) => {
  // State for advanced filter visibility
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  // State for dropdown visibility
  const [showCoinDropdown, setShowCoinDropdown] = useState<boolean>(false);

  // Toggle a coin type in the filter
  const toggleCoinType = (coinType: string) => {
    setFilters(prev => {
      const newCoinTypes = prev.coinType.includes(coinType)
        ? prev.coinType.filter(type => type !== coinType)
        : [...prev.coinType, coinType];
        
      return {
        ...prev,
        coinType: newCoinTypes
      };
    });
  };

  // Set region
  const handleRegionChange = (region: string) => {
    setFilters(prev => ({
      ...prev,
      region: region === "All Regions" ? "" : region
    }));
  };

  return (
    <>
      {/* Filter Header - For Non-Mobile Only */}
      {!isMobile && (
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            P2P Crypto Trade Listings
          </h2>
          <p className="text-gray-400 text-sm">
            Showing {filteredCount} of {totalCount} available trades
          </p>
        </div>
      )}

      {/* Simple Filter Section - Always Visible */}
      <div className="p-3 bg-gray-900 border-b border-gray-700">
        {/* Main Filters Row */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-1 relative">
            {/* Popular Coins Buttons */}
            {POPULAR_CRYPTOS.map(coin => (
              <button
                key={coin}
                style={{
                  backgroundColor: filters.coinType.includes(coin) ? getCryptoColor(coin) : '#374151' // gray-700
                }}
                className={`px-2 py-1 text-xs rounded-md transition-colors duration-200 ${
                  filters.coinType.includes(coin)
                    ? `text-white font-medium ring-2 ring-offset-1 ring-opacity-50 ring-${getCryptoColor(coin).replace('#', '')}` 
                    : "text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => toggleCoinType(coin)}
              >
                {coin.charAt(0).toUpperCase() + coin.slice(1)}
              </button>
            ))}
            
            {/* More Coins Dropdown Button */}
            <div className="relative">
              <button 
                className="px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
                onClick={() => setShowCoinDropdown(!showCoinDropdown)}
              >
                More+
              </button>
              
              {/* Dropdown Menu */}
              {showCoinDropdown && (
                <div className="absolute left-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-10 py-1 text-xs">
                  {availableCoinTypes
                    .filter(coin => !POPULAR_CRYPTOS.includes(coin))
                    .map(coin => (
                      <div 
                        key={coin}
                        className={`px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center ${
                          filters.coinType.includes(coin) ? "bg-gray-700" : ""
                        }`}
                        onClick={() => {
                          toggleCoinType(coin);
                          // Keep dropdown open to allow multiple selections
                        }}
                      >
                        <span 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getCryptoColor(coin) }}
                        ></span>
                        <span className="flex-1">{coin.charAt(0).toUpperCase() + coin.slice(1)}</span>
                        {filters.coinType.includes(coin) && (
                          <span className="text-green-400">✓</span>
                        )}
                      </div>
                    ))}
                    <div 
                      className="border-t border-gray-700 px-3 py-2 hover:bg-gray-700 cursor-pointer text-center text-blue-400"
                      onClick={() => setShowCoinDropdown(false)}
                    >
                      Close
                    </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="text-xs text-blue-400 hover:text-blue-300"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? "Less" : "More"}
          </button>
        </div>
        
        {/* Price and Rating Filters */}
        <div className="flex gap-1">
          <select 
            className="flex-1 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
            value={filters.priceTier}
            onChange={(e) => setFilters(prev => ({ ...prev, priceTier: e.target.value }))}
          >
            <option value="all">All prices</option>
            <option value="low">Under 1,000</option>
            <option value="medium">1,000-10,000</option>
            <option value="high">Over 10,000</option>
          </select>
          
          <select 
            className="flex-1 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
            value={filters.reputation}
            onChange={(e) => setFilters(prev => ({ ...prev, reputation: e.target.value }))}
          >
            <option value="all">Any rating</option>
            <option value="4+">4+ stars</option>
            <option value="4.5+">4.5+ stars</option>
            <option value="5">5 stars only</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Section - Collapsible */}
      {showAdvancedFilters && (
        <div className="p-3 bg-gray-800 border-b border-gray-700">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-300 mb-1">Specific Coins</label>
            <div className="flex flex-wrap gap-1">
              {/* Individual Coins */}
              {availableCoinTypes.map(coin => (
                <button
                  key={coin}
                  className={`px-2 py-1 text-xs rounded-full transition-colors duration-200
                    ${filters.coinType.includes(coin) 
                      ? "text-white font-medium ring-1 ring-white" 
                      : "text-gray-200 hover:text-white"
                    }`}
                  style={{
                    backgroundColor: filters.coinType.includes(coin)
                      ? getCryptoColor(coin)
                      : 'rgba(31, 41, 55, 0.8)' // dark gray background for unselected
                  }}
                  onClick={() => toggleCoinType(coin)}
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Price Range</label>
            <select 
              className="w-full bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
              value={filters.priceTier}
              onChange={(e) => setFilters(prev => ({ ...prev, priceTier: e.target.value }))}
            >
              <option value="all">All prices</option>
              <option value="low">Under 1,000</option>
              <option value="medium">1,000-10,000</option>
              <option value="high">Over 10,000</option>
            </select>
          </div>
          
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Trader Rating</label>
            <select 
              className="w-full bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
              value={filters.reputation}
              onChange={(e) => setFilters(prev => ({ ...prev, reputation: e.target.value }))}
            >
              <option value="all">Any rating</option>
              <option value="4+">4+ stars</option>
              <option value="4.5+">4.5+ stars</option>
              <option value="5">5 stars only</option>
            </select>
          </div>
          
          {/* New Region Filter */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">New Zealand Region</label>
            <select 
              className="w-full bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600"
              value={filters.region || "All Regions"}
              onChange={(e) => handleRegionChange(e.target.value)}
            >
              {NZ_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  );
};

export default FiltersComponent;