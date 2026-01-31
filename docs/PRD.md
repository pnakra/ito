# ito ("is this ok?") — Product Requirements Document (PRD)

**Version:** 5.0  
**Last Updated:** January 2026  
**Status:** Early Prototype / Exploratory  
**Live URL:** https://ito.lovable.app

---

## 1. Executive Summary

### 1.1 Product Vision
ito is an anonymous, harm-reduction tool designed to help young people navigate consent, boundaries, and accountability in intimate situations. It provides three distinct pathways for users depending on their relationship to a situation: prevention, self-reflection, and processing experiences.

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

### 1.5 Why This Is More Than a Chatbot

ito is fundamentally different from a "chatbot with a nice UI":

| Aspect | Typical AI Chatbot | ito |
|--------|-------------------|-----|
| **Risk Assessment** | AI decides risk level | Deterministic rules in frontend code |
| **AI Role** | Assesses and advises | Explains pre-computed decisions |
| **User Flow** | Open-ended conversation | Structured decision points with gates |
| **Safety Guardrails** | Prompt-based only | Multi-layer: code rules + prompts + UI gates |
| **Escalation Handling** | AI judgment | Hard-coded refusal states |
| **GREEN Signal** | "You're good to go!" | Never displays approval; internal-only state |
| **Session Awareness** | None | Pattern tracking for repeat risk behaviors |

**The AI cannot override the system's safety rules.** If a user selects "They said no," the system displays RED regardless of what the AI might "think."

---

## 2. Target Users

### 2.1 Primary Audience
- **Age Range:** 14-24 years old
- **Demographics:** All genders, though language is currently optimized for young men in the prevention flow
- **Context:** Users navigating dating, hookups, relationships, and intimate situations

### 2.2 User Mindsets (Entry Points)

| Mindset | Route | User State |
|---------|-------|------------|
| Uncertain | `/before` | "I'm thinking about making a move" |
| Reflective | `/after` | "I think I may have done something wrong" |
| Processing | `/happened-to-me` | "Something happened to me that felt off" |

---

## 3. Product Architecture

### 3.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        ITO FRONTEND                          │
│                    (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│  /                    │  Landing page with 3 pathways       │
│  /before              │  Prevention: Moves + Ladder flow    │
│  /after               │  Accountability reflection + chat   │
│  /happened-to-me      │  Survivor support chat (multi-turn) │
│  /about               │  Product information                │
│  /resources           │  Crisis resources                   │
│  /demo                │  Internal demo/documentation        │
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
│                  Deployed on Lovable Cloud                   │
├─────────────────────────────────────────────────────────────┤
│  analyze-vibecheck        │  Prevention EXPLANATION AI      │
│  analyze-language         │  AI-powered language detection  │
│  analyze-crossed-line     │  Initial accountability AI      │
│  crossed-line-followup    │  Accountability follow-up AI    │
│  analyze-someone-crossed  │  Survivor support AI            │
│  vibecheck-followup       │  Prevention follow-up chat      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ANTHROPIC CLAUDE API                      │
│              Model: claude-sonnet-4-20250514                 │
│              (Claude 3.5 Sonnet equivalent)                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui components |
| State Management | React useState/useReducer (no global state) |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase-powered) |
| Edge Functions | Deno runtime |
| AI Model | Anthropic Claude 3.5 Sonnet (claude-sonnet-4-20250514) |
| Database | PostgreSQL (minimal use - submissions logging only) |

### 3.3 Secret Management

**Storage Location:** Supabase Edge Function Secrets (server-side only)

| Secret Name | Purpose | Access |
|-------------|---------|--------|
| `ANTHROPIC_API_KEY` | Authenticates with Claude API | Edge functions only |
| `SUPABASE_URL` | Database connection | Auto-provided |
| `SUPABASE_ANON_KEY` | Public client access | Auto-provided |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin database access | Edge functions only |
| `LOVABLE_API_KEY` | Lovable AI Gateway (backup) | Edge functions only |

