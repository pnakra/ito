# Avoid Line — User Journey Document

**Flow:** `/avoid-line` (Prevention Flow)  
**Purpose:** Interrupt risky behavior before it happens. Help users recognize consent signals and make better decisions BEFORE acting.  
**Target Audience:** Primarily young men (14-24) navigating dating/hookup situations.

---

## Overview

This is a **decision-first consent assessment tool**, NOT a chatbot. Users answer structured questions via button selections, receive a deterministic risk classification, and then get AI-powered explanation and guidance.

**Core Philosophy:** Observation before intention, structure before narrative, system rules before AI output.

```
Welcome → Orientation → Consent Signals → Context Factors → Momentum → Free Text → Stop Moment* → AI Explanation → Done/Follow-up → Outcome Check
                                                                                          ↑
                                                                         *Only for RED/YELLOW risk
```

---

## Phase 1: Welcome Screen

**What the user sees:**
- Shield icon
- Heading: "Before You Act"
- Subtext: "Answer a few quick questions. Get a reality check. No judgment, no data stored."
- Button: "Start →"

**Session Pattern Warning:**
If user has encountered 2+ YELLOW/RED outcomes in this browser session, a neutral warning is displayed:
> "You've run into a few situations like this. That's often a sign it's time to slow things way down."

**User action:** Click "Start" to begin.

---

## Phase 2: Orientation (Step 1/4) — NEW

**Prompt:** "Where are you in this situation right now?"

**Options (single select):**

| ID | Label |
|----|-------|
| `texting` | We're texting or messaging |
| `in-person` | We're together in person |
| `party-group` | We're at a party or group setting |
| `already-happened` | Something already happened and I'm unsure |
| `not-sure` | I'm not sure how to describe it |

**User action:** Select one option, click "Continue →"

**Internal notes:**
- Selection is stored but does not yet trigger branching
- `already-happened` triggers optional handoff to `/crossed-line` after explanation

---

## Phase 3: Consent Signal Check (Step 2/4)

**Prompt:** "What have they been doing or saying?"

**Options (single select):**

| ID | Label |
|----|-------|
| `clear-yes` | Clearly saying yes or expressing interest in words |
| `enthusiastic-actions` | Actively initiating or reciprocating |
| `mixed-signals` | Mixed or hard to read |
| `no-response` | Quiet or not responding |
| `said-no` | Said no or pulled away |

**User action:** Select one option, click "Continue →"

**Internal notes:**
- `said-no` = automatic RED (hard stop)
- `no-response` + physical momentum = RED
- `mixed-signals` + physical momentum = RED
- This step comes BEFORE momentum/intent to center observation over intention

---

## Phase 4: Context Factors (Step 3/4)

**Prompt:** "Anything here that might affect how clear consent is?"  
**Subtitle:** "Select all that apply"

**Options (multi-select):**

| ID | Label |
|----|-------|
| `alcohol` | Alcohol or drugs involved |
| `experience-gap` | One of us is much more experienced |
| `age-imbalance` | Age or power imbalance |
| `emotional-pressure` | Emotional pressure |
| `none` | None of these |

**User action:** Select one or more options, click "Continue →"

**Internal notes:**
- Selecting "None of these" deselects all others (exclusive)
- `alcohol` + physical momentum = always RED
- 2+ risk factors = RED
- 1 risk factor + physical momentum = YELLOW

---

## Phase 5: Momentum Check (Step 4/4) — REPLACES INTENT

**Prompt:** "What direction does this feel like it's heading?"

**Options (single select):**

| ID | Label | Risk Weight |
|----|-------|-------------|
| `toward-physical` | Toward something physical | Physical momentum (higher risk) |
| `staying-flirty` | Staying flirty or emotional | Low risk |
| `slow-down` | I want to slow things down | Low risk |
| `dont-know` | I don't know | Neutral |

**User action:** Select one option, click "Continue →"

**Internal notes:**
- Only `toward-physical` carries "physical momentum" risk weight
- This reframes the question from planning ("what are you going to do?") to observation ("where is this heading?")
- Reduces moral hazard by not endorsing future action

---

## Phase 6: Additional Context (Optional Free Text)

**Prompt:** "Anything else you want to add?"  
**Subtext:** "Optional – share more context if you want more specific feedback."

