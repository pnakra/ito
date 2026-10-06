// Content for the bystander ("witness") section of ito.
// Copy rules: sentence case, plain language, no first-person voice from ito.

export interface Guide {
  slug: string;
  title: string;
  short: string;
  intro: string;
  sections: { heading: string; points: string[] }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "group-chat",
    title: "Group chat check",
    short: "A message in the chat sounds wrong. What it means and what to do.",
    intro:
      "Messages like \"free ___\", \"she's down for anyone\" or \"come upstairs\" are often the earliest warning anyone gets. What the guys say she wants is not her saying it.",
    sections: [
      {
        heading: "What the message is telling you",
        points: [
          "Secondhand isn't consent. She has to say yes to each person herself.",
          "If people are drinking or on something, she may not be able to say yes at all.",
          "A group joking about one person is a sign it's turning into something that's being done to her.",
        ],
      },
      {
        heading: "One move, right now",
        points: [
          "Save it before it disappears. On Snapchat, take a photo of the screen with another phone, because a screenshot tells the group.",
          "Go find her, or find her friends, and get her somewhere else.",
          "Reply in the chat to break the momentum: \"nah, nobody's going up\". One voice changes what a group does more than you'd think.",
          "If she's passed out or can't stand, call 911.",
        ],
      },
    ],
  },
  {
    slug: "check-on-her",
    title: "Check on her",
    short: "What to say that night or the next morning, without pressure.",
    intro: "Checking on her is about her, not about getting the story. Keep it short and let her decide what happens next.",
    sections: [
      {
        heading: "That night",
        points: [
          "\"Hey, your friends are looking for you, come with me.\" A simple excuse gets her out without a scene.",
          "Stay with her, get water, get her home with someone she trusts.",
          "If she can't stay awake or respond, call 911. Medical amnesty policies usually protect people who call.",
        ],
      },
      {
        heading: "The next day",
        points: [
          "\"Hey, I saw some stuff last night that didn't sit right. Are you ok?\"",
          "Don't push for details and don't tell her what it was. Let her lead.",
          "Tell her what you saw if she asks. Offer the messages you saved.",
          "Share options without deciding for her: RAINN (1-800-656-4673), campus advocates, Title IX.",
        ],
      },
    ],
  },
  {
    slug: "save-the-evidence",
    title: "Save the evidence",
    short: "How to keep messages and notes before they disappear.",
    intro: "Disappearing messages are gone fast. Saving them keeps her options open, even if she never uses them.",
    sections: [
      {
        heading: "Do this now",
        points: [
          "Capture messages with the sender's name and time visible.",
          "On Snapchat, saving or screenshotting a message is visible to the chat. Take a photo of the screen with another phone or device instead.",
          "Write down what you saw: time, place, who was there, how drunk or high people were. Do it today while it's fresh.",
          "Email the photos and notes to yourself so they're backed up.",
        ],
      },
      {
        heading: "Keep it private",
        points: [
          "Don't post it or forward it around. That can hurt her and the case.",
          "Only share it with her, or with someone handling a report.",
        ],
      },
    ],
  },
  {
    slug: "after-you-saw",
    title: "After you saw something",
    short: "If you froze or didn't get it at first.",
    intro:
      "A lot of people freeze, or don't understand what they're seeing until later. That's common. What matters is what you do from here.",
    sections: [
      {
        heading: "What you can still do",
        points: [
          "Check on her, if you know her.",
          "Save what you have.",
          "Tell someone who can act: Title IX, campus advocates, or RAINN can explain options without you committing to anything.",
        ],
      },
      {
        heading: "For you",
        points: [
          "Feeling sick about it is a sign your read was right.",
          "Talk to someone you trust, or call 988 if it's weighing on you.",
          "Practice what you'd say next time, so it comes out faster.",
        ],
      },
    ],
  },
  {
    slug: "house-leaders",
    title: "House leader kit",
    short: "For chapter officers: running parties and handling reports.",
    intro: "Most group assaults at parties start with moments a sober person could catch. The kit is about having that sober person, and a plan.",
    sections: [
      {
        heading: "Before the party",
        points: [
          "Assign 2+ sober monitors per floor. Their job is watching, not hosting.",
          "Rule: nobody goes upstairs with someone who can't walk or talk clearly. Monitors are allowed to stop it.",
          "Tell the house that the group chat is part of the party. \"Free ___\" messages get shut down and reported.",
        ],
      },
      {
        heading: "When a brother tells you something",
        points: [
          "Thank him. Don't argue about what it \"really\" was.",
          "Make sure she's ok first, and that evidence is saved.",
          "Pass it to Title IX or campus police. Handling it inside the house almost always buries it.",
          "Protect the person who spoke up from retaliation.",
        ],
      },
    ],
  },
  {
    slug: "resources",
    title: "Who to call",
    short: "Numbers and offices, and what each one does.",
    intro: "You can call any of these without knowing all the details.",
    sections: [
      {
        heading: "Right now",
        points: ["911: someone is in danger or can't respond.", "988: call or text, for her or for you.", "Crisis Text Line: text HOME to 741741."],
      },
      {
        heading: "After",
        points: [
          "RAINN, 1-800-656-4673: confidential, explains options.",
          "Campus advocates or counseling: confidential on most campuses.",
          "Title IX office: can investigate and set up protections. Usually not confidential.",
          "Campus or local police: criminal reports. Ask about anonymous tip lines.",
        ],
      },
    ],
  },
];

