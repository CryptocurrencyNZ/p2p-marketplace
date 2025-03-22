"use client";

import React, { useEffect, useRef } from "react";
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

  // Initialize the map
  useEffect(() => {
    const initializeMap = async () => {
      // Check if mapRef exists and map is not already initialized
      if (
        mapRef.current &&
        !mapRef.current.querySelector(".mapboxgl-canvas-container")
      ) {
        // Load Mapbox GL script dynamically
        if (!window.mapboxgl) {
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
        }

        // Initialize the map
        const mapboxgl = window.mapboxgl;
        mapboxgl.accessToken =
          "pk.eyJ1IjoiamF5ZGVuLWNueiIsImEiOiJjbThpZTljaW8wNmh0MmtvZTh4czRycWp1In0.P3UGPsCBIDnPIADynqDMrw"; // Replace with your token

        // New Zealand coordinates
        const nzCenter = [172.8344, -41.5]; // [longitude, latitude]
        const initialZoom = 5;

        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/outdoors-v12", // Changed to light style
          center: nzCenter,
          zoom: initialZoom,
        });

        // Store map object for later use
        setMapObject(map);

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Wait for map to load before fetching listings
        map.on("load", async () => {
          // Add markers for each listing
          addMarkersToMap(map, listings);
        });
      } else if (mapObject && listings.length > 0) {
        // If map is already initialized but we need to refresh markers
        addMarkersToMap(mapObject, listings);
      }
    };

    // Initialize map when component mounts
    initializeMap();
  }, [listings, mapObject, setMapObject]);

  // Function to add markers to the map
  const addMarkersToMap = (map: any, tradeListings: TradeListing[]) => {
    // Clear existing markers if needed
    const existingMarkers = document.querySelectorAll('.marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for each listing
    tradeListings.forEach((listing) => {
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

      // Create popup for the marker
      const popup = new window.mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="color: black; max-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">${listing.title}</h3>
          <p>${listing.cryptoType} - ${listing.price} ${listing.currency}</p>
          <p>Trader: ${listing.trader.name} (${listing.trader.rating}★)</p>
          <p>Type: ${listing.tradeType === "buy" ? "Buying" : "Selling"}</p>
        </div>
      `);

      // Create and add the marker
      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([listing.location.lng, listing.location.lat])
        .setPopup(popup)
        .addTo(map);

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
    });
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