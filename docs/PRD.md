# Vibecheck — Product Requirements Document (PRD)

**Version:** 4.0  
**Last Updated:** January 2026  
**Status:** Early Prototype / Exploratory

---

## 1. Executive Summary

### 1.1 Product Vision
Vibecheck is an anonymous, harm-reduction tool designed to help young people navigate consent, boundaries, and accountability in intimate situations. It provides three distinct pathways for users depending on their relationship to a situation: prevention, self-reflection, and processing experiences.

### 1.2 Mission Statement
To reduce sexual harm by providing accessible, non-judgmental guidance that helps people:
- Recognize consent signals before crossing boundaries
- Reflect on and take accountability for past behavior
- Process experiences where their boundaries may have been crossed

### 1.3 Core Operating Principle: Behavioral Interruption
The product's core operating principle is **behavioral interruption**, not advice-giving. The system is designed to pause risky behavior in the moment and provide reality checks, not to mimic a chatbot or therapist. The Stop Moment is a non-negotiable pattern: it must feel like a brake, not guidance. All UI decisions (buttons over text, enforced pauses over suggestions, system rules over model judgment) reflect this philosophy.

**Key Design Tenets:**
- Observation before intention
- Structure before narrative
- System rules before AI output

### 1.4 Core Principles
1. **Anonymity First** — No accounts, no data storage, no tracking
2. **Non-Judgmental** — Supportive guidance without shame or lectures
3. **Harm Reduction** — Practical, actionable advice over moralizing
4. **User Autonomy** — Users define their own experiences; we don't label for them
5. **Behavioral Interruption** — Create friction before risky behavior, not guidance after
6. **Non-Permissive Stance** — The system never gives a "green light" or permission

---

## 2. Target Users

### 2.1 Primary Audience
- **Age Range:** 14-24 years old
- **Demographics:** All genders, though language is currently optimized for young men in the prevention flow
- **Context:** Users navigating dating, hookups, relationships, and intimate situations

### 2.2 User Mindsets (Entry Points)

| Mindset | Route | User State |
|---------|-------|------------|
| Uncertain | `/avoid-line` | "I'm not sure if what I'm about to do is okay" |
| Reflective | `/crossed-line` | "I think I may have done something wrong" |
| Processing | `/someone-crossed` | "Something happened to me that felt off" |

---

## 3. Product Architecture

