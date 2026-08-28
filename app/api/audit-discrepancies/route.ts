import { NextResponse } from 'next/server';
import { generateDiscrepancyReport, legacyPrototypeRows } from '@/lib/audit/discrepancy-generator';
import { seededCandidates } from '@/lib/data/revalidated-seed';

export async function GET() {
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
      auditedAt: new Date().toISOString()
    },
    reports
  });
}
