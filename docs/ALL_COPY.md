# ito — Complete Static Copy Reference

> All user-facing text across the tool, excluding AI-generated responses.
> Generated for persona-based synthetic testing.

---

## 1. CONSENT MODAL (ConsentModal.tsx)

**Title:** "Before you begin"

**Body:**
- "This is a research prototype, not a production product. It's being tested to understand how AI can help people think through difficult situations."
- "Your responses are logged anonymously to help us evaluate and improve the tool. No personally identifiable information (name, email, IP address) is collected or stored."
- "This is not a crisis service. If you need immediate support, please contact a crisis resource."

**Checkboxes:**
- "I understand this is a research prototype and not a substitute for professional support"
- "I consent to my anonymous responses being logged for research purposes"

**Button:** "Continue"

---

## 2. HEADER (Header.tsx)

**Logo:** "ito" / "is this ok?"

**Nav links:** "About", "Resources"

---

## 3. FOOTER (Footer.tsx)

"© {year} is this ok?"

---

## 4. HOME PAGE (Index.tsx)

**Hero headline (typewriter):** "is this ok?"

**Primary CTA:**
- Title: "Something's on my mind"
- Subtitle: "Stop and think through a confusing situation."

**Guided mode CTA:**
- "Not sure where to start? Answer some guided questions first"

**About accordion trigger:** "About ito"

**About accordion content:**
- "ito is an AI-powered tool that helps you understand if things are consensual, even if things are confusing."
- "Totally private. No need to create an account. Everything gets deleted when you close the tab."
- "Not a replacement for real support. If you need to talk to someone, check the resources."

---

## 5. CHECK-IN PAGE — Narrative Input (CheckIn.tsx + NarrativeInput.tsx)

### Privacy Banner
- "No data is stored long-term."
- "Your input is processed for analysis but not retained."

### Narrative Input
**Heading:** "What's going on?"
**Subheading:** "Describe what happened or what you're thinking about. Write as much or as little as you want."

**Rotating placeholders:**
1. "Tell me what's going on."
2. "You can write this like a Reddit post or text to a friend."
3. "Something happen or something might happen?"
4. "What are you unsure about?"

**Guided mode toggle:** "Not sure how to start? Use guided mode."

**Button:** "Continue"

---

## 6. GUIDED MODE (GuidedMode.tsx)

**Heading:** "Let's walk through it"
**Subheading:** "Answer what feels right. These help me give you better advice."

**Back link:** "Back to free write"

### Questions:

1. **Timing:** "Is this something that already happened, or something you're thinking about?"
2. **Relationship:** "Who's the other person?"
   - Placeholder: "This helps me understand the situation"
3. **What happened:** "What happened or what's the situation?"
   - Placeholder: "Describe what's going on..."
4. **Physical stage:** "What are you thinking about?" (future) / "Has anything physical happened?" (past)
5. **Ages:** "Rough ages help me give better advice"
   - Labels: "You" / "Them"
   - Placeholders: "Your age" / "Their age"
6. **Worried about:** "What are you worried about?"
   - Placeholder: "This helps me understand what matters to you"
7. **Intent:** "What are you hoping to figure out?"

**Button:** "Continue"

---

## 7. SIGNAL FLOOR (SignalFloor.tsx)

**Heading:** "A couple quick things that help me be more accurate"
**Subheading:** "Skip if you want — these just make the advice better."

### Questions (same options as Guided Mode):
1. **Timing:** "Is this something that already happened, or something you're thinking about?"
2. **Physical stage:** "What are you thinking about?" (future) / "Has anything physical happened?" (past)
3. **Ages:** "Rough ages help me give better advice"
4. **Intent:** "What are you hoping to figure out?"

**Buttons:** "Skip these" / "Continue"

---

## 8. STRUCTURED SIGNAL OPTIONS (types/signals.ts)

### Timing
- "This already happened"
- "I'm trying to decide what to do next"
- "Not sure"

### Physical Stage
- "Nothing physical yet"
- "Talking / flirting"
- "Holding hands / cuddling"
- "Kissed"
- "Touching over clothes"
- "Touching under clothes"
- "Clothes off but not sex"
- "Sex"