**Security Model:**
- API keys NEVER exposed to frontend code
- All AI calls go through edge functions
- Edge functions validate input before calling external APIs
- No client-side environment variables contain secrets

### 3.4 Data Flow

**Prevention Flow (Moves + Ladder Architecture):**
1. **Phase 1 - Name the Move:** User selects specific action they're considering
2. User sees visual "ladder" showing intimacy spectrum
3. User selects orientation (where they are in the situation)
4. User describes observed consent signals (what the other person is doing/saying)
5. User selects context factors that might affect consent clarity
6. User selects momentum direction (where things are heading)
7. User optionally adds free-text context
8. Dual-layer detection: Static patterns + AI analysis scan free text
9. Frontend deterministically calculates risk level
10. If RED/YELLOW: Mandatory "Stop Moment" displayed
11. User acknowledges → Edge function called with pre-computed risk
12. AI explains (does not assess) the risk level, directly addressing any flagged language
13. **Phase 3 - Grounding Output:** Mutuality signals + in-between options displayed
14. Post-explanation choice: "I'm done" or "I want to talk more"
15. Optional follow-up chat if user chooses to continue
16. Outcome check: User self-reports what they did
17. One-line reflective feedback (no storage)

**Accountability & Survivor Flows:**
1. User inputs scenario/message in frontend
2. Frontend sends request to edge function
3. Edge function constructs prompt with system instructions
4. Claude API returns structured response
5. Frontend renders response with appropriate UI

### 3.5 Privacy Architecture
- **Minimal database use** — Only anonymous session submissions logged (for product improvement)
- **No authentication** — Fully anonymous access
- **No analytics tracking** — No user behavior logging
- **Stateless conversations** — Context maintained only in-session via frontend state
- **Session-only tracking** — Pattern awareness via sessionStorage (cleared on tab close)
- **Outcome check** — Self-reported, local-only, no storage

### 3.6 Database Schema

```sql
-- Submissions table (anonymous logging for product improvement)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  flow_type TEXT NOT NULL,           -- 'before', 'after', 'happened-to-me'
  step_name TEXT NOT NULL,           -- 'move-selection', 'orientation', etc.
  step_type TEXT NOT NULL,           -- 'choice', 'freetext', 'ai-response'
  choice_value TEXT,                 -- Selected option ID
  freetext_value TEXT,               -- User's free text (if any)
  ai_response_summary TEXT,          -- Brief AI response summary
  metadata JSONB,                    -- Additional context
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Anonymous insert only, no read access
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anonymous inserts" ON submissions FOR INSERT WITH CHECK (true);
-- SELECT restricted to service_role for admin review only
```

---

## 4. Flow Specifications

## 4.1 Flow A: Prevention ("I'm thinking about making a move")

### Route
`/before`

### Purpose
Interrupt risky behavior in the moment. Help users name what they're considering, recognize consent signals, and understand their options before acting.

### Core Insight
Many teens feel "I want to do something more" but lack a shared language for:
- What "a move" actually is
- What options exist between kissing and sex
- How to recognize when a move is mutual

### Interaction Model (v5.0 — Moves + Ladder Architecture)

**Phase 1: Name the Move → Phase 2: Contextual Reflection → Phase 3: Grounding Output**

This is NOT a chatbot. It is a consent risk assessment and behavioral interruption tool.

### Target Persona
Primarily teenage boys (14-18) navigating dating/hookup situations for the first time.

