# is this ok? (ito)

**ito** is a real-time consent and accountability tool for teenage boys. It helps users slow down and think clearly about physical and emotional dynamics — before something happens, or after.

It is not a safety certificate. It does not give green lights, approve situations, or tell users whether an action is permitted. It surfaces tension, names risk, and prompts reflection.

---

## Product flow

The app is a single check-in flow at `/check-in`. Users arrive at a homepage that typewriters the title, shows a brief demo, and offers two entry paths:

- **Just say it** — freetext narrative input (`/check-in`)
- **Help me think through it** — structured guided mode (`/check-in?mode=guided`)

### Flow phases (in order)

| Phase | Component | What happens |
|-------|-----------|--------------|
| `narrative-input` | `NarrativeInput` | User writes what's on their mind in their own words |
| `guided-mode` | `GuidedMode` | Structured question sequence for users who want prompting |
| `signal-floor` | `SignalFloor` | Collects structured context signals (timing, age, substances, etc.) |
| `follow-up-questions` | `AdaptiveFollowUp` | Fills remaining safety-relevant gaps if still missing after signal floor |
| `stop-moment` | `StopMoment` | Interstitial pause for yellow/red risk before AI response |
| `explanation` | `AnimatedExplanationCard` / `NeutralExplanationCard` | Before-flow AI response with risk tier, reasoning, and grounding suggestion |
| `after-explanation` | `AfterExplanationCard` | After-flow AI response with accountability framing |
| `post-explanation-choice` | `PostExplanationChoice` | User chooses to end or continue with follow-up |
| `follow-up-chat` | `ConversationalChat` | Open-ended follow-up conversation |
| `outcome` | `OutcomeCheck` | User selects what they're going to do next |
| `outcome-feedback` | `OutcomeFeedback` | Closing reflection based on selected outcome |
| `refusal` | `RefusalCard` | Hard stop for repeated coercive patterns in same session |

### Timing detection (before vs. after)

The flow auto-detects whether the situation is **before** (deciding) or **after** (already happened) based on narrative text and structured signals. This determines which AI response format is used. The `after` path returns an accountability framing rather than a risk assessment.

---

## Safety architecture

### Risk tiers

Risk is pre-computed **deterministically** in `src/lib/riskClassification.ts` before any AI call. The AI receives the pre-computed level and cannot override it.

| Tier | Meaning |
|------|---------|
| Green | Minimal flagged signals — still prompts grounding, no permission granted |
| Yellow | Mixed or ambiguous signals — stop moment shown, anti-coaching constraint applied |
| Red | Clear concern signals — stop moment shown, refusal after repeated coercive patterns |

Risk is tracked as a **high-water mark** — it can only increase within a session, never decrease.

### Non-negotiable invariants

- **Silence ≠ consent** — stated in all yellow/red responses
- **Intoxication/sleep invalidates consent** — stated when those signals are present
- **Past consent ≠ present consent** — stated when relationship history is a factor
- **No step-by-step coaching** — yellow and red responses give no specific physical advice
- **No clinical labels** — no "manipulation", "abuse", "gaslighting", "coercion", "toxic"
- **Self-harm threats** — redirected to crisis resources without assigning blame

### Session pattern detection

`useSessionRiskTracking` tracks risk levels across runs in a session. If a user runs multiple high-risk scenarios, a `SessionPatternWarning` surfaces. After repeated coercive-language patterns, the app returns a `RefusalCard` and stops engaging.

### Flag word detection

`src/lib/riskClassification.ts` includes a regex-based flag word list that triggers immediate risk escalation regardless of AI interpretation. Categories include: victim blaming, dismissing no, incapacitation, force/coercion, derogatory labels, entitlement, and reported pressure from the victim's perspective.

---

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Hosting**: Vercel (production URL)
- **UI editing**: Lovable (syncs to GitHub → auto-deploys to Vercel)
- **Database**: Supabase (external project: `supabase-override-ito`)
- **AI**: Anthropic Claude via Supabase edge functions
- **Routing**: React Router — `/`, `/check-in`, `/about`, `/resources`, `/demo`, `/release-notes`

### Key source files

| File | Purpose |
|------|---------|
| `src/pages/CheckIn.tsx` | Main flow controller — all phase logic and state |
| `src/lib/riskClassification.ts` | Deterministic risk pre-computation and flag word detection |
| `src/lib/narrativeGapDetection.ts` | Detects missing safety-relevant context from narrative text |
| `src/lib/submissionLogger.ts` | Logs all user interactions to Supabase via `log-submission` edge function |
| `src/lib/supabase.ts` | **Owned Supabase client** — always import from here, never from `src/integrations/supabase/client` |
| `src/lib/invokeEdgeFunctionWithRetry.ts` | Retry wrapper for edge function calls with transient error handling |
| `src/hooks/useSessionRiskTracking.ts` | Session-level risk pattern detection |
| `src/types/risk.ts` | `RiskLevel` type (`green` / `yellow` / `red`) |
| `src/types/signals.ts` | `StructuredSignals` type and serialization |

### Edge functions

| Function | Purpose | Secrets required |
|----------|---------|-----------------|
| `log-submission` | Writes all user interactions to the `submissions` table | `EXTERNAL_SUPABASE_URL`, `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` |
| `analyze-narrative` | Main AI response generation for both before and after flows | Anthropic API key |
| `slack-notifs` | Sends Slack notification on new submission | Slack webhook URL |

### Supabase

- **Project**: `supabase-override-ito`
- **Project ID**: `xzwtpgujdajinvcbfprd`
- **Key table**: `submissions` — logs every user interaction with `session_id`, `flow_type`, `step_name`, `step_type`, choice/freetext/AI response values, and `message_index`

### Vercel environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | External Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref (used by `submissionLogger.ts` to build edge function URL) |

---

## Important: Lovable + Supabase client

Lovable auto-regenerates `src/integrations/supabase/client.ts` on every edit. **Do not import from this file directly.** Always import the Supabase client from `src/lib/supabase.ts`, which is an independently owned standalone client that survives Lovable regeneration.

If `src/lib/supabase.ts` ever gets reset to a re-export, restore it to a standalone `createClient` call using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## What this is not

- Not a legal tool
- Not a therapist or counsellor
- Not a permission system or consent checker
- Not a substitute for direct communication between people

---

## Docs

| File | Purpose |
|------|---------|
| `docs/PRD.md` | Full product requirements and intervention logic |
| `docs/AFTER_FLOW.md` | After flow design decisions and copy rationale |
| `docs/ALL_COPY.md` | Full UI copy reference |
| `docs/SYSTEM_CARD.md` | AI system card |
