# ito — Six-Month Technical Retrospective

**Period:** January – June 2026
**Product:** [ito / "is this ok?"](https://isthisok.app) — a narrative-first behavioral interruption tool for teens facing ambiguous consent situations.

Companion docs:
- [`SYSTEM_CARD.md`](./SYSTEM_CARD.md) — authoritative safety architecture
- [`ALL_COPY.md`](./ALL_COPY.md) — authoritative static copy
- [`PRD.md`](./PRD.md) — product spec
- [`AFTER_FLOW.md`](./AFTER_FLOW.md) — accountability flow design

---

## 1. Product evolution & flow architecture

**Started as:** "Vibecheck" — a chat-first AI tool giving teen boys feedback on dating approaches. Single freeform input → single AI response.

**Ended as:** **ito / "is this ok?"** — a narrative-first, decision-tree behavioral interruption tool with three distinct flows:
- `/check-in` (before — prevention)
- `/after` (accountability — "I already did something")
- `/someone-crossed` (survivor support)

**Key architectural pivots:**
- **Jan 27** — Refactored `/avoid-line` from chat-first to **decision-first**. Pulled consent risk logic *out* of the LLM into deterministic frontend code (`src/lib/riskClassification.ts`). LLM is now only used for *explanation*, never *assessment*. This was the foundational call that made everything else possible.
- **Feb** — Added the "Moves + Ladder" model and a **non-permissive stance**: no "GREEN/safe" verdicts. Renamed to "No flag detected" with mandatory disclaimer *"This is not permission."*
- **Feb–Mar** — Shifted to **narrative-first adaptive intake**. User types the situation in their own words first; deterministic + AI layers parse it. Replaced rigid stepper with progressive structure.
- **Mar** — Built **guided mode** as a 7-step stepper alternative for users who don't want to write freeform.
- **Mar–Apr** — Added **conversational follow-up** after assessment, **refusal state** for repeated coercive/dehumanizing language, **session pattern warnings** (2+ flags = warning), and **"What did you do?" outcome capture**.

## 2. Safety architecture (the 3-layer system)

See [`SYSTEM_CARD.md`](./SYSTEM_CARD.md) for the authoritative spec.

1. **Deterministic layer** — `riskClassification.ts` with hardcoded flag-word regex (derogatory labels, entitlement language, victim-blaming), **high-water-mark logic** (risk never decreases within a session), and signal-floor rules.
2. **Tiered AI prompting** — separate system prompts per risk tier:
   - **RED:** interrupt only, no coaching, ≤1 actionable suggestion
   - **YELLOW:** pause + reflect
   - **NEUTRAL:** no validation, no permission language
3. **Hardcoded crisis resources** — 988, RAINN, Crisis Text Line surface only on RED.

**Stress testing:**
- Generated 30 adversarial first-person scenarios across 9 risk categories (mixed signals, boundary erosion, alcohol, power dynamics, etc.).
- Built an eval rubric (`docs/EVAL_RUBRIC.md`) with 6 scoring dimensions (risk caught, tone, victim-blaming avoidance, permission-slip avoidance, etc.).
- Ran the full pipeline end-to-end, hardened invariants, re-ran.

**Ethical code reviews:** Ran the codebase through an external ethical scanning framework twice. Addressed "visual exoneration," "AI ventriloquism," "false approval of risky behavior," and "false reassurance for bad actors." Added mandatory consent banners on all explanation cards.

## 3. AI infrastructure

- **Started:** `@anthropic-ai/sdk` called **client-side** (API key exposed — security disaster).
- **Migrated to:** Supabase edge functions (`analyze-ito`, `log-submission`, etc.) with `verify_jwt = false`.
- **Model journey:** Anthropic SDK direct → Lovable AI Gateway (Gemini 2.5 Flash) → back to **Claude Sonnet 4** (`claude-sonnet-4-20250514`) via direct Anthropic API for tone and safety quality.
- Resolved: Anthropic protocol errors (consecutive `user` messages, strict role alternation), JSON parsing edge cases on AI output, edge function cold-start timeouts.

## 4. Data & analytics

- **`submissions` table** in Supabase: `session_id`, `flow_type`, `step_name`, `step_type`, `choice_value`, `freetext_value`, `metadata`, `created_at`. RLS enabled; anonymous inserts via edge function using service role.
- **Anonymous session IDs** — 30-day rotating value in localStorage, no PII.
- **Referral attribution** — `submissionLogger.ts` captures `?src=&pid=&sid=` on first load, persists in `sessionStorage`, merges into every submission's `metadata`. Lets me split Prolific vs. Gameboi-referred vs. organic post-hoc.
- **GA4 + Vercel Analytics** wired for top-of-funnel.
- 2,000-char client cap / 10,000-char backend cap on freeform inputs.

## 5. Production infrastructure

- **Migrated Lovable hosting → Vercel** mid-project for custom domain and edge control.
- Custom domain: `isthisok.app` (alias `ito.lovable.app`).
- **Two Supabase instances:** dev (Lovable Cloud, stopped receiving writes May 22) and **prod external** (where real traffic lands). Discovered the hard way that analytics queries against the dev DB were stale.
- Supabase migrations with explicit `GRANT` blocks on every public table, RLS policies using a `has_role` security-definer function pattern, separated `user_roles` table (never stored on a profile row).
- Edge function logging + error capture.

## 6. Design system

See [`ALL_COPY.md`](./ALL_COPY.md) for the authoritative copy bank.

- **Initial:** Generic purple/pink gradient Gen-Z aesthetic.
- **Final:** Dark-mode default ("notes app at night" vibe), **Geist Sans + Newsreader serif** italic for headlines, neutral grays. No green anywhere — green flag = false safety signal. 100dvh mobile layouts, quick-exit button, skip links, hand-drawn decorative element.
- Removed PWA capability (intentional product constraint).
- Built `prevention/StopMoment` component with color-coded glow, animated reveal timing, conditional crisis-link rendering on RED.

## 7. Marketing / growth experiments

- **Prolific studies** — paid participant testing, tagged via `?src=prolific&pid=&sid=` URL params. 171 sessions, ~60% post-reading outcome response rate (vs. 22% organic).
- **Gameboi referral integration** — 54 sessions, ~43% response rate. Built `?situation=` query-param prefill so external handoffs (Gameboi → ito) preload the textarea.
- **Snapchat ad** — produced a 7-second 9:16 vertical video via **Remotion** (programmatic React/TS video framework, 1080×1920), animating UI components and real teen scenarios.
- **Reddit bot prototype** — separately built using Claude Sonnet against a test subreddit, with explicit command/post triggers.
- `/blog` system with SEO + CTAs, `/release-notes` page, `/about` page written to 8th-grade reading level, `/privacy` page, mandatory agreement gateway modal (sessionStorage-backed, can't bypass).

## 8. Outcome data (Jan 30 → Jun 24, 2026)

From the production Supabase `submissions` export:

| Metric | Value |
|---|---|
| Total sessions | **611** |
| "Before" flow sessions | 601 |
| Saw a reading | 536 (~89% of starters) |
| Answered "What did you do?" | **193 (~36% of readers)** |

**Outcome breakdown by source:**

| Outcome | Prolific (n=105) | Organic (n=78) | Gameboi (n=23) |
|---|---|---|---|
| I asked if they were okay | **53 (50%)** | 21 (27%) | 3 (13%) |
| I decided not to do it | 32 (30%) | 14 (18%) | 3 (13%) |
| I stopped | 8 (8%) | 14 (18%) | 8 (35%) |
| I'm not sure / I didn't follow this | 12 (11%) | 29 (37%) | 9 (39%) |

**Headline metric:** "I asked if they were okay" — 38% of all post-reading respondents.

---

*Last updated: June 25, 2026*
