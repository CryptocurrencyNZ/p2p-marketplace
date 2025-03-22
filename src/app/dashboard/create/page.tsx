"use client"

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  Plus, 
  Minus, 
  DollarSign, 
  Bitcoin, 
  Map,
  AlignLeft,
  CreditCard,
  Landmark,
  ShoppingCart,
  Tag
} from 'lucide-react';

import { NZ_REGIONS } from '@/components/Map/filters';

const CreateListingPage = () => {
  // Define the currency type
  type Currency = {
    id: string;
    name: string;
    symbol: string;
    type: 'crypto' | 'fiat';
    icon: React.ReactNode;
  };

  // Define the price response type
  type PriceResponse = {
    id: string;
    name: string;
    symbol: string;
    price_usd: number | null;
    price_nzd: number;
    nzd_rate?: number;
    last_updated: string;
  };

  // State for the form fields
  const [listingType, setListingType] = useState<'buy' | 'sell'>('sell');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showPaymentCurrencyDropdown, setShowPaymentCurrencyDropdown] = useState(false);
  const [amount, setAmount] = useState('');
  const [marginRate, setMarginRate] = useState(0);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onChainProof, setOnChainProof] = useState(false);
  
  // New state for live price data
  const [livePrice, setLivePrice] = useState<PriceResponse | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  // List of popular cryptocurrencies and fiat options
  const currencyOptions: Currency[] = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', icon: <Bitcoin size={20} /> },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', type: 'crypto', icon: <DollarSign size={20} /> },
    { id: 'usdt', name: 'Tether', symbol: 'USDT', type: 'crypto', icon: <DollarSign size={20} /> },
    { id: 'bnb', name: 'BNB', symbol: 'BNB', type: 'crypto', icon: <DollarSign size={20} /> },
    { id: 'xrp', name: 'Ripple', symbol: 'XRP', type: 'crypto', icon: <DollarSign size={20} /> },
    { id: 'sol', name: 'Solana', symbol: 'SOL', type: 'crypto', icon: <DollarSign size={20} /> },
    { id: 'ada', name: 'Cardano', symbol: 'ADA', type: 'crypto', icon: <DollarSign size={20} /> },
    { id: 'nzd', name: 'New Zealand Dollar', symbol: 'NZD', type: 'fiat', icon: <DollarSign size={20} /> },
  ];

  // Fetch live price data when currency changes
  useEffect(() => {
    async function fetchPriceData() {
      if (!selectedCurrency) return;
      
      // Skip fetching for NZD as it's the base currency
      if (selectedCurrency.symbol === 'NZD') {
        setLivePrice({
          id: selectedCurrency.id,
          name: selectedCurrency.name,
          symbol: selectedCurrency.symbol,
          price_usd: null,
          price_nzd: 1.0,
          last_updated: new Date().toISOString()
        });
        return;
      }
      
      try {
        setIsLoadingPrice(true);
        setPriceError(null);
        
        const response = await fetch(`/api/crypto-price?currency=${selectedCurrency.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch price data');
        }
        
        const priceData = await response.json();
        setLivePrice(priceData);
      } catch (error) {
        console.error('Error fetching price data:', error);
        setPriceError(error instanceof Error ? error.message : 'Failed to fetch price data');
        setLivePrice(null);
      } finally {
        setIsLoadingPrice(false);
      }
    }
    
    fetchPriceData();
    
    // Set up interval to refresh price data every 60 seconds
    const intervalId = setInterval(fetchPriceData, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [selectedCurrency]);

  // Filter currencies based on search
  const filteredCurrencies = currencyOptions.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group currencies by type
  const groupedCurrencies = {
    crypto: filteredCurrencies.filter((c) => c.type === 'crypto'),
    fiat: filteredCurrencies.filter((c) => c.type === 'fiat'),
  };

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setShowCurrencyDropdown(false);
  };

  // Calculate total amount with margin
  const calculateTotalWithMargin = (): number => {
    if (!amount) return 0;
    const baseAmount = parseFloat(amount);
    return baseAmount + (baseAmount * marginRate) / 100;
  };

  // Calculate value in NZD
  const calculateNZDValue = (): number => {
    if (!amount || !livePrice) return 0;
    const baseAmount = parseFloat(amount);
    return baseAmount * livePrice.price_nzd;
  };

  // Calculate margin amount
  const calculateMarginAmount = (): number => {
    if (!amount) return 0;
    const baseAmount = parseFloat(amount);
    return (baseAmount * marginRate) / 100;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Complete validation - check ALL required fields
    if (!selectedCurrency || !amount || !location || !description) {
      const missingFields = [];
      if (!selectedCurrency) missingFields.push("Currency");
      if (!amount) missingFields.push("Amount");
      if (!location) missingFields.push("Location");
      if (!description) missingFields.push("Description");
      
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create complete API payload with ALL required fields
      const payload = {
        title: `${listingType === 'sell' ? 'Selling' : 'Buying'} ${amount} ${selectedCurrency.symbol}`,
        location: location,
        price: parseFloat(amount),
        isBuy: listingType === 'buy',
        currency: selectedCurrency.symbol,
        descrption: description, // Note: This matches the typo in your API schema
        onChainProof: onChainProof,
        marginRate: marginRate
      };
      
      console.log("Submitting payload:", payload);
      
      // Make API call
      const response = await fetch('/api/listings/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create listing');
      }
      
      // Handle success
      const data = await response.json();
      console.log('Listing created successfully:', data);
      
      // Redirect to dashboard after successful creation
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Error creating listing:', error);
      alert(`Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the selected currency from payment options
  const filteredPaymentCurrencies = currencyOptions.filter(
    (currency) =>
      (currency.name.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(paymentSearchQuery.toLowerCase())) &&
      (!selectedCurrency || currency.id !== selectedCurrency.id)
  );

  // Group payment currencies by type
  const groupedPaymentCurrencies = {
    crypto: filteredPaymentCurrencies.filter((c) => c.type === 'crypto'),
    fiat: filteredPaymentCurrencies.filter((c) => c.type === 'fiat'),
  };

  // Format a number with proper decimal places based on currency type
  const formatAmount = (value: number, currencySymbol: string | undefined): string => {
    if (!currencySymbol) return value.toString();
    
    // Fiat currencies typically use 2 decimal places
    if (currencySymbol === 'NZD') {
      return value.toFixed(2);
    }
    
    // Crypto usually displays more decimal places
    return value.toFixed(8);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="px-4 py-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center">
            <button className="mr-3 p-1.5 text-gray-400 hover:text-green-400 rounded-lg transition-all duration-200">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-300 text-transparent bg-clip-text">
              Create Listing
            </h1>
          </div>
          
          {/* Buy/Sell Tab Switcher */}
          <div className="mt-6 bg-gray-800 p-1 rounded-full flex max-w-xs mx-auto">
            <button
              onClick={() => setListingType('buy')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                listingType === 'buy'
                  ? 'bg-green-500 text-gray-900 shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingCart size={18} className={`mr-2 transition-opacity duration-300 ${
                listingType === 'buy' ? 'opacity-100' : 'opacity-70'
              }`} />
              Buy
            </button>
            <button
              onClick={() => setListingType('sell')}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
                listingType === 'sell'
                  ? 'bg-green-500 text-gray-900 shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tag size={18} className={`mr-2 transition-opacity duration-300 ${
                listingType === 'sell' ? 'opacity-100' : 'opacity-70'
              }`} />
              Sell
            </button>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Currency Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {listingType === 'sell' ? 'Currency to Sell' : 'Currency to Buy'}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg p-3 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              >
                {selectedCurrency ? (
                  <div className="flex items-center">
                    <span className="mr-2">{selectedCurrency.icon}</span>
                    <span className="font-medium">{selectedCurrency.name}</span>
                    <span className="ml-2 text-gray-400">({selectedCurrency.symbol})</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Select a currency</span>
                )}
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${
                    showCurrencyDropdown ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {/* Currency Dropdown */}
              {showCurrencyDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-700">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search currencies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md text-white px-4 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {/* Crypto Section */}
                    {groupedCurrencies.crypto.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-800/70">
                          Cryptocurrencies
                        </div>
                        {groupedCurrencies.crypto.map((currency) => (
                          <button
                            key={currency.id}
                            type="button"
                            className="w-full px-3 py-2 flex items-center hover:bg-gray-700/50 text-left text-sm transition-colors duration-200"
                            onClick={() => handleCurrencySelect(currency)}
                          >
                            <span className="mr-2">{currency.icon}</span>
                            <span>{currency.name}</span>
                            <span className="ml-2 text-gray-400">({currency.symbol})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Fiat Section */}
                    {groupedCurrencies.fiat.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-800/70">
                          Fiat Currencies
                        </div>
                        {groupedCurrencies.fiat.map((currency) => (
                          <button
                            key={currency.id}
                            type="button"
                            className="w-full px-3 py-2 flex items-center hover:bg-gray-700/50 text-left text-sm transition-colors duration-200"
                            onClick={() => handleCurrencySelect(currency)}
                          >
                            <span className="mr-2">{currency.icon}</span>
                            <span>{currency.name}</span>
                            <span className="ml-2 text-gray-400">({currency.symbol})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredCurrencies.length === 0 && (
                      <div className="px-3 py-4 text-center text-gray-400 text-sm">
                        No currencies found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <div className="relative">
              
              {/* Payment Currency Dropdown */}
              {showPaymentCurrencyDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-700">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search payment methods..."
                        value={paymentSearchQuery}
                        onChange={(e) => setPaymentSearchQuery(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md text-white px-4 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
                      />
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {/* Crypto Section */}
                    {groupedPaymentCurrencies.crypto.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-800/70">
                          Cryptocurrencies
                        </div>
                        {groupedPaymentCurrencies.crypto.map((currency) => (
                          <button
                            key={currency.id}
                            type="button"
                            className="w-full px-3 py-2 flex items-center hover:bg-gray-700/50 text-left text-sm transition-colors duration-200"
                            onClick={() => handleCurrencySelect(currency)}
                          >
                            <span className="mr-2">{currency.icon}</span>
                            <span>{currency.name}</span>
                            <span className="ml-2 text-gray-400">({currency.symbol})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Fiat Section */}
                    {groupedPaymentCurrencies.fiat.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-gray-800/70">
                          Fiat Currencies
                        </div>
                        {groupedPaymentCurrencies.fiat.map((currency) => (
                          <button
                            key={currency.id}
                            type="button"
                            className="w-full px-3 py-2 flex items-center hover:bg-gray-700/50 text-left text-sm transition-colors duration-200"
                            onClick={() => handleCurrencySelect(currency)}
                          >
                            <span className="mr-2">{currency.icon}</span>
                            <span>{currency.name}</span>
                            <span className="ml-2 text-gray-400">({currency.symbol})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredPaymentCurrencies.length === 0 && (
                      <div className="px-3 py-4 text-center text-gray-400 text-sm">
                        No payment methods found matching "{paymentSearchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Amount to {listingType === 'sell' ? 'Sell' : 'Buy'}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^(\d*\.?\d*)$/.test(value) || value === '') {
                    setAmount(value);
                  }
                }}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
              />
              {selectedCurrency && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  {selectedCurrency.symbol}
                </div>
              )}
            </div>
            {selectedCurrency && (
              <p className="text-xs text-gray-400">
                {amount ? `${listingType === 'sell' ? 'Selling' : 'Buying'} ${amount} ${selectedCurrency.symbol}` : `Enter amount in ${selectedCurrency.symbol}`}
              </p>
            )}
          </div>

{/* Margin Rate Input */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-300">
    Margin Rate
  </label>
  <div className="relative">
    <input
      type="number"
      min="0"
      step="0.01"
      value={marginRate}
      onChange={(e) => {
        const value = parseFloat(e.target.value);
        setMarginRate(isNaN(value) ? 0 : value);
      }}
      placeholder="0.00"
      className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm"
      // This CSS completely removes the incrementors on all browsers
      style={{ 
        WebkitAppearance: "none", 
        MozAppearance: "textfield",
        appearance: "textfield"
      }}
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
      %
    </div>
  </div>
</div>
  
  {/* Visual Equation Display */}
  {amount && marginRate ? (
    <div className="mt-2 p-3 bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Base Amount:</span>
        <span className="text-sm font-medium text-white">{amount} {selectedCurrency?.symbol || ''}</span>
      </div>
    <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-gray-300">Margin ({marginRate}%):</span>
        <span className="text-sm font-medium text-green-400">
            {((parseFloat(amount) * (marginRate)) / 100).toFixed(8).toString()} {selectedCurrency?.symbol || ''}
        </span>
    </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
        <span className="text-sm font-medium text-gray-300">Total:</span>
        <span className="text-sm font-medium text-green-400">
          {(parseFloat(amount) + (parseFloat(amount) * (marginRate)) / 100).toFixed(8)} {selectedCurrency?.symbol || ''}
        </span>
      </div>
    </div>
  ) : (
    <p className="text-xs text-gray-400">
      Set margin percentage to calculate final amount
    </p>
  )}


{/* Add current NZD value display when we have price data */}
{(livePrice && selectedCurrency) && (
  <>
    <div className="mt-2 pt-2 border-t border-gray-700">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">Current Price:</span>
        <span className="text-sm font-medium text-white">
          1 {selectedCurrency.symbol} = {formatAmount(livePrice.price_nzd, 'NZD')} NZD
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-gray-300">Value in NZD:</span>
        <span className="text-sm font-medium text-green-400">
          {formatAmount(calculateNZDValue(), 'NZD')} NZD
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm text-gray-300">Total with Margin:</span>
        <span className="text-sm font-medium text-green-400">
          {formatAmount(calculateTotalWithMargin() * livePrice.price_nzd, 'NZD')} NZD
        </span>
      </div>
      <div className="text-xs text-gray-400 mt-1 text-right">
        Last updated: {new Date(livePrice.last_updated).toLocaleTimeString()}
      </div>
    </div>
  </>
)}

{/* On-Chain Proof Section */}
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <label className="block text-sm font-medium text-gray-300">
      On-Chain Proof
    </label>
    <div className="relative inline-block w-10 mr-2 align-middle select-none">
      <input 
        type="checkbox" 
        id="onChainProof" 
        name="onChainProof" 
        checked={onChainProof}
        onChange={(e) => setOnChainProof(e.target.checked)}
        className="opacity-0 absolute block w-6 h-6 rounded-full bg-white border-4 cursor-pointer"
      />
      <label 
        htmlFor="onChainProof" 
        className={`block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer ${onChainProof ? 'bg-green-500' : ''}`}
      >
        <span className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-300 ${onChainProof ? 'translate-x-4' : ''}`}></span>
      </label>
    </div>
  </div>
  
  <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
    <div className="flex items-start">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-300">
          On-Chain Proof creates an escrow contract that locks your funds on the blockchain, verifying to buyers that you own the cryptocurrency you're selling. This increases trust without requiring you to send funds first.
        </p>
        {onChainProof && (
          <p className="mt-2 text-sm text-green-400">
            Your listing will show a verified badge, indicating funds are secured on-chain.
          </p>
        )}
      </div>
    </div>
  </div>
</div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about your listing..."
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm resize-none"
              />
              <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            <p className="text-xs text-gray-400 flex justify-between">
              <span>Be specific about payment terms, meeting preferences, etc.</span>
              <span>{description.length}/280</span>
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Location
            </label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm appearance-none"
              >
                <option value="">Select your location...</option>
                {NZ_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <Map className="absolute left-3 top-3 text-gray-400" size={18} />
              <ChevronDown 
                size={18} 
                className="absolute right-3 top-3 text-gray-400 pointer-events-none" 
              />
            </div>
            <p className="text-xs text-gray-400">
              Your general location helps buyers find local trades
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-green-600 to-green-500 text-gray-900 font-medium rounded-lg py-3 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : `Create ${listingType === 'sell' ? 'Sell' : 'Buy'} Listing`}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateListingPage;