<!--
Sync Impact Report
- Version change: 1.0 → 2.0 (MAJOR)
- Rationale: Replace generic FishDev default with project-specific
  governance for FUTURE 3a10candidatesV2. Removes Flyway-first
  database mandate as a core principle (no datastore exists).
  Adds non-negotiable audit principles (zero fabrication,
  provenance, canonical debt, transparent scoring, data modes).
  Restructures document onto the Spec Kit constitution scaffold.
- Modified principles:
  - I. Constitution Supremacy → retained, restated
  - II. Spec-Driven Development → retained, restated
  - III. Repository State Is Authoritative → moved under Core Principles as X
  - IV. Clean Code → folded into IX. Narrow Scope & Reviewability
  - V. Refactoring Is Continuous → folded into IX
  - VI. Narrow Task Scope → folded into IX
  - VII. Testing First → restated as VIII. Test-First Accuracy
  - VIII. Local and CI Validation → folded into VIII
  - IX. Version Controlled Databases → removed as core principle;
    persistence rules retained under Development Workflow
  - X. Git History Preservation → folded into Development Workflow
  - XI. Progress Over Conversation → folded into Development Workflow
  - XII. Human Reviewability → folded into IX
  - XIII. Reproducibility → folded into Development Workflow
  - XIV. Explicit Dependencies → folded into Development Workflow
  - XV. Technology Neutrality → folded into Development Workflow
  - XVI. Security by Default → folded into Product & Audit Constraints
    and Development Workflow
  - XVII. AI Transparency → folded into Governance
  - XVIII. Specification Structure → restated under Development Workflow
  - XIX. Progress Logging → folded into Development Workflow
  - XX. Completion Criteria → folded into Development Workflow
- Added principles:
  - III. Zero Fabrication (NON-NEGOTIABLE)
  - IV. Field-Level Provenance
  - V. Canonical Financial Truth
  - VI. Transparent Scoring
  - VII. Explicit Data Modes
- Added sections: Product & Audit Constraints; Development Workflow
- Removed sections: standalone Guiding Principle block (absorbed
  into Governance); generic JUnit/Flyway example lists
- Follow-up TODOs: none
-->

# FUTURE 3a10candidatesV2 Constitution

This constitution governs FUTURE 3a10candidatesV2, an internal
review-grade screener for US public micro-cap and small-cap issuers
that may be structurally suited to Securities Act Section 3(a)(10)
claim-settlement analysis.

It supersedes the generic FishDev default constitution (v1.0) for
this repository. All humans and AI assistants working in this
repository MUST follow these principles.

## Core Principles

### I. Constitution Supremacy

This constitution governs all engineering activity in the repository.

Specifications, plans, tasks, implementations, reviews, commits, and
AI behavior MUST comply with this constitution.

If a conflict exists between this constitution and any other
decision, the constitution prevails.

### II. Spec-Driven Development

All work MUST originate from a specification.

No code change is too small to require specification. This includes
features, bug fixes, refactors, documentation updates, dependency
upgrades, configuration changes, and typographical corrections.

Every meaningful change MUST be traceable to:

1. A specification
2. A task
3. A progress log entry

If no specification exists, create one before implementing work.
If no task exists, create one before implementing work.
Implementation without specification is prohibited.

### III. Zero Fabrication (NON-NEGOTIABLE)

The system MUST never invent, estimate, randomly generate, or
silently substitute financial or market figures.

If a required fact is absent, ambiguous, or unparseable, the field
MUST remain empty (null) and the record MUST carry an explicit
fallback reason, warning, or validation failure.

The following are prohibited:

* Random or pseudo-random values used as prices, multiples, or fills
* Substituting total liabilities for total debt
* Estimating debt as a fraction of liabilities
* Mixing figures from different reporting periods without disclosing
  the mix in the analyst-facing record
* Presenting a guessed number as an extracted or canonical fact

Rationale: V1 displayed material conflicts with official filings
because missing XBRL tags were filled with invented values. That
class of defect is a product-integrity failure, not a cosmetic bug.

### IV. Field-Level Provenance

No filing-derived number MAY be shown to an analyst without
traceable source metadata for that field. Provenance MUST include,
at minimum:

