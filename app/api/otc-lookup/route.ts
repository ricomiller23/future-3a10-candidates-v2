import { NextResponse } from 'next/server';
import { fetchOtcMarketQuote } from '@/lib/otc/otc-markets-api';

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
    const quote = await fetchOtcMarketQuote(ticker);
    if (!quote) {
      return NextResponse.json(
        { message: `No live OTC quote available for ${ticker}.`, ticker },
        { status: 404 }
      );
    }
    return NextResponse.json(quote);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || `OTC Markets lookup error for ${ticker}.` },
      { status: 500 }
    );
  }
}