### User Journey (v5.0)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         PHASE 1: NAME THE MOVE                              │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                                        │
│  │ Privacy Banner  │  "Nothing is saved. This is just for you."            │
│  └─────────────────┘                                                        │
│                                                                              │
│  "What kind of move are you thinking about?"                                │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE LADDER (Visual Spectrum)                                        │   │
│  │  ────────────────────────────                                        │   │
│  │  ○ Sit closer                                                        │   │
│  │  ○ Hold hands                                                        │   │
│  │  ● Kiss  ◄── Selected                                                │   │
│  │  ○ Make out                                                          │   │
│  │  ○ Touch over clothes                                                │   │
│  │  ○ Touch under clothes                                               │   │
│  │  ○ Go somewhere private                                              │   │
│  │  ○ Have sex                                                          │   │
│  │  ○ Not sure yet                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: CONTEXTUAL REFLECTION                           │
│                    (Existing ito questions, contextualized)                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Step 0: Orientation                                                        │
│  Step 1: Observed Consent Signals                                           │
│  Step 2: Context Risk Factors                                               │
│  Step 3: Momentum Check                                                     │
│  Step 4: Free Text (optional)                                               │
│                                                                              │
│  ↓ Dual-layer detection + Deterministic risk calculation ↓                 │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STOP MOMENT (if RED/YELLOW)                                          │   │
│  │ "I understand" button required to proceed                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ↓ AI Explanation (references selected move) ↓                             │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                       PHASE 3: GROUNDING OUTPUT                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  A) MUTUALITY SIGNALS (always shown)                                        │
│  "What [selected move] usually looks like when it's mutual:"               │
│  • Both people initiate or lean in                                          │
│  • Bodies are relaxed, not stiff or pulling away                            │
│  • You can pause or stop without it being weird                             │
│  • They're actively participating, not just allowing                        │
│                                                                              │
│  B) IN-BETWEEN OPTIONS (shown for yellow/red or uncertainty)                │
│  "If you're unsure, you don't have to jump ahead:"                         │
│  • Longer hug                                                               │
│  • Sitting closer                                                           │
│  • Hand on their back                                                       │
│  • Ask what they want                                                       │
│                                                                              │
│  ↓ Post-explanation choice → Optional follow-up → Outcome check ↓          │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

### Phase 1: Move Selection Options

| ID | Label | Ladder Position |
|----|-------|-----------------|
| `sit-closer` | Sit closer | 1 (least intimate) |
| `hold-hands` | Hold hands | 2 |
| `kiss` | Kiss | 3 |
| `make-out` | Make out | 4 |
| `touch-over-clothes` | Touch over clothes | 5 |
| `touch-under-clothes` | Touch under clothes | 6 |
| `go-somewhere-private` | Go somewhere private | 7 |
| `have-sex` | Have sex | 8 (most intimate) |
| `not-sure` | Not sure yet | N/A |

**The Ladder Mental Model:**
- Visual orientation aid, NOT a required progression
- Shows user where their selected move sits in the spectrum
- Helps them see "in-between" options they might not have considered
- NOT gamified, NOT a checklist, NOT a "level up" system

### Phase 2: Contextual Reflection Steps

**Step 0: Orientation**
> "Where are you in this situation right now?"

| ID | Label | Description |
|----|-------|-------------|
| `texting` | We're texting or messaging | Remote/async context |
| `in-person` | We're together in person | Physical proximity |
| `party-group` | We're at a party or group setting | Social context with others |
| `already-happened` | Something already happened and I'm unsure | Post-event reflection |
| `not-sure` | I'm not sure how to describe it | Unclear context |

**Step 1: Observed Consent Signals**
> "What have they been doing or saying?"

Questions are dynamically contextualized with the selected move. Example:
- Generic: "Are you confident the other person is comfortable?"
- Contextualized: "Do they seem actually into this, or just going along with it?"

| ID | Label | Description |
|----|-------|-------------|
| `clear-yes` | Clearly saying yes or expressing interest in words | Explicit verbal consent |
| `enthusiastic-actions` | Actively initiating or reciprocating | Non-verbal but active consent |
| `mixed-signals` | Mixed or hard to read | Ambiguous signals |
| `no-response` | Quiet or not responding | Absence of response |
| `said-no` | Said no or pulled away | Clear refusal |

