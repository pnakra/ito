# vibe check — Complete Copy Audit

**Purpose:** Full text/copy inventory for accessibility review (targeting 14-18 year olds)

---

## HOMEPAGE (/)

### Hero Section
- **Badge:** "No accounts · No tracking · Just clarity"
- **Headline:** "Know the vibe. Know the line."
- **Subhead:** "A quick check-in when you're not sure what's happening — or what happened."

### Three Main Tiles

**Tile 1 - Reality Check**
- Title: "Reality Check"
- Description: "Not sure if something's okay? Think it through first."
- CTA: "Start"

**Tile 2 - Second Thoughts**
- Title: "Second Thoughts"
- Description: "Something already happened? Reflect on it here."
- CTA: "Reflect"

**Tile 3 - Need to Talk**
- Title: "Need to Talk"
- Description: "Something happened to you? Process it at your pace."
- CTA: "Talk"

### What is this? Section
- **Bold:** "A reality check, not a lecture."
- **Text:** "You already know what consent is. This is for when things feel unclear."
- **Bold:** "Completely anonymous."
- **Text:** "No accounts, no tracking. Close the tab and it's gone."
- **Bold:** "Not a replacement for real help."
- **Text:** "If you need support, check the resources."

### Footer Note
- "Add to home screen"
- "Built for early exploration — not a finished product."

---

## REALITY CHECK FLOW (/avoid-line)

### Welcome Card
- **Title:** "Before You Act"
- **Description:** "Answer a few quick questions. Get a reality check. No judgment, no data stored."
- **CTA:** "Start"

### Step 1: Orientation
- **Question:** "Where are you in this situation right now?"
- **Options:**
  - "We're texting or messaging"
  - "We're together in person"
  - "We're at a party or group setting"
  - "Something already happened and I'm unsure"
  - "I'm not sure how to describe it"

### Step 2: Consent Signals
- **Question:** "What have they been doing or saying?"
- **Options:**
  - "Clearly saying yes or expressing interest in words"
  - "Actively initiating or reciprocating"
  - "Mixed or hard to read"
  - "Quiet or not responding"
  - "Said no or pulled away"

### Step 3: Context Factors
- **Question:** "Anything here that might affect how clear consent is?"
- **Subtitle:** "Select all that apply"
- **Options:**
  - "Alcohol or drugs involved"
  - "One of us is much more experienced"
  - "Age or power imbalance"
  - "Emotional pressure"
  - "None of these"

### Step 4: Momentum Check
- **Question:** "What direction does this feel like it's heading?"
- **Options:**
  - "Toward something physical"
  - "Staying flirty or emotional"
  - "I want to slow things down"
  - "I don't know"

### Step 5: Additional Context (Free Text)
- **Placeholder:** "Anything else you want to add? (optional)"
- **Note:** See ContextInput.tsx for full copy

### Stop Moment Overlay

**RED Risk:**
- **Header:** "Hold up"
- **Subtext:** "This needs your attention."
- **CTA:** "Got it, show me more"
- **Footer:** "Taking a moment to think is a good thing."

**YELLOW Risk:**
- **Header:** "Let's pause here"
- **Subtext:** "Just want to make sure you see this."
- **CTA:** "Got it, show me more"
- **Footer:** "Clear communication helps everyone."

### Neutral Explanation Card (GREEN)
- **Badge:** "No hard stop detected right now"
- **Remember section title:** "Remember"
- **Remember text:** "Consent is ongoing and reversible. This is not approval or permission to proceed. If they hesitate, go quiet, or pull back at any point, that's your cue to stop."

### Full Explanation Card (RED/YELLOW)
- **Section titles:**
  - "What's Actually Happening"
  - "What NOT to Do"
  - "What to Do Instead"
  - "Real Talk"

### Refusal Card
- **Title:** "I can't help with continuing this."
- **Text:** "The situation you described involves clear boundaries that need to be respected. The safest move is to stop."
- **CTA:** "Start over"