### Age Bands
- "Under 16"
- "16–17"
- "18–24"
- "25+"

### Intent
- "If something was okay"
- "What to do next"
- "How to talk about it"
- "If I should be worried"
- "Just want clarity"

### Relationship
- "Friend"
- "Partner / boyfriend / girlfriend"
- "Someone I'm dating"
- "Someone older than me"
- "Someone I don't know well"
- "Other"

---

## 9. ADAPTIVE FOLLOW-UP (AdaptiveFollowUp.tsx)

**Heading:** "A couple quick questions"
**Subheading:** "These help me understand better. Skip any you don't want to answer."

**Placeholder:** "Optional"
**Loading text:** "Looking at your situation..."
**Buttons:** "Skip these" / "Continue" or "Skip"

---

## 10. STOP MOMENT (StopMoment.tsx)

**Red header:** "Wait"
**Yellow header:** "One second"

**Message:** (dynamic from riskClassification — `stopMessage`)

**Button:** "See what this means for you"

---

## 11. REFUSAL CARD (RefusalCard.tsx)

**Heading:** "I can't help you continue here."
**Body:** "Clear boundaries were set. The safest move is to stop."
**Button:** "Start over"

---

## 12. SESSION PATTERN WARNING (SessionPatternWarning.tsx)

"You've been here a few times now. That might mean it's time to slow things down for a bit."

---

## 13. RISK BADGE (RiskBadge.tsx)

**Red:** "Hard Stop"
**Yellow:** "Pause & Check"
**Green:** "Check in with them"

**Green disclaimer:** "This tool only sees what you typed. It cannot tell you whether something is okay. Only the other person can do that."

**Universal disclaimer (lg):** "This is a reflection tool, not a legal or moral ruling. Only the other person can give consent."

---

## 14. POST-EXPLANATION CHOICE (PostExplanationChoice.tsx)

**Heading:** "Did we get it right?"
**Subheading:** "If something's off or there's more to the story, you can tell us."

**Options:**
- "I want to share more" — "Clarify something or add details"
- "That makes sense" — "I'm good for now"

---

## 15. CONVERSATIONAL CHAT (ConversationalChat.tsx)

**Heading:** "Let's talk through it"
**Subheading:** "Share more, ask questions, or clarify anything."

**Placeholder:** "Type here..."
**Buttons:** "I'm done" / "Send"

---

## 16. MUTUALITY GROUNDING (MutualityGrounding.tsx)

**Section header:** "Be honest with yourself"

### Per-move checks:
**Sit closer:**
- "Are they moving closer too, or just not leaving?"
- "Not pulling away is not the same as wanting you there."

**Hold hands:**
- "Are they holding back, or just letting it happen?"
- "If you let go, would they reach for you again?"

**Kiss:**
- "Are they leaning in, or are you the only one moving?"
- "Not stopping you is not the same as wanting it."

**Touch over clothes:**
- "Are they responding, or just not stopping you?"
- "Silence is not a yes. Have you actually asked?"

**Touch under clothes:**
- "Have you asked clearly? Not hinted. Asked."
- "Going along with it is not the same as wanting it."

**Have sex:**
- "Are they enthusiastic, or just not saying no?"
- "Can either of you stop without it being a problem?"

### Uncertainty communication options header: "If you're unsure, ask them"
**Subtext:** "These are ways to check in. The goal is to hear what they actually want, not to find a workaround."

**Kiss:**
- "Ask: 'Can I kiss you?'"
- "Say: 'I'd like to kiss you. How do you feel about that?'"
- "Check: 'Is this okay?' before leaning in"

**Touch over clothes:**
- "Ask: 'Is this okay?'"
- "Say: 'Tell me if you want me to stop'"
- "Check: 'Do you want this?'"

**Touch under clothes:**
- "Ask clearly: 'Can I touch you here?'"
- "Say: 'I want to check in with you'"
- "Ask: 'What do you want right now?'"

**Have sex:**
- "Have an actual conversation about what you both want"
- "Ask: 'Are you sure you want this?'"
- "Say: 'I need to know you want this too'"