**Step 2: Context Risk Factors**
> "Anything here that might affect how clear consent is?" (Multi-select)

| ID | Label |
|----|-------|
| `alcohol` | Alcohol or drugs involved |
| `experience-gap` | One of us is much more experienced |
| `age-imbalance` | Age or power imbalance |
| `emotional-pressure` | Emotional pressure |
| `none` | None of these |

**Step 3: Momentum Check**
> "What direction does this feel like it's heading?"

| ID | Label | Risk Mapping |
|----|-------|--------------|
| `toward-physical` | Toward something physical | Maps to physical intent risk weights |
| `staying-flirty` | Staying flirty or emotional | Non-physical |
| `slow-down` | I want to slow things down | Non-physical |
| `dont-know` | I don't know | Non-physical |

**Step 4: Additional Context (Optional)**
> "Anything else you want to add?"

Free text input (max 800 characters). Subject to dual-layer flag detection.

### Phase 3: Grounding Output

**A) Mutuality Signals (Always Shown)**
Move-specific indicators that a move is mutual:

| Move | Mutuality Signals |
|------|-------------------|
| `kiss` | Both people lean in, eye contact, relaxed body language, easy to pause |
| `make-out` | Active participation from both, hands moving naturally, comfortable pauses |
| `touch-over-clothes` | They guide your hand or touch back, relaxed not tense |
| `touch-under-clothes` | Clear verbal yes, they help with clothing, ongoing enthusiasm |
| `have-sex` | Explicit conversation, both actively participating, can stop anytime |

**B) In-Between Options (Shown for Yellow/Red or Uncertainty)**
Low-pressure alternatives based on selected move:

| Selected Move | In-Between Options |
|---------------|-------------------|
| `kiss` | Longer hug, sitting closer, hand on their back |
| `make-out` | Gentle kiss, holding hands, asking what they want |
| `touch-over-clothes` | Making out with clothes on, holding them close |
| `touch-under-clothes` | Touching over clothes only, asking what feels good |
| `have-sex` | Everything else on the ladder, explicit conversation about what they want |

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
Edge function `analyze-language` using Claude detects nuanced patterns:

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

### GREEN State Semantics (Non-Permissive)

**CRITICAL: GREEN is an internal classification state, NOT a user-facing approval.**

When risk is internally classified as GREEN:
- Do NOT display the word "GREEN" or any green color
- Display neutral header: "No clear red flags right now"
- Use neutral colors (gray/muted)
- Explanation is SHORTER than YELLOW/RED
- Still show mutuality signals
- No reassurance or validation of intent

**Required copy elements for GREEN:**
- "Consent is ongoing and can change"
- "This isn't permission—it's just that nothing here is a hard stop"
- "If they hesitate, go quiet, or seem off, that's your cue to pause"

**Forbidden language:**
- "You're good"
- "Safe to proceed"
- "Okay to proceed"
- Any language that could be interpreted as permission

### Stop Moment Component

For RED and YELLOW risk levels, a full-screen modal appears:

**RED Stop Moment:**
- Large octagon icon
- Header: "Wait"
- Subtext: "This is a hard stop."
- Message: Specific concern based on classification
- Button: "I understand" (required to proceed)
- Footer: "Proceeding without clear consent can cause serious harm."

**YELLOW Pause Moment:**
- Large triangle warning icon
- Header: "Pause & Check"
- Subtext: "Take a moment before continuing."
- Message: Specific caution based on classification
- Button: "I understand" (required to proceed)
- Footer: "When things are unclear, a simple check-in helps."

---

## 5. API Integration

### 5.1 AI Model Selection

**Primary Model:** Anthropic Claude 3.5 Sonnet (`claude-sonnet-4-20250514`)

**Rationale:**
- Superior reasoning for nuanced consent scenarios
- Better tone alignment with peer-to-peer philosophy
- Strong safety guardrails built into the model
- Consistent JSON output formatting

