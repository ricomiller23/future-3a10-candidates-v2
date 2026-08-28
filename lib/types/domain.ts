export type SourceType =
  | "SEC_XBRL"
  | "SEC_SUBMISSIONS"
  | "MARKET_DATA"
  | "OTC_MARKETS"
  | "MANUAL_CURATED"
  | "CACHE"
  | "DERIVED";

export type DataMode =
  | "LIVE_VERIFIED"
  | "LIVE_PARTIAL"
  | "CURATED_SNAPSHOT"
  | "STALE"
  | "FAILED_VALIDATION";

export type ValidationStatus =
  | "PASS"
  | "WARN"
  | "FAIL";

export type FilingType =
  | "10-Q"
  | "10-K"
  | "8-K"
  | "10-Q/A"
  | "10-K/A"
  | "20-F"
  | "OTHER";

export interface Issuer {
  ticker: string;
  cik: string;
  companyName: string;
  exchange?: string;
  sector?: string;
  subsector?: string;
  otcTier?: string;
}

export interface SourceRef {
  id: string;
  sourceType: SourceType;
  sourceUrl: string;
  retrievedAt: string; // ISO timestamp
  filingType?: FilingType;
  filingPeriodEnd?: string; // ISO date
  filingAcceptedAt?: string; // ISO datetime
  concept?: string; // XBRL concept or extraction key
  rawLabel?: string;
  rawValue?: string | number | null;
  normalizedValue?: number | null;
  unit?: "USD" | "shares" | "ratio" | "text";
  notes?: string;
}

export interface RawFinancialExtraction {
  issuer: Issuer;
  filingType?: FilingType;
  filingPeriodEnd?: string;
  filingAcceptedAt?: string;

  accountsPayable?: number | null;
  accruedLiabilities?: number | null;
  totalLiabilities?: number | null;
  currentDebt?: number | null;
  longTermDebt?: number | null;
  financeLeaseLiabilities?: number | null;
  convertibleDebt?: number | null;
  defaultedNotes?: number | null;
  cashAndEquivalents?: number | null;
  restrictedCash?: number | null;
  shortTermInvestments?: number | null;
  sharesOutstanding?: number | null;

  sourceRefs: Record<string, SourceRef[]>;
}

export interface CanonicalFinancialSnapshot {
  issuer: Issuer;
  asOfDate: string; // filing period end date
  filingType?: FilingType;
  filingAcceptedAt?: string;
  filingUrl?: string;

  canonicalAccountsPayable?: number | null;
  canonicalAccruedLiabilities?: number | null;
  canonicalTotalLiabilities?: number | null;

  canonicalCurrentDebt?: number | null;
  canonicalLongTermDebt?: number | null;
  canonicalFinanceLeaseLiabilities?: number | null;
  canonicalConvertibleDebt?: number | null;
  canonicalDefaultedNotes?: number | null;

  canonicalTotalDebt?: number | null;
  canonicalCash?: number | null;

  marketCap?: number | null;
  marketCapAsOf?: string | null;
  marketCapSource?: SourceRef | null;
  sharePrice?: number | null;
  sharesOutstanding?: number | null;
  sharesBasis?: "basic" | "diluted" | "unknown" | null;

  sourceRefs: Record<string, SourceRef[]>;
  fallbackReasons?: Record<string, string>;
}

export interface DerivedMetrics {
  debtToMarketCap?: number | null;
  apToMarketCap?: number | null;
  liabilitiesToCash?: number | null;
  debtToCash?: number | null;
  apTrendPct?: number | null;
  debtTrendPct?: number | null;
}

export interface ScoreBreakdown {
  debtStress: number; // 0-25
  apBurden: number; // 0-15
  distressUrgency: number; // 0-20
  structureFit: number; // 0-15
  venuePrecedentFit: number; // 0-10
  dataQuality: number; // 0-15
  total: number; // 0-100
  confidence: number; // 0-100 score confidence
  reasons: string[];
  blockers: string[];
}

export interface ValidationMessage {
  code: string;
  status: ValidationStatus;
  field?: string;
  message: string;
}

export interface ValidationResult {
  status: ValidationStatus;
  messages: ValidationMessage[];
  freshnessState: DataMode;
  confidence: number;
}

export interface CandidateRecord {
  issuer: Issuer;
  snapshot: CanonicalFinancialSnapshot;
  metrics: DerivedMetrics;
  score: ScoreBreakdown | null;
  validation: ValidationResult;
  dataMode: DataMode;
  tags?: string[];
  analystNotes?: string;
  lastUpdated?: string;
}

export interface DiscrepancyItem {
  field: string;
  seededValue: number | string | null;
  liveSecValue: number | string | null;
  differencePct?: number;
  varianceAmount?: number;
  status: "MATCH" | "DISCREPANCY" | "UNAVAILABLE";
  explanation: string;
  sourceUrl?: string;
}

export interface DiscrepancyReportRecord {
  ticker: string;
  companyName: string;
  cik: string;
  filingPeriodEnd: string;
  discrepancies: DiscrepancyItem[];
  overallStatus: "VERIFIED_MATCH" | "MATERIAL_DISCREPANCY" | "PARTIAL_AUDIT";
  auditedAt: string;
}

export interface AuditLogEntry {
  auditId: string;
  ticker: string;
  cik: string;
  companyName: string;
  sourceType: SourceType;
  filingType?: FilingType;
  filingPeriodEnd?: string;
  filingAcceptedAt?: string;
  extractedValues: Record<string, number | string | null>;
  formulasApplied: Record<string, string>;
  validationStatus: ValidationStatus;
  validationMessages: ValidationMessage[];
  confidenceScore: number;
  fetchedAt: string;
  cacheKey?: string;
  rawSourceUrls: string[];
}
