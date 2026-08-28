import { FilingType, RawFinancialExtraction, SourceRef } from '../types/domain';

export interface FactExtractorResult {
  value: number | null;
  conceptUsed?: string;
  rawLabel?: string;
  sourceRef?: SourceRef;
}

export function extractFactValue(
  gaap: any,
  concepts: string[],
  filingUrl: string,
  filingType: FilingType = "10-Q",
  filingPeriodEnd?: string
): FactExtractorResult {
  if (!gaap) return { value: null };

  for (const concept of concepts) {
    const fact = gaap[concept];
    if (fact?.units?.USD && fact.units.USD.length > 0) {
      // Sort facts by filed or end date descending
      const sorted = [...fact.units.USD].sort((a: any, b: any) => {
        const dateA = a.end || a.filed || "";
        const dateB = b.end || b.filed || "";
        return dateB.localeCompare(dateA);
      });

      const latest = sorted[0];
      if (latest && typeof latest.val === 'number') {
        const sourceRef: SourceRef = {
          id: `sec-${concept}-${Date.now()}`,
          sourceType: "SEC_XBRL",
          sourceUrl: filingUrl,
          retrievedAt: new Date().toISOString(),
          filingType,
          filingPeriodEnd: latest.end || filingPeriodEnd,
          filingAcceptedAt: latest.filed,
          concept,
          rawLabel: fact.label || concept,
          rawValue: latest.val,
          normalizedValue: latest.val,
          unit: "USD"
        };

        return {
          value: latest.val,
          conceptUsed: concept,
          rawLabel: fact.label || concept,
          sourceRef
        };
      }
    }
  }

  return { value: null };
}

export function parseSecCompanyFacts(
  cik: string,
  companyName: string,
  ticker: string,
  factsData: any,
  filingUrl: string,
  filingType: FilingType = "10-Q",
  filingPeriodEnd?: string
): RawFinancialExtraction {
  const gaap = factsData?.facts?.['us-gaap'];
  const dei = factsData?.facts?.['dei'];

  const sourceRefs: Record<string, SourceRef[]> = {};

  // 1. Accounts Payable
  const apExt = extractFactValue(
    gaap,
    ['AccountsPayableCurrent', 'AccountsPayableAndAccruedLiabilitiesCurrent'],
    filingUrl,
    filingType,
    filingPeriodEnd
  );
  if (apExt.sourceRef) sourceRefs.canonicalAccountsPayable = [apExt.sourceRef];

  // 2. Current Debt
  const stDebtExt = extractFactValue(
    gaap,
    ['DebtCurrent', 'ShortTermBorrowings', 'NotesPayableCurrent', 'ConvertibleDebtCurrent'],
    filingUrl,
    filingType,
    filingPeriodEnd
  );
  if (stDebtExt.sourceRef) sourceRefs.canonicalCurrentDebt = [stDebtExt.sourceRef];

  // 3. Long-Term Debt
  const ltDebtExt = extractFactValue(
    gaap,
    ['LongTermDebtNoncurrent', 'LongTermNotesPayable', 'LongTermDebtAndCapitalLeaseObligations'],
    filingUrl,
    filingType,
    filingPeriodEnd
  );
  if (ltDebtExt.sourceRef) sourceRefs.canonicalLongTermDebt = [ltDebtExt.sourceRef];

  // 4. Finance Lease Liabilities
  const leaseExt = extractFactValue(
    gaap,
    ['FinanceLeaseLiabilityCurrent', 'FinanceLeaseLiabilityNoncurrent'],
    filingUrl,
    filingType,
    filingPeriodEnd
  );
  if (leaseExt.sourceRef) sourceRefs.canonicalFinanceLeaseLiabilities = [leaseExt.sourceRef];

  // 5. Convertible Debt
  const convDebtExt = extractFactValue(
    gaap,
    ['ConvertibleDebtCurrent', 'ConvertibleLongTermNotesNoncurrent'],
    filingUrl,
    filingType,
    filingPeriodEnd
  );
  if (convDebtExt.sourceRef) sourceRefs.canonicalConvertibleDebt = [convDebtExt.sourceRef];

  // 6. Total Liabilities
  const totLiabExt = extractFactValue(
    gaap,
    ['Liabilities', 'LiabilitiesCurrent'],
    filingUrl,
    filingType,
    filingPeriodEnd
  );
  if (totLiabExt.sourceRef) sourceRefs.canonicalTotalLiabilities = [totLiabExt.sourceRef];

  // 7. Cash and Cash Equivalents
  const cashExt = extractFactValue(
    gaap,
    ['CashAndCashEquivalentsAtCarryingValue', 'Cash', 'RestrictedCashAndCashEquivalentsAtCarryingValue'],
    filingUrl,
    filingType,
    filingPeriodEnd
  );
  if (cashExt.sourceRef) sourceRefs.canonicalCash = [cashExt.sourceRef];

  // 8. Shares Outstanding
  let sharesOutstanding: number | null = null;
  const sharesFact = dei?.EntityCommonStockSharesOutstanding;
  if (sharesFact?.units?.shares?.length > 0) {
    const sortedShares = [...sharesFact.units.shares].sort((a: any, b: any) =>
      (b.filed || "").localeCompare(a.filed || "")
    );
    if (sortedShares[0] && typeof sortedShares[0].val === 'number') {
      sharesOutstanding = sortedShares[0].val;
    }
  }

  return {
    issuer: {
      ticker,
      cik,
      companyName
    },
    filingType,
    filingPeriodEnd,
    accountsPayable: apExt.value,
    currentDebt: stDebtExt.value,
    longTermDebt: ltDebtExt.value,
    financeLeaseLiabilities: leaseExt.value,
    convertibleDebt: convDebtExt.value,
    totalLiabilities: totLiabExt.value,
    cashAndEquivalents: cashExt.value,
    sharesOutstanding,
    sourceRefs
  };
}