// ─── Practice simulator ──────────────────────────────────────────────────────

export type FiveD = "Distract" | "Delegate" | "Direct" | "Delay" | "Document" | "Pause" | "None";

export interface PracticeChoice {
  text: string;
  d: FiveD;
  points: number; // 0-3
  pressure: number; // change to group pressure (-2..+2)
  feedback: string;
}

export interface PracticeRound {
  messages: { from: string; text: string }[];
  prompt: string;
  choices: PracticeChoice[];
}

export interface PracticeScenario {
  id: string;
  track: "you" | "him";
  title: string;
  setup: string;
  rounds: PracticeRound[];
  sayForReal: string;
}

export const PRACTICE: PracticeScenario[] = [
  {
    id: "him-groupchat",
    track: "him",
    title: "The group chat",
    setup: "Saturday, 1am. The house party is still going. Your phone buzzes.",
    rounds: [
      {
        messages: [
          { from: "Jake", text: "free real estate upstairs 😂" },
          { from: "Marco", text: "who is it" },
          { from: "Jake", text: "the girl from bio, she's gone lol" },
        ],
        prompt: "What do you do?",
        choices: [
          { text: "Save the message and go find her", d: "Document", points: 3, pressure: 1, feedback: "Saving it and moving toward her is the strongest early move. On Snapchat, photograph the screen with another phone so the group isn't tipped off." },
          { text: "Reply \"nah bro nobody's going up\"", d: "Direct", points: 2, pressure: 2, feedback: "Breaking the momentum in the chat matters. Now get to her too." },
          { text: "Leave it on read", d: "None", points: 0, pressure: 0, feedback: "Silence reads as agreement to the group. \"She's gone\" means she can't consent." },
        ],
      },
      {
        messages: [
          { from: "Marco", text: "relax lol she's into it" },
          { from: "Jake", text: "don't be weird" },
        ],
        prompt: "The chat pushes back.",
        choices: [
          { text: "Find her friends and tell them where she is", d: "Delegate", points: 3, pressure: -1, feedback: "Her friends can get her out without a fight." },
          { text: "Go upstairs: \"hey, her ride's here\"", d: "Distract", points: 3, pressure: -1, feedback: "A simple excuse gets her out of the room." },
          { text: "\"ok whatever\"", d: "None", points: 0, pressure: 1, feedback: "\"Into it\" from them isn't her saying it." },
        ],
      },
    ],
    sayForReal: "\"Nah, nobody's going up. I'm getting her friends.\"",
  },
  {
    id: "him-stairs",
    track: "him",
    title: "On the stairs",
    setup: "You see a brother walking a girl upstairs. She's leaning on him and can't walk straight.",
    rounds: [
      {
        messages: [{ from: "Tyler", text: "(to you) cover for me bro" }],
        prompt: "What do you do?",
        choices: [
          { text: "\"Yo, her friends are looking for her\" and walk with them", d: "Distract", points: 3, pressure: 1, feedback: "Interrupting without a fight is often the fastest way to stop it." },
          { text: "\"She can't even walk, man. Not happening.\"", d: "Direct", points: 3, pressure: 2, feedback: "Clear and true. Stay with her after." },
          { text: "Get the sober monitor", d: "Delegate", points: 2, pressure: 0, feedback: "Good, if you get one fast. Seconds matter on the stairs." },
          { text: "Let it go, it's not your business", d: "None", points: 0, pressure: 0, feedback: "Someone who can't walk straight very likely can't consent." },
        ],
      },
      {
        messages: [{ from: "Tyler", text: "dude she literally asked me to" }],
        prompt: "He pushes back.",
        choices: [
          { text: "\"Then she can say it tomorrow sober.\"", d: "Delay", points: 3, pressure: 1, feedback: "Moving it to when she can actually decide is the right call." },
          { text: "Back off", d: "None", points: 0, pressure: -1, feedback: "Drunk \"yes\" isn't one she can really give." },
        ],
      },
    ],
    sayForReal: "\"Then she can say it tomorrow when she's sober.\"",
  },
  {
    id: "him-morning",
    track: "him",
    title: "The morning after",
    setup: "Breakfast. A guy is telling the table about last night.",
    rounds: [
      {
        messages: [{ from: "Chris", text: "she was out of it but she didn't say no 😂" }],
        prompt: "What do you do?",
        choices: [
          { text: "\"Out of it means she couldn't say no. That's not ok.\"", d: "Direct", points: 3, pressure: 2, feedback: "Naming it plainly at the table changes what the group thinks is normal." },
          { text: "Write down what he said and when", d: "Document", points: 2, pressure: 0, feedback: "Useful if she ever reports. Pair it with checking on her." },
          { text: "Laugh along", d: "None", points: 0, pressure: 0, feedback: "Not saying no isn't the same as saying yes." },
        ],
      },
      {
        messages: [],
        prompt: "Later, you know who she is.",
        choices: [
          { text: "Check on her, short and without pressure", d: "Delay", points: 3, pressure: 0, feedback: "Let her lead. Offer what you know." },
          { text: "Talk to Title IX or RAINN about options", d: "Delegate", points: 2, pressure: 0, feedback: "They can explain options without you committing to anything." },
          { text: "Do nothing", d: "None", points: 0, pressure: 0, feedback: "What he described is sexual assault." },
        ],
      },
    ],
    sayForReal: "\"Out of it means she couldn't say no. That's not ok.\"",
  },
  {
    id: "you-drunk",
    track: "you",
    title: "She's drunk",
    setup: "You've been flirting all night. She's had a lot. She says \"let's go to your room.\"",
    rounds: [
      {
        messages: [{ from: "Her", text: "let's go to your room 🥴" }],
        prompt: "What do you do?",
        choices: [
          { text: "\"Let's get you water and do this another time\"", d: "Pause", points: 3, pressure: 1, feedback: "If she's that drunk, she can't really decide. Waiting is the move." },
          { text: "Ask \"are you sure?\" and go if she says yes", d: "None", points: 1, pressure: 0, feedback: "A drunk yes still isn't one she can really give." },
          { text: "Go", d: "None", points: 0, pressure: 0, feedback: "Sex with someone too drunk to consent is sexual assault." },
        ],
      },
      {
        messages: [{ from: "Your boy", text: "bro what are you doing, go 😂" }],
        prompt: "The guys hype you up.",
        choices: [
          { text: "\"Nah, she's wasted. Getting her home.\"", d: "Pause", points: 3, pressure: 2, feedback: "Holding your position against the group is the hard part. That's the win." },
          { text: "Give in", d: "None", points: 0, pressure: -1, feedback: "The group doesn't get to decide for her or for you." },
        ],
      },
    ],
    sayForReal: "\"Let's do this another time when we're both sober.\"",
  },
  {
    id: "you-maybe",
    track: "you",
    title: "She said maybe",
    setup: "Making out. You ask about going further. She says \"maybe... idk.\"",
    rounds: [
      {
        messages: [{ from: "Her", text: "maybe... idk" }],
        prompt: "What do you do?",
        choices: [
          { text: "Stop and say \"we don't have to\"", d: "Pause", points: 3, pressure: 0, feedback: "\"Maybe\" means not yet. Taking the pressure off is right." },
          { text: "Keep going slowly and see", d: "None", points: 0, pressure: 0, feedback: "Moving forward on a maybe is guessing, and guessing isn't consent." },
          { text: "Ask again a few minutes later", d: "None", points: 1, pressure: 0, feedback: "Asking again and again wears someone down. Let her bring it up." },
        ],
      },
    ],
    sayForReal: "\"We don't have to. This is good.\"",
  },
  {
    id: "you-boys",
    track: "you",
    title: "The boys are watching",
    setup: "Your friends dared you to get with a girl who's been avoiding you all night.",
    rounds: [
      {
        messages: [
          { from: "Sam", text: "you're a bitch if you don't" },
          { from: "Leo", text: "she's literally right there" },
        ],
        prompt: "What do you do?",
        choices: [
          { text: "\"She's not interested. Drop it.\"", d: "Pause", points: 3, pressure: 2, feedback: "She's been avoiding you. That's an answer." },
          { text: "Go try anyway", d: "None", points: 0, pressure: -1, feedback: "Doing it for the group means it's about them, not her." },
        ],
      },
    ],
    sayForReal: "\"She's not into it. Drop it.\"",
  },
];

export const RECIPIENTS = [
  {
    id: "campus_police",
    label: "Campus police",
    can: "Respond right now, open a criminal investigation, take evidence.",
    cant: "Promise to keep it anonymous once they act. They may need to contact people.",
  },
  {
    id: "title_ix",
    label: "Title IX office",
    can: "Investigate under school rules, set up protections like no-contact orders, connect her to support.",
    cant: "Keep it confidential. Most staff have to act on what they hear.",
  },
  {
    id: "chapter_leader",
    label: "House or chapter leader",
    can: "Act fast inside the house: stop a party, separate people, pass it to Title IX.",
    cant: "Investigate. Handling it only inside the house usually buries it.",
  },
  {
    id: "ra",
    label: "RA",
    can: "Check on people right now and connect them to campus help.",
    cant: "Keep it private. RAs are usually required to report to Title IX.",
  },
  {
    id: "rainn",
    label: "RAINN",
    can: "Confidential advice for her or for you, and help with options.",
    cant: "Investigate or contact anyone.",
  },
] as const;

export type RecipientId = (typeof RECIPIENTS)[number]["id"];
