"use client";

import React, { useEffect, useRef, useState } from "react";
import { TradeListing } from "./types";

interface P2PCryptoTradeMapProps {
  listings: TradeListing[];
  selectedListing: TradeListing | null;
  setSelectedListing: (listing: TradeListing | null) => void;
  mapObject: any;
  setMapObject: (map: any) => void;
  isLoading: boolean;
  isMobile: boolean;
  setShowPanel: (show: boolean) => void;
  setShowFilterMenu: (show: boolean) => void;
  fetchListings: () => Promise<TradeListing[]>;
}

const P2PCryptoTradeMap: React.FC<P2PCryptoTradeMapProps> = ({
  listings,
  selectedListing,
  setSelectedListing,
  mapObject,
  setMapObject,
  isLoading,
  isMobile,
  setShowPanel,
  setShowFilterMenu,
  fetchListings,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Debug flag - set to true to enable console logs
  const debug = true;

  // Initialize the map
  useEffect(() => {
    const initializeMap = async () => {
      // Check if mapRef exists and map is not already initialized
      if (
        mapRef.current &&
        !mapRef.current.querySelector(".mapboxgl-canvas-container")
      ) {
        if (debug) console.log("Initializing map...");
        
        // Load Mapbox GL script dynamically
        if (!window.mapboxgl) {
          if (debug) console.log("Loading mapboxgl scripts...");
          
          // Load CSS
          const linkEl = document.createElement("link");
          linkEl.href =
            "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
          linkEl.rel = "stylesheet";
          document.head.appendChild(linkEl);

          // Load JS
          const scriptEl = document.createElement("script");
          scriptEl.src =
            "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
          scriptEl.async = true;

          // Wait for script to load
          await new Promise((resolve) => {
            scriptEl.onload = resolve;
            document.head.appendChild(scriptEl);
          });
          
          if (debug) console.log("mapboxgl scripts loaded successfully");
        }

        // Initialize the map
        try {
          const mapboxgl = window.mapboxgl;
          mapboxgl.accessToken =
            "pk.eyJ1IjoiamF5ZGVuLWNueiIsImEiOiJjbThpZTljaW8wNmh0MmtvZTh4czRycWp1In0.P3UGPsCBIDnPIADynqDMrw";

          // New Zealand coordinates
          const nzCenter = [172.8344, -41.5]; // [longitude, latitude]
          const initialZoom = 5;

          const map = new mapboxgl.Map({
            container: mapRef.current,
            style: "mapbox://styles/mapbox/outdoors-v12",
            center: nzCenter,
            zoom: initialZoom,
          });

          // Store map object for later use
          setMapObject(map);

          // Add navigation controls
          map.addControl(new mapboxgl.NavigationControl(), "top-right");

          // Wait for map to load before fetching listings
          map.on("load", () => {
            if (debug) console.log("Map loaded successfully");
            setMapLoaded(true);
            
            // Add markers for each listing
            if (listings.length > 0) {
              if (debug) console.log("Adding markers on initial load:", listings.length);
              addMarkersToMap(map, listings);
            }
          });
          
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      } else if (mapObject && mapLoaded && listings.length > 0) {
        // If map is already initialized but we need to refresh markers
        if (debug) console.log("Map already initialized, adding markers:", listings.length);
        addMarkersToMap(mapObject, listings);
      }
    };

    // Initialize map when component mounts
    initializeMap();
  }, [listings, mapObject, setMapObject, mapLoaded]);

  // Function to add markers to the map
  const addMarkersToMap = (map: any, tradeListings: TradeListing[]) => {
    if (!map || !tradeListings.length) {
      if (debug) console.log("Map or listings not available");
      return;
    }
    
    if (debug) {
      console.log("Adding markers to map, count:", tradeListings.length);
      console.log("Sample listing:", tradeListings[0]);
    }
    
    // Clear existing markers
    if (markersRef.current.length > 0) {
      if (debug) console.log("Removing existing markers:", markersRef.current.length);
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }

    // Create new markers array
    const newMarkers: any[] = [];

    // Add markers for each listing
    tradeListings.forEach((listing) => {
      if (!listing.location || typeof listing.location.lat !== 'number' || typeof listing.location.lng !== 'number') {
        if (debug) console.log("Invalid location data:", listing.location);
        return;
      }
      
      // Create custom element for marker
      const el = document.createElement("div");
      el.className = "marker";
      
      // Set color based on trade type (buy/sell)
      const markerColor = listing.tradeType === "buy" ? "#22c55e" : "#ef4444"; // Green for buy, red for sell
      
      el.style.backgroundColor = markerColor;
      el.style.width = "25px";
      el.style.height = "25px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

// Create popup for the marker
const getCryptoColor = (cryptoType: string): string => {
  // Return appropriate color based on crypto type
  const colors: Record<string, string> = {
    "BTC": "#F7931A",
    "ETH": "#627EEA",
    "USDT": "#26A17B",
    // Add more as needed
    "default": "#1E88E5"
  };
  return colors[cryptoType] || colors.default;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const tradeTypeColor = listing.tradeType === "buy" ? "#22c55e" : "#ef4444";
const tradeTypeText = listing.tradeType === "buy" ? "Buying" : "Selling";

const popupHTML = `
  <div style="width: 280px; background-color: #1F2937; border-radius: 8px; box-shadow: 0 10px 15px rgba(0,0,0,0.5); overflow: hidden;">
    <div style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="font-size: 18px; font-weight: bold; color: white; margin: 0;">
          ${listing.title}
        </h3>
        <button style="background: none; border: none; color: #9CA3AF; font-size: 24px; font-weight: bold; cursor: pointer; padding: 4px 8px;">
          &times;
        </button>
      </div>

      <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
        <div style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 14px; background-color: ${getCryptoColor(listing.cryptoType)}; color: #000;">
          ${listing.cryptoType}
        </div>
        
        <div style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 14px; background-color: ${tradeTypeColor}; color: white;">
          ${tradeTypeText}
        </div>
      </div>

      <div style="margin-bottom: 8px;">
        <div style="font-weight: 500; color: white; font-size: 18px;">
          ${listing.price} ${listing.currency}
        </div>
        <div style="color: #9CA3AF; font-size: 14px;">
          Posted ${formatDate(listing.createdAt)}
        </div>
      </div>

      <div style="margin-bottom: 8px; color: white;">${listing.description}</div>

      <div style="display: flex; flex-direction: column; font-size: 14px; color: #D1D5DB; margin-bottom: 12px;">
        <div style="margin-bottom: 4px;">
          <span style="font-weight: bold;">Trader:</span> 
          ${listing.trader.name}
        </div>
        <div>
          <span style="font-weight: bold;">Rating:</span> 
          ${listing.trader.rating}★ (${listing.trader.completedTrades} trades)
        </div>
      </div>

      <button style="width: 100%; font-size:1.2em; background: linear-gradient(to right, #22c55e, #16a34a); color: white; padding: 8px 0; border-radius: 8px; border: none; cursor: pointer; font-weight: 500;">
        Contact Trader
      </button>
    </div>
  </div>
`;

const popup = new window.mapboxgl.Popup({ 
  offset: 25,
  className: 'custom-popup', // Add a custom class
  closeButton: false // Hide the default close button
}).setHTML(popupHTML);

// Add a style tag to the document to target the mapboxgl popup container
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  .custom-popup .mapboxgl-popup-content {
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
  .custom-popup .mapboxgl-popup-tip {
    border-top-color: #1F2937;
    border-bottom-color: #1F2937;
  }
`;
document.head.appendChild(styleTag);

      if (debug) console.log("Creating marker at:", [listing.location.lng, listing.location.lat]);
      
      try {
        // Create and add the marker
        const marker = new window.mapboxgl.Marker(el)
          .setLngLat([listing.location.lng, listing.location.lat])
          .setPopup(popup)
          .addTo(map);
        
        // Store reference to remove later
        newMarkers.push(marker);

        // Add click event to focus on this listing
        el.addEventListener("click", () => {
          setSelectedListing(listing);

          // Fly to this location
          map.flyTo({
            center: [listing.location.lng, listing.location.lat],
            zoom: 12,
            essential: true,
          });

          // On mobile, show the panel
          if (isMobile) {
            setShowPanel(true);
            // Hide filter menu when showing panel
            setShowFilterMenu(false);
          }
        });
      } catch (error) {
        console.error("Error creating marker:", error);
      }
    });
    
    // Update markers reference
    markersRef.current = newMarkers;
    
    if (debug) console.log(`Added ${newMarkers.length} markers to map`);
  };

  return (
    <div ref={mapRef} className="w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80 z-10">
          <div className="text-gray-800 text-lg">Loading map...</div>
        </div>
      )}
    </div>
  );
};

// Declare the mapboxgl on window for TypeScript
declare global {
  interface Window {
    mapboxgl: any;
  }
}

export default P2PCryptoTradeMap;