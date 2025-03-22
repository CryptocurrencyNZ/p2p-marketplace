"use client"

import React, { useState } from 'react';
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

  // State for the form fields
  const [listingType, setListingType] = useState<'buy' | 'sell'>('sell');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showPaymentCurrencyDropdown, setShowPaymentCurrencyDropdown] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { id: 'usd', name: 'US Dollar', symbol: 'USD', type: 'fiat', icon: <DollarSign size={20} /> },
    { id: 'eur', name: 'Euro', symbol: 'EUR', type: 'fiat', icon: <DollarSign size={20} /> },
    { id: 'gbp', name: 'British Pound', symbol: 'GBP', type: 'fiat', icon: <DollarSign size={20} /> },
    { id: 'aud', name: 'Australian Dollar', symbol: 'AUD', type: 'fiat', icon: <DollarSign size={20} /> },
    { id: 'jpy', name: 'Japanese Yen', symbol: 'JPY', type: 'fiat', icon: <DollarSign size={20} /> },
  ];

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
        crypto_type: selectedCurrency.symbol, // Ensure this field is included
        descrption: description, // Note: This matches the typo in your API schema
        onChainProof: false
      };
      
      console.log("Submitting payload:", payload);
      
      // Make API call
      const response = await fetch('/api/listings', {
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