### 5.2 API Request Format (Prevention Flow)

**Endpoint:** `https://api.anthropic.com/v1/messages`

**Request Structure:**
```javascript
{
  method: "POST",
  headers: {
    "x-api-key": ANTHROPIC_API_KEY,  // Server-side only
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json"
  },
  body: {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,  // See below
    messages: [
      { 
        role: "user", 
        content: formatSelectionsForAI(selections, moveLabel)
      }
    ]
  }
}
```

**Input Formatting (`formatSelectionsForAI`):**
```
Selected Move: Kiss

Orientation: We're together in person
Signals from the other person: Mixed or hard to read
Context factors: Alcohol or drugs involved
Momentum: Toward something physical

Additional context from the user:
"[user's free text if provided]"

FLAGGED: entitlement, dismissing boundaries

System-computed risk level: red
Reasoning: No response + physical intent, Flag words detected
```

### 5.3 System Prompts

**Prevention Explanation (RED/YELLOW):**
```
You are ito - you help teenage boys (14-18) understand consent.

IMPORTANT: The risk level has ALREADY been determined by the system. 
Do NOT override or reassess it. Your job is to EXPLAIN why this risk 
level applies, not to judge it.

CONTEXT: The user is thinking about making a move: [SELECTED_MOVE]

TONE:
- Direct, not preachy. Like an older brother, not a teacher.
- No lectures. Keep it real and conversational.
- Use normal capitalization and punctuation.
- 8th grade reading level
- Avoid em dashes

YOUR ROLE:
1. Accept the pre-computed risk level as fact
2. Explain what's happening in this specific situation
3. Reference the specific move they're considering
4. Describe why the signals/context led to this classification
5. Offer concrete alternatives that would be safer

CRITICAL - FLAGGED LANGUAGE:
When flagged language is detected, you MUST:
- Directly call out the specific problematic word or attitude
- Reference what they actually said, not system labels
- Explain WHY this framing is harmful
- Do NOT be preachy - be direct and matter-of-fact
- NEVER output phrases like "FLAGGED CONCERNING LANGUAGE"

CRITICAL RULES:
- Do NOT say "I would classify this as..." or "This seems like..."
- Do NOT override the system's risk assessment
- Focus on explanation, not judgment
- Never blame the other person
- Never suggest manipulation tactics
- Keep it brief and actionable
```

**Prevention Explanation (GREEN/Neutral):**
```
You are ito - you help teenage boys (14-18) understand consent.

IMPORTANT: The system has determined there are no immediate red flags, 
but this is NOT approval or permission to proceed.

CONTEXT: The user is thinking about making a move: [SELECTED_MOVE]

TONE:
- Brief and neutral. Not celebratory.
- No reassurance that they're "good to go"
- 8th grade reading level

YOUR ROLE:
1. Acknowledge that no hard stop was detected
2. Briefly summarize what's happening
3. Remind that consent is ongoing and can change
4. Do NOT provide extensive guidance

CRITICAL RULES:
- NEVER imply permission or approval
- NEVER say "you're good" or "safe to proceed"
- Keep response SHORT
- Always include reminder about ongoing consent
- Return empty arrays for whatNotToDo and whatToDoInstead
```

### 5.4 Response Schema (Prevention)

```json
{
  "assessment": "2-3 sentence explanation (addresses flagged language if present)",
  "whatsHappening": ["bullet 1", "bullet 2", "bullet 3"],
  "whatNotToDo": ["action 1", "action 2"],
  "whatToDoInstead": ["action 1", "action 2"],
  "realTalk": "One sentence self-interest angle"
}
```

### 5.5 Edge Function Security

