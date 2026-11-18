export type PartnerFocus = "bystander" | "ito" | "both";

export const FOCUS_OPTIONS: { id: PartnerFocus; label: string }[] = [
  { id: "bystander", label: "Helping a friend" },
  { id: "ito", label: "Your own situations" },
  { id: "both", label: "Both" },
];

const BY_SHORT = "Saw something in a group chat or at a party that didn't sit right? isthisok.app/bystanderbeta is a free, anonymous place to describe it and figure out what to do, starting with steps no one can trace back to you.";
const BY_LONG = "Not sure what to do about something you saw? Maybe someone in the group chat keeps posting about a girl from last weekend. Maybe a post on Sidechat or Fizz names a student and people are piling on. Maybe a friend is pushing someone who doesn't seem into it. is this ok? (isthisok.app/bystanderbeta) is a free, anonymous tool for moments like these. Describe what you saw or heard, and it helps you work out whether something might be wrong and what you can do about it. It starts with steps that won't put you on the spot, and it can help you write up an anonymous tip. You don't sign in, and nothing you type is linked to you. In an emergency, call 911.";
const BY_STAFF_FIRST = "is this ok? is a free, anonymous website built by Override Labs, an Illinois nonprofit working on sexual violence prevention.";
const BY_STAFF_REST = "The bystander version helps someone who saw or heard something worrying, online or in person, decide what to do next. It suggests ways to help that don't require confronting anyone first, can draft an anonymous tip in the student's own words, and includes short guides for practicing what to say and for stopping an online pile-on. It is an AI tool, not a crisis line or a reporting system. It doesn't contact anyone or file reports for the student, and it links to 911, 988 and RAINN. Users don't create accounts or give names.";
const ITO_LONG = "Not sure if something was ok? Maybe they said yes but something felt off. Maybe you were both drinking and you're not sure where the line was. is this ok? (isthisok.app) is a free, anonymous tool where you describe a dating or sexual situation that feels off and get a clear, judgment-free read on it, plus what to do next. You don't sign in, and nothing you type is linked to you. In an emergency, call 911.";

export const MESSAGES: Record<PartnerFocus, { label: string; text: string }[]> = {
  bystander: [
    { label: "Short", text: BY_SHORT },
    { label: "Longer", text: BY_LONG },
    { label: "Staff explainer", text: `${BY_STAFF_FIRST} ${BY_STAFF_REST}` },
  ],
  ito: [
    { label: "Short", text: "Hookup or date that felt off? isthisok.app is a free, anonymous place to describe it and get a clear, judgment-free read on what happened and what to do next." },
    { label: "Longer", text: ITO_LONG },
    { label: "Staff explainer", text: "is this ok? is a free, anonymous website built by Override Labs, an Illinois nonprofit working on sexual violence prevention. Students describe a dating or sexual situation that feels off and get a clear, judgment-free read on what happened and what to do next. It is an AI tool, not a crisis line or a reporting system. It doesn't contact anyone or file reports, and it links to 911, 988 and RAINN. Users don't create accounts or give names." },
  ],
  both: [
    { label: "Short", text: "Something feel off, for you or for someone else? is this ok? is free and anonymous. For your own situations: isthisok.app. If you saw something happen to someone else: isthisok.app/bystanderbeta." },
    { label: "Longer", text: `${ITO_LONG} Saw something happen to someone else? The bystander version at isthisok.app/bystanderbeta helps you figure out how to help, starting with steps no one can trace back to you.` },
    { label: "Staff explainer", text: `${BY_STAFF_FIRST} Students can use it for their own situations at isthisok.app, or for something they saw happen to someone else at isthisok.app/bystanderbeta. ${BY_STAFF_REST}` },
  ],
};

export const FLYERS: Record<PartnerFocus, { pill: boolean; headline: string; sub: string; examples: string[] }> = {
  bystander: {
    pill: true,
    headline: "Saw something that felt off?",
    sub: "Describe it anonymously and figure out what to do, starting with steps no one can trace back to you.",
    examples: ["Someone in the group chat keeps posting about a girl from last night", "A Sidechat or Fizz post names a student and people pile on", "A friend might be pressuring someone who isn't into it"],
  },
  ito: {
    pill: false,
    headline: "Not sure if it was ok?",
    sub: "Describe a hookup, date or situation that felt off. Get a clear, judgment-free read on what happened and what to do next.",
    examples: ["They said yes but something felt off", "We were both drinking and I'm not sure where the line was", "I don't know where they stand"],
  },
  both: {
    pill: false,
    headline: "Something feel off?",
    sub: "For your own situations, or something you saw happen to someone else. Free and anonymous.",
    examples: ["They said yes but something felt off", "Someone in the group chat keeps posting about a girl from last night", "A Sidechat or Fizz post names a student and people pile on"],
  },
};

export const STAFF_FAQ: { q: string; a: string; privacyLink?: boolean }[] = [
  { q: "Is it really anonymous? What gets saved?", a: "No one signs in or gives a name, email or phone number. The text someone types is processed by the AI model that writes ito's responses and saved so our small team can review it for quality and safety and improve the tool. We use Google Analytics in non-personalized mode for basic usage counts. We ask people not to type full names or school names, and the anonymous tip page doesn't save what's written there. Full details are in our privacy policy.", privacyLink: true },
  { q: "Does it report anything to Title IX, the school or police?", a: "No. ito never contacts anyone or files a report. It can help a student draft an anonymous tip, and the student decides whether and where to send it. Sharing the link doesn't change your own reporting obligations: if a student tells you something directly, your usual process applies." },
  { q: "What if a student describes their own assault, or is in crisis?", a: "ito is not a crisis line and says so on every page. It links to 911 for emergencies, 988 for mental health crises and RAINN for sexual assault support. When someone discloses that something happened to them, it responds with support and points them to those resources." },
  { q: "What ages is it for?", a: "The site is for ages 13 and up. The bystander version was built with college students and older teens in mind, including Greek life and campus group chats." },
  { q: "Who built it, and who reviewed it?", a: "Override Labs, an Illinois nonprofit focused on sexual violence prevention, founded by Priya Nakra. Its responses were developed with input from clinical and academic advisors and are tested against a large set of realistic scenarios." },
  { q: "Does it cost anything?", a: "No. It's free for students and for the schools and organizations that share it." },
  { q: "Can we see how many of our students use it?", a: "Not through tracking links, because that would undercut the promise that nothing is linked to the user. Students can optionally tell us where they heard about ito, and we share totals with an organization once enough people have named it that no one can be identified. Telling us where you shared it (below) helps too." },
];

export const REACH_OPTIONS = ["Under 50", "50-200", "200-1,000", "1,000+", "Not sure"];
