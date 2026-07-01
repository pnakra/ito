// Fictional, composite scenarios for the "See how ito responds" preview page.
// Not real user submissions.
//
// Each scenario is tagged with a theme so the shuffle picks across the
// full range of ito's lane instead of clustering on one dynamic.

export type ResponseStyle = "plain" | "kind" | "light";

export type ScenarioTheme =
  | "silence-as-consent"
  | "intoxication"
  | "repeated-asking"
  | "after-the-fact"
  | "mixed-signals"
  | "reading-into-it"
  | "subtle-pressure"
  | "boundary-testing"
  | "power-imbalance"
  | "past-consent-assumed";

export interface PreviewScenario {
  id: string;
  narrator_gender: "male" | "female";
  theme: ScenarioTheme;
  title: string;
  scenario_text: string;
  starters: Record<ResponseStyle, string>;
}

export const PREVIEW_SCENARIOS: PreviewScenario[] = [
  // ── silence-as-consent ──────────────────────────────────────────────
  {
    id: "ito-scenario-01",
    narrator_gender: "male",
    theme: "silence-as-consent",
    title: "The pause I might have missed",
    scenario_text:
      "We were messing around and at one point she got quiet and pulled back a little, but didn't say anything or tell me to stop. I kept going, but I've been replaying whether that pause meant something I should've paid more attention to.",
    starters: {
      plain: "Just ask her directly if she was okay with what happened. Don't dance around it.",
      kind: "Check in with her. Let her know you noticed the pause and want to make sure she was actually good.",
      light: "Just text her and ask if she was good. Not a big deal to bring up.",
    },
  },
  {
    id: "ito-scenario-05",
    narrator_gender: "male",
    theme: "silence-as-consent",
    title: "Not saying no isn't the same as saying yes",
    scenario_text:
      "Earlier she told me she wasn't really feeling up for anything, but later that night when we were together, she didn't say no and seemed to go along with things. I don't know if she changed her mind or just felt like it was easier not to say anything.",
    starters: {
      plain: "Not saying no isn't a yes. She told you earlier she wasn't into it — that should've been the answer.",
      kind: "Talk to her. She'd already told you she wasn't feeling it, so check in honestly about how she's doing now.",
      light: "Just check in with her and make sure she was actually good with how it went.",
    },
  },
  {
    id: "ito-scenario-11",
    narrator_gender: "female",
    theme: "silence-as-consent",
    title: "I froze and he kept going",
    scenario_text:
      "Things escalated faster than I expected and I kind of froze. I didn't say stop but I also didn't say yes to what happened. He acted like nothing was wrong after, and now I don't know if I'm allowed to feel weird about it.",
    starters: {
      plain: "You're allowed to feel weird. Freezing isn't agreeing — that's on him to have noticed.",
      kind: "What you're feeling makes sense. Not reacting isn't the same as being okay with it.",
      light: "You don't need permission to feel off about it.",
    },
  },

  // ── intoxication ────────────────────────────────────────────────────
  {
    id: "ito-scenario-04",
    narrator_gender: "male",
    theme: "intoxication",
    title: "Replaying it after",
    scenario_text:
      "Looking back at what happened between us, she said yes at the time, but she'd had a few drinks, and I keep wondering if she would've said the same thing sober. She hasn't brought it up since and acts like everything's normal, but I can't stop replaying it.",
    starters: {
      plain: "You knew she'd been drinking. Own that and ask her how she actually feels about it now.",
      kind: "Check in with her honestly. Don't act like it didn't happen just because she hasn't brought it up.",
      light: "Just ask her if she's good. Better than sitting on it.",
    },
  },
  {
    id: "ito-scenario-12",
    narrator_gender: "male",
    theme: "intoxication",
    title: "She was more drunk than I realized",
    scenario_text:
      "At the party she seemed fine when we went upstairs, but the next morning she barely remembered parts of the night. Nothing crazy happened but we did hook up, and now I'm trying to figure out if I should have called it earlier.",
    starters: {
      plain: "If she doesn't remember parts of the night, she wasn't in a place to consent. Own that.",
      kind: "Reach out honestly. Tell her you're worried about how drunk she was and want to know how she's feeling.",
      light: "Just check in with her today. Don't pretend it didn't happen.",
    },
  },
  {
    id: "ito-scenario-13",
    narrator_gender: "female",
    theme: "intoxication",
    title: "I don't remember agreeing",
    scenario_text:
      "I was pretty drunk and I remember bits of the night but not clearly. He says I was into it, but I don't remember making that call. I've been trying to figure out how to bring it up without making it a whole thing.",
    starters: {
      plain: "If you don't remember agreeing, that matters. His version isn't the only one that counts.",
      kind: "You don't owe anyone a chill version of this. Talk to someone you trust about how you're feeling.",
      light: "Not remembering is a real thing to sit with. You don't have to rush how you handle it.",
    },
  },

  // ── repeated-asking ─────────────────────────────────────────────────
  {
    id: "ito-scenario-03",
    narrator_gender: "male",
    theme: "repeated-asking",
    title: "Did I ask too many times",
    scenario_text:
      "I've brought up wanting to take things further a few times with someone I've been seeing, and she keeps saying she's not ready. I think I've backed off, but now I'm second-guessing whether I asked too many times, or if she felt like she had to keep saying no for it to register.",
    starters: {
      plain: "Stop asking. She's said no more than once — drop it and don't bring it up again.",
      kind: "Let it go. She's told you where she's at. Don't make her keep repeating herself.",
      light: "Quit bringing it up. If anything changes, she'll say so.",
    },
  },
  {
    id: "ito-scenario-08",
    narrator_gender: "female",
    theme: "repeated-asking",
    title: "He keeps bringing it up",
    scenario_text:
      "I told a friend I wasn't interested in anything physical right now. He keeps bringing it up anyway over text, not pushy exactly, but like he's testing if I'll change my mind. I don't know if I'm allowed to be annoyed about this or if it's normal.",
    starters: {
      plain: "Tell him plainly to stop. You don't owe him repeated nos.",
      kind: "Let him know you've already answered and you'd like him to drop it.",
      light: "Just tell him to chill — same answer as before.",
    },
  },
  {
    id: "ito-scenario-14",
    narrator_gender: "male",
    theme: "repeated-asking",
    title: "Maybe if I ask differently",
    scenario_text:
      "She's said she doesn't want to hook up right now. I've been thinking about bringing it up again in a different way, more casual, so it doesn't feel like pressure. But I also know she already told me where she's at.",
    starters: {
      plain: "Rewording the same ask is still the same ask. Leave it alone.",
      kind: "She already gave you an answer. Trust it and let her come to you if that changes.",
      light: "Don't repackage it. She'll say if things change.",
    },
  },

  // ── after-the-fact ──────────────────────────────────────────────────
  {
    id: "ito-scenario-15",
    narrator_gender: "male",
    theme: "after-the-fact",
    title: "She's been distant since",
    scenario_text:
      "We hooked up last weekend and since then she's been short with me over text, kind of avoiding making plans. In the moment it seemed fine but now I'm wondering if something felt off to her that I didn't pick up on.",
    starters: {
      plain: "Ask her directly. Something's clearly off — don't wait for it to blow over.",
      kind: "Reach out and give her space to be honest. Don't try to fix it, just listen.",
      light: "Just text her and ask what's up. No pressure.",
    },
  },
  {
    id: "ito-scenario-16",
    narrator_gender: "female",
    theme: "after-the-fact",
    title: "It didn't feel right after",
    scenario_text:
      "I hooked up with someone I've been talking to for a while. In the moment I thought I was into it, but afterward I felt off in a way I can't really explain. He was fine, nothing bad happened, but something isn't sitting right.",
    starters: {
      plain: "Feeling off after is real information. You don't need it to fit a bigger story to matter.",
      kind: "That feeling is worth taking seriously, even if nothing obvious went wrong.",
      light: "You can sit with it without needing to explain it to anyone yet.",
    },
  },

  // ── mixed-signals ───────────────────────────────────────────────────
  {
    id: "ito-scenario-17",
    narrator_gender: "male",
    theme: "mixed-signals",
    title: "Yes to one thing, unclear on the rest",
    scenario_text:
      "She said she was down to hook up but was less clear on what exactly she wanted to do. In the moment I read it as her being open to whatever, but looking back I'm not sure that's what she actually meant.",
    starters: {
      plain: "Yes to one thing isn't yes to everything. Ask specifically next time — and check in with her about this time.",
      kind: "Open to something isn't the same as open to anything. Check in with her about how it landed.",
      light: "Just ask her what she was actually up for. Better than assuming.",
    },
  },
  {
    id: "ito-scenario-18",
    narrator_gender: "female",
    theme: "mixed-signals",
    title: "I said maybe and he heard yes",
    scenario_text:
      "He asked if I wanted to come back to his place and I said something like 'maybe, we'll see.' He treated it like a yes and I ended up going along with it because backing out felt harder than just letting it happen.",
    starters: {
      plain: "Maybe isn't yes. Going along because it felt harder to leave isn't consent either.",
      kind: "What you're describing matters. You didn't want it enough to say yes clearly, and that counts.",
      light: "You're allowed to name that as not being what you actually wanted.",
    },
  },

  // ── reading-into-it ─────────────────────────────────────────────────
  {
    id: "ito-scenario-02",
    narrator_gender: "male",
    theme: "reading-into-it",
    title: "What I wanted to see",
    scenario_text:
      "After we made out, I've been thinking about how into it she actually seemed versus how into it I wanted her to be. In the moment it felt mutual, but I keep questioning whether I was reading what I hoped for instead of what was actually there.",
    starters: {
      plain: "Be honest and ask her if she was actually into it. Stop guessing on your own.",
      kind: "Talk to her. Tell her you've been thinking about it and want to make sure it felt mutual to her too.",
      light: "Just ask her. She'll tell you.",
    },
  },
  {
    id: "ito-scenario-09",
    narrator_gender: "female",
    theme: "reading-into-it",
    title: "Reading it as it happened",
    scenario_text:
      "We made out once, and afterward I kept replaying whether he was actually into it or just going along with it. He seemed enthusiastic in the moment, but I don't know how much of that I can trust versus what I wanted to see.",
    starters: {
      plain: "Just ask him directly if he was into it. Don't sit with the guessing.",
      kind: "Check in with him. Tell him you want to make sure it actually felt mutual.",
      light: "Just ask. He'll say.",
    },
  },
  {
    id: "ito-scenario-07",
    narrator_gender: "male",
    theme: "reading-into-it",
    title: "The nagging feeling I ignored",
    scenario_text:
      "My friends told me I was overthinking it, but in the moment I had this nagging feeling that she wasn't as into it as she was acting. I went along with what was happening anyway, and now I keep wondering if I should've stopped and asked instead of assuming.",
    starters: {
      plain: "You knew something was off and ignored it. Check in with her now and actually listen.",
      kind: "Your gut was telling you something. Reach out and ask her how she's really feeling about it.",
      light: "Just ask her. Better late than never.",
    },
  },

  // ── subtle-pressure ─────────────────────────────────────────────────
  {
    id: "ito-scenario-10",
    narrator_gender: "female",
    theme: "subtle-pressure",
    title: "Is this still pressure",
    scenario_text:
      "I told a guy I wasn't interested in anything happening between us. He didn't push back exactly, but he started talking about wanting to 'finally do it this year,' like he was hoping I'd reconsider. It's subtle enough that I don't know if I'm allowed to call it pressure.",
    starters: {
      plain: "That's pressure. Tell him to stop bringing it up — your answer stands.",
      kind: "Name it. Let him know the way he keeps mentioning it feels like pressure.",
      light: "Tell him to drop the 'finally this year' thing. Not happening.",
    },
  },
  {
    id: "ito-scenario-19",
    narrator_gender: "male",
    theme: "subtle-pressure",
    title: "Guilting her without meaning to",
    scenario_text:
      "When she said she wasn't in the mood, I made a comment about how it's been a while and I was starting to feel like she wasn't into me anymore. She ended up going along with it that night but I've been thinking about how I said that.",
    starters: {
      plain: "That was pressure, even if you didn't mean it that way. Own it with her.",
      kind: "What you said put her in a spot. Talk to her honestly about it — don't wait for her to bring it up.",
      light: "Just tell her you shouldn't have framed it like that.",
    },
  },
  {
    id: "ito-scenario-20",
    narrator_gender: "female",
    theme: "subtle-pressure",
    title: "He gets quiet when I say no",
    scenario_text:
      "Every time I say I'm not up for anything physical, he goes quiet or acts a little cold for the rest of the night. He never actually argues with me, but the energy shift is enough that I've started dreading saying no.",
    starters: {
      plain: "That's a real form of pressure. Dreading saying no is a sign, not overthinking.",
      kind: "The way he reacts is doing something to you. That's worth naming — to him or to yourself first.",
      light: "You're not making it up. That pattern is a thing.",
    },
  },

  // ── boundary-testing ────────────────────────────────────────────────
  {
    id: "ito-scenario-21",
    narrator_gender: "male",
    theme: "boundary-testing",
    title: "Pushing past what she said",
    scenario_text:
      "She told me she wasn't ready for one specific thing. When we were together I tried it anyway to see how she'd react, and she pulled back. I stopped, but I know I shouldn't have tried it in the first place.",
    starters: {
      plain: "You knew the answer and tested it anyway. That's on you to sit with and not repeat.",
      kind: "You already know that wasn't okay. Own it with her directly and don't do it again.",
      light: "Don't test what someone already told you no to. Full stop.",
    },
  },
  {
    id: "ito-scenario-22",
    narrator_gender: "female",
    theme: "boundary-testing",
    title: "He keeps trying things I said no to",
    scenario_text:
      "There's one thing I've told him more than once I don't want to do. He keeps trying it in the moment, like maybe I'll be into it that time. I usually stop him but it's exhausting having to keep saying no.",
    starters: {
      plain: "Him doing this on purpose is a pattern, not a mistake. You're allowed to be done explaining.",
      kind: "You've already been clear. He's not confused — he's hoping you'll cave. Trust that read.",
      light: "You don't owe him a hundredth no. That's on him.",
    },
  },

  // ── power-imbalance ─────────────────────────────────────────────────
  {
    id: "ito-scenario-23",
    narrator_gender: "male",
    theme: "power-imbalance",
    title: "She's younger than my friends realized",
    scenario_text:
      "I met someone at a party and we hooked up. Later I found out she's a couple years younger than me, still in high school while I'm in college. Nothing weird happened in the moment but now the gap feels different than I thought.",
    starters: {
      plain: "The gap matters. Don't hook up with her again and be honest with yourself about why it felt off.",
      kind: "You're right that it feels different now. Trust that and don't keep it going.",
      light: "Leave it there. Don't repeat it.",
    },
  },
  {
    id: "ito-scenario-24",
    narrator_gender: "female",
    theme: "power-imbalance",
    title: "He's older and it feels off",
    scenario_text:
      "I've been talking to a guy who's a few years older. He's not doing anything wrong exactly, but he brings up how mature I am a lot and it's started to make me feel weird. I don't know if I'm making something out of nothing.",
    starters: {
      plain: "You're not making it up. The 'so mature' line is a pattern worth paying attention to.",
      kind: "That feeling is worth trusting. You don't need proof for it to matter.",
      light: "That feeling is a real thing. You're allowed to step back.",
    },
  },

  // ── past-consent-assumed ────────────────────────────────────────────
  {
    id: "ito-scenario-06",
    narrator_gender: "male",
    theme: "past-consent-assumed",
    title: "Bringing it up again",
    scenario_text:
      "After what happened between us, I've thought about bringing up doing it again, but I keep stalling because I'm not sure if she actually wants that or if she'd just go along with it to avoid an awkward conversation. I don't know how to ask without it feeling like pressure.",
    starters: {
      plain: "Don't bring it up. If she wants it, she'll tell you.",
      kind: "Leave space for her. If she's into it again, she'll let you know on her own.",
      light: "Just chill — don't push for a round two.",
    },
  },
  {
    id: "ito-scenario-25",
    narrator_gender: "male",
    theme: "past-consent-assumed",
    title: "We did it before, so I figured",
    scenario_text:
      "We'd hooked up before and last night I kind of assumed we were going to again. She didn't stop me but she also seemed less into it than the first time. I keep telling myself it was fine because of last time.",
    starters: {
      plain: "Last time isn't a standing yes. Check in with her about how last night actually landed.",
      kind: "History isn't consent for tonight. Talk to her about how it felt for her.",
      light: "Just ask her how it was for her. Don't assume off last time.",
    },
  },
  {
    id: "ito-scenario-26",
    narrator_gender: "female",
    theme: "past-consent-assumed",
    title: "He assumed because we had before",
    scenario_text:
      "We've hooked up a few times. Last time he moved things forward without really checking, like it was just the default now. I went with it but I've been sitting with the fact that he didn't actually ask.",
    starters: {
      plain: "You're allowed to want him to keep asking. Tell him that plainly.",
      kind: "Being past hookups doesn't mean you stop needing to be checked in with. Say that to him.",
      light: "Tell him you still want him to ask. Not weird to bring up.",
    },
  },
];

