const SEC_USER_AGENT = 'Future3a10CandidatesV2 ScreenerTool/2.0 (contact@future3a10candidates.org)';

interface SecTickerEntry {
  cik_str: number;
  ticker: string;
  title: string;
}

const STATIC_FALLBACK_MAP: Record<string, { cik: string; companyName: string }> = {
  "NKLA": { cik: "0001731289", companyName: "Nikola Corporation" },
  "ASTS": { cik: "0001780312", companyName: "AST SpaceMobile, Inc." },
  "NBY": { cik: "0001389545", companyName: "NovaBay Pharmaceuticals, Inc." },
  "GOEV": { cik: "0001750153", companyName: "Canoo Inc." },
  "XELA": { cik: "0001620170", companyName: "Exela Technologies, Inc." },
  "FFIE": { cik: "0001805521", companyName: "Faraday Future Intelligent Electric Inc." },
  "CETY": { cik: "0001437925", companyName: "Clean Energy Technologies, Inc." },
  "VCIG": { cik: "0001956697", companyName: "VCI Global Limited" },
  "AREB": { cik: "0001648432", companyName: "American Rebel Holdings, Inc." },
  "AAPL": { cik: "0000320193", companyName: "Apple Inc." },
  "BRK.A": { cik: "0001067983", companyName: "Berkshire Hathaway Inc." }
};

let tickerCache: Record<string, { cik: string; companyName: string }> | null = null;

export async function getCikForTicker(ticker: string): Promise<{ cik: string; companyName: string } | null> {
  const cleanTicker = ticker.trim().toUpperCase();

  try {
    if (!tickerCache) {
      const res = await fetch('https://www.sec.gov/files/company_tickers.json', {
        headers: {
          'User-Agent': SEC_USER_AGENT,
          'Accept-Encoding': 'gzip, deflate',
          'Host': 'www.sec.gov'
        }
      });

      if (res.ok) {
        const data: Record<string, SecTickerEntry> = await res.json();
        const map: Record<string, { cik: string; companyName: string }> = {};

        Object.values(data).forEach(item => {
          const cikFormatted = item.cik_str.toString().padStart(10, '0');
          map[item.ticker.toUpperCase()] = {
            cik: cikFormatted,
            companyName: item.title
          };
        });

        tickerCache = { ...STATIC_FALLBACK_MAP, ...map };
      } else {
        tickerCache = STATIC_FALLBACK_MAP;
      }
    }

    const match = tickerCache[cleanTicker];
    if (match) return match;
    return STATIC_FALLBACK_MAP[cleanTicker] || null;
  } catch (err) {
    console.warn(`Failed to resolve SEC CIK for ticker ${ticker} via SEC API, using static fallback map.`, err);
    return STATIC_FALLBACK_MAP[cleanTicker] || null;
  }
}
