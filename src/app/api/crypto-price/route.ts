// File: app/api/crypto-price/route.ts

import { NextResponse } from 'next/server';
import { SUPPORTED_CURRENCIES } from '@/lib/crypto';

// Define types
type CurrencyType = 'crypto' | 'fiat';

interface Currency {
  id: string;
  name: string;
  symbol: string;
  type: CurrencyType;
}

interface CryptoPrice {
  [coinId: string]: {
    usd: number;
  };
}

interface ExchangeRateResponse {
  base: string;
  rates: {
    [currency: string]: number;
  };
  date: string;
}

interface PriceResponse {
  id: string;
  name: string;
  symbol: string;
  price_usd: number | null;
  price_nzd: number;
  nzd_rate?: number;
  last_updated: string;
  source?: string; // Added to track which data source was used
}

interface ConversionRequest {
  amount?: number;
  from?: string;
  to?: string;
}

interface ConversionResponse {
  from: string;
  to: string;
  amount: number;
  converted_amount: number;
  rate: number;
  last_updated: string;
}

// Common currency symbol mapping to CoinCap API IDs
const SYMBOL_TO_COINCAP_ID: Record<string, string> = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'bnb': 'binance-coin',
  'xrp': 'xrp',
  'ada': 'cardano',
  'sol': 'solana',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'ltc': 'litecoin',
  'link': 'chainlink',
  'usdt': 'tether',
  'usdc': 'usd-coin',
};

// Fallback prices for common cryptocurrencies in USD (as of March 2025)
const FALLBACK_PRICES: Record<string, number> = {
  'bitcoin': 82000,
  'ethereum': 5000,
  'binance-coin': 650,
  'xrp': 1.50,
  'cardano': 1.20,
  'solana': 180,
  'dogecoin': 0.20,
  'polkadot': 25,
  'litecoin': 120,
  'chainlink': 40,
  'tether': 1,
  'usd-coin': 1,
};

// Fallback NZD exchange rate (1 USD = ~1.65 NZD)
const FALLBACK_NZD_RATE = 1.65;

/**
 * Fetches current exchange rates with USD as base currency
 * @returns {Promise<ExchangeRateResponse>} Exchange rates object
 */
async function getExchangeRates(): Promise<ExchangeRateResponse> {
  try {
    const forexResponse = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { 
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!forexResponse.ok) {
      throw new Error(`Failed to fetch forex rates: ${forexResponse.status}`);
    }
    
    return await forexResponse.json();
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return a fallback exchange rate response
    return {
      base: 'USD',
      rates: {
        'NZD': FALLBACK_NZD_RATE
      },
      date: new Date().toISOString().split('T')[0]
    };
  }
}

/**
 * Fetches crypto price from CoinGecko API
 * @param {string} coinId - CoinGecko coin ID
 * @returns {Promise<number | null>} USD price or null if not available
 */
async function getCoinGeckoPrice(coinId: string): Promise<number | null> {
  try {
    const cryptoResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { 
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );
    
    if (!cryptoResponse.ok) {
      console.error(`CoinGecko API error: ${cryptoResponse.status} for ${coinId}`);
      return null;
    }
    
    const data = await cryptoResponse.json();
    
    if (!data[coinId] || typeof data[coinId].usd !== 'number') {
      return null;
    }
    
    return data[coinId].usd;
  } catch (error) {
    console.error(`Error fetching from CoinGecko for ${coinId}:`, error);
    return null;
  }
}

/**
 * Fetches crypto price from CoinCap API
 * @param {string} coinId - CoinGecko coin ID
 * @returns {Promise<number | null>} USD price or null if not available
 */
