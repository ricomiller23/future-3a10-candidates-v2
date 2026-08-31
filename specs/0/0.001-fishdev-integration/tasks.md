# Tasks: FishDev Integration

**Input**: Design documents from `/specs/0/0.001-fishdev-integration/`

**Prerequisites**: spec.md (present). plan.md was not generated; this list is based on the spec, constitution, and work already completed on `fishdev-integration`.

**Tests**: Not requested as new test suites. Remaining verification uses the existing product and `npm test`.

**Organization**: Tasks are grouped by user story. Items completed on this branch or already present in the V2 product (retained, not rebuilt) are checked.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions
- **[x]** = done (this branch, retained V2 product, or verified this session)
- All 32 tasks are complete.

## Path Conventions

Single Next.js app at repository root: `app/`, `components/`, `lib/`, `specs/`, `.specify/`, `.config/ai/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch and Spec Kit feature location for this integration

- [x] T001 Create git branch `fishdev-integration` from `main` at repository root
- [x] T002 Create FishDev feature directory `specs/0/0.001-fishdev-integration/`
- [x] T003 [P] Record active feature path in `.specify/feature.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Project-specific constitution and the integration specification. User stories depend on these artifacts existing.

**⚠️ CRITICAL**: No further product implementation on this feature until this phase is complete (it is).

- [x] T004 Replace generic FishDev v1.0 constitution with v2.0.0 domain constitution (zero fabrication, provenance, canonical debt, transparent scoring, data modes) in `.specify/memory/constitution.md`
- [x] T005 Author FishDev integration specification (US1–US4, FRs, success criteria, assumptions) in `specs/0/0.001-fishdev-integration/spec.md`
- [x] T006 [P] Author specification quality checklist in `specs/0/0.001-fishdev-integration/checklists/requirements.md`
- [x] T007 Record constitution adoption and spec decisions in `.config/ai/progress.ai`
- [x] T008 Author this task list in `specs/0/0.001-fishdev-integration/tasks.md`

**Checkpoint**: Foundation ready — constitution, spec, and tasks exist; remaining work is retain-and-verify plus FishDev session completeness.

---

## Phase 3: User Story 1 - Analyst keeps an audit-ready screener (Priority: P1) 🎯 MVP

**Goal**: Analysts still screen, inspect, and export seeded candidates with sourced figures, unbundled debt, data-mode labels, and a transparent score. FishDev adoption must not rebuild or regress this path.

**Independent Test**: Complete screen → inspect → export on the seeded set; every filing-derived figure is sourced or explicitly missing; no invented fills.

### Implementation for User Story 1 (retained V2 product)

- [x] T009 [P] [US1] Keep canonical types (unbundled debt, data modes, score breakdown, provenance) in `lib/types/domain.ts`
- [x] T010 [P] [US1] Keep audited seeded candidates (canonical AP, debt components, cash, market cap, scores) in `lib/data/revalidated-seed.ts`
- [x] T011 [P] [US1] Keep 6-component 3(a)(10) scoring with confidence, reasons, and blockers in `lib/scoring/score-engine.ts`
- [x] T012 [P] [US1] Keep fail-closed validation (no silent fabrication) in `lib/audit/validator.ts`
- [x] T013 [US1] Keep screener, filters ($100M default / $500M ceiling), inspector, score modal, and CSV export in `app/page.tsx`, `components/CandidateTable.tsx`, `components/FilterToolbar.tsx`, `components/CandidateInspector.tsx`, `components/ScoreBreakdownModal.tsx`

### Verification for User Story 1

- [x] T014 [US1] Verify screen → inspect → export still works and displayed filing-derived figures are sourced or marked missing (exercise `app/page.tsx` and inspector; no product change expected)

**Checkpoint**: User Story 1 is functionally present; T014 confirms it survived integration.

---

## Phase 4: User Story 2 - Contributor discovers governing rules without prior chat (Priority: P1)

**Goal**: A new engineer or AI assistant can learn the product, constitution version, active spec, progress, and zero-fabrication rule from repository artifacts alone.

**Independent Test**: Without chat history, name constitution version, active spec path, and the zero-fabrication rule in under five minutes.

### Implementation for User Story 2

- [x] T015 [P] [US2] Session startup already requires reading constitution, specs, progress, and handoff in `start.ai`
- [x] T016 [P] [US2] Domain constitution (not generic starter-kit) is the in-force document at `.specify/memory/constitution.md`
- [x] T017 [P] [US2] Active spec and quality checklist exist in `specs/0/0.001-fishdev-integration/spec.md` and `specs/0/0.001-fishdev-integration/checklists/requirements.md`
- [x] T018 [US2] Progress log records this feature in `.config/ai/progress.ai`
- [x] T019 [US2] Fill repository settings (stack, constitution pointer, active spec) in `.config/ai/repo.ai`
- [x] T020 [US2] Fill current branch, current task, and recommended next action in `.config/ai/handoff.ai`

**Checkpoint**: After T019–T020, session bootstrap artifacts are complete.