* Source location (official filing or quote source)
* Filing form when the value comes from a filing
* Period-end date for balance-sheet facts
* The reported concept or extraction rule used
* The raw reported value and the normalized USD value when numeric

Rationale: Review-grade use requires a reviewer to retrace any
displayed figure to an official source without reading chat history
or trusting tribal knowledge.

### V. Canonical Financial Truth

Each displayed metric MUST map to exactly one canonical field.

Debt MUST be unbundled. Canonical total debt is the sum of:

* Current debt
* Long-term debt
* Finance lease liabilities
* Convertible debt

Total liability burden is a separate metric and MUST NOT be used as
a debt proxy.

Accounts payable MUST represent trade payables. Combining AP with
accrued payroll or tax liabilities is allowed only when the filing
reports them as a single line item, and MUST be recorded as an
explicit fallback reason.

Derived ratios (debt-to-market-cap, AP-to-market-cap,
liabilities-to-cash, debt-to-cash) MUST be recomputed at evaluation
time from canonical fields. Ratios MUST NEVER be stored as
hand-entered text that can drift from the underlying facts.

If a denominator is missing or zero, the ratio MUST be empty, never
infinity or a fabricated stand-in.

### VI. Transparent Scoring

The 3(a)(10) feasibility score MUST be a numeric 0–100 total with a
visible component breakdown, a 0–100 confidence rating, explicit
reasons, and explicit blockers.

Scoring MUST use only validated canonical fields and disclosed
qualitative flags (for example going-concern language, defaulted
notes, convertible debt presence, jurisdiction precedent).

If critical inputs (accounts payable, total debt, or market cap) are
missing, the system MUST degrade confidence and MUST NOT emit a
high-conviction score as if the inputs existed.

Score labels such as tier names MUST be derived from the computed
score. Manual override of score labels without changing inputs is
prohibited.

Rationale: Unexplainable score labels were a V1 audit liability.
A reviewer MUST be able to recompute or reject a score from the
breakdown alone.

### VII. Explicit Data Modes

Curated snapshots and live extractions MAY coexist. They MUST NEVER
be mixed without an explicit data-mode label on the candidate.

Allowed modes:

* `LIVE_VERIFIED` — live filing facts and live market data, validated
* `LIVE_PARTIAL` — live fetch with non-critical fields missing
* `CURATED_SNAPSHOT` — manually audited baseline
* `STALE` — facts outside the freshness window
* `FAILED_VALIDATION` — critical inconsistency or missing source

`FAILED_VALIDATION` rows MUST be excluded from default
high-conviction rankings unless an analyst explicitly overrides.

Market-cap controls MUST be consistent everywhere they appear: the
default micro-cap filter is $100 million; the maximum ceiling is
$500 million. UI, metadata, exports, and constants MUST NOT
contradict each other.

### VIII. Test-First Accuracy

Testing is a first-class deliverable.

Preferred order:

1. Test-first development
2. Tests concurrent with implementation
3. Test-after development (discouraged)

Accuracy, identity resolution, canonical formulas, scoring, and
validation MUST have automated tests. A change that can reintroduce
fabricated values, wrong debt totals, or mismatched market-cap
ceilings is incomplete without a failing-then-passing test.

Tests MUST be runnable locally. Tests SHOULD also run in CI when a
pipeline exists.

Live filing fetches are rate-limited external services. Tests MUST
not depend on inventing facts when a live fetch fails; they MUST
fail closed or use an explicit fixture labeled as a fixture.

### IX. Narrow Scope & Reviewability

Work MUST stay inside the active specification and task.

Unrelated refactors, opportunistic cleanups, and scope expansion
require explicit human approval and, when architectural, their own
specification.

Code MUST be readable, testable, and understandable by a new
engineer. Prefer small functions, clear names, single
responsibility, explicit behavior, low coupling, and high cohesion.

A reviewer MUST be able to determine what changed, why it changed,
which task it satisfies, and how it was tested, without reading AI
conversations.

### X. Repository State Is Authoritative

Authoritative project knowledge exists only in:

* This constitution
* Specifications, plans, and tasks
* Progress logs and handoff files
* Source code and tests
* Version control history

