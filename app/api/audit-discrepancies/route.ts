import { NextResponse } from 'next/server';
import { generateDiscrepancyReport, legacyPrototypeRows } from '@/lib/audit/discrepancy-generator';
import { seededCandidates } from '@/lib/data/revalidated-seed';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const timestamp = new Date().toISOString();
  const responseHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Runtime-Timestamp': timestamp
  };

  const reports = legacyPrototypeRows.map(legacy => {
    const verified = seededCandidates.find(c => c.issuer.ticker === legacy.ticker);
    return generateDiscrepancyReport(legacy.ticker, legacy, {
      cik: verified?.issuer.cik || "0000000000",
      filingPeriodEnd: verified?.snapshot.asOfDate || "2026-03-31",
      filingUrl: verified?.snapshot.filingUrl,
      ap: verified?.snapshot.canonicalAccountsPayable ?? null,
      totalDebt: verified?.snapshot.canonicalTotalDebt ?? null,
      cash: verified?.snapshot.canonicalCash ?? null,
      marketCap: verified?.snapshot.marketCap ?? null
    });
  });

  return NextResponse.json({
    summary: {
      totalAudited: reports.length,
      discrepancyCount: reports.filter(r => r.overallStatus === "MATERIAL_DISCREPANCY").length,
      auditedAt: timestamp,
      serverTime: Date.now()
    },
    reports
  }, { headers: responseHeaders });
}
