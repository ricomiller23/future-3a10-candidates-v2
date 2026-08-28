# Data Model Review & Scoring Specifications — FUTURE 3a10candidatesV2

**System**: FUTURE 3a10candidatesV2 (Audit-Ready Screener)  
**Status**: Data Architecture & Scoring Engine Specification  
**Version**: 2.0  
**Effective Date**: 2026-07-21  

---

## 1. Data Model Goals

The redesign of the domain model transitions the application from a prototype presentation into a review-grade analytical database. The core goals are:

1. **One Canonical Source of Truth Per Metric**: Eliminate duplicate or conflicting fields. Every displayed metric maps to a single canonical field.
2. **Explicit Debt Unbundling**: Eradicate the ambiguous "debt" bucket. Require explicit accounting for `currentDebt`, `longTermDebt`, `financeLeaseLiabilities`, and `convertibleDebt`.
3. **Strict Layering**: Separate raw XBRL extractions (`RawFinancialExtraction`), normalized snapshot values (`CanonicalFinancialSnapshot`), derived financial ratios (`DerivedMetrics`), and score breakdown models (`ScoreBreakdown`).
4. **Field-Level Provenance**: Every metric links back to its underlying `SourceRef` array (containing URL, filing form, period end, concept, raw label, normalized USD, and unit).
5. **Clear Separation of Curated & Live Data**: Curated baseline snapshots and live SEC XBRL extractions coexist cleanly without overwrite risk or confusion.

---

## 2. Canonical Field Definitions

### A. Accounts Payable (`canonicalAccountsPayable`)
- **Definition**: Trade payables and vendor obligations reported on the balance sheet.
- **XBRL Concept Priority**:
  1. `us-gaap:AccountsPayableCurrent`
  2. `us-gaap:AccountsPayableAndAccruedLiabilitiesCurrent` (with fallback reason logged)
- **Rules**: Do NOT combine AP with accrued payroll or tax liabilities unless explicitly reported as a single line item in the filing, in which case `fallbackReasons["accountsPayable"]` is set.

### B. Total Debt (`canonicalTotalDebt`)
- **Definition**: Formula-based total interest-bearing and structured debt obligations.
- **Formula**:
  $$\text{canonicalTotalDebt} = \text{currentDebt} + \text{longTermDebt} + \text{financeLeaseLiabilities} + \text{convertibleDebt}$$
- **XBRL Concepts Included**:
  - `us-gaap:DebtCurrent`, `us-gaap:NotesPayableCurrent`, `us-gaap:ShortTermBorrowings`
  - `us-gaap:LongTermDebtNoncurrent`, `us-gaap:LongTermNotesPayable`
  - `us-gaap:FinanceLeaseLiabilityCurrent`, `us-gaap:FinanceLeaseLiabilityNoncurrent`
  - `us-gaap:ConvertibleDebtCurrent`, `us-gaap:ConvertibleDebtNoncurrent`
- **Rule**: Never substitute `totalLiabilities` for `totalDebt`.

### C. Total Liability Burden (`canonicalTotalLiabilities`)
- **Definition**: Total liabilities reported on the balance sheet (`us-gaap:Liabilities` or `us-gaap:LiabilitiesCurrent`). Tracked separately from `canonicalTotalDebt` as an indicator of total legal claim pressure.

### D. Cash & Equivalents (`canonicalCash`)
- **Definition**: Unrestricted cash and cash equivalents (`us-gaap:CashAndCashEquivalentsAtCarryingValue` or `us-gaap:Cash`). Restricted cash and short-term investments are stored separately if reported.

### E. Market Cap (`canonicalMarketCap`)
- **Definition**: Live quote-based market capitalization.
- **Calculation**: Sourced from OTC Markets API / Market Data quote, or `sharePrice × sharesOutstanding`.
- **Metadata Required**: Pricing timestamp, quote provider, share count basis (`basic` vs `diluted`).

---

## 3. Scoring Engine Redesign (6-Component Transparent Model)

The 3(a)(10) Feasibility Score is computed via a transparent 100-point model. It evaluates an issuer's eligibility and attractiveness for section 3(a)(10) debt-for-equity claim settlement.

$$\text{Score} = \text{DebtStress (25)} + \text{APBurden (15)} + \text{DistressUrgency (20)} + \text{StructureFit (15)} + \text{VenueFit (10)} + \text{DataQuality (15)}$$

### Scoring Breakdown Components

| Component | Max Points | Evaluation Criteria & Formula |
| :--- | :--- | :--- |
| **1. Debt Stress** | 25 | • `debtToMarketCap >= 1.5`: 15 pts \| `>= 0.8`: 10 pts \| `>= 0.4`: 5 pts<br>• `liabilitiesToCash >= 10.0`: 10 pts \| `>= 4.0`: 6 pts \| `>= 2.0`: 3 pts |
| **2. AP Burden** | 15 | • `apToMarketCap >= 0.5`: 10 pts \| `>= 0.25`: 6 pts \| `>= 0.10`: 3 pts<br>• `canonicalAccountsPayable >= $5M`: 5 pts \| `>= $1M`: 3 pts |
| **3. Distress & Urgency** | 20 | • Going concern warning present in 10-Q/10-K: 10 pts<br>• Active defaulted notes or litigation: 10 pts |
| **4. Structure Fit** | 15 | • Convertible debt present: 8 pts<br>• Microcap capitalization structure fit (Share price < $2.00, high float): 7 pts |
| **5. Venue / Precedent Fit** | 10 | • State court jurisdiction precedent (e.g. FL 12th Circuit, CA Superior Court, NV District Court): 10 pts |
| **6. Data Quality & Provenance** | 15 | • `LIVE_VERIFIED` mode: 15 pts<br>• `LIVE_PARTIAL` mode: 10 pts<br>• `CURATED_SNAPSHOT` mode: 6 pts<br>• `FAILED_VALIDATION`: 0 pts |

### Score Confidence Rating (0–100%)

In addition to the numeric score, the engine computes a **Score Confidence Rating**:
- **100%**: Live SEC XBRL facts + live market cap quotes fully verified.
- **80%**: Live SEC facts retrieved, but non-critical market data estimated from filing period end shares.
- **60%**: Static curated snapshot baseline.
- **< 50%**: One or more critical financial inputs (AP, Debt, or Cash) missing.

---

## 4. Product Copy & Config Standardization

To eliminate the market cap inconsistency observed in production (where UI sliders permitted $500M but text copy referenced $100M):

1. **Standard Screener Universe Filter**: Default screening is filtered for micro-caps (Market Cap ≤ $100,000,000).
2. **Ceiling Selector**: UI controls permit expanding the view up to Small-Cap ceiling ($500,000,000).
3. **Unified Copy**: All metadata descriptions, headers, CSV export labels, and tooltips explicitly reflect:  
   *"FUTURE 3a10candidatesV2 — Screening US Public Micro/Small-Caps ($100M Default Filter, Up to $500M Cap Ceiling)"*.
