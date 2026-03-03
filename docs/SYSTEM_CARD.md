# ito — System Card

**Version:** 1.0  
**Date:** March 2026  
**Status:** Pre-release (seeking expert review)

---

## 1. Overview

**ito** is a real-time consent reflection tool designed for teenagers and young adults navigating physical and emotional dynamics. It surfaces tension, names risk, and prompts reflection.

### What ito is NOT
- Not a permission system — it never says "you're good to go"
- Not a therapist, counselor, or diagnostic tool
- Not a legal instrument
- Not a "consent checker" that approves actions
- Not a substitute for direct communication between people

### Two flows

| Flow | Entry point | Purpose |
|------|------------|---------|
| **Before** — "Something's on my mind" | User approaching an uncertain situation | Structured intake → deterministic risk classification → AI reflection |
| **After** — "Something happened to me" | User processing something that already occurred | Narrative intake → accountability framing without diagnosis or labels |

---

## 2. Model Details

| Property | Value |
|----------|-------|
| Model | Anthropic Claude Sonnet 4 |
| Version | `claude-sonnet-4-20250514` (pinned) |
| Invocation | Server-side only, via Supabase Edge Functions |
| Risk level | Pre-computed deterministically; passed to AI as **locked** — the model cannot downgrade it |

### Edge functions

| Function | Purpose |
|----------|---------|
| `analyze-ito` | Before flow — primary AI response generation |
| `ito-followup` | Before flow — conversational follow-up |
| `analyze-language` | Supplementary language signal detection |
| `analyze-narrative` | After flow — narrative gap detection |
| `analyze-crossed-line` | After flow — initial analysis |
| `crossed-line-followup` | After flow — conversational follow-up |
| `analyze-someone-crossed` | After flow — third-party accountability framing |

---

## 3. The 10 Non-Negotiable Safety Invariants

These are enforced in every AI prompt. Violation of any invariant is a system failure.

1. **NEVER imply permission or encouragement to proceed.** No phrasing may suggest it is safe or acceptable to continue.
2. **RED responses INTERRUPT.** At most one actionable suggestion. No multi-step advice.
3. **NEVER normalize pressure, repeated asking, silence, intoxication, or power imbalance.**
4. **Silence is NEVER consent.** Stated explicitly when relevant.
5. **Intoxication INVALIDATES consent.** Never describe drunk behavior as "interest."
6. **Past consent does NOT imply present consent.**
7. **NO judgment labels.** The system never uses "manipulation," "toxic," "red flag," "abuse," "gaslighting," "controlling," or "narcissist." It describes dynamics in plain language instead.
8. **Self-harm threats:** Redirect to crisis resources. Do not dismiss or assign responsibility to the user.
9. **BANNED phrases:** "Real talk," "Classic tactic," "Everyone knows."
10. **Maximum 120 words total. Exactly one behavioral suggestion. No multi-step advice.**

---

## 4. Mandatory Harm-Minimization Check

Every AI prompt includes a mandatory internal verification pass. Before returning output, the model must evaluate:

1. Could this response be interpreted as encouraging escalation?
2. Does any phrasing reduce caution in an ambiguous situation?
3. Does it provide tactical language that could be used to pressure someone?
4. Does it downplay or soften a power imbalance?
5. Does it contain more than one behavioral directive?

**If YES to any → regenerate with stronger clarity and stricter constraints.**

This is a prompt-level instruction, not a code-enforced gate. See Section 10 (Known Gaps) for implications.

---

## 5. Deterministic Auto-Fail Conditions

Risk is classified using ~40 regex patterns in `riskClassification.ts` **before any AI call**. These fire deterministically and cannot be overridden by the model.

### Immediate RED — Incapacitation / Force / Coercion

| Pattern | Category |
|---------|----------|
| `passed out` | Incapacitation |
| `asleep` | Incapacitation |
| `unconscious` | Incapacitation |
| `too drunk / wasted / high` | Incapacitation |
| `forced` | Force |
| `hold her/him/them down` | Force |
| `make her/him/them do/have/give` | Coercion |
| `can't say no` / `won't say no` | Coercion |
| `won't remember` | Exploitation |
| `she was asking for it` | Victim blaming |
| `no means yes` | Dismissing boundaries |
| `no one will believe` | Threat |
| `keep it/this secret` | Secrecy/coercion |

### RED — Derogatory / Objectifying Language

| Pattern | Category |
|---------|----------|
| `slut` | Derogatory label |
| `whore` | Derogatory label |
| `hoe` | Derogatory label |
| `thot` | Derogatory label |
| `skank` | Derogatory label |
| `easy` | Objectifying assumption |
| `gets around` | Objectifying assumption |
| `owes me` | Entitlement |