### Outcome Check Options
- "I stopped or checked in verbally"
- "I checked in and they confirmed they wanted to continue"
- "I decided not to proceed"
- "I'm not sure what happened"

### Outcome Feedback Messages
- **stopped/checked-in:** "Clear pauses and verbal check-ins are what actually prevent harm."
- **didnt-proceed:** "Choosing not to proceed is always a valid way to keep things safe."
- **not-sure:** "If a situation feels confusing, earlier pauses usually make things clearer."

---

## SECOND THOUGHTS FLOW (/crossed-line)

### Intro Screen
- **Title:** "Let's figure out what happened — calmly."
- **Description:** "Sometimes you realize afterward that a moment felt off — or you worry you crossed a boundary. This space helps you slow down and reflect."
- **Note:** "This is a reflective guide — not legal advice or therapy."
- **CTA:** "Start reflecting"

### Input Screen
- **Title:** "What happened?"
- **Instructions:** "Can you describe what happened, in your own words? You don't need to share details — just the parts that feel important to understand."
- **Placeholder:** "Take your time to describe what happened..."

### Results Section Titles
- "Clarity Check"
- "Understanding Others' Boundaries"
- "Understanding Your Patterns"
- "What Accountability Could Look Like"
- "How to Do Better Next Time"

### Follow-Up Chat Section
- **Title:** "Have questions?"
- **Description:** "If you'd like to explore any of these topics further or ask follow-up questions, you can continue the conversation."
- **CTA:** "Continue the conversation"

### Support Resources Box
- **Title:** "If someone was harmed"
- **Text:** "If someone was hurt or uncomfortable, they may also need support. Everyone deserves safety."

### Closing Quote
- "Acknowledging harm doesn't make you a bad person — it means you're taking responsibility for learning and doing better."

---

## NEED TO TALK FLOW (/someone-crossed)

### Intro Screen
- **Title:** "Something felt off. Let's figure it out — at your pace."
- **Disclaimer:** "This is a safe, anonymous space. Nothing you share is stored or logged. This tool does not provide legal advice or therapy — it's a supportive guide."
- **Description:** "Sometimes things happen that leave us confused, uncomfortable, or unsure. You might not have words for it yet — and that's okay. This space is here to help you process what happened."

### Three Info Cards

**Card 1:**
- **Title:** "Your feelings are valid"
- **Text:** "Confusion, mixed emotions, and self-doubt are all normal responses."

**Card 2:**
- **Title:** "No pressure, no labels"
- **Text:** "We won't tell you what to call your experience. That's your decision."

**Card 3:**
- **Title:** "You're in control"
- **Text:** "Share as much or as little as you want. Ask follow-up questions anytime."

- **CTA:** "Start talking"

### Chat Screen
- **Welcome title:** "Share what happened"
- **Instructions:** "In your own words, describe what happened. You don't need to share every detail — just the parts that feel important to you."
- **Subtext:** "Take your time. There's no rush."
- **Placeholder (first message):** "Share what happened..."
- **Placeholder (follow-up):** "Ask a question or share more..."
- **Loading state:** "Taking a moment..."
- **Error fallback:** "I'm having trouble right now. Please try again, or reach out to a trusted person for support."

### AI Response Section Titles (First Message)
- "Understanding What Happened"
- "Your Feelings Are Valid"
- "About Consent"
- "What You Can Do"

---

## RESOURCES PAGE (/resources)

- **Title:** "Resources"
- **Subtitle:** "Sometimes you need more than a vibe check. These are here to help."

### Crisis Support Section
- **Crisis Text Line:** "Text HOME to 741741" — "Free, 24/7 support. Text with a trained crisis counselor."
- **RAINN:** "1-800-656-HOPE (4673)" — "National sexual assault hotline. Free, confidential, 24/7."
- **Teen Line:** "Text TEEN to 839863" — "Talk to another teen who's trained to listen. 6-9 PM PT."
- **Love Is Respect:** "Text LOVEIS to 22522" — "Help understanding healthy relationships."

