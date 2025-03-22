// File: app/api/crypto-price/route.ts

import { NextResponse } from 'next/server';
import { SUPPORTED_CURRENCIES, Currency, CurrencyType } from '@/lib/crypto';

// Define types
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

/**
 * Fetches current exchange rates with USD as base currency
 * @returns {Promise<ExchangeRateResponse>} Exchange rates object
 */
async function getExchangeRates(): Promise<ExchangeRateResponse> {
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
}

/**
 * Fetches crypto prices for multiple coins at once
 * @param {string[]} coinIds - Array of CoinGecko coin IDs
 * @returns {Promise<CryptoPrice>} Price data object
 */
async function getCryptoPrices(coinIds: string[]): Promise<CryptoPrice> {
  const idsParam = coinIds.join(',');
  const cryptoResponse = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`,
    { 
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 } // Cache for 60 seconds
    }
  );
  
  if (!cryptoResponse.ok) {
    throw new Error(`Failed to fetch crypto prices: ${cryptoResponse.status}`);
  }
  
  return await cryptoResponse.json();
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
        last_updated: new Date().toISOString()
      };
      
      return NextResponse.json(response);
    }
    
    // For crypto currencies, fetch price from CoinGecko
    const cryptoData = await getCryptoPrices([currency.id]);
    
    if (!cryptoData[currency.id] || !cryptoData[currency.id].usd) {
      return NextResponse.json(
        { error: `Price data not available for ${currency.name}` },
        { status: 404 }
      );
    }
    
    const usdPrice = cryptoData[currency.id].usd;
    
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
      const cryptoData = await getCryptoPrices([fromCurrency.id]);
      
      if (!cryptoData[fromCurrency.id] || !cryptoData[fromCurrency.id].usd) {
        return NextResponse.json(
          { error: `Price data not available for ${fromCurrency.name}` },
          { status: 404 }
        );
      }
      
      const usdPrice = cryptoData[fromCurrency.id].usd;
      rate = usdPrice * nzdRate; // Price of 1 unit of crypto in NZD
      convertedAmount = amount * rate;
    }
    // Case 2: Convert from NZD to crypto
    else if (fromCurrency.symbol === 'NZD' && toCurrency.type === 'crypto') {
      const cryptoData = await getCryptoPrices([toCurrency.id]);
      
      if (!cryptoData[toCurrency.id] || !cryptoData[toCurrency.id].usd) {
        return NextResponse.json(
          { error: `Price data not available for ${toCurrency.name}` },
          { status: 404 }
        );
      }
      
      const usdPrice = cryptoData[toCurrency.id].usd;
      const nzdPrice = usdPrice * nzdRate; // Price of 1 unit of crypto in NZD
      rate = 1 / nzdPrice; // How much crypto you get for 1 NZD
      convertedAmount = amount * rate;
    }
    // Case 3: Convert between different cryptocurrencies
    else if (fromCurrency.type === 'crypto' && toCurrency.type === 'crypto') {
      const cryptoData = await getCryptoPrices([fromCurrency.id, toCurrency.id]);
      
      if (!cryptoData[fromCurrency.id] || !cryptoData[fromCurrency.id].usd ||
          !cryptoData[toCurrency.id] || !cryptoData[toCurrency.id].usd) {
        return NextResponse.json(
          { error: `Price data not available for one of the selected currencies` },
          { status: 404 }
        );
      }
      
      const fromUsdPrice = cryptoData[fromCurrency.id].usd;
      const toUsdPrice = cryptoData[toCurrency.id].usd;
      
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