// Define types
export type CurrencyType = 'crypto' | 'fiat';

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  type: CurrencyType;
}

// Define supported currencies
export const SUPPORTED_CURRENCIES: Record<string, Currency> = {
  btc: { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'crypto' },
  eth: { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', type: 'crypto' },
  usdt: { id: 'tether', name: 'Tether', symbol: 'USDT', type: 'crypto' },
  bnb: { id: 'binancecoin', name: 'BNB', symbol: 'BNB', type: 'crypto' },
  xrp: { id: 'ripple', name: 'Ripple', symbol: 'XRP', type: 'crypto' },
  sol: { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'crypto' },
  ada: { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'crypto' },
  nzd: { id: 'nzd', name: 'New Zealand Dollar', symbol: 'NZD', type: 'fiat' }
}; 