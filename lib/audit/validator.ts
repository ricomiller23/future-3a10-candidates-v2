import {
  CandidateRecord,
  CanonicalFinancialSnapshot,
  DataMode,
  ValidationMessage,
  ValidationResult,
  ValidationStatus
} from '../types/domain';
import { checkNumericTolerance } from './tolerance';

export function validateCandidateRecord(record: Partial<CandidateRecord>): ValidationResult {
  const messages: ValidationMessage[] = [];
  let overallStatus: ValidationStatus = "PASS";
  let confidence = 100;

  const issuer = record.issuer;
  const snapshot = record.snapshot;

  // 1. Identity checks
  if (!issuer?.ticker) {
    messages.push({
      code: "INVALID_TICKER",
      status: "FAIL",
      field: "ticker",
      message: "Ticker symbol is missing or empty."
    });
    overallStatus = "FAIL";
    confidence -= 40;
  }

  if (!issuer?.cik || issuer.cik.length === 0) {
    messages.push({
      code: "MISSING_CIK",
      status: "WARN",
      field: "cik",
      message: "SEC CIK mapping is missing or unverified."
    });
    confidence -= 15;
    if (overallStatus !== "FAIL") overallStatus = "WARN";
  }

  if (!snapshot) {
    messages.push({
      code: "NO_SNAPSHOT",
      status: "FAIL",
      field: "snapshot",
      message: "Canonical financial snapshot is missing."
    });
    return {
      status: "FAIL",
      messages,
      freshnessState: "FAILED_VALIDATION",
      confidence: 0
    };
  }

  // 2. Filing Metadata checks
  if (!snapshot.asOfDate) {
    messages.push({
      code: "MISSING_AS_OF_DATE",
      status: "WARN",
      field: "asOfDate",
      message: "Filing period end date (asOfDate) is not specified."
    });
    confidence -= 10;
    if (overallStatus !== "FAIL") overallStatus = "WARN";
  }

  // 3. Accounts Payable checks
  const ap = snapshot.canonicalAccountsPayable;
  const totLiab = snapshot.canonicalTotalLiabilities;

  if (ap == null) {
    messages.push({
      code: "AP_MISSING",
      status: "WARN",
      field: "canonicalAccountsPayable",
      message: "Accounts Payable is missing or could not be extracted from XBRL."
    });
    confidence -= 15;
    if (overallStatus !== "FAIL") overallStatus = "WARN";
  } else if (ap === 0) {
    messages.push({
      code: "AP_ZERO",
      status: "WARN",
      field: "canonicalAccountsPayable",
      message: "Accounts Payable is reported as zero. Verify if trade payables are bundled in accrued liabilities."
    });
    confidence -= 5;
  }

  if (ap != null && totLiab != null && ap > totLiab) {
    messages.push({
      code: "AP_EXCEEDS_LIABILITIES",
      status: "FAIL",
      field: "canonicalAccountsPayable",
      message: `Accounts Payable ($${(ap / 1e6).toFixed(2)}M) exceeds Total Liabilities ($${(totLiab / 1e6).toFixed(2)}M).`
    });
    overallStatus = "FAIL";
    confidence -= 35;
  }

  // 4. Debt Components & Formula Check
  const currentDebt = snapshot.canonicalCurrentDebt ?? 0;
  const longTermDebt = snapshot.canonicalLongTermDebt ?? 0;
  const leaseLiab = snapshot.canonicalFinanceLeaseLiabilities ?? 0;
  const convertibleDebt = snapshot.canonicalConvertibleDebt ?? 0;

  const expectedTotalDebt = currentDebt + longTermDebt + leaseLiab + convertibleDebt;
  const reportedTotalDebt = snapshot.canonicalTotalDebt;

  if (reportedTotalDebt == null) {
    messages.push({
      code: "TOTAL_DEBT_MISSING",
      status: "WARN",
      field: "canonicalTotalDebt",
      message: "Canonical total debt is missing."
    });
    confidence -= 15;
    if (overallStatus !== "FAIL") overallStatus = "WARN";
  } else {
    // Check component sum tolerance
    const debtTol = checkNumericTolerance(expectedTotalDebt, reportedTotalDebt, "Total Debt Component Sum");
    if (!debtTol.isWithinTolerance && (currentDebt > 0 || longTermDebt > 0)) {
      messages.push({
        code: "DEBT_SUM_MISMATCH",
        status: "FAIL",
        field: "canonicalTotalDebt",
        message: `Displayed Total Debt ($${(reportedTotalDebt / 1e6).toFixed(2)}M) does not equal sum of debt components ($${(expectedTotalDebt / 1e6).toFixed(2)}M).`
      });
      overallStatus = "FAIL";
      confidence -= 30;
    }
  }

  // 5. Cash checks
  const cash = snapshot.canonicalCash;
  if (cash == null) {
    messages.push({
      code: "CASH_MISSING",
      status: "WARN",
      field: "canonicalCash",
      message: "Cash and cash equivalents figure is missing."
    });
    confidence -= 10;
    if (overallStatus !== "FAIL") overallStatus = "WARN";
  }

  // 6. Market Cap checks
  const marketCap = snapshot.marketCap;
  if (marketCap == null || marketCap <= 0) {
    messages.push({
      code: "MARKET_CAP_MISSING",
      status: "WARN",
      field: "marketCap",
      message: "Market Cap is missing or invalid. Debt/Cap and AP/Cap ratios cannot be computed."
    });
    confidence -= 20;
    if (overallStatus !== "FAIL") overallStatus = "WARN";
  } else if (marketCap > 500000000) {
    messages.push({
      code: "MARKET_CAP_EXCEEDS_CAP",
      status: "WARN",
      field: "marketCap",
      message: `Market Cap ($${(marketCap / 1e6).toFixed(1)}M) exceeds upper screener threshold ($500M).`
    });
  }

  // Determine Freshness State
  let freshnessState: DataMode = record.dataMode || "LIVE_VERIFIED";

  if (overallStatus === "FAIL") {
    freshnessState = "FAILED_VALIDATION";
  } else if (record.dataMode === "CURATED_SNAPSHOT") {
    freshnessState = "CURATED_SNAPSHOT";
  } else if (confidence < 80) {
    freshnessState = "LIVE_PARTIAL";
  } else {
    freshnessState = "LIVE_VERIFIED";
  }

  return {
    status: overallStatus,
    messages,
    freshnessState,
    confidence: Math.max(0, Math.min(100, confidence))
  };
}
