# ito for bystanders: approach and plan

## Recommendation: one product, a role question, and a separate bystander entry point

Don't fork ito into a second product yet. Do two things instead:

1. **Ask a role question right after the person writes their story** (before any stop screen):
   "Is this about something you're doing, or something someone else is doing?"
   - Me / something I might do
   - Someone else (a friend, a guy in my house, someone at a party)
   - I'm not sure
2. **Add a bystander front door** (for example `/witness` or a partner link like `/cornell-ifc`). It skips the question and starts already set to "someone else". It can have its own landing copy and branding for frats and campuses, but it runs on the same engine, safety checks and evals.

Why:
- Both kinds of people will show up at either door. A bystander-only app still gets guys asking about themselves, and the main app still gets witnesses. Asking the question works on both.
- One safety system to maintain, test and defend to schools. Forks drift apart.
- The Sept 30 test proved the problem is the response frame (the "Hold on" pre-action stop screen shown to a witness), not detection. Getting the role right fixes that frame.
- "I'm not sure" and "someone else" answers get kept as a real signal. Some people describing "a friend" are describing themselves. The perpetrator-prevention focus has to stay in place: if the story shows the user was involved, the response steers back to their own conduct no matter which role they picked.

## What changes in bystander mode

| Today (actor frame) | Bystander frame |
|---|---|
| "Hold on" / don't proceed stop screen | "This sounds serious. Here's what you can do right now" |
| Focus on your own behavior | Focus on her safety, your options, and saving evidence |
| Crisis lines | Crisis lines + RAINN + campus Title IX + how to check on her |
| Is this ok for you to do | Was this ok, and what's your part now |

Response scaffold for bystanders (same 4-part shape, same tone):
1. What the person described, plainly (crime named when it fits, stated conditionally: "if she was that drunk, she very likely couldn't consent")
2. Why secondhand signals don't count ("the guys saying she's into it isn't her saying it")
3. One concrete move now (check on her, get her friends, save the message, get help)
4. Where it goes next (report options, campus resources, support for him)

Timing matters: **happening now** (urgent: interrupt, distract, call someone) vs **already happened** (care for her, save evidence, report options, his own guilt).

## Module 1: practice simulator (gamified)

A live, text-message style practice room, borrowing gameboi's loop: short rounds, choices under time pressure, a score, unlockable scenarios.

Two tracks:
- **"It's you"**: the player is the one with momentum (she's drunk, she said maybe, the guys are hyping him up). Winning means pausing, checking in, or leaving.
- **"It's him"**: the player watches a friend or brother head toward something (the group chat "free ___" message, a guy walking a drunk girl upstairs, a pressure story the next morning).

Mechanics:
- Every round teaches one of the 5 Ds: Distract, Delegate, Direct, Delay, Document.
- Social pressure is the opponent: a meter showing the group pushing back ("bro relax") and the player holding their position.
- Scoring rewards early moves (stepping in at the group chat beats stepping in at the door) and never rewards a "perfect" outcome for staying quiet.
- Ends with a short "what you'd say for real" line the player can save in their head (nothing stored that identifies them).
- Scenarios are written by us and checked against the eval rubric. No free AI roleplay of an assault. The AI plays the friends and the group chat only, inside fixed limits.

## Module 2: anonymous report (simulation only, not live)

A "what would a report look like" walkthrough. Nothing gets sent. A clear banner: "Practice mode. This does not send anything."

Flow:
1. Pick who it would go to: campus police, Title IX, house/chapter leader, RA, RAINN.
2. ito turns the story into a structured brief: when, where (venue type, not addresses unless the person adds them), what was seen, how many people, intoxication signs, is it ongoing, evidence that exists (for example "Snapchat group message, saved"), what the reporter is willing to do next.
3. ito strips anything that identifies the reporter (names, phone, writing style tells it flags for them to change) and shows a preview "as the recipient would see it".
4. Shows what each recipient can and can't do, and what happens after (Title IX's duties, police response, whether a chapter leader has to pass it on).

What's needed before this ever goes live (not in this build): legal review for each school, a vetted inbox per partner, a way to stop abuse and false reports, and a plan for what anonymity truly means once police are involved. Reports about minors also need separate rules.

## Other modules that would make it complete

- **Group chat check**: paste or describe a message ("free ___", "she's down for anyone") and get a read on what it signals and the one thing to do now. This is probably the single earliest warning point at a party.
- **Check on her**: short scripts for approaching her or her friends, the next morning or that night, without pressure.
- **Save the evidence**: how to screenshot disappearing messages, write down times, keep it private.
- **After you saw something**: support for the bystander's own guilt and freeze response ("you didn't understand at first" is normal), with a path to talking to someone.
- **House leader kit**: for chapter officers. Party sober-monitor roles, what to do when a brother reports something, how not to bury it.
- **Pattern memory (anonymous)**: if the same session describes the same guy or house more than once, ito names the pattern.
- **Campus resource directory**: per-partner list (Title IX, advocates, campus police, after-hours line), set up for each school.

## Cornell question, honestly

The details of that case aren't something ito has verified, so this is about the general pattern. In group-assault cases at parties, the earliest moments usually look like: a group chat message, a visibly drunk person being taken somewhere, guys bragging, someone noticing and not knowing whether it "counts". Tools like this help most at those moments, and only if people already know about the tool before the party. So the House leader kit and the simulator (used at new member education) probably matter more than the live check-in. It can't promise prevention. It can shorten the "how am I supposed to know for sure" gap.

## Build phases

1. **Role question + bystander response frame** in the current check-in (biggest safety win, fixes the Sept 30 failure). Add bystander evals. The two v9 bystander scenarios already in the suite become pass/fail checks.
2. **Bystander front door** with its own landing page and copy.
3. **Report simulator** (practice only).
4. **Practice simulator** (start with 6 scenarios, 3 per track).
5. Group chat check, Check on her, Save the evidence, After you saw something.
6. House leader kit and per-school resource setup.

## Technical details

- New `role` field (`self` | `other` | `unsure`) collected after narrative input in `CheckIn.tsx`, passed to `analyze-narrative` and `ito-followup`, and logged in `submissions` metadata. Changing those edge function calls needs your explicit OK (project rule).
- Role-aware prompt branch in the edge functions. Detection and the high-water-mark risk level stay the same. Only the response frame changes. If the story shows the user was involved, the frame is forced back to `self`.
- `StopMoment.tsx` gets a bystander variant (new heading/copy, no "do not proceed", adds check-on-her and evidence steps).
- Eval suite: add a `bystander` tier/role expectation and a `stop_screen_frame` check; witness scenarios fail if they get the pre-action copy.
- Simulator: new route, scripted scenario data file, AI only for the side characters, inside fixed limits. Scores stay in local storage only.
- Report simulator: new route, AI makes a structured brief plus a de-identify pass, rendered as a preview. Nothing gets sent and there are no stored reports.
- Growth dashboard: split counts by role.
