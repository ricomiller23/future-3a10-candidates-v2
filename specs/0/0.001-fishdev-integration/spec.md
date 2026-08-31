# Feature Specification: FishDev Integration

**Feature Branch**: `fishdev-integration`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "based on what this repo is, update the constitution. Then make a spec for this integration"

## User Scenarios & Testing *(mandatory)*

This feature adopts FishDev constitution-and-specification governance for FUTURE 3a10candidatesV2 without changing the screener’s purpose: helping internal analysts identify US micro-cap and small-cap issuers that may fit Section 3(a)(10) claim-settlement analysis, using sourced financials rather than invented figures.

### User Story 1 - Analyst keeps an audit-ready screener (Priority: P1)

An internal review analyst opens the screener and works the existing candidate list: search, filter by data mode and market-cap ceiling, inspect a candidate’s sourced figures and score breakdown, compare known historical discrepancies, request a live filing lookup, and export the filtered set.

The analyst continues to see explicit data-mode labels, unbundled debt, accounts payable, cash, market cap, a numeric 3(a)(10) score with confidence, and a path back to the official filing or quote source. Missing facts appear as gaps or validation failures, not as filled-in guesses.

**Why this priority**: The product already exists. FishDev adoption fails if it regresses the screener or reopens the V1 fabrication problem. Protecting analyst-facing integrity is the first deliverable of the integration.

**Independent Test**: An analyst can complete screen → inspect → export on the seeded candidate set and confirm every displayed filing-derived figure is either sourced or explicitly marked missing, with no invented fills.

**Acceptance Scenarios**:

1. **Given** the screener is available with the audited candidate set, **When** the analyst opens the default screening view, **Then** each candidate shows identity, data mode, canonical accounts payable, unbundled or total canonical debt, cash, market cap, score, and confidence.
2. **Given** a candidate row, **When** the analyst inspects it, **Then** the analyst can see why the score was assigned (component breakdown, reasons, blockers) and can reach the official filing or quote source for filing-derived numbers.
3. **Given** a fact that cannot be sourced, **When** that candidate is shown, **Then** the field is empty or failed-validation, never a silent estimate, random fill, or liabilities-as-debt substitute.
4. **Given** the analyst sets a market-cap ceiling, **When** the list filters, **Then** the ceiling used in the view is consistent with the product’s published $100 million default micro-cap filter and $500 million maximum ceiling.

---

### User Story 2 - Contributor discovers governing rules without prior chat (Priority: P1)

An engineer or AI assistant starting a session on this repository can determine, from repository artifacts alone: what the product is, which constitution is in force, which specification is active, what work is in progress, and what they are forbidden to do (especially fabricating financials).

**Why this priority**: FishDev integration exists so future work is constitution-bound and spec-originated. If a new contributor still depends on Slack or chat history, the integration has not landed.

**Independent Test**: A reviewer unfamiliar with prior conversations can open the repository and, within a few minutes, name the governing constitution version, the active specification, and the zero-fabrication rule.

**Acceptance Scenarios**:

1. **Given** a fresh session and no chat history, **When** the contributor follows the repository’s session startup instructions, **Then** they can report the current branch, constitution presence and version, active specification, recent progress, and recommended next work.
2. **Given** the project constitution, **When** the contributor reads it, **Then** it describes this screener (3(a)(10) candidate review, sourced financials, unbundled debt, transparent scoring) rather than a generic starter-kit product.
3. **Given** a proposed change with no specification or task, **When** the contributor checks workflow rules, **Then** implementation is prohibited until a specification and task exist.

---

### User Story 3 - Reviewer traces a change to a spec and audit rules (Priority: P2)

A human reviewer examining work on the FishDev integration branch can see which specification the work satisfies, confirm it does not weaken audit rules, and confirm product-facing behavior is unchanged except where the specification explicitly allows it.

**Why this priority**: Reviewability is how the constitution is enforced. Integration is incomplete if reviewers still need the originating chat to understand intent.

