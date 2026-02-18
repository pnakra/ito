# ito

**ito** is a real-time consent and accountability tool. It helps people slow down and think clearly about physical and emotional dynamics — before something happens, or after.

It is not a safety certificate. It does not give green lights, approve situations, or tell users whether an action is permitted. It surfaces tension, names risk, and prompts reflection.

---

## What it does

ito has two paths, reached through a shared intake screen:

### Before — "Something's on my mind"
For users uncertain about a situation they're approaching. The flow asks about what they're planning, what the other person is signalling, and what contextual factors are present (substances, power gaps, age gaps, emotional pressure). It returns a tiered assessment — not a verdict — describing the tension in the situation and offering one grounding suggestion.

**There is no green light.** Even low-risk assessments remind users that silence is not consent and that conditions can change.

### After — "Something happened to me"
For users processing something that already occurred. The flow collects a narrative description and returns an accountability framing — naming dynamics without diagnosing or labelling the other party. It is designed to hold space without assigning legal categories.

---

## Safety architecture

### Risk tiers (Before flow)
| Tier | Meaning |
|------|---------|
| Green | Minimal flagged signals — still prompts grounding, no permission granted |
| Yellow | Mixed or ambiguous signals — anti-coaching constraint applied, no escalation advice |
| Red | Clear concern signals — stop moment before AI response, refusal after repeated patterns |

### Non-negotiable invariants
- **Silence ≠ consent** — stated in all yellow/red responses
- **Intoxication/sleep invalidates consent** — stated when alcohol or sleep context is present
- **Past consent ≠ present consent** — stated when relationship history is a factor
- **No step-by-step coaching** — yellow and red responses do not give specific physical advice
- **No clinical labels** — the system describes situational dynamics, not psychological categories (no "manipulation", "abuse", "gaslighting", "coercion", "toxic")
- **Self-harm threats** — redirected to crisis resources without assigning blame to the user

### Session pattern detection
If a user runs multiple high-risk scenarios in the same session, the system surfaces a pattern warning and eventually returns a refusal card rather than continuing to engage.

---

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Lovable Cloud (Supabase) — edge functions, database logging
- **AI**: Anthropic Claude (via edge functions) for response generation
- **Routing**: React Router — `/before`, `/after`, `/check-in`, `/about`, `/resources`

### Edge functions
| Function | Purpose |
|----------|---------|
| `analyze-ito` | Before flow AI response generation |
| `ito-followup` | Conversational follow-up in Before flow |
| `analyze-crossed-line` | After flow initial analysis |
| `crossed-line-followup` | Conversational follow-up in After flow |
| `analyze-language` | Supplementary language signal detection |
| `analyze-narrative` | Narrative gap detection for After flow |
| `analyze-someone-crossed` | Third-party accountability framing |

### Risk classification
Risk is pre-computed deterministically in `src/lib/riskClassification.ts` before any AI call. The AI receives the pre-computed risk level and cannot override it. This ensures consistent safety outcomes regardless of AI response variation.

---

## What this is not

- Not a legal tool
- Not a therapist or counsellor
- Not a permission system
- Not a "consent checker" that approves actions
- Not a substitute for direct communication between people

---

## Docs

| File | Purpose |
|------|---------|
| `docs/PRD.md` | Full product requirements and intervention logic (excluded from version control) |
| `docs/AFTER_FLOW.md` | After flow design decisions and copy rationale |
| `docs/ALL_COPY.md` | Full UI copy reference |
