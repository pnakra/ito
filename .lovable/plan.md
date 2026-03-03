

## Plan: Create `docs/SYSTEM_CARD.md`

This will be a single new file consolidating the full safety architecture into a standard System Card format suitable for sharing with your reviewer.

### What the document will contain

**Section 1 — Overview**: What ito is, what it is not (not a permission system, not a therapist), the two flows (Before/After).

**Section 2 — Model Details**: Claude Sonnet 4 (`claude-sonnet-4-20250514`), pinned version, called via edge functions with locked severity levels. Seven edge functions listed with purposes.

**Section 3 — The 10 Non-Negotiable Safety Invariants**: Verbatim from the codebase comments in `analyze-ito/index.ts` (lines 20-30), numbered and explained.

**Section 4 — Mandatory Harm-Minimization Check**: The 5-question internal verification pass the LLM must run before returning output (lines 33-38 of `analyze-ito`).

**Section 5 — Deterministic Auto-Fail Conditions**: The full regex taxonomy from `riskClassification.ts`, organized by category:
- Immediate RED (incapacitation/force): `passed out`, `asleep`, `unconscious`, `forced`, `hold them down`, `won't remember`, `she was asking for it`
- RED (derogatory/objectifying): `slut`, `whore`, `thot`, `skank`, `easy`, `gets around`, `owes me`
- RED (reported pressure): `kept pushing`, `wouldn't stop`, `wouldn't let me leave`, `talked me into`, `pressured me`
- YELLOW (entitlement/manipulation): `deserve`, `friend zoned`, `nice guy`, `playing hard to get`, `led me on`, `don't be a tease`

**Section 6 — Risk Classification Logic**: The deterministic decision tree from `classifyRisk()` — consent signal × momentum × context factors × flag words. Explains that risk is computed client-side before any LLM call, and the LLM receives a locked severity it cannot downgrade.

**Section 7 — Architectural Safeguards**:
- High-water-mark: risk only escalates within a session, never resets
- Session pattern detection: `SessionPatternWarning` after 2+ yellow/red runs, `RefusalCard` after 2+ coercive-flagged runs
- No Green Light policy: neutral gray styling, "No flag" label, mandatory disclaimers
- Two-pass analysis: static regex first, then AI language analysis
- Anti-coaching constraints in yellow/red prompts
- Banned terms list (clinical labels, specific phrases)

**Section 8 — Server-Side Security**: Rate limiting (5-15 req/min), input validation (5000 char limit), RLS policies (INSERT-only for anon), retry logic with graceful degradation.

**Section 9 — Copy Constraints**: No clinical labels, no first-person pronouns from AI, mandatory disclaimers on every outcome, "One way they might have experienced this" framing for After flow.

**Section 10 — Known Gaps / Red-Team Surface**: What has NOT been done:
- No automated eval suite (30 PRD scenarios exist but are manual)
- No formal prompt injection testing on free-text fields
- No post-LLM output validation (banned phrase checking server-side)
- Session tracking is `sessionStorage`-based (bypassable via incognito)
- No CI/CD regression testing on prompt changes
- Model behavior variability (pinned but not version-locked against deprecation)

### Implementation
One new file: `docs/SYSTEM_CARD.md`. No code changes.