### Learn More Section
- **Scarleteen:** "Real talk about relationships, consent, and sexuality."
- **Planned Parenthood Teen Resources:** "Honest, accurate info. No judgment."

### Footer Note
- "Asking for help isn't weak — it's smart. All these resources are confidential."

---

## GLOBAL UI ELEMENTS

### Shred Button
- "Clear this session"

### Back Button
- "Back"

### Header
- Brand: "vibe check"

### Footer
- "Anonymous · Nothing stored" (or similar)

---

## SAMPLE AI RESPONSES

### Reality Check — Sample Scenario 1: YELLOW (Mixed Signals)
**User selections:**
- Orientation: In person
- Consent signals: Mixed or hard to read
- Context: Alcohol involved
- Momentum: Toward something physical

**Sample AI Response:**
```json
{
  "riskLevel": "yellow",
  "assessment": "The signals here are unclear, and alcohol is in the mix — which makes everything harder to read. This is a moment to slow way down.",
  "whatsHappening": [
    "Mixed signals usually mean the other person isn't sure yet — and that's important information.",
    "When alcohol is involved, even a 'yes' might not be a clear yes.",
    "Your read of the vibe might not match theirs right now."
  ],
  "whatNotToDo": [
    "Don't assume 'mixed' means 'keep trying until they're sure'",
    "Don't let momentum push past the uncertainty",
    "Don't interpret lack of a 'no' as a 'yes'"
  ],
  "whatToDoInstead": [
    "Ask directly: 'Are you into this? I want to make sure.'",
    "If they hesitate, take that as your answer for now",
    "Suggest picking this up another time when you're both sober"
  ],
  "realTalk": "If you're not sure they're into it, they're probably not sure either — and that's not a green light."
}
```

### Reality Check — Sample Scenario 2: RED (Said No)
**User selections:**
- Orientation: Texting
- Consent signals: Said no or pulled away
- Context: None of these
- Momentum: Toward something physical

**Sample AI Response:**
```json
{
  "riskLevel": "red",
  "assessment": "They said no or pulled away. That's a clear signal — the clearest one there is. This is where you stop.",
  "whatsHappening": [
    "A 'no' or pulling away is a boundary. Full stop.",
    "Continuing to push after this point is where harm happens.",
    "No amount of context changes what 'no' means."
  ],
  "whatNotToDo": [
    "Don't try to convince them to change their mind",
    "Don't ask 'why' or try to negotiate",
    "Don't keep bringing it up hoping they'll come around"
  ],
  "whatToDoInstead": [
    "Respect the boundary without making it weird",
    "Move on in the conversation — don't dwell on it",
    "Let them re-initiate if and when they want to"
  ],
  "realTalk": "They gave you an answer. The only move now is to respect it."
}
```

### Reality Check — Sample Scenario 3: GREEN (Clear Interest)
**User selections:**
- Orientation: In person
- Consent signals: Actively initiating or reciprocating
- Context: None of these
- Momentum: Staying flirty or emotional

**Sample AI Response:**
```json
{
  "assessment": "No obvious concerns right now. They're initiating, you're both engaged, and there's no pressure or power imbalance.",
  "whatsHappening": [
    "Active initiation and reciprocation are good signs.",
    "The context seems balanced — no red flags detected."
  ],
  "whatNotToDo": [],
  "whatToDoInstead": [],
  "realTalk": "Things can change at any moment — keep paying attention to what they're saying and doing, not just what you're hoping for."
}
```

---

### Second Thoughts — Sample Scenario
**User input:** "We were hooking up at a party and I think she froze up at some point but I didn't notice until after. Now I'm worried I pushed too far."

