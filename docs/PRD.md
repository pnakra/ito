# Vibecheck — Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** January 2026  
**Version:** 2.0 — Decision-First Refactor  
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

### 1.3 Core Principles
1. **Anonymity First** — No accounts, no data storage, no tracking
2. **Non-Judgmental** — Supportive guidance without shame or lectures
3. **Harm Reduction** — Practical, actionable advice over moralizing
4. **User Autonomy** — Users define their own experiences; we don't label for them
5. **Balanced Support** — Validation, information, and options in equal measure

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
│               RISK CLASSIFICATION LAYER                      │
│            (Deterministic Frontend Logic)                    │
├─────────────────────────────────────────────────────────────┤
│  src/lib/riskClassification.ts                              │
│  - Maps user selections → risk level (red/yellow/green)     │
│  - Enforces hard rules (e.g., "no response" = yellow+)      │
│  - LLM does NOT determine risk level                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTIONS (Deno)                     │
├─────────────────────────────────────────────────────────────┤
│  analyze-vibecheck        │  Prevention EXPLANATION AI      │
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

**Prevention Flow (Decision-First):**
1. User answers 3 guided questions via buttons
2. Frontend deterministically calculates risk level
3. If RED/YELLOW: Mandatory "Stop Moment" displayed
4. User acknowledges → Edge function called with pre-computed risk
5. AI explains (does not assess) the risk level
6. Outcome check: User self-reports what they did

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
- **Outcome check** — Self-reported, aggregate only, no raw text storage

---

## 4. Flow Specifications

## 4.1 Flow A: Prevention ("I want to avoid crossing a line")

### Route
`/avoid-line`

### Purpose
Interrupt risky behavior in the moment. Help users recognize consent signals and make better decisions BEFORE acting.

### Interaction Model (v2.0 — Decision-First)
**Guided decision sequence → Stop Moment → AI Explanation → Outcome Check**

This is NOT a chatbot. It is a consent risk assessment and behavioral interruption tool.

### Target Persona
Primarily teenage boys (14-18) navigating dating/hookup situations for the first time.

### User Journey

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Step 1:       │     │  Step 2:       │     │  Step 3:       │
│  INTENT CHECK  │ ──► │  CONSENT       │ ──► │  CONTEXT       │
│  (buttons)     │     │  SIGNALS       │     │  FACTORS       │
│                │     │  (buttons)     │     │  (multi-select)│
└────────────────┘     └────────────────┘     └────────────────┘
                                                      │
                                                      ▼
                              ┌──────────────────────────────────┐
                              │   DETERMINISTIC RISK CALCULATION │
                              │   (Frontend: riskClassification.ts)
                              └──────────────────────────────────┘
                                              │
                    ┌───────────────┬─────────┴─────────┐
                    ▼               ▼                   ▼
              ┌──────────┐   ┌──────────┐        ┌──────────┐
              │   RED    │   │  YELLOW  │        │  GREEN   │
              │   STOP   │   │  PAUSE   │        │   ───►   │
              │  MOMENT  │   │  MOMENT  │        │ Explain  │
              └────┬─────┘   └────┬─────┘        └──────────┘
                   │              │
                   └──────┬───────┘
                          ▼
                  ┌───────────────┐
                  │ "I understand"│
                  │   (required)  │
                  └───────┬───────┘
                          ▼
                 ┌─────────────────┐
                 │  AI EXPLANATION │
                 │  (does NOT      │
                 │  assess risk)   │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │  OUTCOME CHECK  │
                 │  (self-report)  │
                 └─────────────────┘