**Footer:** "If asking feels awkward, that might be a sign you're not ready."

---

## 17. OUTCOME CHECK (OutcomeCheck.tsx)

**Heading:** "What did you do?"
**Subheading:** "Just for you to think about. Nothing is saved."

**Options:**
- "I stopped"
- "I asked if they were okay"
- "I decided not to do it"
- "I'm not sure / I didn't follow this"

---

## 18. OUTCOME FEEDBACK (OutcomeFeedback.tsx)

- **stopped / checked-in:** "Stopping or asking is how you make sure everyone's okay."
- **didnt-proceed:** "Not going through with it is always an okay choice."
- **not-sure:** "When things feel confusing, it usually helps to slow down sooner."

**Button:** "Start over"

---

## 19. AFTER HANDOFF (AfterHandoff.tsx)

**Heading:** "Did something already happen?"
**Body:** "If you're thinking you might have already gone too far, there's a different space for that."
**Button:** "Think through what happened"

---

## 20. BEFORE PAGE — Structured Flow (Before.tsx)

### Move Selection (MoveSelection.tsx)
**Privacy banner:** "No data is stored long-term." / "Your input is processed for analysis but not retained."

**Heading:** "What are you thinking about doing?"
**Subheading:** "Start with one — you can always come back for others."

**Options:**
- "Sit closer"
- "Hold hands"
- "Kiss"
- "Touch over clothes"
- "Touch under clothes"
- "Have sex"
- "Not sure yet"

**Button:** "Continue"

### Step 1: Orientation
**Title:** "What's the situation?"
- "We're texting or messaging"
- "We're together in person"
- "We're at a party or with other people"
- "Something already happened"
- "I'm not sure"

### Step 2: Consent Signal (contextualized with selected move)
**Title:** "What are they doing or saying?"
- "They've said they want to {move}"  — "They used words like 'yes', 'I want to', or asked you to"
- "They seem actually into it, not just going along" — "Leaning in, touching you back, making eye contact, smiling"
- "Hard to tell what they want" — "Sometimes engaged, sometimes distant, or their words and body don't match"
- "They're quiet or haven't really said anything" — "No clear reaction, looking away, or just going along without enthusiasm"
- "They said no or pulled away" — "Verbally declined, moved away, or created physical distance"

### Step 3: Context Factors
**Title:** "Is anything else going on?"
**Subtitle:** "Pick all that apply"
- "Alcohol or drugs are involved"
- "One of us has done this more than the other"
- "One of us is older or in charge"
- "Someone might feel like they have to"
- "None of these"

### Step 4: Momentum
**Title:** "Where do you want this to go?"
- "I want to {move}" (or "I want to move forward physically" if no move)
- "Just flirting or vibing"
- "I want to slow down"
- "I'm not sure"

### Step 5: Additional Context (ContextInput.tsx)
**Title:** "Anything else?"
**Subtitle:** "Optional — but more details can help."
**Placeholder:** "What else is going on? How are you feeling?"
**Button:** "Continue" / "Skip"

---

## 21. AFTER PAGE — Accountability Flow (After.tsx)

### Intro
**Heading:** "Let's think through what happened."
**Body:** "Sometimes you look back and realize something felt off, or you're worried you went too far. This is a space to slow down and figure it out."
**Card:** "This is a guide to help you think things through. We'll ask a few questions first."
**Button:** "Continue"

### Step 1: Situation
**Title:** "What's the situation?"
- "We hooked up or were physical"
- "Something was said"
- "It's been happening over time"
- "It happened online or over text"
- "I'm not sure how to describe it"

### Step 2: What Happened
**Title:** "What are you worried about?"
- "Things went further than they wanted" — "Physically or emotionally"
- "I didn't notice or ignored their signals" — "They went quiet, pulled away, or seemed off"
- "I kept asking or pushing" — "Until they went along with it"
- "They were drunk or high" — "And might not have been able to fully consent"
- "There was a power difference" — "Age, position, experience, etc."
- "Something else" — "I'll explain more in a moment"