**Independent Test**: A reviewer can map this branch’s constitution and specification artifacts to the stated user stories and reject a hypothetical change that invents a missing debt figure.

**Acceptance Scenarios**:

1. **Given** the integration specification and constitution, **When** a reviewer inspects the change set, **Then** they can identify the specification directory, the constitution version, and the progress record for the decision.
2. **Given** a proposed implementation that would fill missing debt with a fraction of total liabilities, **When** it is reviewed against the constitution, **Then** it MUST be rejected.
3. **Given** FishDev workflow files in the repository, **When** an analyst uses the screener, **Then** those workflow files do not appear as product features in the analyst interface.

---

### User Story 4 - Analyst still audits discrepancies and live lookups (Priority: P2)

An analyst can still open the discrepancy review of known legacy-versus-filing mismatches and can still request a live lookup of an issuer’s latest reported facts. Results remain labeled by data mode. A failed or partial live lookup does not invent replacement numbers.

**Why this priority**: Discrepancy review and live lookup are how the team proved V1 was wrong. They must survive governance adoption.

**Independent Test**: Exercise discrepancy review for the known mismatched issuers and a live lookup of one ticker; confirm sourced values or explicit failure, never fabricated fills.

**Acceptance Scenarios**:

1. **Given** the known historically mismatched issuers, **When** the analyst opens discrepancy review, **Then** each compared field shows the legacy figure, the audited filing figure, and whether the difference is a match, a material discrepancy, or unavailable.
2. **Given** a ticker the analyst wants to refresh, **When** they request a live lookup, **Then** they receive a candidate record labeled live-verified, live-partial, or failed-validation — not a silently patched curated row.
3. **Given** the live source is unavailable or rate-limited, **When** lookup fails, **Then** the analyst sees an explicit error or partial state, and previously audited curated rows remain inspectable.

---

### Edge Cases

- What happens when a live lookup returns some facts but not accounts payable or debt? The record MUST be partial or failed-validation; missing fields stay empty; score confidence degrades; no substitute formula fills the gap.
- What happens when market cap is missing or zero? Ratios that divide by market cap MUST be empty; the candidate MUST NOT receive a high-conviction score as if cap existed.
- What happens when curated snapshot and live extraction disagree beyond tolerance (the greater of 1% or $50,000)? Discrepancy review MUST surface a material discrepancy; live data MUST NOT silently overwrite the curated baseline without leaving the comparison inspectable.
- What happens when a contributor wants a one-line copy fix with no spec? Workflow MUST still require a specification and task; the integration spec itself may cover tiny documentation-only follow-through that is already in its tasks, but new product behavior still needs its own spec.
- What happens when session startup cannot validate the specification toolkit? Feature implementation MUST stop; the contributor MUST report the failure and ask the human for help.
- How does the system handle an issuer whose latest filing is a foreign-private-issuer annual report rather than a domestic quarterly report? The candidate MAY still be shown if facts are sourced and labeled; data mode and filing form MUST remain visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST have a project constitution that is specific to FUTURE 3a10candidatesV2 (audit-ready 3(a)(10) candidate screening) rather than a generic starter-kit constitution.
- **FR-002**: The constitution MUST prohibit fabricated, random, or silently substituted financial and market figures, and MUST require empty fields plus explicit warnings when facts are missing.
- **FR-003**: The constitution MUST require field-level provenance for filing-derived numbers, unbundled canonical debt, separate total-liability tracking, recomputed ratios, transparent 3(a)(10) scoring with confidence, and explicit data-mode labels.
- **FR-004**: All subsequent product work MUST originate from a specification, a task, and a progress-log entry before implementation.
- **FR-005**: Contributors MUST be able to complete session startup from repository instructions and learn constitution presence, active specification, branch, progress, handoff, and recommended next work without prior conversation.
- **FR-006**: The active feature directory for this integration MUST be a permanent specification location under the FishDev release/feature layout (`specs/<release>/<release>.<feature>-<name>/`) and MUST be discoverable as the active feature.
- **FR-007**: Analysts MUST retain screening, inspection, discrepancy review, live lookup, and export capabilities already present in the product.
- **FR-008**: Analyst-facing views MUST continue to label each candidate with a data mode and MUST keep failed-validation rows out of default high-conviction ranking unless explicitly overridden.
- **FR-009**: Displayed canonical total debt MUST remain the sum of current debt, long-term debt, finance lease liabilities, and convertible debt, within stated tolerance.
- **FR-010**: Market-cap filtering MUST remain consistent: default micro-cap filter $100 million, maximum ceiling $500 million, with no contradictory statements across the product.
- **FR-011**: FishDev and specification-toolkit workflow artifacts MUST NOT be presented as analyst product features.
- **FR-012**: Progress history MUST record this constitution adoption and this specification as durable project decisions.
- **FR-013**: A live lookup that cannot source a critical field MUST fail closed (partial or failed-validation) rather than estimate the field.
- **FR-014**: Reviewers MUST be able to reject any change that would reintroduce V1-style fabrication using only the constitution and this specification.