**Input type:** Textarea (multi-line)

**User action:** Type additional context (or leave blank), click "Get My Vibe Check →"

**Internal notes — Flag Word Detection:**

The system scans free text for concerning language patterns in two layers:

**Layer 1: Static Pattern Matching (instant)**
Detects explicit problematic phrases:
- Derogatory labels: "slut", "whore", "thot", "skank"
- Objectification: "easy", "gets around"
- Entitlement: "owes me", "friend zone", "nice guy"
- Dismissing boundaries: "playing hard to get", "led me on", "means yes"
- Coercion: "just let me", "come on", "don't be a tease"

**Layer 2: AI-Powered Analysis (async)**
Detects nuanced patterns that keywords miss:
- Objectification and dehumanization
- Entitlement to physical intimacy
- Dismissing or reframing rejection
- Subtle coercion or pressure tactics
- Victim-blaming language
- Treating consent as obstacle vs. requirement

**Flag word impact:**
- Flag words + physical momentum = automatic RED
- Flag words + mixed signals = RED
- Flag words alone = YELLOW minimum
- Free text can only escalate risk, never lower it
- AI explanation will directly address the problematic language

---

## Phase 7: Risk Classification (Internal)

**This is NOT shown to the user directly — it determines what happens next.**

Risk level is calculated **deterministically by frontend code**, NOT by the AI.

### Classification Rules

| Condition | Risk Level |
|-----------|------------|
| `said-no` (any context) | 🔴 RED |
| `no-response` + physical momentum | 🔴 RED |
| `mixed-signals` + physical momentum | 🔴 RED |
| `alcohol` + physical momentum | 🔴 RED |
| Flag words + physical momentum | 🔴 RED |
| Flag words + mixed signals | 🔴 RED |
| 2+ context factors | 🔴 RED |
| `no-response` (non-physical momentum) | 🟡 YELLOW |
| `mixed-signals` (non-physical momentum) | 🟡 YELLOW |
| 1 context factor + physical momentum | 🟡 YELLOW |
| Clear positive + 1 context factor | 🟡 YELLOW |
| Flag words alone | 🟡 YELLOW |
| Uncertainty/default | 🟡 YELLOW |
| Clear positive signals + no factors | ⚪ NEUTRAL (internal "green") |

**Risk level is locked after calculation and cannot be lowered by follow-up.**

---

## Phase 8: Stop Moment (RED/YELLOW only)

**For RED risk:**
- Full-screen overlay
- Large octagon icon (red)
- Header: **"STOP"**
- Subtext: "This is a hard stop."
- Message: Specific instruction (e.g., "Stop. They said no or pulled away. That's a clear answer.")
- Button: "I understand"
- Footer: "Proceeding without consent can cause serious harm."

**For YELLOW risk:**
- Full-screen overlay
- Large triangle icon (yellow/amber)
- Header: **"PAUSE"**
- Subtext: "Take a moment before continuing."
- Message: Specific caution (e.g., "Mixed signals mean you need to check in before going further.")
- Button: "I understand"
- Footer: "Clear communication protects both of you."

**For NEUTRAL (green) risk:** Skip directly to AI Explanation.

**User action:** Must click "I understand" to proceed. No way to bypass.

---

## Phase 9: AI Explanation

### For RED/YELLOW (Full Explanation Card)

A card with structured sections:

1. **Assessment** (2-3 sentences)
   - Plain-language explanation of what's happening in this situation
   
2. **What's happening here** (bullet list)
   - Specific observations about the signals and context
   
3. **What NOT to do** (bullet list)
   - Concrete actions to avoid
   
4. **What to do instead** (bullet list)
   - Specific, actionable alternatives
   
5. **Real talk** (1 sentence)
   - Self-interest angle

### For NEUTRAL (Minimal Explanation Card) — NON-PERMISSIVE

**Critical: GREEN is an internal state, NOT approval.**

A minimal card with:
- Title: **"No hard stop detected right now"**
- Neutral colors (gray/blue, NOT green)
- Brief assessment (1-2 sentences)
- Mandatory disclaimer: "That doesn't mean consent is guaranteed or that things can't change. If they hesitate, go quiet, or pull back at any point, that's your cue to stop."
- **Empty** "what not to do" and "what to do instead" lists (minimal guidance)
- Brief reminder about checking in (NOT validation)