### Step 3: Their Response
**Title:** "How are they acting now?"
- "They told me I hurt them"
- "They've been distant or avoiding me"
- "They stopped talking to me"
- "They're acting differently around me"
- "They haven't said anything, but I'm worried"
- "Someone else told me there's a problem"

### Step 4: Current Feelings
**Title:** "How are you feeling about it?"
- "I'm worried I hurt them"
- "I'm confused about what happened"
- "I feel defensive but want to understand"
- "I feel guilty"
- "I want to make it right"
- "I just need to understand what I did"

### Step 5: Additional Context (AfterContextInput.tsx)
**Title:** "Anything else?"
**Subtitle:** "Add any other details that might help (optional)"
**Placeholder:** "Share any other context that feels relevant..."
**Button:** "Continue" / "Processing..."

### Post-Results
**Heading:** "Have questions?"
**Body:** "If you want to talk through anything else, you can keep going."
**Buttons:** "Keep talking" / "I'm done"

### After Follow-Up Chat (AfterFollowUpChat.tsx)
**Header:** "Keep talking"
**Empty state:** "Ask questions or share more about what happened."
**Placeholder:** "Ask a question or share more..."
**Buttons:** "Done" / "Send"

### Complete
**Heading:** "If someone was hurt"
**Body:** "If the other person was hurt or uncomfortable, they might need support too."
**Resources:**
- "RAINN — rainn.org"
- "Crisis Text Line — crisistextline.org"
- "Love Is Respect — loveisrespect.org"
**Button:** "Start Over"

---

## 22. RESOURCES PAGE (Resources.tsx)

**Heading:** "Get Help"
**Subheading:** "Sometimes you need to talk to a real person. These are here for you."

### Talk to Someone Now
- **Crisis Text Line:** "Text HOME to 741741" — "Free, 24/7. Text with someone who's trained to help."
- **RAINN:** "1-800-656-HOPE (4673)" — "Free, private, 24/7 support line."
- **Teen Line:** "Text TEEN to 839863" — "Talk to another teen. 6-9 PM Pacific time."
- **Love Is Respect:** "Text LOVEIS to 22522" — "Help with relationships and what's healthy."

### Learn More
- **Scarleteen:** "Honest info about relationships, consent, and sex."
- **Planned Parenthood for Teens:** "Straight answers about your body and relationships."

**Footer card:** "Asking for help is smart. All of these are private."

---

## 23. ABOUT PAGE (About.tsx)

**Heading:** "About"

**Body:**
- "is this ok? is a tool to help you pause and think through what's happening. It's not legal advice, therapy, or a substitute for talking to someone you trust."
- "Sometimes it's hard to tell what's okay in the moment. This is a space to slow down and figure it out."

### Privacy Card
- "No login required. No account, no personal info needed."
- "No tracking. We don't know who you are, where you're from, or anything about you."
- "Completely anonymous. Close the tab and it's gone."

### FAQs
1. **"Is this really anonymous?"** — "Yes. No personal info, no IP tracking, no login. There's no way to connect anything back to you."
2. **"Will anyone know I used this?"** — "No. Unless you tell someone, nobody will know."
3. **"What if something already happened?"** — "Use 'After something happened' to think it through. If you're worried you went too far, the resources page has support options."
4. **"Can I use this for a friend?"** — "Yes. Sometimes seeing something written out by someone else makes it click."
5. **"Is this going to lecture me?"** — "No. This isn't about telling you what to do. It's about helping you think."

---

## 24. ERROR / FALLBACK COPY

### Analysis failure (CheckIn.tsx)
- **Before flow:** signalLabel: "Something went wrong" / why: "We couldn't check this right now" / suggestion: "When in doubt, slow down and check in verbally."
- **After flow:** clarityCheck: "We couldn't check this right now." / accountabilitySteps: "When in doubt, slow down and check in."

### Follow-up chat error
- "I'm having trouble right now. Can you try again?"

### After flow error (After.tsx)
- clarityCheck: "We're having trouble processing this right now."
- otherPersonPerspective: "Please try again in a moment."
- accountabilitySteps: "If this continues, please seek support from a trusted adult."