---

## Phase 5: User Story 3 - Reviewer traces a change to a spec and audit rules (Priority: P2)

**Goal**: A reviewer can map this branch to the spec and constitution, reject fabrication using those documents, and confirm FishDev files are not product UI.

**Independent Test**: Identify spec directory, constitution version, and progress entry; confirm Docs tab does not present FishDev workflow files as analyst features.

### Implementation for User Story 3

- [x] T021 [P] [US3] Spec directory, constitution version 2.0.0, and progress record exist in `specs/0/0.001-fishdev-integration/`, `.specify/memory/constitution.md`, `.config/ai/progress.ai`
- [x] T022 [P] [US3] Task list exists so work is spec+task traceable in `specs/0/0.001-fishdev-integration/tasks.md`
- [x] T023 [US3] Analyst Docs tab lists product audit specs (`ACCURACY_AUDIT_SPEC.md`, `DATA_MODEL_REVIEW.md`, etc.), not FishDev workflow files, in `app/page.tsx`
- [x] T024 [US3] Review checkpoint: confirm constitution Principle III (Zero Fabrication) is sufficient to reject a liabilities-as-debt fill without reading chat

**Checkpoint**: Reviewer path is documented; T024 is a human review gate, not a code change.

---

## Phase 6: User Story 4 - Analyst still audits discrepancies and live lookups (Priority: P2)

**Goal**: Discrepancy review and live lookup remain available, labeled by data mode, and fail closed when facts are missing.

**Independent Test**: Open discrepancy review for known mismatched issuers; request one live lookup; confirm sourced values or explicit failure, never fabricated fills.

### Implementation for User Story 4 (retained V2 product)

- [x] T025 [P] [US4] Keep discrepancy auditor UI and generator in `components/DiscrepancyAuditor.tsx`, `lib/audit/discrepancy-generator.ts`, `app/api/audit-discrepancies/route.ts`
- [x] T026 [P] [US4] Keep live SEC lookup and universe scanner in `components/UniverseScanner.tsx`, `lib/sec/edgar-api.ts`, `app/api/sec-lookup/route.ts`, `app/api/universe-scan/route.ts`
- [x] T027 [US4] Keep fail-closed XBRL extraction (missing facts stay empty) in `lib/sec/xbrl-parser.ts`

### Verification for User Story 4

- [x] T028 [US4] Verify discrepancy review for NKLA, ASTS, and NBY in `components/DiscrepancyAuditor.tsx` and `docs/DISCREPANCY_REPORT.md`
- [x] T029 [US4] Verify one live lookup returns live-verified, live-partial, or failed-validation — never a silently patched curated row — via `app/api/sec-lookup/route.ts`

**Checkpoint**: User Story 4 is present; T028–T029 confirm it survived integration.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Session completeness and recorded verification

- [x] T030 [P] Add decision notes for this feature in `specs/0/0.001-fishdev-integration/notes.md`
- [x] T031 Run existing test suite (`npm test`) and record commands plus outcomes in `.config/ai/progress.ai`
- [x] T032 Update progress log after remaining verification in `.config/ai/progress.ai`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Complete
- **Foundational (Phase 2)**: Complete — blocks new product work; does not block retain-and-verify
- **User Stories (Phase 3–6)**: Implementation tasks are retained V2 product (complete). Open work is verification (US1, US4) and session artifacts (US2, US3)
- **Polish (Phase 7)**: After remaining verification (or in parallel for T030)

### User Story Dependencies

- **User Story 1 (P1)**: Product retained; only T014 remains
- **User Story 2 (P1)**: Independent of US1 UI; T019–T020 remain
- **User Story 3 (P2)**: Depends on spec + constitution + tasks (done); T024 remains
- **User Story 4 (P2)**: Product retained; T028–T029 remain

### Parallel Opportunities

- T014, T019, T020, T024, T028, T029, and T030 can proceed in parallel (different files / different verification surfaces)
- T031 should run after or alongside T014 / T028 / T029
- T032 last

---

## Parallel Example: Remaining open work

```text
T014  Verify screener path in app/page.tsx
T019  Fill .config/ai/repo.ai
T020  Fill .config/ai/handoff.ai
T028  Verify discrepancy auditor
T029  Verify live lookup fail-closed
T030  Write specs/0/0.001-fishdev-integration/notes.md
```

---

## Implementation Strategy

### MVP (already delivered)

Phases 1–2 plus retained US1 product (T001–T013). Analysts still have the screener. FishDev governance is in force.

### Remaining to close the spec

All remaining items (T014, T019–T020, T024, T028–T032) completed 2026-08-28. See `notes.md` and `.config/ai/progress.ai`.

### What this branch intentionally did not rebuild

Screening, scoring, discrepancy audit, and live SEC lookup already exist. Per spec assumptions, this feature governs and protects them rather than rewriting them.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to spec user stories US1–US4
- plan.md is absent; do not block remaining verification on creating a plan unless a later change needs one
- Commit only when the human asks
