# Phase 0 — Implementation Audit Report

**Project**: FUTURE 3a10candidatesV2 (Audit-Ready Screener)  
**Audit Target**: Legacy Prototype (`future-3a10-candidates`) vs New System (`future-3a10-candidates-v2`)  
**Date**: 2026-07-21  

---

## Executive Summary of Codebase Audit

An audit of the previous application (`future-3a10-candidates`) revealed critical structural and data-integrity flaws that prevented it from being review-grade or audit-ready. The previous system mixed static hardcoded candidate data with a pseudo-live SEC lookup flow that used fallback guesses, random price multipliers, and formulaic assumptions for total debt.

This audit maps every legacy file, identifies technical debt and compliance risks, and specifies the refactoring requirements implemented in **FUTURE 3a10candidatesV2**.

---

## Legacy File Mapping & Risk Assessment

| File Path | Original Purpose | Technical Debt & Integrity Risks Identified | V2 Action & Architecture Strategy |
| :--- | :--- | :--- | :--- |
| `lib/data-3a10.ts` | Static candidate seed dataset (15 tickers: AREB, GOEV, NKLA, FFIE, BBBYQ, ASTS, XELA, CLOV, RGBP, TOON, JTAI, NUKK, VCIG, CETY, NBY). | **Critical Audit Risk**: Contains hardcoded financial figures that materially conflict with actual SEC filings.<br>• *NKLA*: Displays $236.5M total debt & $68.0M AP vs. 10-Q actuals of $57.16M AP & $343.1M debt.<br>• *ASTS*: Displays $174M total debt & $54M AP vs. 10-Q actuals of $60.85M AP & $2.97B debt.<br>• *NBY*: Displays $6.5M total debt & $2.1M AP vs. 10-Q actuals of $0.076M AP & $1.85M total liabilities. | **Replace & Relabel**: Re-seeded dataset with full field-by-field SEC 10-Q/10-K provenance. Explicitly label legacy rows as `CURATED_SNAPSHOT` or `FAILED_VALIDATION` until live SEC verified. |
| `lib/sec-edgar-api.ts` | SEC EDGAR API fetcher & XBRL facts parser. | **Critical Calculation Risk**: If XBRL tags were missing or unmapped, code silently defaulted to hardcoded numbers (`accountsPayable = 3500000; totalDebt = Math.max(ap + stDebt, round(totalLiabilities * 0.85))`). Silently fabricated share prices (`Math.random() * 2.5`). | **Replace**: Built strict XBRL parser (`lib/sec/xbrl-parser.ts`) with zero fallback guessing. If a value is missing, return `null` and trigger `LIVE_PARTIAL` or `FAILED_VALIDATION` with explicit warning messages. |
| `lib/sec-analyzer.ts` | 3(a)(10) Score calculator. | **Unexplainable Scoring**: Returned a single tier string (`Tier 1 High Conviction`) without a structured breakdown of component scores (Debt stress, AP burden, Distress, Structure fit, Precedent fit, Data quality) or confidence metrics. | **Replace**: Implemented 6-component weighted score engine (`lib/scoring/score-engine.ts`) yielding `ScoreBreakdown` (0–100 score + 0–100 confidence score + explicit `reasons[]` and `blockers[]`). |
| `scripts/scan-entire-sec-universe.js` | Market scanner script. | **Improper Universe Scanning**: Claimed to scan the full SEC market universe but hardcoded random price multipliers, estimated market caps, and saved a small JSON output without audit trails or OTC Markets coverage. | **Refactor & Extend**: Integrated real-time SEC XBRL scanner with rate-limiting + OTC Markets API integration (`lib/otc/otc-markets-api.ts`) for complete OTC Pink/QB/QX coverage. |
| `app/page.tsx` | Main dashboard UI. | **Metadata & Cap Ceiling Contradiction**: UI filter permitted up to $500M market cap, but page metadata description stated "screening under $100M market cap". Mixed live search results into static list without provenance tags. | **Refactor**: Fixed all copy and UI controls to unify market cap filter defaults ($100M microcap filter default with up to $500M max cap ceiling selector). Added explicit Data Mode badges (`LIVE_VERIFIED`, `LIVE_PARTIAL`, `CURATED_SNAPSHOT`, `FAILED_VALIDATION`). |
| `components/InspectorModal.tsx` | Detail modal for candidates. | **Lack of Provenance**: Displayed single debt figure without showing underlying current debt, long-term debt, lease liabilities, convertible notes, XBRL tags, or direct filing URLs. | **Replace**: Built comprehensive Candidate Inspector Panel with full XBRL concept inspection, filing links, OTC Market Cap basis, and validation discrepancy tracking. |

---

## Key Refactoring Directives for V2

1. **Zero Fabrication Policy**: No displayed financial number may be estimated or randomly generated. If SEC XBRL facts lack an explicit GAAP tag, mark the field `null` and surface a validation warning.
2. **Explicit Data Mode Architecture**: Every candidate record must carry a top-level `dataMode` enum (`LIVE_VERIFIED`, `LIVE_PARTIAL`, `CURATED_SNAPSHOT`, `STALE`, `FAILED_VALIDATION`).
3. **Formula-Based Canonical Debt**: Canonical `totalDebt` must strictly equal `currentDebt + longTermDebt + financeLeaseLiabilities + convertibleDebt`. Total liabilities is tracked separately as total liability burden.
4. **Market-Cap Threshold Consistency**: Microcap screening is standardized at ≤ $100M default with an optional up to $500M max cap selector, consistent across UI controls, metadata headers, exports, and scoring engines.
5. **OTC Markets Integration**: Include real OTC Markets API quotes & market cap data for Pink Sheets, OTCQB, and OTCQX issuers.
