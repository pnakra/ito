# ito — Six-Month Technical Retrospective

**Period:** January – June 2026
**Product:** [ito / "is this ok?"](https://isthisok.app) — a narrative-first behavioral interruption tool for teens facing ambiguous consent situations.

Companion docs:
- [`SYSTEM_CARD.md`](./SYSTEM_CARD.md) — model details, edge function inventory, risk-tier behavior contracts, and what ito explicitly *is not* (not a permission system, not a counselor, not a consent checker)
- [`ALL_COPY.md`](./ALL_COPY.md) — authoritative static copy bank
- [`PRD.md`](./PRD.md) — product spec
- [`AFTER_FLOW.md`](./AFTER_FLOW.md) — accountability-flow design

---

## TL;DR

Six months. ~611 anonymous sessions, 89% reading-completion, **38% of readers left a behavioral signal** after the AI response — and the modal signal was *"I asked if they were okay"* (38% of respondents, 50% among paid Prolific testers, 27% among organic users). The product works well enough that the highest-leverage open question is no longer "does the reading land?" — it's "why do 64% of readers exit without telling us what they did?"

Two architectural calls in the first two weeks defined everything that followed:
1. **Pull risk classification out of the LLM and into deterministic frontend code.** The model never decides if something is risky — it only explains a verdict already computed.
2. **Make risk monotonic within a session (high-water-mark).** Once flagged, a session can't be argued back down.

Everything else — the safety stress tests, the model swap to Claude, the dark/serif redesign, the referral-attribution plumbing — is downstream of those two decisions.

---

## 1. Outcomes (Jan 30 – Jun 24, 2026)

Production data from the external Supabase `submissions` table. All sessions are anonymous (rotating 30-day localStorage IDs, no PII).

### Funnel

| Stage | Count | % of prior | % of starters |
|---|---|---|---|
| Sessions started | 611 | — | 100% |
| `before` flow sessions | 601 | 98% | 98% |
| Reached the AI reading | 536 | 89% | **88%** |
| Left a post-reading outcome signal | 193 | **36%** | 32% |

The 89% reading-completion rate is the metric I'm proudest of — for an anonymous, ungated, no-incentive tool aimed at teens, getting nearly nine in ten starters all the way through a narrative intake is unusual. **The real leak is reading → outcome (64% drop-off), and that is now the primary optimization target.**

The remaining 10 sessions split between `/after` (accountability) and `/someone-crossed` (survivor support). Both flows ship and work end-to-end, but they're effectively unused at this volume — not a quality problem, a distribution problem. The product story so far is the `before` flow.

### Outcome composition (n = 193)

| Outcome | Prolific (n=105) | Organic (n=78) | Gameboi (n=23) |
|---|---|---|---|
| I asked if they were okay | **53 (50%)** | 21 (27%) | 3 (13%) |
| I decided not to do it | 32 (30%) | 14 (18%) | 3 (13%) |
| I stopped | 8 (8%) | 14 (18%) | 8 (35%) |
| I'm not sure / I didn't follow this | 12 (11%) | **29 (37%)** | 9 (39%) |

### What this actually says

- **The headline metric is "asked if they were okay" — the highest-value outcome the product can produce**, because it converts the user's reflection into a real-world check on the other person rather than a private decision. 38% of all respondents across sources reported it.
- **The Prolific vs. organic gap is contaminated by social-desirability bias.** Paid participants know they're being observed; "I asked if they were okay" is the answer that flatters the task. The 27% organic rate is the more defensible effect size. I'm treating the Prolific cell as an upper bound, not a target.
- **The single most diagnostic number in the table is the organic 37% "not sure / didn't follow."** Real users — no payment, no observer effect — are telling me the reading is too abstract more than a third of the time. That's the next product problem, not the response rate.
- **Gameboi traffic spikes on "I stopped" (35%).** Plausible: users who arrived through a gaming-adjacent referral may already be in a more disengaged frame and treat "I stopped" as exit rather than action.

---

## 2. The two foundational decisions

### Decision 1: Risk classification is deterministic, not generative

**Date:** Jan 27, 2026. **Context:** The product started as a chat-first AI tool — single user input, single Claude response, model deciding everything including how dangerous a situation was. **Problem:** that architecture made the LLM the safety boundary, and LLMs are not safety boundaries. They will agree with framing. They will downgrade severity under adversarial input. They will sometimes produce something that reads like permission.

**What I changed:** Built `src/lib/riskClassification.ts` as the sole arbiter of risk tier. The function takes narrative + structured signals, runs regex against a curated flag-word registry (derogatory labels, entitlement language, victim-blaming patterns, alcohol/incapacitation markers), and returns one of `RED | YELLOW | NEUTRAL`. **The LLM never sees the user input until after the verdict is set, and the verdict is passed to the model as a locked input it cannot modify** (see [`SYSTEM_CARD.md`](./SYSTEM_CARD.md) §2).

**Why this matters:** Once risk is deterministic, the AI's job collapses from "decide + explain + respond" to just "explain at the tone and depth this tier allows." Every downstream safety property — tiered prompts, refusal states, crisis-resource gating — is only possible because the tier exists *before* the model speaks.

### Decision 2: High-water-mark risk

A subtle invariant: within a single session, the risk tier can only increase. A user who triggers YELLOW and then sends a softer follow-up does not get downgraded to NEUTRAL. This blocks the obvious adversarial pattern of "say the bad thing, then rephrase until the model agrees you're fine."

---

## 3. Safety architecture and what failed in testing

Three layers (full spec in [`SYSTEM_CARD.md`](./SYSTEM_CARD.md)):

1. **Deterministic** — `riskClassification.ts` + flag-word registry + high-water-mark.
2. **Tiered AI prompting** — distinct system prompts per tier. RED is locked to interruption only (no coaching, ≤1 actionable suggestion). YELLOW is pause + reflect. NEUTRAL is explicitly forbidden from validation or permission language.
3. **Hardcoded crisis resources** — 988, RAINN, Crisis Text Line render *only* on RED, *only* in `StopMoment`. The model cannot summon or suppress them.

### Stress testing — what actually broke

Generated 30 adversarial first-person scenarios across 9 categories (mixed signals, boundary erosion, alcohol/incapacitation, power dynamics, repeated asks, etc.) and ran them end-to-end through the live pipeline. Scored with a 6-dimension rubric (`docs/EVAL_RUBRIC.md` — risk detection, tone, victim-blaming, permission-slip language, actionability, refusal calibration; 1–4 each, 24 max).

**Failures observed in the first pass:**
- Several YELLOW responses included coaching-shaped language ("you could try…") that read as a permission slip when the user was clearly being pressured.
- The model would occasionally summarize the user's framing back to them sympathetically before challenging it, which functioned as validation regardless of what came after.
- "No flags detected" originally rendered with green styling — a literal green light. Caught during ethical review, not by the rubric.

**Fixes:** Reduced RED responses to one suggestion max; banned the "I hear you, but…" sympathy preamble in YELLOW prompts; killed green from the palette entirely and renamed the state to "No flag detected" with a mandatory `"This is not permission."` subline. Re-ran the 30 scenarios; rubric scores improved on tone and permission-slip dimensions.

**What I still don't know in production:** I don't have a labeled stream of adversarial *real* inputs. The 30 scenarios are synthetic. Building a lightweight in-app "this response was wrong" reporter is the next safety-eval investment.

---

## 4. Model selection — why I ended up on Claude

Not a thrash, but it looked like one from outside. Sequence and reasoning:

| Stage | Model | Why I left it |
|---|---|---|
| 1. Anthropic SDK, client-side | Claude Sonnet 4 | API key exposed in the browser bundle. **Caught it on the next session reviewing network traffic; rotated the key and moved all inference to Supabase edge functions inside ~24 hours.** Single biggest mistake of the project; the recovery time is the only reason it didn't matter. |
| 2. Lovable AI Gateway | `google/gemini-2.5-flash` | Cheap and fast, but Gemini consistently softened YELLOW responses — adding hedges, sympathy preambles, and "remember that everyone deserves respect" closers that read as permission-adjacent to me on the rubric. Tone was wrong for an interruption tool. |
| 3. Direct Anthropic API (current) | `claude-sonnet-4-20250514` (pinned) | Claude held the tier-specific tone contracts more reliably under the same system prompts. Worth the cost and the operational overhead. Pinned to a specific snapshot so I'm not getting surprise behavior changes. |

What I learned: model selection in a safety-critical product is a *tone* decision more than a capability decision. Both models could produce a correct YELLOW response — only one did so without slipping into validation.

---

## 5. Data, attribution, and infrastructure

**Submissions schema** — single `submissions` table: `session_id`, `flow_type`, `step_name`, `step_type`, `choice_value`, `freetext_value`, `metadata` (jsonb), `created_at`. RLS enabled; inserts go through an edge function using the service role. Anonymous session IDs are 30-day rotating values in localStorage.

**Referral attribution** — `submissionLogger.ts` captures `?src=&pid=&sid=` on first load, persists them in `sessionStorage`, and merges them into every submission's `metadata`. This is the only reason the Prolific vs. organic vs. Gameboi outcome split exists; it would be impossible to retrofit credibly.

**Production infrastructure** — migrated Lovable hosting to Vercel mid-project for domain control (`isthisok.app`). Two Supabase instances: a Lovable Cloud dev DB (stopped receiving writes May 22) and a separate external production DB. **I burned a full debugging session on stale analytics before realizing I was querying the dev DB** — a war story that says more about my infra ops than I'd like.

**Auth/roles** — when role logic was added it went into a dedicated `user_roles` table behind a `has_role` security-definer function, never on a profile row. Standard pattern, but worth saying because the obvious shortcut (boolean `is_admin` column) is exactly the privilege-escalation foothold I wanted to avoid.

---

## 6. What I'd do differently

- **Build the "this response was wrong" reporter on day one.** Six months of inference and I still don't have a labeled real-input failure set. Synthetic adversarial scenarios catch category failures, not edge cases.
- **Tag traffic source from session 1, not session 100.** The referral-attribution plumbing arrived after a lot of organic traffic had already been logged as untagged — those sessions are effectively orphaned for analysis.
- **Separate dev and prod from the start.** Two Supabase instances diverging silently cost me real time. A single shared analytics view would have caught it the same day.
- **Treat outcome capture as the product, not a postscript.** "What did you do?" is the most valuable data the tool can produce, and it lives behind a button most users never see because they've already mentally closed the tab. Putting the outcome capture earlier — or making it asynchronous — is probably worth more than another round of prompt tuning.

---

## 7. Open questions for reviewers

- Is 27% (organic) "I asked if they were okay" plausibly causal, or am I selecting for users who would have done that anyway? I do not know how to design the counterfactual without breaking the anonymity model.
- Is the 37% "not sure / didn't follow" rate a copy problem, a comprehension problem, or a signal that the reading is genuinely wrong for those users?
- Is `/after` (accountability) and `/someone-crossed` (survivor support) underused because the surfaces are wrong, or because the audience for those flows isn't on the channels driving traffic?

---

## Footnote: design system

Dark-mode default. Geist Sans + Newsreader serif italic for headlines. **No green anywhere in the palette** — green flag = false safety signal, and "you're good to go" is the one message this product must never produce. Quick-exit button, skip links, 100dvh mobile layouts, hand-drawn decorative element. Intentionally not a PWA. Full system in [`ALL_COPY.md`](./ALL_COPY.md) and the design memories.

---

*Last updated: June 25, 2026*