**Sample AI Response:**
```json
{
  "clarityCheck": "It sounds like something happened that's now weighing on you. It's possible the other person did not feel comfortable continuing, even if they didn't say so directly. The fact that you noticed they froze — even after the fact — suggests you picked up on something that didn't feel right.",
  
  "otherPersonPerspective": "Some people freeze up or go quiet—not because they want something to continue, but because they feel uncomfortable, overwhelmed, or unsure how to stop it. A lack of active participation is not consent. If they went quiet or still, that may have been their way of signaling they weren't okay, even if they didn't say it out loud.",
  
  "yourPatterns": "Part of reflection is recognizing what you tend to do when you feel nervous, excited, pressured, or strongly attracted. Learning to pause, breathe, and check in verbally is a key skill — especially if you tend to move quickly or focus more on your own cues than the other person's. Consider: were you paying attention to how they were responding in the moment, or were you focused on where things were heading?",
  
  "accountabilitySteps": "Accountability starts with respecting their space and not seeking contact unless they clearly want it. Repair must be survivor-led. They may not want dialogue, and pushing for it can cause further harm. Accountability also means learning to pause your impulses, notice when someone pulls back or goes quiet, and recognize that stopping is part of healthy sexual behavior. If an appropriate moment arises in the future, a brief and sincere apology focused on your actions — not their reaction — may be appropriate. But the priority now is respecting their boundaries and reflecting on how to act differently moving forward.",
  
  "avoidingRepetition": "Practice checking in verbally — even during non-verbal interactions like kissing — with phrases like 'Is this okay?' or 'Do you want to keep going?' Create opportunities for the other person to disengage or express discomfort at any time. Build the habit of slowing down, tolerating uncertainty, and prioritizing mutual enthusiasm over ambiguity."
}
```

---

### Need to Talk — Sample Scenario
**User input:** "Someone I was seeing kept going after I said I wanted to stop. I said stop and they didn't. I don't know what to think about it."

**Sample AI Response (First Message):**
```json
{
  "acknowledgment": "Thank you for sharing this with me. What you're describing sounds really difficult, and it takes courage to talk about it, even anonymously. I'm here to listen without judgment.",
  
  "whatYouExperienced": "You described saying 'stop' and having that ignored. What happened after that point wasn't something you agreed to. When someone continues after you've asked them to stop, that's a violation of your boundaries — regardless of what happened before or how you felt about the person.",
  
  "yourFeelingsAreValid": "It's completely normal to feel confused, conflicted, or unsure what to 'call' this. You might feel angry, numb, sad, or even nothing at all right now. Some people question themselves or wonder if they did something wrong. Whatever you're feeling — or not feeling — is valid. There's no 'right' way to process this.",
  
  "understandingConsent": "Consent can be given and then taken away at any point. Saying 'stop' is one of the clearest ways to withdraw consent. When someone ignores that, they're choosing to disregard your boundary. That's on them, not you. It doesn't matter what happened before that moment.",
  
  "whatYouCanDo": "You don't have to do anything right now. Some people find it helpful to talk to someone they trust — a friend, family member, or counselor. Others need time to process on their own first. If you want professional support, resources like RAINN (1-800-656-4673) offer confidential help 24/7. Whatever you choose, it's your decision and your timeline.",
  
  "followUpPrompt": "Is there anything specific you're trying to work through, or anything you'd like me to help you think about?"
}
```

---

## NOTES FOR REVIEW

### Language Patterns to Evaluate
1. **Formality level** — Is it too formal for 14-year-olds? Too casual for 18-year-olds?
2. **Vocabulary** — Any words that might be unclear? (e.g., "reciprocating", "autonomy", "accountability")
3. **Sentence length** — Are any passages too dense?
4. **Emotional tone** — Does it feel supportive without being patronizing?
5. **Gender neutrality** — All pronouns should use "they/them/their"

### Key Phrases That Need Teen-Friendliness Check
- "behavioral interruption" → might be too clinical
- "survivor-led" → might need explanation
- "power imbalance" → might need simpler framing
- "mutual enthusiasm over ambiguity" → might be too abstract
- "tolerate uncertainty" → might not land