**Input Validation (all edge functions):**
```typescript
// Server-side validation
if (!text?.trim()) {
  return new Response(
    JSON.stringify({ error: "Input is required" }),
    { status: 400, headers: corsHeaders }
  );
}

if (text.length > 5000) {
  return new Response(
    JSON.stringify({ error: "Input is too long" }),
    { status: 400, headers: corsHeaders }
  );
}
```

**Error Handling (generic messages to client):**
```typescript
catch (error) {
  console.error("Error in function:", error);
  // Generic message - no stack traces or internal details
  return new Response(
    JSON.stringify({ error: "Service temporarily unavailable" }),
    { status: 500, headers: corsHeaders }
  );
}
```

**Rate Limit Handling:**
```typescript
if (response.status === 429) {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
    { status: 429, headers: corsHeaders }
  );
}
```

---

## 6. Non-Bot Guardrails

### 6.1 Multi-Layer Safety Architecture

ito uses **defense in depth** - multiple independent safety layers that don't rely solely on AI judgment:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: FRONTEND DETERMINISTIC RULES                      │
│  - Hard-coded risk classification                           │
│  - "said-no" ALWAYS = RED, regardless of AI output         │
│  - Static flag word detection (regex patterns)              │
│  - Session pattern tracking                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: UI GATES                                          │
│  - Stop Moment requires explicit "I understand" click       │
│  - Cannot skip or dismiss without acknowledgment            │
│  - Follow-up chat gated behind explicit choice              │
│  - Refusal state blocks further assistance                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: AI PROMPT CONSTRAINTS                             │
│  - AI receives pre-computed risk level as INPUT             │
│  - System prompt forbids overriding risk assessment         │
│  - Required phrases ensure consistent messaging             │
│  - Forbidden language list prevents permission-granting     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: EDGE FUNCTION VALIDATION                          │
│  - Input length limits (5000 chars max)                     │
│  - Generic error messages (no information leakage)          │
│  - Rate limiting to prevent abuse                           │
│  - Graceful fallback if AI fails                            │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 What the AI Cannot Do

| Action | Prevented By |
|--------|-------------|
| Override RED classification | Frontend calculates risk before AI is called |
| Grant permission to proceed | GREEN state is internal-only, never displayed as approval |
| Skip Stop Moment | UI requires explicit click to proceed |
| Access user data | No authentication, no persistent storage |
| Change its own prompt | Prompts are server-side in edge functions |
| See conversation across sessions | Stateless architecture, session-only memory |

### 6.3 Session Pattern Awareness

Located in: `src/hooks/useSessionRiskTracking.ts`

**Tracked within sessionStorage (browser session only):**
- Number of completed `/before` runs
- Count of YELLOW or RED outcomes
- Count of runs with detected coercive/flagged language

**Pattern Warning Display:**
If ≥2 YELLOW or RED outcomes in a session, display neutral observation at welcome screen:
> "You've run into a few situations like this. That's often a sign it's time to slow things way down."

This is informational, not corrective. No persistence across sessions.

### 6.4 Refusal State

**Trigger conditions (ALL must be true):**
1. Repeated coercive/dehumanizing language detected
2. User continues seeking reassurance or ways to continue
3. Risk level is RED

**Refusal behavior:**
- Display RefusalCard component
- Header: "I can't help with this."
- Copy: "The situation you're describing has clear signs that the other person isn't comfortable. The only move here is to stop."
- No further guidance provided
- Only option: Start over

---

## 7. Other Flows

### 7.1 Flow B: Accountability ("I think I crossed a line")

**Route:** `/after`

**Purpose:** Help users who believe they may have harmed someone to reflect, understand impact, and consider accountability.

**Edge Functions:**
- `analyze-crossed-line` — Initial structured reflection
- `crossed-line-followup` — Follow-up conversation

**Response Schema:**
```json
{
  "clarityCheck": "string",
  "otherPersonPerspective": "string", 
  "yourPatterns": "string",
  "accountabilitySteps": "string",
  "avoidingRepetition": "string"
}
```

