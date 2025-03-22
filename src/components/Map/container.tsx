"use client";

import React, { useState, useEffect } from "react";
import { TradeListing, PriceTier, ReputationTier, NZRegion } from "./types";
import ListingsPanel from "./listingPanel";
import P2PCryptoTradeMap from "./map";
import { fetchMockListings } from "./mockListings";

interface P2PCryptoTradeContainerProps {
  className?: string;
}

const P2PCryptoTradeContainer: React.FC<P2PCryptoTradeContainerProps> = ({
  className = "",
}) => {
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<TradeListing | null>(
    null,
  );
  const [mapObject, setMapObject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"map" | "listings">("map"); // Default to map view
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [showFilterMenu, setShowFilterMenu] = useState<boolean>(true);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [cryptoFilter, setCryptoFilter] = useState<string>("all");

  // Extended filter states
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [priceTier, setPriceTier] = useState<PriceTier>("all");
  const [reputationTier, setReputationTier] = useState<ReputationTier>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Resize map if it's initialized
      if (mapObject) {
        setTimeout(() => {
          mapObject.resize();
        }, 100); // Increased timeout for more reliable resizing
      }
    };

    // Check on initial load
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, [mapObject]);

  // Fetch listings using imported function
  const fetchListings = async () => {
    const listings = await fetchMockListings();
    setListings(listings);
    setIsLoading(false);
    return listings;
  };

  // Effect to handle initial loading
  useEffect(() => {
    fetchListings();
  }, []);

  // This effect will resize the map when the view mode changes
  useEffect(() => {
    if (mapObject && viewMode === "map") {
      // Small delay to allow DOM to update
      setTimeout(() => {
        mapObject.resize();
      }, 200);
    }
  }, [viewMode, mapObject, showPanel]);

  // Add an additional resize effect for when the panel is toggled
  useEffect(() => {
    if (mapObject) {
      setTimeout(() => {
        mapObject.resize();
      }, 300); // Slightly longer timeout to account for animations
    }
  }, [showPanel, mapObject]);

  // Handle listing selection
  const handleListingSelect = (listing: TradeListing) => {
    setSelectedListing(listing);

    // Fly to the location on the map
    if (mapObject) {
      mapObject.flyTo({
        center: [listing.location.lng, listing.location.lat],
        zoom: 12,
        essential: true,
      });
    }

    // On mobile, keep map view but show panel
    if (isMobile) {
      setShowPanel(true);
      // Hide filter menu when showing panel
      setShowFilterMenu(false);
    }
  };

  // Effect to manage filter menu visibility
  useEffect(() => {
    if (isMobile) {
      setShowFilterMenu(!showPanel);
    }
  }, [showPanel, isMobile]);

  // Helper function to get color based on crypto type
  const getCryptoColor = (cryptoType: string): string => {
    const colors: { [key: string]: string } = {
      BTC: "#f7931a",
      ETH: "#627eea",
      USDT: "#26a17b",
      SOL: "#00ffbd",
      BNB: "#f3ba2f",
      LTC: "#b8b8b8",
      NZDD: "#2775ca",
      USDC: "#2775ca",
      XMR: "#ff6600",
      DOGE: "#c3a634",
      TRX: "#ff0013"
    };
    return colors[cryptoType] || "#8c8c8c";
  };

  // Format date to more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to determine price tier
  const getPriceTierForListing = (listing: TradeListing): PriceTier => {
    // These thresholds should be adjusted based on your data
    if (listing.price < 20000) return "low";
    if (listing.price < 50000) return "medium";
    return "high";
  };

  // Helper function to determine if rating meets reputation tier
  const meetsReputationTier = (
    rating: number,
    tier: ReputationTier,
  ): boolean => {
    if (tier === "all") return true;
    if (tier === "4+" && rating >= 4) return true;
    if (tier === "4.5+" && rating >= 4.5) return true;
    if (tier === "5" && rating === 5) return true;
    return false;
  };

  // Apply filters to listings
  const applyFilters = () => {
    return listings.filter((listing) => {
      // Filter by trade type
      if (activeFilter !== "all") {
        const filterType = activeFilter === "buying" ? "buy" : "sell";
        if (listing.tradeType !== filterType) return false;
      }

      // Filter by crypto type
      if (cryptoFilter !== "all" && listing.cryptoType !== cryptoFilter) {
        return false;
      }

      // Filter by region
      if (regionFilter !== "all" && listing.location.region !== regionFilter) {
        return false;
      }

      // Filter by price tier
      if (
        priceTier !== "all" &&
        getPriceTierForListing(listing) !== priceTier
      ) {
        return false;
      }

      // Filter by reputation tier
      if (
        reputationTier !== "all" &&
        !meetsReputationTier(listing.trader.rating, reputationTier)
      ) {
        return false;
      }

      return true;
    });
  };

  return (
    <div className={`${className} w-full h-full relative overflow-hidden`}>
      {/* Mobile Listings Button - Moved higher to avoid navbar overlap */}
      {isMobile && !showPanel && (
        <div className="fixed bottom-20 left-0 right-0 z-10 px-4 mx-auto max-w-sm">
          <button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg shadow-lg flex items-center justify-center"
            onClick={() => setShowPanel(true)}
          >
            View Listings ({listings.length})
          </button>
        </div>
      )}

      {/* Mobile Filter Menu */}
      {isMobile && showFilterMenu && (

  <div className="fixed top-4 left-0 right-0 z-10 w-full">
    <div className="bg-transparent p-2 flex flex-wrap items-center justify-between gap-2 w-full">
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-1 w-full">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'all' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-800 text-gray-200'}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'buying' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-200'}`}
          onClick={() => setActiveFilter('buying')}
        >
          Buying
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === 'selling' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-200'}`}
          onClick={() => setActiveFilter('selling')}
        >
          Selling
        </button>
        <select
          className="px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-gray-200"
          value={cryptoFilter}
          onChange={(e) => setCryptoFilter(e.target.value)}
        >
          <option value="all">All Crypto</option>
          <option value="BTC">Bitcoin</option>
          <option value="LTC">Litecoin</option>
          <option value="NZDD">NZDD</option>
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
          <option value="XMR">Monero</option>
          <option value="ETH">Ethereum</option>
          <option value="SOL">Solana</option>
          <option value="DOGE">Dogecoin</option>
          <option value="TRX">Tron</option>
          <option value="BNB">BNB</option>
        </select>
      </div>
    </div>
  </div>
)}

      {/* Desktop Layout with right sidebar */}
      <div className="flex h-full w-full">
        {/* Map Container - Takes up more width on desktop */}
        <div className="flex-grow h-full relative bg-gray-100 overflow-hidden">
          <P2PCryptoTradeMap
            listings={listings}
            selectedListing={selectedListing}
            setSelectedListing={setSelectedListing}
            mapObject={mapObject}
            setMapObject={setMapObject}
            isLoading={isLoading}
            isMobile={isMobile}
            setShowPanel={setShowPanel}
            setShowFilterMenu={setShowFilterMenu}
            fetchListings={fetchListings}
          />
        </div>

        {/* Listings Panel - Right sidebar on desktop, slide up on Mobile */}
        {!isMobile ? (
          <div className="md:w-[26rem] lg:w-[30rem] xl:w-[32rem] h-full shadow-xl bg-gray-800 overflow-y-auto overflow-x-hidden hidden md:block pr-3">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                Listings ({applyFilters().length})
              </h2>

              {/* Desktop Filter Menu */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === "all" ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-700 text-gray-200"}`}
                  onClick={() => setActiveFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === "buying" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200"}`}
                  onClick={() => setActiveFilter("buying")}
                >
                  Buying
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === "selling" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-200"}`}
                  onClick={() => setActiveFilter("selling")}
                >
                  Selling
                </button>
                <select
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200"
                  value={cryptoFilter}
                  onChange={(e) => setCryptoFilter(e.target.value)}
                >
                  <option value="all">All Crypto</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="LTC">Litecoin</option>
                  <option value="NZDD">NZDD</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="XMR">Monero</option>
                  <option value="ETH">Ethereum</option>
                  <option value="SOL">Solana</option>
                  <option value="DOGE">Dogecoin</option>
                  <option value="TRX">Tron</option>
                  <option value="BNB">BNB</option>
                </select>

                <button
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200 flex items-center"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? "Hide Filters" : "More Filters"}
                  <span className="ml-1">
                    {showAdvancedFilters ? "▲" : "▼"}
                  </span>
                </button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Region Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Region
                      </label>
                      <select
                        className="w-full px-3 py-1 rounded text-sm bg-gray-800 text-white border border-gray-600"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                      >
                        <option value="all">All Regions</option>
                        {Object.values(NZRegion).map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Tier Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Price Range
                      </label>
                      <select
                        className="w-full px-3 py-1 rounded text-sm bg-gray-800 text-white border border-gray-600"
                        value={priceTier}
                        onChange={(e) =>
                          setPriceTier(e.target.value as PriceTier)
                        }
                      >
                        <option value="all">Any Price</option>
                        <option value="low">Low ($0+)</option>
                        <option value="medium">Medium ($1,000)</option>
                        <option value="high">High ($10,000)</option>
                      </select>
                    </div>

                    {/* Reputation Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Trader Rating
                      </label>
                      <select
                        className="w-full px-3 py-1 rounded text-sm bg-gray-800 text-white border border-gray-600"
                        value={reputationTier}
                        onChange={(e) =>
                          setReputationTier(e.target.value as ReputationTier)
                        }
                      >
                        <option value="all">Any Rating</option>
                        <option value="4+">4+ Stars</option>
                        <option value="4.5+">4.5+ Stars</option>
                        <option value="5">5 Stars Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                      onClick={() => {
                        setRegionFilter("all");
                        setPriceTier("all");
                        setReputationTier("all");
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full px-5">
              <ListingsPanel
                isLoading={isLoading}
                listings={applyFilters()}
                selectedListing={selectedListing}
                onSelectListing={handleListingSelect}
                getCryptoColor={getCryptoColor}
                formatDate={formatDate}
              />
            </div>
          </div>
        ) : (
          <div
            className={`fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-lg shadow-2xl transition-transform duration-300 ease-in-out z-20 ${
              showPanel ? "translate-y-0" : "translate-y-full"
            }`}
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <div className="flex justify-between items-center p-2 border-b border-gray-700">
              <div className="w-8"></div>
              <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
              <button
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                onClick={() => setShowPanel(false)}
              >
                <span className="text-xl font-bold">&times;</span>
              </button>
            </div>

            {/* Mobile Advanced Filters */}
            <div className="p-3 border-b border-gray-700">
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-1 w-full">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === "all" ? "bg-gradient-to-r from-green-500 to-green-600 text-white" : "bg-gray-700 text-gray-200"}`}
                  onClick={() => setActiveFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === "buying" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200"}`}
                  onClick={() => setActiveFilter("buying")}
                >
                  Buying
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${activeFilter === "selling" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-200"}`}
                  onClick={() => setActiveFilter("selling")}
                >
                  Selling
                </button>
                <select
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200"
                  value={cryptoFilter}
                  onChange={(e) => setCryptoFilter(e.target.value)}
                >
                  <option value="all">All Crypto</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="LTC">Litecoin</option>
                  <option value="NZDD">NZDD</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                  <option value="XMR">Monero</option>
                  <option value="ETH">Ethereum</option>
                  <option value="SOL">Solana</option>
                  <option value="DOGE">Dogecoin</option>
                  <option value="TRX">Tron</option>
                  <option value="BNB">BNB</option>
                </select>

                <button
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200 whitespace-nowrap"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? "Less" : "More"}
                  <span className="ml-1">
                    {showAdvancedFilters ? "▲" : "▼"}
                  </span>
                </button>
              </div>

              {/* Mobile Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-3 pt-2 border-t border-gray-600">
                  <div className="space-y-3">
                    {/* Region Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Region
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded text-sm bg-gray-800 text-white border border-gray-600"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                      >
                        <option value="all">All Regions</option>
                        {Object.values(NZRegion).map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Tier Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Price Range
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded text-sm bg-gray-800 text-white border border-gray-600"
                        value={priceTier}
                        onChange={(e) =>
                          setPriceTier(e.target.value as PriceTier)
                        }
                      >
                        <option value="all">Any Price</option>
                        <option value="low">Low ($0+)</option>
                        <option value="medium">Medium ($1,000)</option>
                        <option value="high">High ($10,000)</option>
                      </select>
                    </div>

                    {/* Reputation Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Trader Rating
                      </label>
                      <select
                        className="w-full px-3 py-2 rounded text-sm bg-gray-800 text-white border border-gray-600"
                        value={reputationTier}
                        onChange={(e) =>
                          setReputationTier(e.target.value as ReputationTier)
                        }
                      >
                        <option value="all">Any Rating</option>
                        <option value="4+">4+ Stars</option>
                        <option value="4.5+">4.5+ Stars</option>
                        <option value="5">5 Stars Only</option>
                      </select>
                    </div>

                    <div className="pt-1">
                      <button
                        className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                        onClick={() => {
                          setRegionFilter("all");
                          setPriceTier("all");
                          setReputationTier("all");
                        }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full px-3">
              <ListingsPanel
                isLoading={isLoading}
                listings={applyFilters()}
                selectedListing={selectedListing}
                onSelectListing={handleListingSelect}
                getCryptoColor={getCryptoColor}
                formatDate={formatDate}
              />
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default P2PCryptoTradeContainer;
