import { MarketIndex, MarketQuote } from '../types/financial';

export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  try {
    const res = await fetch('/api/market/indices');
    if (!res.ok) throw new Error('Failed to fetch indices');
    const json = await res.json();
    return json.indices || [];
  } catch (err) {
    console.error('Error fetching market indices:', err);
    return [];
  }
}

export async function searchMarketStocks(query: string): Promise<MarketQuote[]> {
  try {
    const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search stocks');
    const json = await res.json();
    return json.results || [];
  } catch (err) {
    console.error('Error searching stocks:', err);
    return [];
  }
}

export async function fetchStockQuote(symbol: string): Promise<MarketQuote | null> {
  try {
    const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error('Failed to fetch quote');
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('Error fetching stock quote:', err);
    return null;
  }
}
