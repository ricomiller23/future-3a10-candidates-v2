# Accuracy Audit Specification — FUTURE 3a10candidatesV2

**System**: FUTURE 3a10candidatesV2 (Audit-Ready Screener)  
**Status**: Formal Specification & Implementation Contract  
**Version**: 2.0  
**Effective Date**: 2026-07-21  

---

## 1. Core Audit Principles

To ensure every 3(a)(10) candidate and financial metric surfaced in this application is review-grade and suitable for institutional litigation-finance analysis, the system enforces the following non-negotiable audit principles:

1. **Mandatory Provenance Metadata**: No displayed filing-derived number may appear without full field-level metadata containing:
   - `sourceUrl`: Direct hyperlink to the SEC EDGAR filing document or API endpoint.
   - `filingType`: Form `10-Q`, `10-K`, `8-K`, `10-Q/A`, `10-K/A`, or `20-F`.
   - `filingPeriodEnd`: ISO date (`YYYY-MM-DD`) representing the balance sheet period end.
   - `filingAcceptedAt`: ISO timestamp (`YYYY-MM-DDTHH:mm:ssZ`) of SEC acceptance.
   - `concept`: Exact US-GAAP XBRL taxonomy key or extraction rule name.
   - `confidence`: Field-level confidence score (0–100%).
2. **Explicit Data Mode Labeling**: Never mix stale curated values and live SEC-derived values without explicit labeling. If a value is from a static snapshot or manually entered baseline, it must be labeled `CURATED_SNAPSHOT`.
3. **Automatic Default Exclusion for Failed Rows**: Any row failing consistency or validation checks is tagged `FAILED_VALIDATION`, assigned a warning badge, and automatically excluded from default high-conviction rankings unless manually overridden by an analyst.
4. **Zero Fabrication & Guessing**: If an SEC XBRL fact is absent or ambiguous, the field must remain `null` with an explicit fallback reason or warning message logged. Silently defaulting to arbitrary debt-ratio assumptions or random share prices is strictly prohibited.

---

## 2. Validation Rules for Every Ticker

Before any candidate row is rendered or ranked in the UI, the engine runs the following pipeline:

1. **Identity & Resolution**:
   - Ticker resolves to a single unique SEC CIK via `https://www.sec.gov/files/company_tickers.json`.
   - Issuer title retrieved from SEC catalog matches expected company identity.
2. **Filing Metadata Capture**:
   - Latest accepted SEC filing date and balance sheet period end date are captured.
   - Filing type is verified as an official SEC financial report (`10-Q`, `10-K`, `20-F`).
3. **Numeric Normalization**:
   - Extracted values are converted to numeric float/int, normalized to standard USD, and rounded for display in millions with full floating precision stored in the canonical record.
4. **Formula Recomputation**:
   - Every ratio (`debtToMarketCap`, `apToMarketCap`, `liabilitiesToCash`) is dynamically recomputed from canonical stored fields at runtime. Ratios are never read from hand-entered text.

---

## 3. Required Audit Checks by Field

### A. Market Cap
- **Source**: Sourced from live market quotes (OTC Markets API / Market Data provider) or computed internally as `sharePrice × sharesOutstanding`.
- **Metadata Required**: Quote timestamp, market data provider, share count basis (`basic` or `diluted`).
- **Stale Check**: Flag as stale if price quote is older than 24 hours (trading days).
- **Missing Handling**: If market cap is missing or ≤ 0, ratios are set to `N/A`, score confidence is degraded, and a warning flag is raised.

### B. Accounts Payable (`canonicalAccountsPayable`)
- **Extraction**: Extracted strictly from latest balance sheet XBRL concepts (`AccountsPayableCurrent`, `AccountsPayableAndAccruedLiabilitiesCurrent`).
- **Storage**: Raw extracted XBRL concept name, raw value, and normalized USD stored in `SourceRef`.
- **Hard Failure**: Fail validation (`AP > totalLiabilities`).
- **Warnings**: Surface warning if `AP == 0` for a distressed candidate (unless source explicitly reports 0). Warn if AP changes by >80% quarter-over-quarter without explicit filing context.

### C. Debt (`canonicalTotalDebt`)
- **No Vague Buckets**: Debt must be split into explicit canonical sub-components:
  - `currentDebt`: `ShortTermBorrowings`, `NotesPayableCurrent`, `DebtCurrent`.
  - `longTermDebt`: `LongTermDebtNoncurrent`, `LongTermNotesPayable`.
  - `financeLeaseLiabilities`: `FinanceLeaseLiabilityCurrent + Noncurrent` (if reported separately).
  - `convertibleDebt`: `ConvertibleDebtCurrent + Noncurrent`.
  - `defaultedNotes`: Notes with active notices of default.
- **Traceable Formula**: `canonicalTotalDebt = currentDebt + longTermDebt + financeLeaseLiabilities + convertibleDebt`.
- **Hard Failure**: Fail validation if displayed `totalDebt` differs from component sum beyond tolerance.

### D. Cash (`canonicalCash`)
- **Source**: Extracted from latest filing (`CashAndCashEquivalentsAtCarryingValue`, `Cash`).
- **Warnings**: Warn if `cash > totalAssets`. Warn if cash period end differs from AP/debt period end date.

