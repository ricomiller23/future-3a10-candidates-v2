# Live Fetch Test Plan — FUTURE 3a10candidatesV2

**System**: FUTURE 3a10candidatesV2 (Audit-Ready Screener)  
**Status**: Comprehensive QA Test Plan & Verification Strategy  
**Version**: 2.0  
**Effective Date**: 2026-07-21  

---

## 1. Test Plan Overview & Objectives

The Live Fetch Test Suite verifies that the SEC EDGAR API and OTC Markets scraper accurately retrieve, parse, normalize, and validate live financial data without hardcoding, fabrication, or silent fallback errors.

### Core QA Objectives:
1. **Ticker-to-CIK Identity Verification**: Confirm exact CIK mapping and company title resolution from official SEC catalog (`company_tickers.json`).
2. **Latest Filing Selection**: Confirm the app selects the latest relevant `10-Q`, `10-K`, or `20-F` filing period and correctly extracts accession numbers and report end dates.
3. **XBRL Field Extraction Accuracy**: Confirm zero tolerance extraction for `AccountsPayableCurrent`, `DebtCurrent`, `LongTermDebtNoncurrent`, `CashAndCashEquivalentsAtCarryingValue`, and `Liabilities`.
4. **Formula Recomputation Integrity**: Verify runtime computation of total debt component sums and financial ratios (`debtToMarketCap`, `apToMarketCap`, `liabilitiesToCash`).
5. **Validation & Fallback Handling**: Verify that missing XBRL facts or invalid tickers trigger `LIVE_PARTIAL` or `FAILED_VALIDATION` states rather than generating silent guesses.

---

## 2. Test Categories Matrix

| Category | Test Description | Input / Trigger | Expected Outcome / Assertion |
| :--- | :--- | :--- | :--- |
| **A. Identity Resolution** | Ticker to SEC CIK resolution | Valid Ticker (`NKLA`, `ASTS`, `NBY`) | Resolves correct SEC CIK (`0001731289`, `0001780312`, `0001389545`) and company title. |
| | Delisted / Invalid Ticker | Ticker `"INVALID999"` | Returns clear error: `"Ticker INVALID999 not found in SEC catalog"`. Status: `FAIL`. |
| **B. Filing Selection** | Latest balance sheet filing | CIK `0001731289` | Chooses latest accepted `10-Q` or `10-K`. Captures `periodEnd` and accession number. |
| | 8-K vs 10-Q prioritization | CIK with recent 8-K | App does not substitute 8-K text filing for balance sheet XBRL facts. |
| **C. Field Extraction** | AP Exact Match | `NKLA` CIK `0001731289` | `AccountsPayableCurrent` = $57,161,000 USD (10-Q period 2024-09-30). |
| | Debt Component Extraction | `NKLA` CIK `0001731289` | `currentDebt` = $73,111,000; `longTermDebt` = $270,018,000; Total = $343,129,000. |
| | Cash Exact Match | `NBY` CIK `0001389545` | `CashAndCashEquivalents` = $2,309,000 USD; AP = $76,000. |
| **D. Derived Metrics** | Ratio Computation | `NKLA` snapshot | `debtToMarketCap` = $343.13M / $210M = 1.634 (163.4%). |
| | Zero Denominator Handling | Snapshot with Cash = 0 | `liabilitiesToCash` returns `null` ("N/A"), no `Infinity` or divide-by-zero error. |
| **E. OTC Market Quotes** | OTC Markets Quote Fetch | Ticker `XELA`, `RGBP` | Retrieves live OTC quote, market cap basis, share count, and market tier (OTC Pink / QB). |
| **F. Validation & Modes** | Missing XBRL Tag Handling | Ticker with missing AP tag | Sets `canonicalAccountsPayable` = `null`, validation status = `WARN`, dataMode = `LIVE_PARTIAL`. |

---

## 3. Minimum Required Test Ticker Suite

The automated test suite evaluates the following 12 mandatory test cases:

```
┌────────┬────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ Ticker │ Company Name                   │ Specific Validation Focus                               │
├────────┼────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ NKLA   │ Nikola Corporation             │ AP $57.16M, ST Debt $73.11M, LT Debt $270.02M (343.1M) │
│ ASTS   │ AST SpaceMobile, Inc.          │ LT Debt $2.96B, AP $60.85M, Cap Ceiling Validation      │
│ NBY    │ NovaBay Pharmaceuticals, Inc.  │ AP $0.076M ($76k), Cash $2.31M, Microcap structure      │
│ GOEV   │ Canoo Inc.                     │ High debt stress, AP $42.5M, Tier 1 3(a)(10) candidate  │
│ XELA   │ Exela Technologies, Inc.       │ OTC Pink issuer, $1.115B debt vs $14.5M cap             │
│ FFIE   │ Faraday Future Intelligent      │ EV debt restructuring, convertible note stack ($65M)    │
│ CETY   │ Clean Energy Technologies      │ Microcap clean energy, FL 12th Circuit court fit        │
│ VCIG   │ VCI Global Limited             │ Foreign Private Issuer filing 20-F                      │
│ AAPL   │ Apple Inc.                     │ Clean 10-Q structure outside microcap screen limits     │
│ BRK.A  │ Berkshire Hathaway Inc.        │ Mega-cap issuer outside screen ceiling (> $500M cap)    │
│ UNKNOWN│ Non-Existent Company           │ Invalid ticker resolution test (Graceful failure)       │
│ MISSAP │ Synthetic Awkward XBRL Entity  │ Missing AP tag fallback warning test                    │
└────────┴────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 4. Automated Test Suite Execution

Run all automated unit and integration tests via:

```bash
npm test
```

This script executes:
1. `tests/accuracy-audit.test.ts`: Validates numeric tolerance rules, validation messages, and discrepancy detectors.
2. `tests/domain-model.test.ts`: Validates formula calculations, debt sum invariants, and scoring engine outputs.
3. `tests/live-sec-fetch.test.ts`: Live fetch test runner querying SEC EDGAR facts and OTC Markets API for target test tickers.