### 7.2 Flow C: Survivor Support ("Something happened to me")

**Route:** `/happened-to-me`

**Purpose:** Provide a safe, anonymous space for someone to process an experience where they feel a boundary may have been crossed WITH them.

**Edge Function:** `analyze-someone-crossed`

**Response Schema (First Message):**
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

---

## 8. Technical Specifications

### 8.1 Input Validation

| Parameter | Client-side | Server-side |
|-----------|------------|-------------|
| Max length | 800 chars (free text) | 5000 chars (edge function) |
| Min length | Non-empty (for required steps) | Non-empty |
| Encoding | UTF-8 | UTF-8 |

### 8.2 Error Handling

| Error Type | User Message |
|------------|--------------|
| Rate limit (429) | "Rate limit exceeded. Please try again in a moment." |
| Service error (500) | "Service temporarily unavailable" |
| AI parse error | Graceful fallback with generic supportive message |
| Network error | "Having trouble connecting. Please try again." |
| Language analysis failure | Graceful fallback to static detection only |

### 8.3 Edge Function Configuration

```toml
# supabase/config.toml
project_id = "ochulsnvnqcbzqnlkazu"

[functions.analyze-vibecheck]
verify_jwt = false

[functions.analyze-crossed-line]
verify_jwt = false

[functions.analyze-someone-crossed]
verify_jwt = false

[functions.crossed-line-followup]
verify_jwt = false

[functions.vibecheck-followup]
verify_jwt = false

[functions.analyze-language]
verify_jwt = false
```

**Note:** `verify_jwt = false` is intentional for anonymous access. No user authentication required.

---

## 9. UI Components (v5.0)

| Component | Path | Purpose |
|-----------|------|---------|
| `Before` | `src/pages/Before.tsx` | Main page orchestrator |
| `MoveSelection` | `src/components/prevention/MoveSelection.tsx` | Phase 1: Move picker + ladder |
| `MutualityGrounding` | `src/components/prevention/MutualityGrounding.tsx` | Phase 3: Signals + in-between options |
| `DecisionStep` | `src/components/prevention/DecisionStep.tsx` | Reusable button-based step |
| `ContextInput` | `src/components/prevention/ContextInput.tsx` | Optional free text input |
| `StopMoment` | `src/components/prevention/StopMoment.tsx` | Full-screen brake |
| `ExplanationCard` | `src/components/prevention/ExplanationCard.tsx` | AI response display (RED/YELLOW) |
| `AnimatedExplanationCard` | `src/components/prevention/AnimatedExplanationCard.tsx` | Animated wrapper for explanations |
| `NeutralExplanationCard` | `src/components/prevention/NeutralExplanationCard.tsx` | Neutral response display (GREEN) |
| `PostExplanationChoice` | `src/components/prevention/PostExplanationChoice.tsx` | Done/Talk more binary choice |
| `FollowUpChat` | `src/components/prevention/FollowUpChat.tsx` | Multi-turn follow-up |
| `ConversationalChat` | `src/components/prevention/ConversationalChat.tsx` | Chat UI wrapper component |
| `OutcomeCheck` | `src/components/prevention/OutcomeCheck.tsx` | Self-report buttons |
| `OutcomeFeedback` | `src/components/prevention/OutcomeFeedback.tsx` | One-line reflective feedback |
| `SessionPatternWarning` | `src/components/prevention/SessionPatternWarning.tsx` | Pattern awareness display |
| `RefusalCard` | `src/components/prevention/RefusalCard.tsx` | Adversarial use refusal |
| `AfterHandoff` | `src/components/prevention/AfterHandoff.tsx` | Soft redirect to accountability flow |

---

## 10. Support Resources

### 10.1 Always-Available Resources

| Resource | URL | Use Case |
|----------|-----|----------|
| RAINN | rainn.org | Sexual assault support |
| 1in6 | 1in6.org | Male survivors |
| Crisis Text Line | crisistextline.org | General crisis support |
| Love Is Respect | loveisrespect.org | Healthy relationships |