### Key Entities

- **Constitution**: The governing rules for this repository; versioned; supreme over specifications and implementation.
- **Feature Specification**: The statement of user needs and acceptance rules for a unit of work; this document is the first feature specification under FishDev in this repository.
- **Progress Record**: Durable log of decisions, implementations, tests, and audits so project history does not live only in chat.
- **Issuer**: A US public company identified by ticker and official filing identity.
- **Canonical Financial Snapshot**: The single sourced set of accounts payable, unbundled debt, cash, liabilities, and market cap used for screening and scoring.
- **Source Reference**: The provenance of a field (filing or quote, form, period, concept, raw and normalized values).
- **Data Mode**: The honesty label for how current a candidate’s facts are (live-verified, live-partial, curated snapshot, stale, failed-validation).
- **3(a)(10) Score**: A 0–100 feasibility score with component breakdown, confidence, reasons, and blockers; not an investment recommendation.
- **Discrepancy Item**: A field-level comparison of a legacy figure versus an audited filing figure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor who has never seen prior chat can identify the constitution version, the active specification, and the zero-fabrication rule in under 5 minutes using only repository artifacts.
- **SC-002**: 100% of filing-derived figures shown in the default screener are either sourced or explicitly marked missing/failed; 0% are random, estimated-from-liabilities, or otherwise invented.
- **SC-003**: An analyst can complete the primary path (open screener, filter, inspect one candidate, export) without encountering FishDev workflow files as product UI.
- **SC-004**: Known historical mismatches remain visible in discrepancy review so a reviewer can still see legacy-versus-filing deltas without reconstructing them from memory.
- **SC-005**: A reviewer can map every integration-branch decision in this feature to this specification and constitution with no dependency on chat transcripts.
- **SC-006**: After integration, a live lookup failure or missing critical field produces an explicit gap or failure state in 100% of tested cases, never a silently filled number.

## Assumptions

- Target users are internal analysts and internal engineering contributors (including AI assistants), not the investing public.
- This integration governs and protects the existing screener; it does not rebuild screening, scoring, or filing lookup from scratch.
- Authentication, multi-user accounts, and a persistent database are out of scope for this feature.
- Mobile-specific layouts are out of scope; the existing desktop-oriented analyst interface remains the surface.
- Seeded curated candidates remain the default list until an analyst requests a live lookup.
- External filing and quote services remain the systems of record for live facts; this product caches and labels, it does not become a new official source.
- Tolerance for numeric discrepancy remains the greater of 1% or $50,000, matching the existing audit rules.
- Scores and exports continue to be internal analytical output, not investment advice.
- Specification toolkit validation is required before later implementation tasks; inability to validate the toolkit blocks implementation, not this specification itself.
- Follow-on planning and task breakdown are separate steps after this specification is accepted.