async function getCoinCapPrice(coinId: string): Promise<number | null> {
  try {
    // Map CoinGecko ID to CoinCap ID if needed
    const lowerCoinId = coinId.toLowerCase();
    let coinCapId = lowerCoinId;
    
    // Check if we need to map the ID
    for (const [symbol, capId] of Object.entries(SYMBOL_TO_COINCAP_ID)) {
      if (lowerCoinId === symbol || lowerCoinId.includes(symbol)) {
        coinCapId = capId;
        break;
      }
    }
    
    const response = await fetch(`https://api.coincap.io/v2/assets/${coinCapId}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      console.error(`CoinCap API error: ${response.status} for ${coinCapId}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !data.data || !data.data.priceUsd) {
      return null;
    }
    
    return parseFloat(data.data.priceUsd);
  } catch (error) {
    console.error(`Error fetching from CoinCap for ${coinId}:`, error);
    return null;
  }
}

/**
 * Fetches crypto price from Binance API
 * @param {string} symbol - Currency symbol
 * @returns {Promise<number | null>} USD price or null if not available
 */
async function getBinancePrice(symbol: string): Promise<number | null> {
  try {
    // Binance uses specific trading pairs
    const binanceSymbol = symbol.toUpperCase() + 'USDT';
    
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      console.error(`Binance API error: ${response.status} for ${binanceSymbol}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !data.price) {
      return null;
    }
    
    return parseFloat(data.price);
  } catch (error) {
    console.error(`Error fetching from Binance for ${symbol}:`, error);
    return null;
  }
}

/**
 * Gets crypto USD price using multiple sources with fallbacks
 * @param {Currency} currency - Currency object
 * @returns {Promise<{price: number, source: string}>} Price and source information
 */
async function getCryptoUsdPrice(currency: Currency): Promise<{price: number, source: string}> {
  if (currency.type === 'fiat') {
    if (currency.symbol === 'USD') {
      return { price: 1, source: 'fixed' };
    } else if (currency.symbol === 'NZD') {
      // For NZD, we'll return the inverse of the NZD rate
      const forexData = await getExchangeRates();
      return {
        price: 1 / forexData.rates.NZD,
        source: 'forex'
      };
    }
  }
  
  // For cryptocurrencies, try multiple sources
  
  // 1. Try CoinGecko first
  const geckoPrice = await getCoinGeckoPrice(currency.id);
  if (geckoPrice !== null) {
    return { price: geckoPrice, source: 'coingecko' };
  }
  
  // 2. Try CoinCap as fallback
  const coinCapPrice = await getCoinCapPrice(currency.id);
  if (coinCapPrice !== null) {
    return { price: coinCapPrice, source: 'coincap' };
  }
  
  // 3. Try Binance as another fallback
  const binancePrice = await getBinancePrice(currency.symbol);
  if (binancePrice !== null) {
    return { price: binancePrice, source: 'binance' };
  }
  
  // 4. Use fallback hardcoded prices if available
  if (currency.id.toLowerCase() in FALLBACK_PRICES) {
    return {
      price: FALLBACK_PRICES[currency.id.toLowerCase()],
      source: 'fallback'
    };
  }
  
  // If all else fails, throw an error
  throw new Error(`Could not get price for ${currency.name} from any source`);
}

/**
 * API route that fetches current cryptocurrency prices and converts to NZD
 * 
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - JSON response with crypto prices in NZD
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Get the currency ID from the URL params (e.g., ?currency=btc)
    const url = new URL(request.url);
    const currencyId = url.searchParams.get('currency')?.toLowerCase() || 'btc';
    
    // Check if the currency is supported
    if (!SUPPORTED_CURRENCIES[currencyId]) {
      return NextResponse.json(
        { error: `Currency '${currencyId}' is not supported` },
        { status: 400 }
      );
    }
    
    const currency = SUPPORTED_CURRENCIES[currencyId];
    
    // If the requested currency is NZD, return a fixed rate
    if (currency.type === 'fiat' && currency.symbol === 'NZD') {
      const response: PriceResponse = {
        id: currency.id,
        name: currency.name,
        symbol: currency.symbol,
        price_usd: null, // Not applicable for NZD
        price_nzd: 1.0,   // 1 NZD = 1 NZD
        last_updated: new Date().toISOString(),
        source: 'fixed'
      };
      
      return NextResponse.json(response);
    }
    
    // Get USD price from various sources with fallbacks
    const { price: usdPrice, source } = await getCryptoUsdPrice(currency);
    
    // Get USD to NZD conversion rate
    const forexData = await getExchangeRates();
    const nzdRate = forexData.rates.NZD;
    
    // Calculate price in NZD
    const nzdPrice = usdPrice * nzdRate;
    
    const response: PriceResponse = {
      id: currency.id,
      name: currency.name,
      symbol: currency.symbol,
      price_usd: usdPrice,
      price_nzd: nzdPrice,
      nzd_rate: nzdRate,
      last_updated: new Date().toISOString(),
      source: source
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Convert between currencies (crypto-to-NZD, NZD-to-crypto, or crypto-to-crypto)
 * 
 * @param {Request} request - The incoming request object with JSON body
 * @returns {NextResponse} - JSON response with converted amount
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: ConversionRequest = await request.json();
    const { amount = 1, from = 'btc', to = 'nzd' } = body;
    
    // Validate 'from' currency
    if (!SUPPORTED_CURRENCIES[from]) {
      return NextResponse.json(
        { error: `Currency '${from}' is not supported` },
        { status: 400 }
      );
    }
    
    // Validate 'to' currency
    if (!SUPPORTED_CURRENCIES[to]) {
      return NextResponse.json(
        { error: `Currency '${to}' is not supported` },
        { status: 400 }
      );
    }
    
    const fromCurrency = SUPPORTED_CURRENCIES[from];
    const toCurrency = SUPPORTED_CURRENCIES[to];
    
    // Special case: if converting from NZD to NZD
    if (fromCurrency.type === 'fiat' && toCurrency.type === 'fiat' && 
        fromCurrency.symbol === 'NZD' && toCurrency.symbol === 'NZD') {
      const response: ConversionResponse = {
        from: fromCurrency.symbol,
        to: toCurrency.symbol,
        amount,
        converted_amount: amount,
        rate: 1,
        last_updated: new Date().toISOString()
      };
      
      return NextResponse.json(response);
    }
    
    // Get exchange rates
    const forexData = await getExchangeRates();
    const nzdRate = forexData.rates.NZD;
    
    let convertedAmount = 0;
    let rate = 0;
    
    // Case 1: Convert from crypto to NZD
    if (fromCurrency.type === 'crypto' && toCurrency.symbol === 'NZD') {
      // Get from-currency price with fallbacks
      const { price: fromUsdPrice } = await getCryptoUsdPrice(fromCurrency);
      
      rate = fromUsdPrice * nzdRate; // Price of 1 unit of crypto in NZD
      convertedAmount = amount * rate;
    }
    // Case 2: Convert from NZD to crypto
    else if (fromCurrency.symbol === 'NZD' && toCurrency.type === 'crypto') {
      // Get to-currency price with fallbacks
      const { price: toUsdPrice } = await getCryptoUsdPrice(toCurrency);
      
      const nzdPrice = toUsdPrice * nzdRate; // Price of 1 unit of crypto in NZD
      rate = 1 / nzdPrice; // How much crypto you get for 1 NZD
      convertedAmount = amount * rate;
    }
    // Case 3: Convert between different cryptocurrencies
    else if (fromCurrency.type === 'crypto' && toCurrency.type === 'crypto') {
      // Get prices for both currencies with fallbacks
      const { price: fromUsdPrice } = await getCryptoUsdPrice(fromCurrency);
      const { price: toUsdPrice } = await getCryptoUsdPrice(toCurrency);
      
      rate = fromUsdPrice / toUsdPrice; // How many units of target crypto for 1 unit of source crypto
      convertedAmount = amount * rate;
    }
    
    const response: ConversionResponse = {
      from: fromCurrency.symbol,
      to: toCurrency.symbol,
      amount,
      converted_amount: convertedAmount,
      rate,
      last_updated: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}