### 10.2 Display Guidelines
- Show resources non-intrusively (footer or collapsible card)
- Never require clicking resources before using the tool
- Include resources in accountability flow for the OTHER person who may need support

---

## 11. File Structure

```
ito/
├── src/
│   ├── pages/
│   │   ├── Index.tsx               # Landing page
│   │   ├── Before.tsx              # Prevention flow (Moves + Ladder)
│   │   ├── After.tsx               # Accountability flow
│   │   ├── HappenedToMe.tsx        # Survivor flow
│   │   ├── About.tsx
│   │   ├── Resources.tsx
│   │   └── Demo.tsx                # Internal documentation
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── RiskBadge.tsx
│   │   └── prevention/
│   │       ├── MoveSelection.tsx        # NEW: Phase 1
│   │       ├── MutualityGrounding.tsx   # NEW: Phase 3
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
│   │       └── AfterHandoff.tsx
│   ├── hooks/
│   │   └── useSessionRiskTracking.ts
│   ├── lib/
│   │   ├── riskClassification.ts   # Deterministic rules + static flags
│   │   └── aiLanguageAnalysis.ts   # AI detection integration
│   └── types/
│       └── risk.ts                 # RiskLevel type definitions
├── supabase/
│   ├── config.toml                 # Edge function configuration
│   └── functions/
│       ├── analyze-vibecheck/index.ts
│       ├── analyze-language/index.ts
│       ├── analyze-crossed-line/index.ts
│       ├── crossed-line-followup/index.ts
│       ├── vibecheck-followup/index.ts
│       └── analyze-someone-crossed/index.ts
└── docs/
    ├── PRD.md                      # This document
    ├── COPY_AUDIT.md               # UI text inventory
    └── ONE_PAGER.md                # Shareable overview
```

---

## 12. Changelog

### v5.0 (January 2026)
- **Moves + Ladder Architecture**: Three-phase flow replacing linear decision steps
- **Phase 1 Move Selection**: Users name specific action before assessment
- **Visual Ladder**: Orientation aid showing intimacy spectrum
- **Phase 3 Grounding Output**: Mutuality signals + in-between options
- **Rebranding**: "Vibecheck" → "ito" (is this ok?)
- **Route Updates**: `/avoid-line` → `/before`, `/crossed-line` → `/after`, `/someone-crossed` → `/happened-to-me`
- **AI Model Migration**: Gemini → Claude 3.5 Sonnet for better reasoning
- **Security Hardening**: Input validation, generic error messages across all edge functions
- **Privacy Banner**: Prominent "Nothing is saved" at flow start
- **New Components**: MoveSelection, MutualityGrounding

### v4.0 (January 2026)
- **Observation-First Flow**: Reordered steps to prioritize observed consent signals
- **Orientation Step**: Added Step 0 to orient user in time/context
- **Momentum Check**: Replaced "intent" question with "momentum" framing
- **Non-Permissive GREEN**: GREEN is internal-only; displays as neutral
- **Session Pattern Awareness**: Local-only tracking of repeated risk patterns
- **Refusal State**: System refuses when adversarial use detected
- **Outcome Feedback**: One-line reflective feedback after outcome selection

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

## 13. Glossary

| Term | Definition |
|------|------------|
| **Consent** | Freely given, reversible, informed, enthusiastic, specific agreement |
| **The Ladder** | Visual spectrum of physical intimacy levels, used as orientation aid |
| **Move** | A specific physical action the user is considering |
| **Mutuality Signals** | Observable behaviors indicating both people want the same thing |
| **In-Between Options** | Lower-pressure alternatives to the user's selected move |
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

*This document is intended for internal development and prompt engineering reference. ito is an exploratory prototype and not a substitute for professional support.*

*Live: https://ito.lovable.app*