Human memory, AI memory, and prior conversations are not
authoritative. When uncertainty exists, consult the repository.

## Product & Audit Constraints

This system is an internal analytical screener. It is not a broker,
dealer, investment adviser, or offering vehicle. Copy, scores, and
exports MUST NOT be presented as investment recommendations or as
registered-offering advice.

A candidate MUST be marked `FAILED_VALIDATION` when any of the
following is true:

1. Accounts payable or total debt cannot be tied to an explicit
   filing source or reported concept
2. Displayed total debt differs from the unbundled component sum
   beyond tolerance (the greater of 1% or $50,000)
3. Filing identity (CIK or source location) belongs to a different
   issuer than the displayed ticker
4. Figures from different reporting periods are combined without
   explicit disclosure
5. Market-cap filter ranges conflict across the product
6. A 3(a)(10) score is produced from undefined critical inputs

External filing and quote sources MUST be treated as untrusted
inputs: identity MUST be resolved before numbers are accepted;
secrets MUST never be committed; live source access MUST respect
published rate limits and cache rather than hammer the source.

Seeded curated rows are allowed as an audited baseline. Live fetches
MUST NOT silently overwrite curated facts without leaving the
previous values inspectable in discrepancy review.

## Development Workflow

Specifications are organized by release and feature:

```text
specs/
  <release-number>/
    <release>.<feature-number>-<feature-name>/
```

Rules:

* Release numbers start at 0
* Feature numbers increment sequentially within a release
* Feature names MUST be descriptive
* Specification directories are permanent project history
* The active feature directory MUST also be recorded for Spec Kit
  in `.specify/feature.json`

Each feature directory SHOULD contain, when applicable:

* `spec.md`
* `plan.md`
* `tasks.md`
* `manualtester.md`
* `notes.md`

Session startup MUST follow `start.ai`. Progress MUST be recorded in
`.config/ai/progress.ai`. Incomplete work MUST be handed off in
`.config/ai/handoff.ai`. Chat history MUST NOT be the only record of
a decision.

Git history MUST be preserved. History MUST NOT be rewritten, reset,
or cleaned in a way that discards human work without explicit
permission. When uncertain, stop and ask.

Any engineer MUST be able to clone the repository, install
dependencies, run tests, and build using documented procedures.
Undocumented setup steps are prohibited.

This repository currently has no persistent datastore. If
persistence is introduced, schema changes MUST be version-controlled,
repeatable, and auditable. Manual schema edits in a live environment
are prohibited except during emergencies and MUST be reconciled into
version control immediately afterward.

Dependencies MUST be chosen for maturity, maintenance, adoption, and
security posture. Significant new dependencies MUST have a recorded
rationale. Fashionable novelty is not a sufficient reason.

Security is continuous: track dependency vulnerabilities, protect
secrets, follow least privilege, and record audits in project
history. A monthly vulnerability review SHOULD appear in the
progress log.

Work is not complete until a specification exists, a task exists,
implementation exists, testing exists, the progress log is updated,
and this constitution remains satisfied. Implementation alone does
not constitute completion.

## Governance

Amendments to this constitution require:

1. An explicit change in this file
2. A semantic version bump
3. A sync-impact note describing what changed and why
4. An update to the progress log

Versioning:

* MAJOR: removal or incompatible redefinition of a principle
* MINOR: new principle or materially expanded guidance
* PATCH: clarification, wording, or typo fix

Compliance review is mandatory on every specification, plan, task,
and implementation. A change that would display an unsourced or
fabricated financial figure MUST be rejected.

AI assistance is permitted. Work is judged by correctness,
maintainability, testability, documentation quality, security, and
audit integrity — not by whether a human or an AI produced it.
AI-generated code is subject to the same standards as human code.

Runtime workflow guidance lives in `start.ai`. Product audit rules
in `ACCURACY_AUDIT_SPEC.md` and `DATA_MODEL_REVIEW.md` inform this
constitution; if those documents conflict with this file, this file
prevails until they are amended together.

Build a system a competent reviewer can recompute, challenge, and
maintain years later. Favor clarity over cleverness, documented
knowledge over remembered knowledge, and sourced facts over
convenient estimates.

**Version**: 2.0.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28
