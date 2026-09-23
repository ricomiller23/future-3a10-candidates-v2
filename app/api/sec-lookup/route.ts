import { NextResponse } from 'next/server';
import { fetchLiveSecCandidate } from '@/lib/sec/edgar-api';

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
    const candidate = await fetchLiveSecCandidate(ticker);
    return NextResponse.json({
      ...candidate,
      refreshedAt: timestamp,
      serverTime: Date.now()
    }, { headers: responseHeaders });
  } catch (err: any) {
    console.error(`SEC lookup API error for ticker ${ticker}:`, err);
    return NextResponse.json(
      {
        error: err.message || `Failed to fetch SEC EDGAR facts for ticker "${ticker}".`,
        ticker,
        refreshedAt: timestamp
      },
      { status: 404, headers: responseHeaders }
    );
  }
}
