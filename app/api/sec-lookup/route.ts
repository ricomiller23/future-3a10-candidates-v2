import { NextResponse } from 'next/server';
import { fetchLiveSecCandidate } from '@/lib/sec/edgar-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json(
      { error: 'Missing required "ticker" parameter.' },
      { status: 400 }
    );
  }

  try {
    const candidate = await fetchLiveSecCandidate(ticker);
    return NextResponse.json(candidate);
  } catch (err: any) {
    console.error(`SEC lookup API error for ticker ${ticker}:`, err);
    return NextResponse.json(
      {
        error: err.message || `Failed to fetch SEC EDGAR facts for ticker "${ticker}".`,
        ticker
      },
      { status: 404 }
    );
  }
}