### 3.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VIBECHECK FRONTEND                       │
│                    (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│  /                    │  Landing page with 3 pathways       │
│  /avoid-line          │  Prevention DECISION-FIRST flow     │
│  /crossed-line        │  Accountability reflection + chat   │
│  /someone-crossed     │  Survivor support chat (multi-turn) │
│  /about               │  Product information                │
│  /resources           │  Crisis resources                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               DUAL-LAYER DETECTION SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│  src/lib/riskClassification.ts                              │
│  - Maps user selections → risk level (red/yellow/green)     │
│  - Static flag word detection (regex patterns)              │
│  - Enforces hard rules (e.g., "no response" = yellow+)      │
│  - LLM does NOT determine risk level                        │
├─────────────────────────────────────────────────────────────┤
│  src/lib/aiLanguageAnalysis.ts                              │
│  - AI-powered nuanced language detection                     │
│  - Catches objectification, entitlement, subtle coercion    │
│  - Graceful fallback to static detection if AI fails        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTIONS (Deno)                     │
├─────────────────────────────────────────────────────────────┤
│  analyze-vibecheck        │  Prevention EXPLANATION AI      │
│  analyze-language         │  AI-powered language detection  │
│  analyze-crossed-line     │  Initial accountability AI      │
│  crossed-line-followup    │  Accountability follow-up AI    │
│  analyze-someone-crossed  │  Survivor support AI            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LOVABLE AI GATEWAY                              │
│         (google/gemini-2.5-flash model)                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow

**Prevention Flow (Decision-First, Observation-Centered):**
1. User selects orientation (where they are in the situation)
2. User describes observed consent signals (what the other person is doing/saying)
3. User selects context factors that might affect consent clarity
4. User selects momentum direction (where things are heading)
5. User optionally adds free-text context
6. Dual-layer detection: Static patterns + AI analysis scan free text
7. Frontend deterministically calculates risk level
8. If RED/YELLOW: Mandatory "Stop Moment" displayed
9. User acknowledges → Edge function called with pre-computed risk
10. AI explains (does not assess) the risk level, directly addressing any flagged language
11. Post-explanation choice: "I'm done" or "I want to talk more"
12. Optional follow-up chat if user chooses to continue
13. Outcome check: User self-reports what they did
14. One-line reflective feedback (no storage)

**Accountability & Survivor Flows:**
1. User inputs scenario/message in frontend
2. Frontend sends request to edge function
3. Edge function constructs prompt with system instructions
4. AI Gateway returns structured response
5. Frontend renders response with appropriate UI

### 3.3 Privacy Architecture
- **No database** — Zero persistence of user inputs
- **No authentication** — Fully anonymous access
- **No analytics tracking** — No user behavior logging
- **Stateless conversations** — Context maintained only in-session via frontend state
- **Session-only tracking** — Pattern awareness via sessionStorage (cleared on tab close)
- **Outcome check** — Self-reported, local-only, no storage

---

## 4. Flow Specifications

## 4.1 Flow A: Prevention ("I want to avoid crossing a line")

### Route
`/avoid-line`

### Purpose
Interrupt risky behavior in the moment. Help users recognize consent signals and make better decisions BEFORE acting.

### Interaction Model (v4.0 — Observation-First with Behavioral Interruption)
**Orientation → Observed Consent Signals → Context Factors → Momentum Check → Free Text → Stop Moment → AI Explanation → Post-Explanation Choice → Optional Follow-up → Outcome Check → Reflective Feedback**

This is NOT a chatbot. It is a consent risk assessment and behavioral interruption tool.

### Target Persona
Primarily teenage boys (14-18) navigating dating/hookup situations for the first time.

### User Journey (v4.0)

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Step 0:       │     │  Step 1:       │     │  Step 2:       │     │  Step 3:       │     │  Step 4:       │
│  ORIENTATION   │ ──► │  CONSENT       │ ──► │  CONTEXT       │ ──► │  MOMENTUM      │ ──► │  FREE TEXT     │
│  (buttons)     │     │  SIGNALS       │     │  FACTORS       │     │  CHECK         │     │  (optional)    │
│                │     │  (buttons)     │     │  (multi-select)│     │  (buttons)     │     │                │
└────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘
                                                                                                   │
                                                                                                   ▼
                              ┌───────────────────────────────────────────────────────┐
                              │              DUAL-LAYER DETECTION                      │
                              │  1. Static patterns (instant)                          │
                              │  2. AI analysis (async, graceful fallback)             │
                              └───────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
                              ┌───────────────────────────────────────────────────────┐
                              │         DETERMINISTIC RISK CALCULATION                 │
                              │         (Frontend: riskClassification.ts)              │
                              └───────────────────────────────────────────────────────┘
                                                      │
                    ┌───────────────────────┬─────────┴─────────────┐
                    ▼                       ▼                       ▼
              ┌──────────┐           ┌──────────┐            ┌──────────────────┐
              │   RED    │           │  YELLOW  │            │  "No hard stop"  │
              │   STOP   │           │  PAUSE   │            │  (internal GREEN)│
              │  MOMENT  │           │  MOMENT  │            │   ───► Explain   │
              └────┬─────┘           └────┬─────┘            └──────────────────┘
                   │                      │
                   └──────────┬───────────┘
                              ▼
                      ┌───────────────┐
                      │ "I understand"│
                      │   (required)  │
                      └───────┬───────┘
                              ▼
                     ┌─────────────────┐
                     │  AI EXPLANATION │
                     │  (addresses     │
                     │  flagged lang)  │
                     └────────┬────────┘
                              ▼
                   ┌────────────────────┐
                   │ POST-EXPLANATION   │
                   │ "I'm done" OR      │
                   │ "Talk more"        │
                   └────────┬───────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
        ┌─────────────┐          ┌─────────────────┐
        │ OUTCOME     │          │ FOLLOW-UP CHAT  │
        │ CHECK       │          │ (multi-turn)    │
        └──────┬──────┘          └────────┬────────┘
               │                          │
               ▼                          ▼
        ┌─────────────┐          ┌─────────────────┐
        │ REFLECTIVE  │          │  OUTCOME CHECK  │
        │ FEEDBACK    │          └────────┬────────┘
        └─────────────┘                   ▼
                                 ┌─────────────────┐
                                 │ REFLECTIVE      │
                                 │ FEEDBACK        │
                                 └─────────────────┘
```

### Decision Step Options (v4.0)

**Step 0: Orientation (NEW)**
> "Where are you in this situation right now?"

| ID | Label | Description |
|----|-------|-------------|
| `texting` | We're texting or messaging | Remote/async context |
| `in-person` | We're together in person | Physical proximity |
| `party-group` | We're at a party or group setting | Social context with others |
| `already-happened` | Something already happened and I'm unsure | Post-event reflection |
| `not-sure` | I'm not sure how to describe it | Unclear context |

**Step 1: Observed Consent Signals (RENAMED - was Step 2)**
> "What have they been doing or saying?"

This step prioritizes OBSERVATION of the other person's behavior before asking about the user's intentions.

| ID | Label | Description |
|----|-------|-------------|
| `clear-yes` | Clearly saying yes or expressing interest in words | Explicit verbal consent |
| `enthusiastic-actions` | Actively initiating or reciprocating | Non-verbal but active consent |
| `mixed-signals` | Mixed or hard to read | Ambiguous signals |
| `no-response` | Quiet or not responding | Absence of response |
| `said-no` | Said no or pulled away | Clear refusal |

**Step 2: Context Risk Factors (RENAMED - was Step 3)**
> "Anything here that might affect how clear consent is?" (Multi-select)

| ID | Label |
|----|-------|
| `alcohol` | Alcohol or drugs involved |
| `experience-gap` | One of us is much more experienced |
| `age-imbalance` | Age or power imbalance |
| `emotional-pressure` | Emotional pressure |
| `none` | None of these |

**Step 3: Momentum Check (NEW - replaces Intent)**
> "What direction does this feel like it's heading?"

This replaces the intent-first question to reduce moral hazard. The user describes momentum, not plans.

| ID | Label | Risk Mapping |
|----|-------|--------------|
| `toward-physical` | Toward something physical | Maps to physical intent risk weights |
| `staying-flirty` | Staying flirty or emotional | Non-physical |
| `slow-down` | I want to slow things down | Non-physical |
| `dont-know` | I don't know | Non-physical |

**Step 4: Additional Context (Optional)**
> "Anything else you want to add?"

Free text input (max 800 characters). Subject to dual-layer flag detection.

### Dual-Layer Flag Word Detection

Located in: `src/lib/riskClassification.ts` and `src/lib/aiLanguageAnalysis.ts`

**Layer 1: Static Pattern Matching (instant)**
Regex-based detection in `riskClassification.ts`:

| Category | Examples |
|----------|----------|
| Derogatory labels | "slut", "whore", "thot", "skank", "ho" |
| Objectifying assumptions | "easy", "gets around" |
| Entitlement | "owes me", "deserve", "friend zone", "nice guy" |
| Victim blaming | "asking for it" |
| Dismissing boundaries | "playing hard to get", "led me on", "means yes", "teasing me" |
| Secrecy/manipulation | "won't tell", "nobody will know" |
| Coercion/pressure | "just let me", "come on", "don't be a tease" |

**Layer 2: AI-Powered Analysis (async)**
Edge function `analyze-language` using Gemini detects nuanced patterns:

| Pattern | Description |
|---------|-------------|
| Objectification/dehumanization | Treating the other person as a conquest or object |
| Entitlement to physical intimacy | Assuming access is owed |
| Dismissing or reframing rejection | Interpreting "no" as "convince me" |
| Subtle coercion or pressure | Guilt-tripping, persistence framing |
| Victim-blaming language | Blaming the other person for user's actions |
| Consent as obstacle | Treating consent as hurdle vs. requirement |

**Integration:** `aiLanguageAnalysis.ts` merges static and AI-detected categories with graceful fallback if AI fails.

### Deterministic Risk Classification Rules

Located in: `src/lib/riskClassification.ts`

**Hard Rules (LLM Cannot Override):**

| Condition | Result |
|-----------|--------|
| `said-no` (any momentum) | 🔴 RED |
| Flag words + physical momentum | 🔴 RED |
| `no-response` + physical momentum | 🔴 RED |
| `mixed-signals` + physical momentum | 🔴 RED |
| Flag words + mixed signals | 🔴 RED |
| `alcohol` + physical momentum | 🔴 RED |
| 2+ context factors | 🔴 RED |
| `no-response` + other momentum | 🟡 YELLOW |
| `mixed-signals` + other momentum | 🟡 YELLOW |
| 1 context factor + physical momentum | 🟡 YELLOW |
| Clear positive + 1 factor | 🟡 YELLOW |
| Flag words alone | 🟡 YELLOW |
| Default uncertainty | 🟡 YELLOW |
| Clear positive signals + no factors | 🟢 GREEN (internal only) |

*Physical momentum = `toward-physical`*

### GREEN State Semantics (v4.0 — Non-Permissive)

**CRITICAL: GREEN is an internal classification state, NOT a user-facing approval.**

When risk is internally classified as GREEN:
- Do NOT display the word "GREEN" or any green color
- Display neutral header: "No hard stop detected right now"
- Use neutral colors (gray/muted)
- Explanation is SHORTER than YELLOW/RED
- No expanded "what to do instead" lists
- No reassurance or validation of intent

**Required copy elements for GREEN:**
- "Consent is ongoing and reversible"
- "This is not approval or permission"
- "If they hesitate, go quiet, or pull back at any point, that's your cue to stop"

**Forbidden language:**
- "You're good"
- "Safe to proceed"
- "Okay to proceed"
- Any language that could be interpreted as permission

### Stop Moment Component

For RED and YELLOW risk levels, a full-screen modal appears:

**RED Stop Moment:**
- Large octagon icon
- Header: "STOP"
- Subtext: "This is a hard stop."
- Message: Specific action to NOT take (generated from classification reasoning)
- Button: "I understand" (required to proceed)
- Footer: "Proceeding without consent can cause serious harm."

**YELLOW Pause Moment:**
- Large triangle warning icon
- Header: "PAUSE"
- Subtext: "Take a moment before continuing."
- Message: Specific caution (generated from classification reasoning)
- Button: "I understand" (required to proceed)
- Footer: "Clear communication protects both of you."

### Session-Level Pattern Awareness (v4.0)

Located in: `src/hooks/useSessionRiskTracking.ts`

**Tracked within sessionStorage (browser session only):**
- Number of completed `/avoid-line` runs
- Count of YELLOW or RED outcomes
- Count of runs with detected coercive/flagged language

**Pattern Warning Display:**
If ≥2 YELLOW or RED outcomes in a session, display neutral observation at welcome screen:
> "You've run into a few situations like this. That's often a sign it's time to slow things way down."

This is informational, not corrective. No persistence across sessions.

### Refusal State (v4.0)

**Trigger conditions (ALL must be true):**
1. Repeated coercive/dehumanizing language detected (coercivePatternCount ≥ 1)
2. User continues seeking reassurance or ways to continue
3. Risk level is RED

**Refusal behavior:**
- Display RefusalCard component
- Header: "I can't help with continuing this."
- Copy: "The situation you described involves clear boundaries that need to be respected. The safest move is to stop."
- No further guidance provided
- Only option: Start over

### Soft Handoff to /crossed-line (v4.0)

**Trigger conditions (ANY):**
- Orientation = "already-happened"
- ≥2 YELLOW or RED outcomes in session

**Display after explanation:**
- Title: "If something already happened"
- Copy: "If you're realizing this may have crossed a line already, there's another path focused on reflection and accountability."
- Button: "Reflect on what happened"

Never force navigation.

### Post-Explanation Choice

After AI explanation, users see a binary choice:
- **"I'm done"** — Proceeds to Outcome Check
- **"I want to talk more"** — Opens follow-up chat

This gates access to follow-up chat rather than automatically proceeding.

### Follow-Up Chat (Optional)

Only accessible if user explicitly chooses "I want to talk more."

**Characteristics:**
- Multi-turn conversation
- Maintains context from original selections
- Risk level remains fixed (doesn't change based on follow-up)
- Same "older brother" tone as initial explanation
- User can exit to Outcome Check at any time

### Outcome Check

After the flow concludes:
> "What did you end up doing?"

| ID | Label | Icon |
|----|-------|------|
| `stopped` | I stopped | ✓ (green) |
| `checked-in` | I checked in verbally | 💬 (green) |
| `didnt-proceed` | I didn't go through with it | ✗ (neutral) |
| `not-sure` | I'm not sure / I ignored this | ? (muted) |

**Privacy:** No data is stored. Purely for user self-reflection.

### Outcome Feedback (v4.0)

After outcome selection, display one-line reflective feedback:

| Outcome | Feedback |
|---------|----------|
| `stopped` or `checked-in` | "Clear pauses and verbal check-ins are what actually prevent harm." |
| `didnt-proceed` | "Choosing not to proceed is always a valid way to keep things safe." |
| `not-sure` | "If a situation feels confusing, earlier pauses usually make things clearer." |

No storage. Flow resets after display.

### Edge Functions

**`analyze-vibecheck`** — Main explanation AI

Accepts pre-computed risk level and user selections. Explains why the risk level applies without reassessing it.

**`analyze-language`** — AI-powered flag detection

Analyzes free text for nuanced problematic patterns. Returns categories and explanation for AI to address.

### AI System Prompt (Explanation Mode — RED/YELLOW)

```
You are vibecheck - you help teenage boys (14-18) understand consent.

IMPORTANT: The risk level has ALREADY been determined by the system. 
Do NOT override or reassess it. Your job is to EXPLAIN why this risk 
level applies, not to judge it.

TONE:
- Direct, not preachy. Like an older brother, not a teacher.
- No lectures. Keep it real and conversational.
- Use normal capitalization and punctuation.

YOUR ROLE:
1. Accept the pre-computed risk level as fact
2. Explain what's happening in this specific situation
3. Describe why the signals/context led to this classification
4. Offer concrete alternatives that would be safer

CRITICAL - FLAGGED LANGUAGE:
When flagged language is detected, you MUST:
- Directly call out the specific problematic word or attitude
- Reference what they actually said, not system labels
- Explain WHY this framing is harmful (to the other person AND to him)
- Do NOT be preachy - be direct and matter-of-fact
- NEVER output phrases like "FLAGGED CONCERNING LANGUAGE"

CRITICAL RULES:
- Do NOT say "I would classify this as..." or "This seems like..."
- Do NOT override the system's risk assessment
- Focus on explanation and education, not judgment
- Never blame the other person
- Never suggest manipulation tactics
- Keep it brief and actionable
```

### AI System Prompt (Explanation Mode — GREEN/Neutral)

```
You are vibecheck - you help teenage boys (14-18) understand consent.

IMPORTANT: The system has determined there are no immediate red flags, 
but this is NOT approval or permission to proceed.

TONE:
- Brief and neutral. Not celebratory.
- No reassurance that they're "good to go"

YOUR ROLE:
1. Acknowledge that no hard stop was detected
2. Briefly summarize what's happening
3. Remind that consent is ongoing and reversible
4. Do NOT provide extensive guidance or encouragement

CRITICAL RULES:
- NEVER imply permission or approval
- NEVER say "you're good" or "safe to proceed"
- Keep response SHORT - shorter than red/yellow explanations
- Always include reminder that consent can be withdrawn
- Return empty arrays for whatNotToDo and whatToDoInstead
```

### Request Format

```json
{
  "scenario": "Orientation: We're together in person\nSignals from the other person: Mixed or hard to read\nContext factors: Alcohol or drugs involved\nMomentum: Toward something physical\n\nAdditional context from the user:\n\"...\"\n\nFLAGGED: entitlement, dismissing boundaries",
  "precomputedRiskLevel": "red"
}
```

### Response Schema

```json
{
  "assessment": "2-3 sentence explanation of what's happening (addresses flagged language if present)",
  "whatsHappening": ["bullet 1", "bullet 2", "bullet 3"],
  "whatNotToDo": ["action 1", "action 2", "action 3"],
  "whatToDoInstead": ["action 1", "action 2", "action 3"],
  "realTalk": "One sentence self-interest angle"
}
```

### UI Components (v4.0)

| Component | Path | Purpose |
|-----------|------|---------|
| `AvoidLine` | `src/pages/AvoidLine.tsx` | Main page orchestrator |
| `DecisionStep` | `src/components/prevention/DecisionStep.tsx` | Reusable button-based step |
| `ContextInput` | `src/components/prevention/ContextInput.tsx` | Optional free text input |
| `StopMoment` | `src/components/prevention/StopMoment.tsx` | Full-screen brake |
| `ExplanationCard` | `src/components/prevention/ExplanationCard.tsx` | AI response display (RED/YELLOW) |
| `NeutralExplanationCard` | `src/components/prevention/NeutralExplanationCard.tsx` | Neutral response display (GREEN) |
| `PostExplanationChoice` | `src/components/prevention/PostExplanationChoice.tsx` | Done/Talk more binary choice |
| `FollowUpChat` | `src/components/prevention/FollowUpChat.tsx` | Multi-turn follow-up |
| `OutcomeCheck` | `src/components/prevention/OutcomeCheck.tsx` | Self-report buttons |
| `OutcomeFeedback` | `src/components/prevention/OutcomeFeedback.tsx` | One-line reflective feedback |
| `SessionPatternWarning` | `src/components/prevention/SessionPatternWarning.tsx` | Pattern awareness display |
| `RefusalCard` | `src/components/prevention/RefusalCard.tsx` | Adversarial use refusal |
| `CrossedLineHandoff` | `src/components/prevention/CrossedLineHandoff.tsx` | Soft redirect to accountability flow |

---

## 4.2 Flow B: Accountability ("I think I crossed a line")

### Route
`/crossed-line`

### Purpose
Help users who believe they may have harmed someone to reflect, understand impact, and consider accountability.

### Interaction Model
**Hybrid: Structured reflection → Optional multi-turn chat**

1. Intro screen with framing
2. Single text input for describing what happened
3. Structured reflection cards
4. Optional follow-up conversation

### Target Persona
Anyone (primarily young men) who suspects they crossed a boundary and wants to understand what happened.

### UI Components
1. Intro screen with disclaimer
2. Input screen for scenario
3. Results screen with 5 reflection cards:
   - Clarity Check
   - Understanding Others' Boundaries
   - Understanding Your Patterns
   - What Accountability Could Look Like
   - How to Do Better Next Time
4. Follow-up chat section (expandable)
5. Support resources card

### Edge Functions
- `analyze-crossed-line` — Initial structured reflection
- `crossed-line-followup` — Follow-up conversation

### AI System Prompt (Initial Reflection)

```
You are a reflective guide helping a young person process a situation where they 
think they may have crossed a boundary or hurt someone.

Your goal is to help them:
- Understand what likely happened
- Recognize signs of discomfort or non-consent
- Reflect on their own mindset, assumptions, impulses
- Identify specific moments where they could have slowed down or paused
- Consider accountability steps
- Learn healthier behavior going forward

You MUST follow these rules:
- Do NOT provide legal advice
- Do NOT encourage confessions to crimes
- Do NOT ask for sexual details
- Do NOT describe sexual acts
- Do NOT roleplay
- Do NOT moralize, shame, or scold
- Keep tone neutral, steady, practical
- Use reflection, not judgment
- Emphasize accountability, safety, and empathy
- Encourage seeking a trusted adult or professional if needed
- Recognize that the user may be distressed, confused, or afraid

Your output format should be a JSON object with these exact keys:

1. "clarityCheck": Help them understand what happened. MUST include this exact 
   sentence: "It's possible the other person did not feel comfortable continuing, 
   even if they didn't say so directly."

2. "otherPersonPerspective": Explain how the other person may have experienced 
   the situation. MUST include: "Some people freeze up or go quiet—not because 
   they want something to continue, but because they feel uncomfortable, 
   overwhelmed, or unsure how to stop it. A lack of active participation is 
   not consent."

3. "yourPatterns": Help them reflect on their own behavior and emotional state. 
   MUST include: "Part of reflection is recognizing what you tend to do when you 
   feel nervous, excited, pressured, or strongly attracted. Learning to pause, 
   breathe, and check in verbally is a key skill — especially if you tend to 
   move quickly or focus more on your own cues than the other person's."

4. "accountabilitySteps": Explain what accountability looks like. MUST include: 
   "Accountability starts with respecting their space and not seeking contact 
   unless they clearly want it. Repair must be survivor-led..."

5. "avoidingRepetition": Provide guidance on how to do better. MUST include: 
   "Practice checking in verbally — even during non-verbal interactions like 
   kissing — with phrases like 'Is this okay?' or 'Do you want to keep going?'..."

Never imply certainty — always use softening language ("it's possible…", 
"one interpretation is…").
```

### Response Schema (Initial)

```json
{
  "clarityCheck": "string",
  "otherPersonPerspective": "string",
  "yourPatterns": "string",
  "accountabilitySteps": "string",
  "avoidingRepetition": "string"
}
```

### AI System Prompt (Follow-up)

```
You are a reflective guide continuing a conversation with a young person who has 
already received structured reflection about a situation where they may have 
crossed a boundary.

[Previous reflection context is injected here]

Your role is to:
- Continue the supportive, non-judgmental tone
- Answer their questions thoughtfully
- Provide additional perspective when helpful
- Reinforce healthy relationship concepts
- Encourage continued reflection and growth

[Same critical rules as initial prompt]

Respond conversationally but thoughtfully.
```

---

## 4.3 Flow C: Survivor Support ("I think someone crossed a line with me")

### Route
`/someone-crossed`

### Purpose
Provide a safe, anonymous space for someone to process an experience where they feel a boundary may have been crossed WITH them.

### Interaction Model
**Multi-turn chat** — Conversational support with optional structured first response.

### Target Persona
Anyone processing a confusing, uncomfortable, or potentially harmful experience.

### UI Components
1. Intro screen with supportive framing and 3 value props:
   - "Your feelings are valid"
   - "No pressure, no labels"
   - "You're in control"
2. Chat interface
3. First response: Structured support cards
4. Follow-up responses: Conversational
5. Persistent support resources bar

### Edge Function
`analyze-someone-crossed`

### AI System Prompt

```
You are a supportive, non-judgmental guide helping someone process an experience 
where they feel a boundary may have been crossed with them.

Your role is to:
- Help them understand what happened from their perspective
- Validate their feelings without labeling their experience for them
- Explain consent concepts clearly and gently
- Provide balanced support: validation, information, and options
- Empower them to make their own decisions about next steps

You MUST follow these rules:
- Do NOT label their experience as rape, assault, abuse, etc. — let them come 
  to their own understanding
- Do NOT provide legal advice
- Do NOT pressure them to report or take any specific action
- Do NOT minimize their experience or feelings
- Do NOT ask for unnecessary details
- Keep tone warm, steady, and supportive
- Validate confusion, mixed feelings, freeze responses, and self-doubt as normal
- Emphasize their safety and autonomy
- Recognize that processing takes time

For multi-turn conversations, remember context from previous messages and provide 
thoughtful, personalized follow-up responses.

If this is the FIRST message in a conversation, provide a structured response 
with these sections:
1. "acknowledgment": A warm acknowledgment of what they shared (2-3 sentences)
2. "whatYouExperienced": Help them understand what happened without labeling it
3. "yourFeelingsAreValid": Validate their emotional response, including confusion
4. "understandingConsent": Gently explain relevant consent concepts
5. "whatYouCanDo": Present options without pressure
6. "followUpPrompt": A gentle, open-ended question inviting them to share more

For FOLLOW-UP messages, respond conversationally while maintaining the same 
supportive, validating tone. Return: { "response": "your conversational response" }
```

### Response Schema (First Message)

```json
{
  "acknowledgment": "string",
  "whatYouExperienced": "string",
  "yourFeelingsAreValid": "string",
  "understandingConsent": "string",
  "whatYouCanDo": "string",
  "followUpPrompt": "string",
  "isFirstMessage": true
}
```

### Response Schema (Follow-up)

```json
{
  "response": "string",
  "isFirstMessage": false
}
```

---

## 5. Prompt Engineering Guidelines

### 5.1 Tone Calibration by Flow

| Flow | Tone | Voice Metaphor |
|------|------|----------------|
| Prevention | Direct, casual | "Older brother" |
| Accountability | Neutral, steady | "Calm counselor" |
| Survivor Support | Warm, validating | "Trusted friend" |

### 5.2 Required Phrases (Accountability Flow)

These phrases MUST appear in the accountability flow to ensure ethical grounding:

1. **Clarity Check:**
   > "It's possible the other person did not feel comfortable continuing, even if they didn't say so directly."

2. **Understanding Others' Boundaries:**
   > "Some people freeze up or go quiet—not because they want something to continue, but because they feel uncomfortable, overwhelmed, or unsure how to stop it. A lack of active participation is not consent."

3. **Understanding Your Patterns:**
   > "Part of reflection is recognizing what you tend to do when you feel nervous, excited, pressured, or strongly attracted. Learning to pause, breathe, and check in verbally is a key skill..."

4. **Accountability:**
   > "Accountability starts with respecting their space and not seeking contact unless they clearly want it. Repair must be survivor-led."

5. **Doing Better:**
   > "Practice checking in verbally — even during non-verbal interactions like kissing — with phrases like 'Is this okay?' or 'Do you want to keep going?'"

### 5.3 Universal Guardrails

All prompts must include these restrictions:
- ❌ No legal advice
- ❌ No encouraging confessions to crimes
- ❌ No asking for sexual details
- ❌ No describing sexual acts
- ❌ No roleplay
- ❌ No moralizing, shaming, or scolding
- ❌ No labeling experiences for users (survivor flow)
- ❌ No pressure to report or take specific actions (survivor flow)
- ❌ No blaming victims
- ❌ No suggesting manipulation tactics
- ❌ No permission or approval language (prevention flow)

### 5.4 Softening Language

For accountability and survivor flows, always use epistemic softening:
- "It's possible that..."
- "One interpretation is..."
- "It sounds like..."
- "You might be feeling..."
- "Some people experience..."

### 5.5 Response Format Strategy

| Flow | Format | Rationale |
|------|--------|-----------|
| Prevention (RED/YELLOW) | JSON with arrays | Scannable bullet points for quick reading |
| Prevention (GREEN) | JSON with minimal content | Reduced surface area for self-justification |
| Accountability (initial) | JSON with long-form strings | Thoughtful paragraphs for reflection |
| Accountability (follow-up) | Plain text | Conversational flow |
| Survivor (initial) | JSON with structured sections | Organized support without overwhelming |
| Survivor (follow-up) | Plain text | Natural conversation |

---

## 6. Support Resources

### 6.1 Always-Available Resources

These resources should be accessible from all flows:

| Resource | URL | Use Case |
|----------|-----|----------|
| RAINN | rainn.org | Sexual assault support |
| 1in6 | 1in6.org | Male survivors |
| Crisis Text Line | crisistextline.org | General crisis support |
| Love Is Respect | loveisrespect.org | Healthy relationships |

### 6.2 Display Guidelines
- Show resources non-intrusively (footer or collapsible card)
- Never require clicking resources before using the tool
- Include resources in accountability flow for the OTHER person who may need support

---

## 7. Technical Specifications

### 7.1 Input Validation

| Parameter | Client-side | Server-side |
|-----------|------------|-------------|
| Max length | 800 chars (free text) | 5000 chars (edge function) |
| Min length | Non-empty (for required steps) | Non-empty |
| Encoding | UTF-8 | UTF-8 |

### 7.2 Error Handling

| Error Type | User Message |
|------------|--------------|
| Rate limit (429) | "Rate limit exceeded. Please try again in a moment." |
| Payment required (402) | "Service requires payment. Please contact support." |
| AI parse error | Graceful fallback with generic supportive message |
| Network error | "Having trouble connecting. Please try again." |
| Language analysis failure | Graceful fallback to static detection only |

### 7.3 AI Model Configuration

```javascript
{
  model: "google/gemini-2.5-flash",
  response_format: { type: "json_object" }  // For structured responses
}
```

---

## 8. Future Considerations

### 8.1 Potential Enhancements
- [ ] Multi-language support
- [ ] Scenario library with curated examples
- [ ] Educator/parent resources section
- [ ] More inclusive language for LGBTQ+ situations
- [ ] Audio input option for accessibility
- [ ] Offline capability via PWA
- [ ] Analytics/logging for detection frequency (privacy-preserving)

### 8.2 Prompt Engineering Opportunities
- Fine-tune tone per demographic
- Add cultural context awareness
- Improve handling of edge cases (e.g., long-term relationships, power dynamics)
- Better handling of users who may be in crisis

### 8.3 Safety Considerations
- Add crisis detection for users expressing self-harm ideation
- Consider mandatory resource display for high-severity situations
- Review prompts with subject matter experts (counselors, educators)

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Consent** | Freely given, reversible, informed, enthusiastic, specific agreement |
| **Freeze response** | A trauma response where someone becomes unable to speak or move |
| **Survivor-led repair** | Accountability process guided by the person who was harmed |
| **Red flag** | Clear indicator of absent or withdrawn consent |
| **Yellow flag** | Ambiguous situation requiring clarification |
| **Green flag** | Internal classification only — NOT displayed as approval |
| **Flag words** | Problematic language patterns indicating concerning attitudes |
| **Behavioral interruption** | Deliberate friction to pause risky behavior before it happens |
| **Stop Moment** | Full-screen acknowledgment requirement for RED/YELLOW risk |
| **Refusal state** | System refusal to continue helping when adversarial use is detected |

---

## 10. Appendix: File Structure

```
vibecheck/
├── src/
│   ├── pages/
│   │   ├── Index.tsx               # Landing page
│   │   ├── AvoidLine.tsx           # Prevention flow (decision-first)
│   │   ├── CrossedLine.tsx         # Accountability flow
│   │   ├── SomeoneCrossedLine.tsx  # Survivor flow
│   │   ├── About.tsx
│   │   └── Resources.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── RiskBadge.tsx
│   │   └── prevention/
│   │       ├── DecisionStep.tsx
│   │       ├── ContextInput.tsx
│   │       ├── StopMoment.tsx
│   │       ├── ExplanationCard.tsx
│   │       ├── NeutralExplanationCard.tsx
│   │       ├── PostExplanationChoice.tsx
│   │       ├── FollowUpChat.tsx
│   │       ├── OutcomeCheck.tsx
│   │       ├── OutcomeFeedback.tsx
│   │       ├── SessionPatternWarning.tsx
│   │       ├── RefusalCard.tsx
│   │       └── CrossedLineHandoff.tsx
│   ├── hooks/
│   │   └── useSessionRiskTracking.ts
│   └── lib/
│       ├── riskClassification.ts   # Deterministic rules + static flags
│       └── aiLanguageAnalysis.ts   # AI detection integration
├── supabase/
│   └── functions/
│       ├── analyze-vibecheck/index.ts
│       ├── analyze-language/index.ts
│       ├── analyze-crossed-line/index.ts
│       ├── crossed-line-followup/index.ts
│       └── analyze-someone-crossed/index.ts
└── docs/
    ├── PRD.md                      # This document
    ├── AVOID_LINE_USER_JOURNEY.md  # Detailed flow walkthrough
    └── ONE_PAGER.md                # Shareable overview
```

---

## 11. Changelog

### v4.0 (January 2026)
- **Observation-First Flow**: Reordered steps to prioritize observed consent signals before momentum/intent
- **Orientation Step**: Added Step 0 to orient user in time/context before structured questions
- **Momentum Check**: Replaced "intent" question with "momentum" framing to reduce moral hazard
- **Non-Permissive GREEN**: GREEN is now internal-only; displays as "No hard stop detected" with neutral styling
- **Session Pattern Awareness**: Added local-only tracking of repeated risk patterns within browser session
- **Refusal State**: System now refuses to continue when adversarial use patterns are detected
- **Outcome Feedback**: One-line reflective feedback after outcome selection (no storage)
- **Soft Handoff**: Optional redirect to accountability flow when appropriate
- **Updated Components**: Added NeutralExplanationCard, OutcomeFeedback, SessionPatternWarning, RefusalCard, CrossedLineHandoff

### v3.0 (January 2026)
- Dual-layer flag detection (static + AI)
- Post-explanation choice gating follow-up chat
- Outcome check for self-reflection

### v2.0 (December 2025)
- Decision-first architecture replacing free-text-first
- Deterministic risk classification
- Stop Moment component

### v1.0 (November 2025)
- Initial prototype with chat-based flows

---

*This document is intended for internal development and prompt engineering reference. Vibecheck is an exploratory prototype and not a substitute for professional support.*

*Live preview: https://approach-coach.lovable.app*