export const RESPONSE_STYLES: {
  id: ResponseStyle;
  label: string;
  emoji: string;
  tone: string;
}[] = [
  { id: "plain", label: "Say it plainly", emoji: "🎯", tone: "Direct" },
  { id: "kind", label: "Be kind and careful", emoji: "🫶", tone: "Warm" },
  { id: "light", label: "Keep it light", emoji: "🪶", tone: "Breezy" },
];

// Themes in the order we want to cycle through — spreads picks across
// the full range of ito's lane instead of clustering on one dynamic.
const THEME_ROTATION: ScenarioTheme[] = [
  "silence-as-consent",
  "intoxication",
  "repeated-asking",
  "subtle-pressure",
  "mixed-signals",
  "boundary-testing",
  "reading-into-it",
  "past-consent-assumed",
  "after-the-fact",
  "power-imbalance",
];

/**
 * Pick a scenario that isn't from the same theme as the last one shown.
 * This keeps consecutive picks feeling varied instead of clustering on
 * (say) three "intoxication" scenarios in a row.
 */
export function pickNextScenario(previous?: PreviewScenario): PreviewScenario {
  const avoidTheme = previous?.theme;
  const avoidId = previous?.id;

  const preferredThemes = THEME_ROTATION.filter((t) => t !== avoidTheme);
  const nextTheme = preferredThemes[Math.floor(Math.random() * preferredThemes.length)];

  const themePool = PREVIEW_SCENARIOS.filter(
    (s) => s.theme === nextTheme && s.id !== avoidId
  );
  const pool = themePool.length > 0
    ? themePool
    : PREVIEW_SCENARIOS.filter((s) => s.id !== avoidId);

  return pool[Math.floor(Math.random() * pool.length)];
}
