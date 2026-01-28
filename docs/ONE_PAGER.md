# vibecheck

**Know the vibe. Know the line.**

---

## What is it?

**vibecheck** is a free, anonymous tool that helps young people navigate consent, boundaries, and accountability in real time.

It's not a chatbot. It's not a lecture. It's a reality check — designed to interrupt risky behavior before harm happens.

---

## The Problem

Sexual harm among young people is staggeringly common. Most prevention education happens in classrooms, months or years before the moments that matter. When someone is actually in a situation — unsure if what they're about to do is okay — there's nothing there.

Meanwhile:
- Young people don't want to ask parents or teachers
- "Just don't do it" messaging doesn't work
- Most tools focus on aftermath, not prevention
- Consent education rarely meets people in the moment

---

## The Solution

vibecheck meets people **in the moment they need it most** — before they act.

Three pathways based on where someone is:

| If you're thinking... | We help you... |
|----------------------|----------------|
| "I'm not sure if this is okay" | Pause, assess consent signals, and decide |
| "I think I crossed a line" | Reflect without shame, and consider accountability |
| "Someone crossed a line with me" | Process what happened on your terms |

---

## How It Works

### Prevention Flow (`/avoid-line`)

A structured 5-step flow that asks:
1. **Where are you?** (orientation)
2. **What are they doing/saying?** (observed consent signals)
3. **Any complicating factors?** (alcohol, power imbalance, etc.)
4. **Where is this heading?** (momentum check)
5. **Anything else?** (optional free text)

Then the system:
- **Calculates risk deterministically** (not AI judgment)
- **Forces a pause** if needed (mandatory "Stop Moment")
- **Explains why** in plain, direct language

The AI explains; it doesn't decide. The system is the brake.

---

## Why It's Different

| Traditional Approach | vibecheck |
|---------------------|-----------|
| Classroom lectures | In-the-moment intervention |
| Moralizing tone | "Older brother" directness |
| AI makes decisions | System rules; AI explains |
| Asks about intent first | Asks about the other person first |
| Green = approval | No green light, ever |

**Core principle:** This is a behavioral interruption tool, not a consent class or therapist.

---

## Key Design Decisions

### 1. No Permission, Ever
Even when no red flags are detected, the system explicitly states:
> "This is not approval or permission to proceed."

### 2. Observation Before Intention
Users describe what the other person is doing before describing their own plans. This centers the other person's experience first.

### 3. System Rules Over AI Judgment
Risk classification is deterministic. The AI cannot override a "STOP" signal. Rules are locked in code, not prompt.

### 4. Mandatory Friction
For risky situations, users must acknowledge a full-screen "Stop Moment" before seeing any explanation. This is a brake, not a suggestion.

### 5. Zero Data Storage
No accounts. No logs. No tracking. Everything resets when you close the tab.

---

## Who It's For

**Primary:** Young men ages 14-24 navigating dating and hookups

**Also serves:**
- Anyone questioning their own past behavior
- Anyone processing a confusing or harmful experience
- Educators/counselors who want to recommend a resource

---

## Why Now?

- **Gen Z expects digital-first resources** — they won't call a hotline or see a counselor for "maybe" situations
- **AI makes real-time guidance possible** — but only if designed with strict guardrails
- **The consent conversation is stuck** — we've been repeating the same classroom approaches for decades
- **Harm prevention > harm response** — most resources focus on what to do after. We focus on before.

---

## What We're Not

- ❌ Not a therapist or counselor
- ❌ Not legal advice
- ❌ Not a chatbot you can manipulate for permission
- ❌ Not a tool that stores your data or tracks you
- ❌ Not a replacement for real human support

---

## Current Status

**Early prototype / exploratory.**

This is a proof-of-concept built to test whether this approach resonates and works. It is not a finished product.

---

## Built With

- React + TypeScript frontend
- AI explanations via Gemini (through Lovable Cloud)
- Deterministic risk classification (no AI judgment on risk level)
- Zero backend storage — fully stateless

---

## Get Involved

We're looking for:
- **Feedback** from young people, educators, and counselors
- **Subject matter experts** to review prompts and flows
- **Partners** interested in piloting in schools or youth programs

---

## Try It

**Live preview:** [approach-coach.lovable.app](https://approach-coach.lovable.app)

---

*Built for early exploration — not a finished product.*

*vibecheck is not a substitute for professional support. If you or someone you know needs help, visit [rainn.org](https://rainn.org) or text HOME to 741741.*
