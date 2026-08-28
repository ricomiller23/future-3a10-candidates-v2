import { SourceRef } from '../types/domain';

export interface OtcMarketQuote {
  ticker: string;
  price: number | null;
  marketCap: number | null;
  sharesOutstanding: number | null;
  exchange: string;
  otcTier?: string;
  retrievedAt: string;
  sourceRef: SourceRef;
}

export async function fetchOtcMarketQuote(ticker: string): Promise<OtcMarketQuote | null> {
  const cleanTicker = ticker.trim().toUpperCase();

  try {
    // Query public OTC Markets endpoint
    const url = `https://api.otcmarkets.com/market-data/v1/stock/quote/symbol/${cleanTicker}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const price = data.price || data.lastPrice || data.closePrice || null;
      const marketCap = data.marketCap || null;
      const shares = data.sharesOutstanding || data.shares || null;
      const otcTier = data.tierName || data.marketTier || "OTC Pink";

      const sourceRef: SourceRef = {
        id: `otc-quote-${cleanTicker}-${Date.now()}`,
        sourceType: "OTC_MARKETS",
        sourceUrl: `https://www.otcmarkets.com/stock/${cleanTicker}/overview`,
        retrievedAt: new Date().toISOString(),
        rawValue: price,
        normalizedValue: marketCap,
        unit: "USD",
        notes: `OTC Markets API Quote. Tier: ${otcTier}`
      };

      return {
        ticker: cleanTicker,
        price,
        marketCap,
        sharesOutstanding: shares,
        exchange: "OTC Pink",
        otcTier,
        retrievedAt: new Date().toISOString(),
        sourceRef
      };
    }
  } catch (err) {
    console.warn(`OTC Markets API direct query failed for ${cleanTicker}:`, err);
  }

  // Graceful fallback for market cap / pricing when live OTC API limits occur
  return null;
}
