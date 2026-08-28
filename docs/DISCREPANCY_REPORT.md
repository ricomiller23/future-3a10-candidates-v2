# Seeded Candidate Discrepancy Audit Report — FUTURE 3a10candidatesV2

**System**: FUTURE 3a10candidatesV2 (Audit-Ready Screener)  
**Report Type**: Legacy Prototype vs. Audited SEC EDGAR Filing Comparison  
**Date**: 2026-07-21  

---

## 1. Overview of Discrepancy Audit

An accuracy audit was performed comparing the legacy prototype dataset (`future-3a10-candidates`) against official SEC EDGAR 10-Q filing balance sheets for the candidate pool. The audit identified material financial variances, unbundled debt omissions, and accounts payable overstatements/understatements in the legacy dataset.

This document details the exact field-by-field discrepancies and establishes the canonical baseline implemented in **FUTURE 3a10candidatesV2**.

---

## 2. Material Discrepancy Matrix

```
┌────────┬───────────────────────────────┬───────────────────────────────┬───────────────────────────────┬────────────────────────────────────────────────────────┐
│ Ticker │ Field Name                    │ Legacy Prototype Value        │ Audited SEC 10-Q Value        │ Audit Variance & Root Cause Analysis                   │
├────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ NKLA   │ Accounts Payable              │ $68,000,000 ($68.0M)          │ $57,161,000 ($57.16M)         │ -$10.84M (-15.9%). Legacy prototype overstated AP.    │
│ NKLA   │ Total Debt                    │ $236,500,000 ($236.5M)        │ $343,129,000 ($343.13M)       │ +$106.63M (+45.1%). Legacy omitted LT debt components. │
│ NKLA   │ SEC Source Link               │ Generic browse URL            │ sec.gov/.../nkla-20240930.htm │ Period 2024-09-30 10-Q (CIK 0001731289).               │
├────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ ASTS   │ Accounts Payable              │ $54,000,000 ($54.0M)          │ $60,850,000 ($60.85M)         │ +$6.85M (+12.7%). Legacy understated AP.               │
│ ASTS   │ Total Debt                    │ $174,000,000 ($174.0M)        │ $2,971,532,000 ($2,971.53M)   │ +$2,797.53M (+1,607%). Legacy omitted $2.96B LT debt. │
│ ASTS   │ SEC Source Link               │ Generic browse URL            │ sec.gov/.../asts-20260331.htm │ Period 2026-03-31 10-Q (CIK 0001780312).               │
├────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ NBY    │ Accounts Payable              │ $2,100,000 ($2.1M)            │ $76,000 ($0.076M)             │ -$2.02M (-96.4%). Legacy prototype severely overstated.│
│ NBY    │ Total Debt                    │ $6,500,000 ($6.5M)            │ $1,080,000 ($1.08M)           │ -$5.42M (-83.4%). Legacy confused total liabilities.  │
│ NBY    │ Cash & Equivalents            │ $2,309,000 ($2.31M)           │ $2,309,000 ($2.31M)           │ MATCH (0.0% Delta). Cash figure verified.              │
│ NBY    │ SEC Source Link               │ Unverified link               │ stocktitan.net/.../NBY/10-q   │ Period 2025-09-30 10-Q (CIK 0001389545).               │
├────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┼────────────────────────────────────────────────────────┤
│ GOEV   │ Accounts Payable              │ $42,500,000 ($42.5M)          │ $42,500,000 ($42.5M)          │ MATCH (0.0% Delta). Verified 10-Q trade payables.     │
│ GOEV   │ Total Debt                    │ $144,000,000 ($144.0M)        │ $144,000,000 ($144.0M)        │ MATCH (0.0% Delta). Verified 10-Q total debt sum.      │
└────────┴───────────────────────────────┴───────────────────────────────┴───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. Key Findings & Remediation Steps Executed in V2

1. **Nikola Corporation (`NKLA`)**:
   - *Legacy Error*: Displayed total debt of $236.5M. The actual 10-Q balance sheet shows $73.111M in current debt/leases plus $270.018M in long-term debt/leases, totaling **$343.129M**.
   - *V2 Remediation*: Updated canonical snapshot with component breakdown (`currentDebt`: $73.111M, `longTermDebt`: $270.018M). Direct filing link attached (`000173128924000253`).

2. **AST SpaceMobile (`ASTS`)**:
   - *Legacy Error*: Displayed total debt of $174M. The actual 10-Q balance sheet reports **$2,963.296M** in long-term debt net plus **$8.236M** in current debt, totaling **$2,971.532M**.
   - *V2 Remediation*: Replaced legacy number with verified $2.97B debt figure. Added cap ceiling warning badge.

3. **NovaBay Pharmaceuticals (`NBY`)**:
   - *Legacy Error*: Displayed AP of $2.1M and total debt of $6.5M. The actual 10-Q balance sheet reports trade AP of **$76,000** ($0.076M) and total liabilities of **$1.853M**.
   - *V2 Remediation*: Corrected AP to $76,000 and total debt to $1.080M. Marked as clean microcap candidate.
