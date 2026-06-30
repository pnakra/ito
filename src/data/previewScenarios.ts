// Fictional, composite scenarios for the "See how ito responds" preview page.
// Not real user submissions.

export interface PreviewScenario {
  id: string;
  narrator_gender: "male" | "female";
  title: string;
  scenario_text: string;
}

export const PREVIEW_SCENARIOS: PreviewScenario[] = [
  {
    id: "ito-scenario-01",
    narrator_gender: "male",
    title: "Reading the signals",
    scenario_text:
      "There's a girl in my friend group who's been texting more and finding reasons to hang out alone. She hasn't said anything outright, but I keep wondering if she's actually interested or if I'm reading into normal friend stuff. I don't want to misjudge this and push for something she didn't actually offer.",
  },
  {
    id: "ito-scenario-02",
    narrator_gender: "male",
    title: "After the makeout",
    scenario_text:
      "We made out once a couple weeks ago and haven't talked about it since. She still texts me like normal, but I can't tell if she thinks something's going to happen again or if she's also just pretending it didn't happen. I don't want to assume more than what's actually there.",
  },
  {
    id: "ito-scenario-03",
    narrator_gender: "male",
    title: "Did I ask too many times",
    scenario_text:
      "I've brought up wanting to take things further a few times with someone I've been seeing, and she keeps saying she's not ready. I think I've backed off, but now I'm second-guessing whether I asked too many times, or if she felt like she had to keep saying no for it to register.",
  },
  {
    id: "ito-scenario-04",
    narrator_gender: "male",
    title: "Replaying it after",
    scenario_text:
      "Looking back at what happened between us, she said yes at the time, but she'd had a few drinks, and I keep wondering if she would've said the same thing sober. She hasn't brought it up since and acts like everything's normal, but I can't stop replaying it.",
  },
  {
    id: "ito-scenario-05",
    narrator_gender: "male",
    title: "Her words vs. what I'm seeing",
    scenario_text:
      "She's told me before she's not looking for anything serious, but the way she acts when we're together feels like more than that. I keep going back and forth on whether I should take her at her word or trust what I'm seeing, and I don't want to push for something she didn't actually offer.",
  },
  {
    id: "ito-scenario-06",
    narrator_gender: "male",
    title: "Bringing it up again",
    scenario_text:
      "After what happened between us, I've thought about bringing up doing it again, but I keep stalling because I'm not sure if she actually wants that or if she'd just go along with it to avoid an awkward conversation. I don't know how to ask without it feeling like pressure.",
  },
  {
    id: "ito-scenario-07",
    narrator_gender: "male",
    title: "Trusting my own read",
    scenario_text:
      "My friends keep telling me a girl I've been talking to is 'definitely into it' and that I'm overthinking things, but something about how she acts makes me uneasy in a way I can't fully explain. I don't know if I should trust their read or my own hesitation.",
  },
  {
    id: "ito-scenario-08",
    narrator_gender: "female",
    title: "He keeps bringing it up",
    scenario_text:
      "I told a friend I wasn't interested in anything physical right now. He keeps bringing it up anyway over text, not pushy exactly, but like he's testing if I'll change my mind. I don't know if I'm allowed to be annoyed about this or if it's normal.",
  },
  {
    id: "ito-scenario-09",
    narrator_gender: "female",
    title: "What it felt like vs. what he said",
    scenario_text:
      "We made out once, and the way he acted that night felt like more than just a one-time thing. A few days later he told me he just sees me as a friend. I don't know what to do with how different things felt in the moment versus what he said after.",
  },
  {
    id: "ito-scenario-10",
    narrator_gender: "female",
    title: "Is this still pressure",
    scenario_text:
      "I told a guy I wasn't interested in anything happening between us. He didn't push back exactly, but he started talking about wanting to 'finally do it this year,' like he was hoping I'd reconsider. It's subtle enough that I don't know if I'm allowed to call it pressure.",
  },
];

export type ResponseStyle = "plain" | "kind" | "light";

export const RESPONSE_STYLES: { id: ResponseStyle; label: string; starter: string }[] = [
  { id: "plain", label: "Say it plainly",      starter: "Honestly? I think you already know the answer. " },
  { id: "kind",  label: "Be kind and careful", starter: "I get why you're sitting with this. Maybe give it some space and " },
  { id: "light", label: "Keep it light",       starter: "Dude, don't overthink it. Just " },
];