### RED — Reported Pressure (victim perspective)

| Pattern | Category |
|---------|----------|
| `he/she/they kept pushing/asking/trying/pressuring` | Reported pressure |
| `he/she/they wouldn't stop/take no/listen/back off/leave me alone` | Reported pressure |
| `pressured/guilted/coerced me` | Reported pressure |
| `made/forced/talked me into` | Reported pressure |
| `wouldn't let me leave/go/say no/stop` | Reported pressure |
| `I said/told no/stop... but they kept/continued/didn't stop` | Reported boundary violation |

### YELLOW — Entitlement / Manipulation / Pressure

| Pattern | Category |
|---------|----------|
| `deserve` | Entitlement |
| `friend zoned` | Entitlement |
| `nice guy` | Entitlement |
| `playing hard to get` | Dismissing boundaries |
| `led me on` / `leading me on` | Dismissing boundaries |
| `teasing me` | Dismissing boundaries |
| `wanting it` | Dismissing boundaries |
| `won't tell` / `nobody will know` | Secrecy/manipulation |
| `out of your/her/his/their league` | Manipulation |
| `just let me` | Coercion |
| `come on` | Pressure |
| `don't be like that` / `don't be a tease` | Pressure |

---

## 6. Risk Classification Logic

Risk is computed **client-side** in `classifyRisk()` using a deterministic decision tree. The AI receives the result as a locked severity and cannot change it.

### Decision tree (simplified)

```
1. Immediate RED flag words detected?          → RED (bypass all other logic)
2. Consent signal = "said no" or pulled away?  → RED
3. Flag words + physical momentum?             → RED
4. No response + physical momentum?            → RED
5. No response (no physical momentum)?         → YELLOW
6. Mixed signals + physical momentum?          → RED
7. Mixed signals + flag words?                 → RED
8. Mixed signals (alone)?                      → YELLOW
9. Alcohol + physical momentum?                → RED
10. 2+ context risk factors?                   → RED
11. Flag words (alone)?                        → YELLOW
12. 1 risk factor + physical momentum?         → YELLOW
13. Clear yes + 0 risk factors?                → GREEN (no green light — see Section 7)
14. Clear yes + risk factors?                  → YELLOW
15. Default (any remaining uncertainty)?       → YELLOW
```

### Input dimensions

| Dimension | Options |
|-----------|---------|
| **Consent signal** | Clear verbal yes · Enthusiastic actions · Mixed signals · No response · Said no / pulled away |
| **Momentum** | Toward physical · Staying flirty · Wanting to slow down · Not sure |
| **Context factors** | Alcohol/drugs · Experience gap · Age/power imbalance · Emotional pressure · Power dynamic · None |
| **Free text** | Scanned by regex flag words before AI processing |

---

## 7. Architectural Safeguards

### 7.1 High-Water-Mark Risk

Risk only escalates within a session — never resets downward. Stored in a `riskHighWaterMark` ref. If a user's first run returns YELLOW and a second run would compute GREEN, the session stays YELLOW.

### 7.2 Session Pattern Detection

Tracked via `useSessionRiskTracking` hook using `sessionStorage`.

| Threshold | Trigger |
|-----------|---------|
| 2+ yellow or red runs | `SessionPatternWarning` — surfaces pattern observation |
| 2+ runs with flagged coercive language | `RefusalCard` — system declines to continue engaging |

### 7.3 No Green Light Policy

Even when risk computes as GREEN (Level 0):
- **No green styling** — result card uses neutral gray
- **Label:** "No flag" (never "green flag" or "green light")
- **Mandatory disclaimer** on every outcome regardless of level
- **AI prompt explicitly bans** the phrases "green flag," "green light," and any language implying permission

### 7.4 Two-Pass Analysis

1. **Static pass:** Regex flag word detection (`detectFlagWords()`) — deterministic, instant
2. **AI pass:** Claude analysis with locked severity — generates reflection text within constraints

The static pass can only **escalate** risk. The AI pass cannot change the risk level.

### 7.5 Anti-Coaching Constraints

YELLOW and RED prompts include explicit instructions:
- "Do NOT advise on how to progress or escalate physical touch"
- RED: "Do not offer alternatives to stopping"
- RED: "This is a STOP, not a pause. Do not soften it."

### 7.6 Banned Terms

The AI is instructed to never output:
- Clinical/diagnostic labels: "manipulation," "toxic," "red flag," "abuse," "gaslighting," "controlling," "narcissist," "emotional blackmail," "sexual coercion"
- Specific phrases: "Real talk," "Classic tactic," "Everyone knows," "That's a red flag," "That's manipulation"

---

