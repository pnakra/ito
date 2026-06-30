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
        "Hey — when you went quiet the other night, I'm not sure if I should've stopped. Did I miss something?",
      kind:
        "I've been thinking about that moment you pulled back. I want to check in — was that actually okay with you?",
      light:
        "Random one — that pause the other night, you were good, right? Just want to make sure.",
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
        "I want to ask straight up — were you actually into it the other night, or was I reading what I wanted to see?",
      kind:
        "I keep wondering if I read the other night right. Was it actually mutual for you?",
      light:
        "Quick one — the other night felt mutual to me, but you'd say if it wasn't, right?",
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
        "I've asked about this a few times and I shouldn't have kept bringing it up. I'm done asking — it's your call.",
      kind:
        "I realize I've brought this up more than once. I don't want you to feel like you have to keep saying no. I'll leave it alone.",
      light:
        "Forget I kept bringing it up — my bad. Not asking again.",
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
        "I want to ask about the other night. You'd been drinking, and I'm not sure I should've gone ahead. How are you actually feeling about it?",
      kind:
        "I've been sitting with the other night. You'd had a few drinks, and I want to check in honestly — how are you feeling about how it went?",
      light:
        "Hey — about the other night, just wanted to check you're actually good with how it went.",
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
        "Earlier you said you weren't up for anything, and I shouldn't have let it keep going just because you didn't stop me. I'm sorry.",
      kind:
        "You'd told me earlier you weren't feeling it. I want to check in honestly — was the rest of the night actually okay with you?",
      light:
        "Hey — you told me earlier you weren't up for it. Just want to make sure you were actually good with what happened.",
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
        "I'm not going to keep bringing up doing it again. If it's something you want, you can tell me — otherwise I'll leave it.",
      kind:
        "I don't want to keep raising the idea of doing it again. If it's something you want, let me know on your own time.",
      light:
        "Not angling for a round two — if you're into it sometime, you tell me.",
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
        "I had a feeling you weren't fully into it the other night and I didn't stop to ask. I should have. Are you okay?",
      kind:
        "Something felt off to me in the moment and I didn't check in then. I'm checking now — was that actually okay with you?",
      light:
        "Quick check — the other night, you were actually good, right? I should've asked then.",
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
        "I've already told you I'm not interested in anything physical. Please stop bringing it up.",
      kind:
        "I said I'm not into anything physical right now. I'd rather you didn't keep checking — my answer isn't going to change.",
      light:
        "Same answer as before — not interested. Can we drop it?",
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
        "Quick thing — when we made out, were you actually into it or just going along?",
      kind:
        "I've been wondering if I read the other night right. Were you actually into it?",
      light:
        "Random — the other night, you were good with it, right?",
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
        "When you talk about 'finally doing it this year,' it feels like pressure. I told you I'm not interested — that's still where I'm at.",
      kind:
        "The way you keep mentioning it is starting to feel like pressure. I meant what I said before — I'm not interested.",
      light:
        "The 'finally this year' stuff — not happening. I already told you where I'm at.",
    },
  },
];

export const RESPONSE_STYLES: { id: ResponseStyle; label: string }[] = [
  { id: "plain", label: "Say it plainly" },
  { id: "kind", label: "Be kind and careful" },
  { id: "light", label: "Keep it light" },
];