```

### Decision Step Options

**Step 1: Intent Check**
> "What are you thinking about doing next?"

| ID | Label |
|----|-------|
| `go-to-their-place` | Go to their place |
| `invite-to-mine` | Invite them to mine |
| `keep-texting` | Keep texting / messaging |
| `physical-move` | Make a physical move |
| `not-sure` | I'm not sure yet |

**Step 2: Consent Signal Check**
> "What signals have you gotten from them?"

| ID | Label | Description |
|----|-------|-------------|
| `clear-yes` | Clear yes in words | They explicitly said yes |
| `enthusiastic-actions` | Enthusiastic actions | Initiating, leaning in, reciprocating |
| `mixed-signals` | Mixed / unclear signals | Sometimes interested, sometimes pulling back |
| `no-response` | No response | They haven't replied or acknowledged |
| `said-no` | They said no or pulled away | Verbal refusal or physical withdrawal |

**Step 3: Context Risk Factors**
> "Anything here that might complicate consent?" (Multi-select)

| ID | Label |
|----|-------|
| `alcohol` | Alcohol or drugs involved |
| `experience-gap` | One of us is much more experienced |
| `age-imbalance` | Age or power imbalance |
| `emotional-pressure` | Emotional pressure |
| `none` | None of these |

### Deterministic Risk Classification Rules

Located in: `src/lib/riskClassification.ts`

**Hard Rules (LLM Cannot Override):**

| Condition | Result |
|-----------|--------|
| `said-no` (any intent) | 🔴 RED |
| `no-response` + physical intent | 🔴 RED |
| `no-response` + other intent | 🟡 YELLOW |
| `mixed-signals` + physical intent | 🔴 RED |
| `mixed-signals` + other intent | 🟡 YELLOW |
| `alcohol` + physical intent | 🔴 RED |
| 2+ context factors | 🔴 RED |
| 1 context factor + physical intent | 🟡 YELLOW |
| Clear positive signals + no factors | 🟢 GREEN |
| Clear positive + 1 factor | 🟡 YELLOW |

*Physical intent = `go-to-their-place`, `invite-to-mine`, or `physical-move`*

### Stop Moment Component

For RED and YELLOW risk levels, a full-screen modal appears:

**RED Stop Moment:**
- Large octagon icon
- Header: "STOP"
- Message: Specific action to NOT take (e.g., "Do not go to their place tonight.")
- Button: "I understand" (required to proceed)
- Subtext: "Proceeding without consent can cause serious harm."

**YELLOW Pause Moment:**
- Large triangle warning icon
- Header: "PAUSE"
- Message: Specific caution (e.g., "Check in verbally before proceeding.")
- Button: "I understand" (required to proceed)
- Subtext: "Clear communication protects both of you."

### Edge Function
`analyze-vibecheck`

### AI System Prompt (Explanation Mode)

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

CRITICAL RULES:
- Do NOT say "I would classify this as..." or "This seems like..."
- Do NOT override the system's risk assessment
- Focus on explanation and education, not judgment
- Never blame the other person
- Never suggest manipulation tactics
- Keep it brief and actionable
```

### Request Format

```json
{
  "scenario": "Intent: Going to their place\nConsent signals: No response\nContext factors: Alcohol involved",
  "precomputedRiskLevel": "red"
}
```

### Response Schema

```json
{
  "assessment": "2-3 sentence explanation of what's happening",
  "whatsHappening": ["bullet 1", "bullet 2", "bullet 3"],
  "whatNotToDo": ["action 1", "action 2", "action 3"],
  "whatToDoInstead": ["action 1", "action 2", "action 3"],
  "realTalk": "One sentence self-interest angle"
}
```

### Outcome Check

After the explanation, users see:
> "What did you end up doing?"

| ID | Label |
|----|-------|
| `stopped` | I stopped |
| `checked-in` | I checked in verbally |
| `didnt-proceed` | I didn't go through with it |
| `not-sure` | I'm not sure / I ignored this |

**Privacy:** No raw text stored. Aggregate counts only if analytics exist.

### UI Components (v2.0)

| Component | Path | Purpose |
|-----------|------|---------|
| `AvoidLine` | `src/pages/AvoidLine.tsx` | Main page orchestrator |
| `DecisionStep` | `src/components/prevention/DecisionStep.tsx` | Reusable button-based step |
| `StopMoment` | `src/components/prevention/StopMoment.tsx` | Full-screen brake |
| `ExplanationCard` | `src/components/prevention/ExplanationCard.tsx` | AI response display |
| `OutcomeCheck` | `src/components/prevention/OutcomeCheck.tsx` | Self-report buttons |

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
| Prevention | JSON with arrays | Scannable bullet points for quick reading |
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
| Max length | 2000 chars (textarea) | 5000 chars (edge function) |
| Min length | Non-empty | Non-empty |
| Encoding | UTF-8 | UTF-8 |

### 7.2 Error Handling

| Error Type | User Message |
|------------|--------------|
| Rate limit (429) | "Rate limit exceeded. Please try again in a moment." |
| Payment required (402) | "Service requires payment. Please contact support." |
| AI parse error | Graceful fallback with generic supportive message |
| Network error | "Having trouble connecting. Please try again." |

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
| **Green flag** | Clear indicators of enthusiastic consent |

---

## 10. Appendix: File Structure

```
vibecheck/
├── src/
│   ├── pages/
│   │   ├── Index.tsx           # Landing page
│   │   ├── Chat.tsx            # Prevention flow (/avoid-line)
│   │   ├── CrossedLine.tsx     # Accountability flow (/crossed-line)
│   │   ├── SomeoneCrossedLine.tsx  # Survivor flow (/someone-crossed)
│   │   ├── About.tsx
│   │   └── Resources.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── RiskBadge.tsx
│   └── ...
├── supabase/
│   └── functions/
│       ├── analyze-vibecheck/index.ts
│       ├── analyze-crossed-line/index.ts
│       ├── crossed-line-followup/index.ts
│       └── analyze-someone-crossed/index.ts
└── docs/
    └── PRD.md                  # This document
```

---

*This document is intended for internal development and prompt engineering reference. Vibecheck is an exploratory prototype and not a substitute for professional support.*
