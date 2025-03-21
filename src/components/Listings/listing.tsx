'use client';

import React, { useState, useEffect, useRef } from 'react';

// Type definitions for our trade listings
interface TradeLocation {
  lat: number;
  lng: number;
}

interface TradeListing {
  id: string;
  title: string;
  location: TradeLocation;
  price: number;
  currency: string;
  cryptoType: string;
  trader: {
    name: string;
    rating: number;
    completedTrades: number;
  };
  description: string;
  createdAt: string;
}

interface P2PCryptoTradeMapProps {
  className?: string;
}

const P2PCryptoTradeMap: React.FC<P2PCryptoTradeMapProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [listings, setListings] = useState<TradeListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<TradeListing | null>(null);
  const [mapObject, setMapObject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listingsVisible, setListingsVisible] = useState<boolean>(true);
  
  // Mock data - replace with your actual API call
  const fetchListings = async () => {
    // Simulating API fetch delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data for New Zealand locations
    const mockListings: TradeListing[] = [
      {
        id: '1',
        title: 'Selling Bitcoin in Auckland CBD',
        location: { lat: -36.8485, lng: 174.7633 },
        price: 82000,
        currency: 'NZD',
        cryptoType: 'BTC',
        trader: { name: 'CryptoKiwi', rating: 4.8, completedTrades: 143 },
        description: 'Trading in person at the central library. Cash only.',
        createdAt: '2025-03-15T14:30:00Z'
      },
      {
        id: '2',
        title: 'Ethereum for Cash in Wellington',
        location: { lat: -41.2865, lng: 174.7762 },
        price: 3700,
        currency: 'NZD',
        cryptoType: 'ETH',
        trader: { name: 'WellyTrader', rating: 4.6, completedTrades: 87 },
        description: 'Meet at Cuba Street cafes. Min trade 0.5 ETH.',
        createdAt: '2025-03-18T09:15:00Z'
      },
      {
        id: '3',
        title: 'USDT trades in Christchurch',
        location: { lat: -43.5321, lng: 172.6362 },
        price: 1.62,
        currency: 'NZD',
        cryptoType: 'USDT',
        trader: { name: 'SouthIslandCrypto', rating: 5.0, completedTrades: 211 },
        description: 'Buying USDT with NZD. Flexible meeting locations around Christchurch.',
        createdAt: '2025-03-19T16:45:00Z'
      },
      {
        id: '4',
        title: 'Buying Solana in Hamilton',
        location: { lat: -37.7870, lng: 175.2793 },
        price: 290,
        currency: 'NZD',
        cryptoType: 'SOL',
        trader: { name: 'HamTownMiner', rating: 4.2, completedTrades: 43 },
        description: 'Looking to buy SOL. Can meet anywhere in Hamilton area.',
        createdAt: '2025-03-17T11:20:00Z'
      },
      {
        id: '5',
        title: 'Sell BNB in Queenstown',
        location: { lat: -45.0302, lng: 168.6612 },
        price: 930,
        currency: 'NZD',
        cryptoType: 'BNB',
        trader: { name: 'QTownCryptoGuru', rating: 4.9, completedTrades: 76 },
        description: 'Selling BNB at market price. Meet in public places only.',
        createdAt: '2025-03-16T15:50:00Z'
      }
    ];
    
    setListings(mockListings);
    setIsLoading(false);
    return mockListings;
  };
  
  // Initialize the map
  useEffect(() => {
    const initializeMap = async () => {
      // Check if the map is already initialized
      if (mapRef.current && !mapRef.current.querySelector('.mapboxgl-canvas-container')) {
        setIsLoading(true);
        
        // Load Mapbox GL script dynamically
        if (!window.mapboxgl) {
          // Load CSS
          const linkEl = document.createElement('link');
          linkEl.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          linkEl.rel = 'stylesheet';
          document.head.appendChild(linkEl);
          
          // Load JS
          const scriptEl = document.createElement('script');
          scriptEl.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          scriptEl.async = true;
          
          // Wait for script to load
          await new Promise((resolve) => {
            scriptEl.onload = resolve;
            document.head.appendChild(scriptEl);
          });
        }
        
        // Initialize the map
        const mapboxgl = window.mapboxgl;
        mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Replace with your token
        
        // New Zealand coordinates
        const nzCenter = [172.8344, -41.5000]; // [longitude, latitude]
        const initialZoom = 5;
        
        const map = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/dark-v11', // Using dark style for crypto theme
          center: nzCenter,
          zoom: initialZoom,
        });
        
        // Store map object for later use
        setMapObject(map);
        
        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Wait for map to load before fetching listings
        map.on('load', async () => {
          const tradeListings = await fetchListings();
          
          // Add markers for each listing
          tradeListings.forEach(listing => {
            // Create custom element for marker
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = getCryptoColor(listing.cryptoType);
            el.style.width = '25px';
            el.style.height = '25px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.cursor = 'pointer';
            
            // Create popup for the marker
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="color: black; max-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 5px;">${listing.title}</h3>
                <p>${listing.cryptoType} - ${listing.price} ${listing.currency}</p>
                <p>Trader: ${listing.trader.name} (${listing.trader.rating}★)</p>
              </div>
            `);
            
            // Create and add the marker
            const marker = new mapboxgl.Marker(el)
              .setLngLat([listing.location.lng, listing.location.lat])
              .setPopup(popup)
              .addTo(map);
              
            // Add click event to focus on this listing
            el.addEventListener('click', () => {
              setSelectedListing(listing);
              
              // Fly to this location
              map.flyTo({
                center: [listing.location.lng, listing.location.lat],
                zoom: 12,
                essential: true
              });
            });
          });
        });
      }
    };
    
    // Initialize map when component mounts
    initializeMap();
  }, []);
  
  // Helper function to get color based on crypto type
  const getCryptoColor = (cryptoType: string): string => {
    const colors: {[key: string]: string} = {
      'BTC': '#f7931a',
      'ETH': '#627eea',
      'USDT': '#26a17b',
      'SOL': '#00ffbd',
      'BNB': '#f3ba2f'
    };
    
    return colors[cryptoType] || '#8c8c8c';
  };
  
  // Format date to more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Filter listings (could add filtering functionality later)
  const filteredListings = listings;
  
  return (
    <div className={`${className} relative`}>
      <div className="flex h-[700px]">
        {/* Map Section - Larger square view */}
        <div className="flex-grow h-full relative bg-gray-900 rounded-lg shadow-xl overflow-hidden">
          {/* Map Container */}
          <div ref={mapRef} className="w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 z-10">
                <div className="text-white text-lg">Loading map...</div>
              </div>
            )}
          </div>
          
          {/* Toggle button for listings panel */}
          <button 
            className="absolute top-4 right-4 z-20 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg"
            onClick={() => setListingsVisible(!listingsVisible)}
            title={listingsVisible ? "Hide listings" : "Show listings"}
          >
            {listingsVisible ? "→" : "←"}
          </button>
        </div>
        
        {/* Listings Panel - Right side navbar style */}
        <div 
          className={`w-80 h-full bg-gray-800 border-l border-gray-700 shadow-xl transition-all duration-300 transform ${
            listingsVisible ? 'translate-x-0' : 'translate-x-full'
          } absolute right-0 top-0 z-10 md:relative md:${
            listingsVisible ? 'translate-x-0' : 'translate-x-80'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">P2P Crypto Trade Listings</h2>
              <p className="text-gray-400 text-sm">Showing {filteredListings.length} available trades</p>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-white">Loading listings...</div>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {filteredListings.map(listing => (
                    <div 
                      key={listing.id}
                      className={`p-4 hover:bg-gray-700 cursor-pointer transition-colors ${selectedListing?.id === listing.id ? 'bg-gray-700 border-l-4 border-blue-500' : ''}`}
                      onClick={() => {
                        setSelectedListing(listing);
                        
                        // Fly to this location on the map
                        if (mapObject) {
                          mapObject.flyTo({
                            center: [listing.location.lng, listing.location.lat],
                            zoom: 12,
                            essential: true
                          });
                        }
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-6 h-6 rounded-full mr-2"
                          style={{ backgroundColor: getCryptoColor(listing.cryptoType) }}
                        ></div>
                        <h3 className="font-medium text-white">{listing.title}</h3>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <div className="text-gray-300">{listing.cryptoType}</div>
                        <div className="font-medium text-white">{listing.price} {listing.currency}</div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="text-gray-400">
                          {listing.trader.name} ({listing.trader.rating}★)
                        </div>
                        <div className="text-gray-400">{formatDate(listing.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Listing Detail Popup (shows when a listing is selected) */}
      {selectedListing && (
        <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-gray-800 rounded-t-lg md:rounded-lg shadow-2xl z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-white">{selectedListing.title}</h3>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedListing(null)}
              >
                &times;
              </button>
            </div>
            
            <div 
              className="inline-block px-2 py-1 rounded-full text-sm mb-2"
              style={{ 
                backgroundColor: getCryptoColor(selectedListing.cryptoType),
                color: '#000' 
              }}
            >
              {selectedListing.cryptoType}
            </div>
            
            <div className="mb-2">
              <div className="font-medium text-white text-lg">
                {selectedListing.price} {selectedListing.currency}
              </div>
              <div className="text-gray-400 text-sm">
                Posted {formatDate(selectedListing.createdAt)}
              </div>
            </div>
            
            <div className="mb-2 text-white">
              {selectedListing.description}
            </div>
            
            <div className="flex items-center text-sm text-gray-300 mb-3">
              <div className="mr-3">
                <span className="font-bold">Trader:</span> {selectedListing.trader.name}
              </div>
              <div>
                <span className="font-bold">Rating:</span> {selectedListing.trader.rating}★ ({selectedListing.trader.completedTrades} trades)
              </div>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
              Contact Trader
            </button>
          </div>
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