**NEUTRAL explanations must be noticeably shorter than YELLOW/RED.**

**Prohibited language for NEUTRAL:**
- "You're good"
- "Safe to proceed"
- "Okay to continue"
- Any approval or permission framing

---

## Phase 9.5: Crossed-Line Handoff (Conditional)

**Shown after explanation when:**
- Orientation = "Something already happened and I'm unsure" OR
- User has encountered 2+ RED outcomes in session

**Card content:**
- Title: "If something already happened"
- Copy: "If you're realizing this may have crossed a line already, there's another path focused on reflection and accountability."
- Button: "Reflect on what happened" → navigates to `/crossed-line`

**Navigation is NEVER forced.**

---

## Phase 10: Refusal State (Adversarial Use)

**Triggered when ALL of the following are true:**
- Repeated coercive/dehumanizing language detected (flag words in 2+ runs)
- Risk level is RED
- User continues seeking guidance

**What the user sees:**
- Card with firm boundary
- Title: "I can't help with this"
- Copy: "The situation you described involves clear boundaries that need to be respected. The safest move is to stop."
- Copy: "If you're struggling with patterns of behavior, talking to a counselor or trusted adult is a better path forward."
- Button: "Start over" (resets flow)

**No further guidance is provided beyond this.**

---

## Phase 11: Post-Explanation Choice

**What the user sees:**
- Two buttons side by side
- "I'm done" — Ends the flow, goes to Outcome Check
- "I want to talk more" — Opens follow-up chat

**User action:** Choose one option.

---

## Phase 12a: Follow-up Chat (Optional)

**Only shown if user clicked "I want to talk more"**

**Prompt:** "What's on your mind?"  
**Subtext:** "Ask anything about this situation. We'll keep the context."

**Input type:** Textarea

**User action:** Type question/concern, click "Send"