## 8. Server-Side Security

### Rate Limiting

| Function | Limit |
|----------|-------|
| `analyze-ito` | 5 requests / 60 seconds per IP |
| `ito-followup` | 15 requests / 60 seconds per IP |
| Other functions | 10 requests / 60 seconds per IP (default) |

Implementation: In-memory IP-based throttling with `x-forwarded-for` / `x-real-ip` header extraction, fingerprint fallback.

### Input Validation
- Maximum input length: **5,000 characters** (enforced server-side)
- `precomputedRiskLevel` must be one of `green`, `yellow`, `red` — rejected otherwise
- Empty/whitespace-only input rejected

### Database Security
- `submissions` table: RLS enabled, **INSERT-only for anonymous users**, no SELECT/UPDATE/DELETE
- No user-identifying data stored (session IDs are random UUIDs)

### Retry Logic
- 2 retries on Claude API failures
- Graceful degradation: returns a safe fallback response on total failure ("When in doubt, slow down and check in verbally.")
- 429 responses from Claude are surfaced to the user without retry

---

## 9. Copy Constraints

| Constraint | Scope |
|------------|-------|
| No clinical labels | All flows — dynamics described in plain language |
| No first-person pronouns from AI | AI never says "I think" or "I believe" |
| Mandatory disclaimers | Every outcome screen, regardless of risk level |
| "One way they might have experienced this" | After flow framing — avoids definitive claims |
| 8th grade reading level | All AI-generated text |
| Maximum 120 words | All Before flow AI responses |
| No em dashes | Prompt-level formatting constraint |
| Proper sentence case | Never all lowercase |
| "ito" always lowercase | Brand constraint |

---

## 10. Known Gaps / Red-Team Surface

These are identified limitations that have **not** been addressed. They represent the current attack surface and areas for improvement.

### 10.1 No Automated Eval Suite
The PRD contains 30 adversarial test scenarios with expected classifications. These exist as documentation only — there is no automated harness that runs them against the edge functions or validates AI output compliance.

### 10.2 No Prompt Injection Testing
Free-text input fields (`additionalContext` in Before flow, narrative input in After flow, chat follow-up) have not been formally tested against adversarial prompt injection (e.g., "ignore previous instructions," role-play attacks, system prompt extraction attempts). The locked severity architecture mitigates downstream risk, but the AI's *text output* could theoretically be manipulated.

### 10.3 No Post-LLM Output Validation
The harm-minimization check (Section 4) is a prompt-level instruction only. There is no server-side code that verifies the AI's response actually:
- Stays under 120 words
- Avoids banned phrases
- Contains only one suggestion
- Avoids green-light language

If Claude violates these constraints, the violation reaches the user.

### 10.4 Bypassable Session Tracking
Session pattern detection (Section 7.2) uses `sessionStorage`, which:
- Resets on incognito/private browsing
- Resets on new tabs (in some browsers)
- Can be cleared via browser developer tools

A determined user can bypass the `RefusalCard` and `SessionPatternWarning` mechanisms.

### 10.5 No CI/CD Regression Testing
Prompt changes are not automatically tested against expected outputs. A prompt edit could silently degrade safety behavior with no automated detection.

### 10.6 Model Deprecation Risk
The model is pinned to `claude-sonnet-4-20250514`. If Anthropic deprecates this version, the system will need manual intervention to migrate. There is no fallback model configured.

### 10.7 Client-Side Risk Computation
The deterministic risk classification runs client-side. A technically sophisticated user could modify the JavaScript to send a different `precomputedRiskLevel` to the edge function. The edge function validates the value is one of `green`/`yellow`/`red` but does not independently re-classify. This is partially mitigated by the AI prompts being severity-appropriate (a tampered "green" request still receives the GREEN prompt, which still prohibits green-light language).

---

## Appendix: Prompt Architecture

Three separate system prompts exist, one per severity level. The AI receives the prompt matching the pre-computed risk — it never selects its own prompt.

| Severity | Prompt tone | Key constraint |
|----------|------------|----------------|
| GREEN (Level 0) | "Thoughtful older sibling" — normalize, reflect | No permission language, no "green flag/light" |
| YELLOW (Level 1) | Same tone — name uncertainty, do not reassure | Anti-coaching, no reassurance, no "no red flags" |
| RED (Level 2-3) | Direct, protective, firm — name the problem | STOP not pause, no alternatives to stopping, no softening |

All three prompts share:
- Persona: "thoughtful older sibling"
- Format: JSON with `signalLabel`, `why[]`, `suggestion`
- Word limit: 120
- Reading level: 8th grade
- Banned phrases and labels
- The 10 safety invariants
- The harm-minimization verification pass
