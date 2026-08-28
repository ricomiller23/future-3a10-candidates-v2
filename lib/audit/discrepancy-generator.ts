import { DiscrepancyItem, DiscrepancyReportRecord } from '../types/domain';
import { checkNumericTolerance } from './tolerance';

export interface LegacyPrototypeRow {
  ticker: string;
  companyName: string;
  legacyTotalDebt: number;
  legacyAP: number;
  legacyCash: number;
  legacyMarketCap: number;
}

export const legacyPrototypeRows: LegacyPrototypeRow[] = [
  {
    ticker: "NKLA",
    companyName: "Nikola Corporation",
    legacyTotalDebt: 236500000,
    legacyAP: 68000000,
    legacyCash: 198300000,
    legacyMarketCap: 210000000
  },
  {
    ticker: "ASTS",
    companyName: "AST SpaceMobile, Inc.",
    legacyTotalDebt: 174000000,
    legacyAP: 54000000,
    legacyCash: 412000000,
    legacyMarketCap: 485000000
  },
  {
    ticker: "NBY",
    companyName: "NovaBay Pharmaceuticals, Inc.",
    legacyTotalDebt: 6500000,
    legacyAP: 2100000,
    legacyCash: 2309000,
    legacyMarketCap: 4200000
  },
  {
    ticker: "GOEV",
    companyName: "Canoo Inc.",
    legacyTotalDebt: 144000000,
    legacyAP: 42500000,
    legacyCash: 4200000,
    legacyMarketCap: 145000000
  }
];

export function generateDiscrepancyReport(
  ticker: string,
  legacyRow: LegacyPrototypeRow,
  secVerifiedSnapshot: {
    cik: string;
    filingPeriodEnd: string;
    filingUrl?: string;
    ap: number | null;
    totalDebt: number | null;
    cash: number | null;
    marketCap: number | null;
  }
): DiscrepancyReportRecord {
  const discrepancies: DiscrepancyItem[] = [];
  let overallStatus: "VERIFIED_MATCH" | "MATERIAL_DISCREPANCY" | "PARTIAL_AUDIT" = "VERIFIED_MATCH";

  // 1. Accounts Payable Audit
  const apTol = checkNumericTolerance(legacyRow.legacyAP, secVerifiedSnapshot.ap, "Accounts Payable");
  if (!apTol.isWithinTolerance) {
    overallStatus = "MATERIAL_DISCREPANCY";
    discrepancies.push({
      field: "Accounts Payable",
      seededValue: legacyRow.legacyAP,
      liveSecValue: secVerifiedSnapshot.ap,
      differencePct: apTol.variancePct,
      varianceAmount: apTol.varianceAmount,
      status: "DISCREPANCY",
      explanation: `Legacy prototype displayed $${(legacyRow.legacyAP / 1e6).toFixed(2)}M AP. Actual SEC 10-Q filing reports $${secVerifiedSnapshot.ap ? (secVerifiedSnapshot.ap / 1e6).toFixed(2) + 'M' : 'N/A'}. Delta: $${(apTol.varianceAmount / 1e6).toFixed(2)}M (${apTol.variancePct.toFixed(1)}%).`,
      sourceUrl: secVerifiedSnapshot.filingUrl
    });
  } else {
    discrepancies.push({
      field: "Accounts Payable",
      seededValue: legacyRow.legacyAP,
      liveSecValue: secVerifiedSnapshot.ap,
      differencePct: apTol.variancePct,
      varianceAmount: apTol.varianceAmount,
      status: "MATCH",
      explanation: apTol.message,
      sourceUrl: secVerifiedSnapshot.filingUrl
    });
  }

  // 2. Total Debt Audit
  const debtTol = checkNumericTolerance(legacyRow.legacyTotalDebt, secVerifiedSnapshot.totalDebt, "Total Debt");
  if (!debtTol.isWithinTolerance) {
    overallStatus = "MATERIAL_DISCREPANCY";
    discrepancies.push({
      field: "Total Debt",
      seededValue: legacyRow.legacyTotalDebt,
      liveSecValue: secVerifiedSnapshot.totalDebt,
      differencePct: debtTol.variancePct,
      varianceAmount: debtTol.varianceAmount,
      status: "DISCREPANCY",
      explanation: `Legacy prototype displayed $${(legacyRow.legacyTotalDebt / 1e6).toFixed(2)}M total debt. Actual SEC 10-Q filing reports $${secVerifiedSnapshot.totalDebt ? (secVerifiedSnapshot.totalDebt / 1e6).toFixed(2) + 'M' : 'N/A'}. Delta: $${(debtTol.varianceAmount / 1e6).toFixed(2)}M (${debtTol.variancePct.toFixed(1)}%).`,
      sourceUrl: secVerifiedSnapshot.filingUrl
    });
  } else {
    discrepancies.push({
      field: "Total Debt",
      seededValue: legacyRow.legacyTotalDebt,
      liveSecValue: secVerifiedSnapshot.totalDebt,
      differencePct: debtTol.variancePct,
      varianceAmount: debtTol.varianceAmount,
      status: "MATCH",
      explanation: debtTol.message,
      sourceUrl: secVerifiedSnapshot.filingUrl
    });
  }

  // 3. Cash Audit
  const cashTol = checkNumericTolerance(legacyRow.legacyCash, secVerifiedSnapshot.cash, "Cash & Equivalents");
  if (!cashTol.isWithinTolerance) {
    overallStatus = "MATERIAL_DISCREPANCY";
    discrepancies.push({
      field: "Cash & Equivalents",
      seededValue: legacyRow.legacyCash,
      liveSecValue: secVerifiedSnapshot.cash,
      differencePct: cashTol.variancePct,
      varianceAmount: cashTol.varianceAmount,
      status: "DISCREPANCY",
      explanation: `Legacy prototype displayed $${(legacyRow.legacyCash / 1e6).toFixed(2)}M cash. Actual SEC 10-Q filing reports $${secVerifiedSnapshot.cash ? (secVerifiedSnapshot.cash / 1e6).toFixed(2) + 'M' : 'N/A'}. Delta: $${(cashTol.varianceAmount / 1e6).toFixed(2)}M (${cashTol.variancePct.toFixed(1)}%).`,
      sourceUrl: secVerifiedSnapshot.filingUrl
    });
  } else {
    discrepancies.push({
      field: "Cash & Equivalents",
      seededValue: legacyRow.legacyCash,
      liveSecValue: secVerifiedSnapshot.cash,
      differencePct: cashTol.variancePct,
      varianceAmount: cashTol.varianceAmount,
      status: "MATCH",
      explanation: cashTol.message,
      sourceUrl: secVerifiedSnapshot.filingUrl
    });
  }

  return {
    ticker,
    companyName: legacyRow.companyName,
    cik: secVerifiedSnapshot.cik,
    filingPeriodEnd: secVerifiedSnapshot.filingPeriodEnd,
    discrepancies,
    overallStatus,
    auditedAt: new Date().toISOString()
  };
}
