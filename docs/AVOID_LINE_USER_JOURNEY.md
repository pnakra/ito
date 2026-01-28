# Avoid Line — User Journey Document

**Flow:** `/avoid-line` (Prevention Flow)  
**Purpose:** Interrupt risky behavior before it happens. Help users recognize consent signals and make better decisions BEFORE acting.  
**Target Audience:** Primarily young men (14-24) navigating dating/hookup situations.

---

## Overview

This is a **decision-first consent assessment tool**, NOT a chatbot. Users answer structured questions via button selections, receive a deterministic risk classification, and then get AI-powered explanation and guidance.

```
Welcome → Intent → Signals → Context Factors → Free Text → Stop Moment* → AI Explanation → Done/Follow-up → Outcome Check
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

**User action:** Click "Start" to begin.

---

## Phase 2: Intent Check (Step 1/3)

**Prompt:** "What are you thinking about doing next?"

**Options (single select):**

| ID | Label |
|----|-------|
| `go-to-their-place` | Go to their place |
| `invite-to-mine` | Invite them to mine |
| `keep-texting` | Keep texting / messaging |
| `physical-move` | Make a physical move |
| `not-sure` | I'm not sure yet |

**User action:** Select one option, click "Continue →"

**Internal notes:**
- Options marked as "physical intent" (`go-to-their-place`, `invite-to-mine`, `physical-move`) carry higher risk weight in classification.

---

## Phase 3: Consent Signal Check (Step 2/3)

**Prompt:** "What signals have you gotten from them?"

**Options (single select):**

| ID | Label | Description |
|----|-------|-------------|
| `clear-yes` | Clear yes in words | They explicitly said yes or expressed clear interest verbally |
| `enthusiastic-actions` | Enthusiastic actions | They're initiating, leaning in, reciprocating |
| `mixed-signals` | Mixed / unclear signals | Sometimes interested, sometimes pulling back |
| `no-response` | No response | They haven't replied or acknowledged |
| `said-no` | They said no or pulled away | Verbal refusal or physical withdrawal |

**User action:** Select one option, click "Continue →"

**Internal notes:**
- `said-no` = automatic RED (hard stop)
- `no-response` + physical intent = RED
- `mixed-signals` + physical intent = RED

---

## Phase 4: Context Factors (Step 3/3)

**Prompt:** "Anything here that might complicate consent?"  
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
- `alcohol` + physical intent = always RED
- 2+ risk factors = RED
- 1 risk factor + physical intent = YELLOW

---

## Phase 5: Additional Context (Optional Free Text)

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
- Flag words + physical intent = automatic RED
- Flag words + mixed signals = RED
- Flag words alone = YELLOW minimum
- AI explanation will directly address the problematic language

---

## Phase 6: Risk Classification (Internal)

**This is NOT shown to the user directly — it determines what happens next.**

Risk level is calculated **deterministically by frontend code**, NOT by the AI.

### Classification Rules

| Condition | Risk Level |
|-----------|------------|
| `said-no` (any context) | 🔴 RED |
| `no-response` + physical intent | 🔴 RED |
| `mixed-signals` + physical intent | 🔴 RED |
| `alcohol` + physical intent | 🔴 RED |
| Flag words + physical intent | 🔴 RED |
| Flag words + mixed signals | 🔴 RED |
| 2+ context factors | 🔴 RED |
| `no-response` (non-physical intent) | 🟡 YELLOW |
| `mixed-signals` (non-physical intent) | 🟡 YELLOW |
| 1 context factor + physical intent | 🟡 YELLOW |
| Clear positive + 1 context factor | 🟡 YELLOW |
| Flag words alone | 🟡 YELLOW |
| Uncertainty/default | 🟡 YELLOW |
| Clear positive signals + no factors | 🟢 GREEN |

---

## Phase 7: Stop Moment (RED/YELLOW only)

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

**For GREEN risk:** Skip directly to AI Explanation.

**User action:** Must click "I understand" to proceed. No way to bypass.

---

## Phase 8: AI Explanation

**What the user sees:**

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
   - Self-interest angle (e.g., "Even if you don't care about their experience, doing this wrong could ruin your reputation or worse.")

**AI Behavior:**
- The AI does NOT determine risk level — it explains the pre-computed level
- If flag words were detected, the AI directly addresses the problematic language
- Tone: Direct, not preachy. Like an older brother, not a teacher.
- No lectures, no moralizing
- Focus on practical guidance

**Example AI response for RED (said-no):**

```json
{
  "assessment": "They gave you a clear 'no' — either with words or by pulling away physically. That's not ambiguous, and it's not something to try to work around.",
  "whatsHappening": [
    "They communicated a boundary directly",
    "This is actually the clearest signal someone can give",
    "Continuing to push after this point is not a gray area"
  ],
  "whatNotToDo": [
    "Don't try to convince them to change their mind",
    "Don't wait and try again later hoping they'll be 'in a different mood'",
    "Don't assume they didn't really mean it"
  ],
  "whatToDoInstead": [
    "Accept the 'no' as final for tonight",
    "Say something like 'Okay, no problem' and actually mean it",
    "Give them space without making it weird"
  ],
  "realTalk": "Respecting a 'no' the first time is what separates you from someone who makes people feel unsafe."
}
```

---

## Phase 9: Post-Explanation Choice

**What the user sees:**
- Two buttons side by side
- "I'm done" — Ends the flow, goes to Outcome Check
- "I want to talk more" — Opens follow-up chat

**User action:** Choose one option.

---

## Phase 10a: Follow-up Chat (Optional)

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

## Phase 10b: Outcome Check (Final)

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

**After selection:** Flow resets to welcome screen. User can start over if desired.

**Privacy:** No data is stored. This is purely for user self-reflection.

---

## Complete Example Scenarios

### Scenario A: GREEN Path

1. **Intent:** Keep texting / messaging
2. **Signals:** Enthusiastic actions
3. **Context:** None of these
4. **Free text:** (empty)
5. **Result:** GREEN → No stop moment → AI explanation (positive reinforcement)
6. **Outcome:** User selects what they did

### Scenario B: YELLOW Path

1. **Intent:** Invite them to mine
2. **Signals:** Clear yes in words
3. **Context:** Alcohol or drugs involved
4. **Free text:** "We've been drinking at a party"
5. **Result:** YELLOW → Pause moment appears → User acknowledges → AI explanation (caution)
6. **Outcome:** User selects what they did

### Scenario C: RED Path (Explicit No)

1. **Intent:** Make a physical move
2. **Signals:** They said no or pulled away
3. **Context:** None of these
4. **Free text:** (empty)
5. **Result:** RED → Stop moment appears → User acknowledges → AI explanation (hard stop)
6. **Outcome:** User selects what they did

### Scenario D: RED Path (Flag Words)

1. **Intent:** Go to their place
2. **Signals:** Mixed / unclear signals
3. **Context:** Alcohol or drugs involved
4. **Free text:** "She's been leading me on all night, she's kind of a slut"
5. **Flag detection:** "leading me on" (dismissing boundaries), "slut" (derogatory label)
6. **Result:** RED → Stop moment → AI explanation directly addresses the problematic language
7. **Outcome:** User selects what they did

---

## Technical Architecture

```
Frontend (React)
├── src/pages/AvoidLine.tsx           — Main flow orchestrator
├── src/lib/riskClassification.ts     — Deterministic risk rules
├── src/lib/aiLanguageAnalysis.ts     — AI-powered flag detection
└── src/components/prevention/
    ├── DecisionStep.tsx              — Reusable button step
    ├── ContextInput.tsx              — Free text input
    ├── StopMoment.tsx                — Full-screen brake
    ├── ExplanationCard.tsx           — AI response display
    ├── PostExplanationChoice.tsx     — Done/Continue buttons
    ├── FollowUpChat.tsx              — Multi-turn chat
    └── OutcomeCheck.tsx              — Self-report buttons

Edge Functions (Supabase/Deno)
├── analyze-vibecheck                 — Main AI explanation
└── analyze-language                  — AI-powered flag detection
```

---

## Key Design Decisions

1. **Risk is deterministic, not AI-determined**
   - Frontend code enforces hard rules
   - AI explains, does not assess
   - Ensures consistent safety enforcement

2. **Stop Moment is mandatory**
   - Cannot skip or dismiss
   - Creates deliberate friction before risky behavior
   - User must acknowledge understanding

3. **Flag word detection is dual-layer**
   - Fast static matching for obvious patterns
   - AI catches nuanced problematic attitudes
   - Both feed into risk classification AND AI response

4. **No data storage**
   - Full anonymity
   - Outcome check is for user reflection only
   - Removes barriers to honest engagement

5. **Tone is peer-like, not authoritative**
   - "Older brother" not "teacher"
   - Direct without lecturing
   - Self-interest angles alongside ethical guidance

---

*Document generated for feedback purposes. Flow available at: https://approach-coach.lovable.app/avoid-line*