**AI Behavior:**
- Maintains conversation context from original selections
- Continues same tone (direct, non-preachy)
- Re-generates explanation card with updated guidance
- Risk level remains fixed (doesn't change based on follow-up)

**After AI responds:** User can choose "I'm done" or "Talk more" again.

---

## Phase 12b: Outcome Check (Final)

**What the user sees:**

Card with question: "What did you end up doing?"  
Subtext: "This helps you reflect. Nothing is stored or tracked."

**Options:**

| ID | Label | Icon |
|----|-------|------|
| `stopped` | I stopped | ✓ (green) |
| `checked-in` | I checked in verbally | 💬 (green) |
| `didnt-proceed` | I didn't go through with it | ✗ (neutral) |
| `not-sure` | I'm not sure / I ignored this | ? (muted) |

**User action:** Select one option.

---

## Phase 13: Outcome Feedback

**One-line reflective feedback based on selection (NOT stored):**

| Outcome | Feedback |
|---------|----------|
| `stopped` or `checked-in` | "Clear pauses and verbal check-ins are what actually prevent harm." |
| `didnt-proceed` | "Choosing not to proceed is always a valid way to keep things safe." |
| `not-sure` | "If a situation feels confusing, earlier pauses usually make things clearer." |

**After feedback:** Button to "Start over" and reset flow.

---

## Complete Example Scenarios

### Scenario A: NEUTRAL Path (No Hard Stop)

1. **Orientation:** We're texting or messaging
2. **Signals:** Actively initiating or reciprocating
3. **Context:** None of these
4. **Momentum:** Staying flirty or emotional
5. **Free text:** (empty)
6. **Result:** NEUTRAL → No stop moment → Minimal explanation (NOT approval)
7. **Outcome:** User selects what they did → Reflective feedback

### Scenario B: YELLOW Path

1. **Orientation:** We're together in person
2. **Signals:** Clearly saying yes or expressing interest in words
3. **Context:** Alcohol or drugs involved
4. **Momentum:** Toward something physical
5. **Free text:** "We've been drinking at a party"
6. **Result:** RED (alcohol + physical momentum) → Stop moment → Full explanation
7. **Outcome:** User selects what they did → Reflective feedback

### Scenario C: RED Path (Explicit No)

1. **Orientation:** We're at a party or group setting
2. **Signals:** Said no or pulled away
3. **Context:** None of these
4. **Momentum:** Toward something physical
5. **Free text:** (empty)
6. **Result:** RED → Stop moment appears → Full explanation
7. **Outcome:** User selects what they did → Reflective feedback

### Scenario D: RED Path with Crossed-Line Handoff

1. **Orientation:** Something already happened and I'm unsure
2. **Signals:** Mixed or hard to read
3. **Context:** Alcohol or drugs involved
4. **Momentum:** I don't know
5. **Free text:** (empty)
6. **Result:** YELLOW → Pause moment → Explanation → Crossed-Line Handoff card shown
7. **User may navigate to /crossed-line for accountability flow**

### Scenario E: Refusal (Adversarial Use)

1. **First run:** RED + flag words ("she was leading me on")
2. **Resets and tries again**
3. **Second run:** RED + flag words ("she owes me")
4. **Result:** Refusal card shown, no further guidance provided

---

## Technical Architecture

```
Frontend (React)
├── src/pages/AvoidLine.tsx           — Main flow orchestrator
├── src/lib/riskClassification.ts     — Deterministic risk rules
├── src/lib/aiLanguageAnalysis.ts     — AI-powered flag detection
├── src/hooks/useSessionRiskTracking.ts — Session-level pattern awareness
└── src/components/prevention/
    ├── DecisionStep.tsx              — Reusable button step
    ├── ContextInput.tsx              — Free text input
    ├── StopMoment.tsx                — Full-screen brake
    ├── ExplanationCard.tsx           — AI response display (RED/YELLOW)
    ├── NeutralExplanationCard.tsx    — Minimal display (NEUTRAL)
    ├── PostExplanationChoice.tsx     — Done/Continue buttons
    ├── FollowUpChat.tsx              — Multi-turn chat
    ├── OutcomeCheck.tsx              — Self-report buttons
    ├── OutcomeFeedback.tsx           — Reflective one-liner
    ├── SessionPatternWarning.tsx     — Session-level observation
    ├── RefusalCard.tsx               — Adversarial use boundary
    └── CrossedLineHandoff.tsx        — Soft navigation to accountability

Edge Functions (Supabase/Deno)
├── analyze-vibecheck                 — Main AI explanation
└── analyze-language                  — AI-powered flag detection
```

---

## Key Design Decisions

1. **Observation before intention**
   - Consent signals asked BEFORE momentum/intent
   - Centers what the other person is communicating
   - Reduces moral hazard of planning-first framing

2. **Risk is deterministic, not AI-determined**
   - Frontend code enforces hard rules
   - AI explains, does not assess
   - Ensures consistent safety enforcement

3. **GREEN is not approval**
   - Internal state only, never displayed as "green"
   - Neutral styling and language
   - Explicitly states this is not permission
   - Minimal guidance (less is more)

4. **Stop Moment is mandatory**
   - Cannot skip or dismiss
   - Creates deliberate friction before risky behavior
   - User must acknowledge understanding

5. **Session-level pattern awareness**
   - Tracks run counts and risk outcomes in sessionStorage only
   - Surfaces neutral observation for repeat risky encounters
   - No persistence across sessions

6. **Explicit refusal for adversarial use**
   - System can say "I can't help with this"
   - Triggered by repeated coercive language at RED
   - Redirects to appropriate resources

7. **Soft handoff to accountability**
   - If user indicates something already happened
   - Optional navigation to /crossed-line
   - Never forces transition

8. **No data storage**
   - Full anonymity
   - Outcome check is for user reflection only
   - Removes barriers to honest engagement

9. **Tone is peer-like, not authoritative**
   - "Older brother" not "teacher"
   - Direct without lecturing
   - Self-interest angles alongside ethical guidance

---

## Success Criteria

This flow is successful if:

1. ✅ Users feel oriented before being asked to describe their situation
2. ✅ Stop Moments feel inevitable, not advisory
3. ✅ The system cannot be used to extract permission
4. ✅ An outside observer would describe this as a safety system, not a chatbot
5. ✅ GREEN cannot be interpreted as approval

---

*Document generated for feedback purposes. Flow available at: https://approach-coach.lovable.app/avoid-line*