### E. Filing Links
- **Resolution**: Links must resolve to official SEC EDGAR URLs (`https://www.sec.gov/Archives/edgar/data/{cik}/{accNum}/{docName}`).
- **Verification**: URL must embed the matching CIK and accession number.

### F. 3(a)(10) Feasibility Score
- **Recomputation**: Score must be derived exclusively from validated canonical fields.
- **Missing Input Handling**: If any required scoring input is missing, score confidence is degraded. If total debt or market cap is unavailable, return `"insufficient data"`.

---

## 4. Cross-Field Consistency Rules

The engine evaluates hard mathematical invariants:

$$\text{debtToMarketCap} = \frac{\text{canonicalTotalDebt}}{\text{marketCap}}$$

$$\text{apToMarketCap} = \frac{\text{canonicalAccountsPayable}}{\text{marketCap}}$$

$$\text{liabilitiesToCash} = \frac{\text{canonicalTotalLiabilities}}{\text{canonicalCash}} \quad (\text{if canonicalCash} > 0)$$

- **Zero / Missing Denominator**: If `marketCap` or `cash` is missing or 0, return `null` (`"N/A"` in UI), never divide by zero or output `Infinity`.
- **Banding Consistency**: Score banding (Tier 1 High Conviction, Tier 2 Moderate, Tier 3 Watchlist) is determined dynamically from computed score ranges, never manually overridden by static labels.

---

## 5. Freshness & Data Modes

Every candidate record is classified into one of five distinct data modes:

```
                  ┌──────────────────────────────────────────┐
                  │          SEC XBRL / Market Fetch         │
                  └────────────────────┬─────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        [ All Critical Fields OK ]             [ Critical Missing / Fail ]
                    │                                     │
         ┌──────────┴──────────┐                          ▼
         ▼                     ▼                 FAILED_VALIDATION
   LIVE_VERIFIED          LIVE_PARTIAL         (Excluded by Default)
 (Latest Filing & Quote)  (Minor Field Missing)           ▲
         ▲                     ▲                          │
         └──────────┬──────────┘                          │
                    │                                     │
           [ Age > 30 Days ]                              │
                    │                                     │
                    ▼                                     │
                  STALE ──────────────────────────────────┘
```

1. **`LIVE_VERIFIED`**: Fetched live from SEC EDGAR + OTC Market Data within freshness window (<= 30 days old). All core fields validated.
2. **`LIVE_PARTIAL`**: Fetched live, but non-critical secondary fields (e.g. volume or 30D VWAP) are missing.
3. **`CURATED_SNAPSHOT`**: Manually seeded or cached historical snapshot. Explicitly visually separated in UI.
4. **`STALE`**: Filing period end date is older than 180 days without a fresh 10-Q filing.
5. **`FAILED_VALIDATION`**: Critical extraction error, material inconsistency, or missing mandatory debt/AP source.

---

## 6. Tolerance & Discrepancy Rules

Numeric discrepancies between legacy seeded numbers and live SEC extractions are evaluated using:

$$\text{Tolerance} = \max\left(1\%, \$50,000\right)$$

- Exact match preferred.
- If $|\text{Seeded} - \text{Live SEC}| > \text{Tolerance}$, the discrepancy auditor logs a `MATERIAL_DISCREPANCY` event with field-by-field delta details.

---

## 7. Machine-Readable Audit Schema & Types

See `lib/types/domain.ts` for full TypeScript interfaces:
- `CandidateRecord`
- `CanonicalFinancialSnapshot`
- `ValidationResult`
- `ValidationMessage`
- `AuditLogEntry`
- `DiscrepancyReportRecord`

---

## 8. UI Requirements for Auditability

The Candidate Inspector Panel surfacing auditability contains:
- **Data Mode Badge**: Color-coded pill (`LIVE_VERIFIED` Green, `LIVE_PARTIAL` Blue, `CURATED_SNAPSHOT` Purple, `STALE` Yellow, `FAILED_VALIDATION` Red).
- **As-Of Filing Date & Form**: Direct display of `10-Q` / `10-K` period end date.
- **Direct Source Links**: Interactive button launching the SEC EDGAR filing document.
- **Raw XBRL Inspector**: View extracted XBRL tags (`AccountsPayableCurrent`, `DebtCurrent`, etc.) side-by-side with canonical normalized values.
- **Score Breakdown & Confidence Rating**: Radar / visual meters showing Debt Stress, AP Burden, Distress, Structure Fit, Precedent Fit, and Data Quality score + 0-100 Confidence rating.
- **Discrepancy Comparison**: Side-by-side comparison of seeded prototype numbers vs. actual SEC 10-Q figures.

---

## 9. Must-Fail Scenarios

A candidate MUST be marked `FAILED_VALIDATION` if:
1. Accounts Payable or Total Debt cannot be tied to an explicit SEC filing source or XBRL concept.
2. Displayed `totalDebt` differs materially from `currentDebt + longTermDebt + leaseLiabilities + convertibleDebt`.
3. Filing URL or CIK belongs to a different entity.
4. Financial figures mix data from different reporting periods without explicit UI disclosure.
5. Market cap filter range conflicts between UI and constants ($100M filter with $500M max cap ceiling).
6. 3(a)(10) score is generated from undefined critical inputs.
