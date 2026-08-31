# Notes: FishDev Integration (0.001)

**Branch**: `fishdev-integration`  
**Date**: 2026-08-28

## Intent

Adopt FishDev (constitution + spec-first workflow) on the existing FUTURE 3a10candidatesV2 screener. Do not rebuild screening, scoring, discrepancy audit, or live lookup. Encode V2 audit rules as repository law so V1 fabrication cannot return.

## T024 — Review checkpoint: Zero Fabrication rejects liabilities-as-debt

**Question**: Can a reviewer reject a change that fills missing total debt with `totalLiabilities * 0.85` using only the constitution, without chat history?

**Verdict**: Yes. Principle III (Zero Fabrication) in `.specify/memory/constitution.md` explicitly prohibits:

- Substituting total liabilities for total debt
- Estimating debt as a fraction of liabilities
- Presenting a guessed number as an extracted or canonical fact

Missing facts MUST stay empty with an explicit warning or `FAILED_VALIDATION`. Principle I (Constitution Supremacy) requires the reviewer to reject the change even if a spec or PR description argues convenience. No prior conversation is required.

## T029 finding — invented $1.25 share price

During live-lookup review, `lib/sec/edgar-api.ts` filled missing market cap with a hard-coded `$1.25` share price when a live quote was absent. That is the same class of silent estimate Principle III forbids.

**Fix (this branch)**: Compute market cap only from a sourced quote price × sourced shares. If price is missing, leave `marketCap` and `sharePrice` empty so the record is `LIVE_PARTIAL` or fails validation. Do not invent a price.

## Decisions

- Spec layout is FishDev `specs/<release>/<release>.<feature>-<name>/`, with `.specify/feature.json` for Spec Kit.
- `plan.md` was not generated; tasks were written from spec.md plus completed branch work.
- `.config/ai/defaults/constitution.md` remains the generic FishDev template; the in-force constitution is `.specify/memory/constitution.md`.
- Product Docs tab stays on audit specs (`ACCURACY_AUDIT_SPEC.md`, etc.). FishDev files are not analyst features.

## Verification (2026-08-28)

- **T014**: Browser on `http://localhost:3000` — 20 candidates, $0–$500M cap slider, search `NKLA` filters to one row, Inspect shows NKLA CIK 0001731289, AP $57.16M, debt $343.13M unbundled, 10-Q link, score breakdown. Export CSV clicked without error. Pre-existing hydration overlay on `CandidateTable.tsx` did not block the path.
- **T024**: Principle III explicitly bans liabilities-as-debt and fraction-of-liabilities estimates. Pass.
- **T028**: API and UI — NKLA, ASTS, NBY `MATERIAL_DISCREPANCY`; GOEV `VERIFIED_MATCH`. Matches `docs/DISCREPANCY_REPORT.md`.
- **T029**: `GET /api/sec-lookup?ticker=NBY` → `LIVE_PARTIAL`, total debt and market cap empty, score 20 / confidence 35, blockers present. UI scanner shows the same. Invalid ticker returns explicit 404 JSON. Removed `$1.25` invented price so missing quotes stay empty.
- **T031**: Accuracy, domain/scoring, and live CIK resolution tests passed after `npm install`.
