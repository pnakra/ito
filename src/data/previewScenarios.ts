// Fictional, composite scenarios for the "See how ito responds" preview page.
// Not real user submissions.

export type ResponseStyle = "plain" | "kind" | "light";

export interface PreviewScenario {
  id: string;
  narrator_gender: "male" | "female";
  title: string;
  scenario_text: string;
  starters: Record<ResponseStyle, string>;
}

export const PREVIEW_SCENARIOS: PreviewScenario[] = [
  {
    id: "ito-scenario-01",
    narrator_gender: "male",
    title: "The pause I might have missed",
    scenario_text:
      "We were messing around and at one point she got quiet and pulled back a little, but didn't say anything or tell me to stop. I kept going, but I've been replaying whether that pause meant something I should've paid more attention to.",
    starters: {
      plain:
        "Just ask her directly if she was okay with what happened. Don't dance around it.",
      kind:
        "Check in with her. Let her know you noticed the pause and want to make sure she was actually good.",
      light:
        "Just text her and ask if she was good. Not a big deal to bring up.",
    },
  },
  {
    id: "ito-scenario-02",
    narrator_gender: "male",
    title: "What I wanted to see",
    scenario_text:
      "After we made out, I've been thinking about how into it she actually seemed versus how into it I wanted her to be. In the moment it felt mutual, but I keep questioning whether I was reading what I hoped for instead of what was actually there.",
    starters: {
      plain:
        "Be honest and ask her if she was actually into it. Stop guessing on your own.",
      kind:
        "Talk to her. Tell her you've been thinking about it and want to make sure it felt mutual to her too.",
      light:
        "Just ask her. She'll tell you.",
    },
  },
  {
    id: "ito-scenario-03",
    narrator_gender: "male",
    title: "Did I ask too many times",
    scenario_text:
      "I've brought up wanting to take things further a few times with someone I've been seeing, and she keeps saying she's not ready. I think I've backed off, but now I'm second-guessing whether I asked too many times, or if she felt like she had to keep saying no for it to register.",
    starters: {
      plain:
        "Stop asking. She's said no more than once — drop it and don't bring it up again.",
      kind:
        "Let it go. She's told you where she's at. Don't make her keep repeating herself.",
      light:
        "Quit bringing it up. If anything changes, she'll say so.",
    },
  },
  {
    id: "ito-scenario-04",
    narrator_gender: "male",
    title: "Replaying it after",
    scenario_text:
      "Looking back at what happened between us, she said yes at the time, but she'd had a few drinks, and I keep wondering if she would've said the same thing sober. She hasn't brought it up since and acts like everything's normal, but I can't stop replaying it.",
    starters: {
      plain:
        "You knew she'd been drinking. Own that and ask her how she actually feels about it now.",
      kind:
        "Check in with her honestly. Don't act like it didn't happen just because she hasn't brought it up.",
      light:
        "Just ask her if she's good. Better than sitting on it.",
    },
  },
  {
    id: "ito-scenario-05",
    narrator_gender: "male",
    title: "Not saying no isn't the same as saying yes",
    scenario_text:
      "Earlier she told me she wasn't really feeling up for anything, but later that night when we were together, she didn't say no and seemed to go along with things. I don't know if she changed her mind or just felt like it was easier not to say anything.",
    starters: {
      plain:
        "Not saying no isn't a yes. She told you earlier she wasn't into it — that should've been the answer.",
      kind:
        "Talk to her. She'd already told you she wasn't feeling it, so check in honestly about how she's doing now.",
      light:
        "Just check in with her and make sure she was actually good with how it went.",
    },
  },
  {
    id: "ito-scenario-06",
    narrator_gender: "male",
    title: "Bringing it up again",
    scenario_text:
      "After what happened between us, I've thought about bringing up doing it again, but I keep stalling because I'm not sure if she actually wants that or if she'd just go along with it to avoid an awkward conversation. I don't know how to ask without it feeling like pressure.",
    starters: {
      plain:
        "Don't bring it up. If she wants it, she'll tell you.",
      kind:
        "Leave space for her. If she's into it again, she'll let you know on her own.",
      light:
        "Just chill — don't push for a round two.",
    },
  },
  {
    id: "ito-scenario-07",
    narrator_gender: "male",
    title: "The nagging feeling I ignored",
    scenario_text:
      "My friends told me I was overthinking it, but in the moment I had this nagging feeling that she wasn't as into it as she was acting. I went along with what was happening anyway, and now I keep wondering if I should've stopped and asked instead of assuming.",
    starters: {
      plain:
        "You knew something was off and ignored it. Check in with her now and actually listen.",
      kind:
        "Your gut was telling you something. Reach out and ask her how she's really feeling about it.",
      light:
        "Just ask her. Better late than never.",
    },
  },
  {
    id: "ito-scenario-08",
    narrator_gender: "female",
    title: "He keeps bringing it up",
    scenario_text:
      "I told a friend I wasn't interested in anything physical right now. He keeps bringing it up anyway over text, not pushy exactly, but like he's testing if I'll change my mind. I don't know if I'm allowed to be annoyed about this or if it's normal.",
    starters: {
      plain:
        "Tell him plainly to stop. You don't owe him repeated nos.",
      kind:
        "Let him know you've already answered and you'd like him to drop it.",
      light:
        "Just tell him to chill — same answer as before.",
    },
  },
  {
    id: "ito-scenario-09",
    narrator_gender: "female",
    title: "Reading it as it happened",
    scenario_text:
      "We made out once, and afterward I kept replaying whether he was actually into it or just going along with it. He seemed enthusiastic in the moment, but I don't know how much of that I can trust versus what I wanted to see. I don't know how to tell the difference.",
    starters: {
      plain:
        "Just ask him directly if he was into it. Don't sit with the guessing.",
      kind:
        "Check in with him. Tell him you want to make sure it actually felt mutual.",
      light:
        "Just ask. He'll say.",
    },
  },
  {
    id: "ito-scenario-10",
    narrator_gender: "female",
    title: "Is this still pressure",
    scenario_text:
      "I told a guy I wasn't interested in anything happening between us. He didn't push back exactly, but he started talking about wanting to 'finally do it this year,' like he was hoping I'd reconsider. It's subtle enough that I don't know if I'm allowed to call it pressure.",
    starters: {
      plain:
        "That's pressure. Tell him to stop bringing it up — your answer stands.",
      kind:
        "Name it. Let him know the way he keeps mentioning it feels like pressure.",
      light:
        "Tell him to drop the 'finally this year' thing. Not happening.",
    },
  },
];

export const RESPONSE_STYLES: { id: ResponseStyle; label: string }[] = [
  { id: "plain", label: "Say it plainly" },
  { id: "kind", label: "Be kind and careful" },
  { id: "light", label: "Keep it light" },
];
