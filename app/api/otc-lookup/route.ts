import { NextResponse } from 'next/server';
import { fetchOtcMarketQuote } from '@/lib/otc/otc-markets-api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const timestamp = new Date().toISOString();

  const responseHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Runtime-Timestamp': timestamp
  };

  if (!ticker) {
    return NextResponse.json(
      { error: 'Missing required "ticker" parameter.' },
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    const quote = await fetchOtcMarketQuote(ticker);
    if (!quote) {
      return NextResponse.json(
        { message: `No live OTC quote available for ${ticker}.`, ticker, refreshedAt: timestamp },
        { status: 404, headers: responseHeaders }
      );
    }
    return NextResponse.json({
      ...quote,
      refreshedAt: timestamp,
      serverTime: Date.now()
    }, { headers: responseHeaders });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || `OTC Markets lookup error for ${ticker}.`, refreshedAt: timestamp },
      { status: 500, headers: responseHeaders }
    );
  }
}
