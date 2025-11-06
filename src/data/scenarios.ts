export type RiskLevel = "red" | "yellow" | "green";

export interface Scenario {
  id: string;
  title: string;
  situation: string;
  riskLevel: RiskLevel;
  assessment: string;
  whatsHappening: string[];
  whatNotToDo: string[];
  whatToDoInstead: string[];
  realTalk: string;
  keywords: string[];
}

export const scenarios: Scenario[] = [
  {
    id: "persistent-texting",
    title: "15 unanswered texts, should I show up?",
    situation: "I've texted this girl 15 times over 3 days and she's not responding. Should I just show up at her house so she knows I'm serious?",
    riskLevel: "red",
    assessment: "Reality check: After 15 unanswered texts, showing up at her house isn't romantic—it's stalking. This behavior will get you blocked, reported, or worse.",
    whatsHappening: [
      "She's seen your messages and chose not to respond—that IS her answer",
      "You're hoping persistence will change her mind, but it actually makes you seem desperate and potentially dangerous",
      "She's likely feeling uncomfortable, possibly scared, and definitely not interested"
    ],
    whatNotToDo: [
      "Don't show up at her house, school, work, or anywhere else she might be",
      "Don't send more messages trying to explain yourself or asking why she's not responding",
      "Don't ask her friends to talk to her for you or try to find out information about her"
    ],
    whatToDoInstead: [
      "Stop texting immediately. Delete the conversation if it helps you move on",
      "Recognize that no response IS a response—she's not interested",
      "Focus your energy on someone who actually wants to talk to you"
    ],
    realTalk: "You want someone who's excited to text you back, not someone you have to track down. That's what good relationships feel like. Move on and find someone who's actually interested in you.",
    keywords: ["show up", "her house", "not responding", "unanswered", "15 times", "keeps texting"]
  },
  {
    id: "alcohol-hookup",
    title: "Should I get her drunk to hook up?",
    situation: "There's a party tonight. My friend said I should try to get this girl drunk so she'll be more likely to hook up. Good idea?",
    riskLevel: "red",
    assessment: "Absolutely not. What you're describing is sexual assault. This isn't just a bad idea—it's a crime that can ruin your life and cause serious harm to another person.",
    whatsHappening: [
      "Your friend is giving you advice that could land you in jail and put someone in danger",
      "Someone who's drunk can't legally consent to anything sexual—period",
      "You're considering taking advantage of someone's impaired state, which is predatory behavior"
    ],
    whatNotToDo: [
      "Don't give anyone drinks with the goal of getting them intoxicated",
      "Don't pursue any kind of sexual activity with someone who's been drinking",
      "Don't listen to friends who encourage you to do things that could harm someone"
    ],
    whatToDoInstead: [
      "If you're interested in someone, talk to them when you're both sober",
      "Get to know people at parties through actual conversation, not alcohol",
      "Be the guy who looks out for people's safety at parties, not the one people need protection from"
    ],
    realTalk: "Do you want to be known as the predator who takes advantage of drunk girls? That reputation follows you forever. If someone only hooks up with you because they're drunk, they don't actually want to hook up with you. Get your consent from sober, enthusiastic people.",
    keywords: ["drunk", "alcohol", "intoxicated", "get her drunk", "party", "drinks"]
  },
  {
    id: "she-said-stop",
    title: "She said stop but I really like her",
    situation: "We were making out and she said she wanted to stop but I really like her. Should I try again later tonight?",
    riskLevel: "red",
    assessment: "When someone says stop, you stop. Full stop. Trying again after she's already said no is pressure at best, assault at worst.",
    whatsHappening: [
      "She clearly communicated her boundary—she wanted to stop",
      "Your feelings for her don't override her right to say no at any point",
      "Asking again is pressuring her and shows you don't respect her boundaries"
    ],
    whatNotToDo: [
      "Don't try to initiate anything physical again tonight",
      "Don't try to convince her or ask why she wanted to stop",
      "Don't sulk or make her feel guilty for setting a boundary"
    ],
    whatToDoInstead: [
      "Respect her decision without making it weird or awkward",
      "Tell her you respect her boundaries and you're glad she felt comfortable saying stop",
      "Give her space and let her initiate if she wants to continue in the future"
    ],
    realTalk: "The hottest thing in the world is someone who's excited to be with you. When someone's not sure or says stop, and you pressure them—they're not going to suddenly become excited. They're going to feel unsafe and tell their friends you're creepy. Respect boundaries and find someone who's enthusiastically into you.",
    keywords: ["said stop", "said no", "wanted to stop", "try again", "keep trying"]
  },
  {
    id: "playing-hard-to-get",
    title: "Is she playing hard to get?",
    situation: "I've asked her out 5 times and she keeps saying she's busy. My friends say she's just playing hard to get. Should I keep trying?",
    riskLevel: "yellow",
    assessment: "She's not playing hard to get—she's hoping you'll take the hint. Five rejections is not a game, it's a clear pattern.",
    whatsHappening: [
      "She's trying to let you down gently by saying she's busy instead of flat-out rejecting you",
      "Your friends might be wrong—not every rejection is 'playing games'",
      "She's probably uncomfortable at this point and wondering why you won't stop asking"
    ],
    whatNotToDo: [
      "Don't ask her out again—five times is way past enough",
      "Don't believe the 'playing hard to get' narrative when someone keeps saying no",
      "Don't make her explicitly reject you to make her point clearer"
    ],
    whatToDoInstead: [
      "Accept that she's not interested and stop asking",
      "Give her space and let her come to you if her feelings change",
      "Put your energy toward someone who says yes the first or second time you ask"
    ],
    realTalk: "Real talk: when someone wants to go out with you, they make time. They don't have five excuses in a row. Save your dignity and move on to someone who's excited to hang out with you, not someone you have to chase down.",
    keywords: ["playing hard to get", "keeps saying", "busy", "asked her out", "5 times", "keep trying"]
  },
  {
    id: "mixed-signals",
    title: "Touchy when alone, ignores me in public",
    situation: "She's really touchy and flirty when we're alone but ignores me in public. I'm confused. Does she like me or not?",
    riskLevel: "yellow",
    assessment: "This is a yellow flag situation. She might like you but isn't ready to be public about it, or she might be using you for attention. Either way, you deserve clarity.",
    whatsHappening: [
      "She's comfortable with physical intimacy in private but not acknowledging you publicly",
      "This could mean she's not ready for a relationship, is embarrassed, or is keeping her options open",
      "You're getting mixed messages because her behavior is actually inconsistent"
    ],
    whatNotToDo: [
      "Don't keep accepting this treatment hoping it will change on its own",
      "Don't pressure her to be public with you if she's not ready",
      "Don't assume the worst without asking her directly about it"
    ],
    whatToDoInstead: [
      "Have a direct conversation: 'I'm confused about where we stand. What's going on?'",
      "Ask what she wants from this situation—casual, private, or potentially more?",
      "Decide if you're okay with her terms, and if not, be honest about what you need"
    ],
    realTalk: "You don't want to be someone's secret. If she's into you, she should be able to acknowledge you in public. If she's not ready for that, you need to decide if you're cool with the current situation or if you need something more. Don't settle for scraps.",
    keywords: ["mixed signals", "ignores me", "in public", "when alone", "touchy", "flirty"]
  },
  {
    id: "friend-pressure-party",
    title: "Friends pressuring me to make a move",
    situation: "My friends are all pressuring me to make a move on this girl at a party. She seems uncomfortable but they're saying I'm being a pussy. What do I do?",
    riskLevel: "yellow",
    assessment: "Your friends are wrong. Making someone uncomfortable isn't being confident—it's being an asshole. Trust your gut here.",
    whatsHappening: [
      "You're picking up on her discomfort, which means she's not interested or not ready",
      "Your friends are prioritizing their entertainment over both your and her wellbeing",
      "They're confusing aggression with confidence—there's a big difference"
    ],
    whatNotToDo: [
      "Don't make a move on someone who seems uncomfortable just to prove something to your friends",
      "Don't let peer pressure override your instincts about someone's boundaries",
      "Don't participate in 'proving your manhood' at someone else's expense"
    ],
    whatToDoInstead: [
      "Trust your gut—if she seems uncomfortable, back off",
      "Tell your friends you're not interested or change the subject",
      "Find better friends who don't pressure you to make people uncomfortable"
    ],
    realTalk: "Real confidence is being able to ignore peer pressure and do what's right. The guys who actually get girls aren't the ones forcing interactions—they're the ones who can read a room and respect boundaries. Your friends won't be there when you're dealing with consequences, but you will.",
    keywords: ["friends pressure", "they're saying", "make a move", "party", "seems uncomfortable"]
  },
  {
    id: "post-rejection-persistence",
    title: "She wants to be friends but I know she's the one",
    situation: "She said she just wants to be friends but I know she's the one. Should I keep trying to show her we're meant to be together?",
    riskLevel: "red",
    assessment: "She's not 'the one' if she doesn't want to be with you. You're romanticizing rejection, and continuing to pursue her crosses into harassment.",
    whatsHappening: [
      "She's been clear about her boundaries—she wants friendship, not romance",
      "You're not respecting her stated wishes because you believe you know better than she does",
      "This is the beginning of stalker behavior disguised as romance"
    ],
    whatNotToDo: [
      "Don't keep trying to 'show her' or 'prove' you're meant to be together",
      "Don't hang around as her friend hoping she'll eventually change her mind",
      "Don't make grand gestures or declarations of love after she's rejected you"
    ],
    whatToDoInstead: [
      "Accept her rejection and genuinely move on—no 'maybe someday' fantasies",
      "Take real space from the friendship until you're completely over your romantic feelings",
      "Redirect your energy toward someone who actually wants to be with you"
    ],
    realTalk: "There's no such thing as 'the one' who doesn't want you back. That's called a crush, not destiny. You're wasting time on someone who's told you no instead of finding someone who's excited to say yes. Stop chasing and start being available to someone who actually wants you.",
    keywords: ["the one", "meant to be", "keep trying", "just wants to be friends", "show her"]
  },
  {
    id: "bystander-friend",
    title: "My friend won't stop texting a girl",
    situation: "My friend is texting a girl who's clearly not interested. He keeps saying he'll show up at her house. Should I say something?",
    riskLevel: "yellow",
    assessment: "Yes, you should say something. Your friend is heading toward behavior that could be dangerous for her and have serious consequences for him.",
    whatsHappening: [
      "Your friend is exhibiting stalking behavior and doesn't realize how serious it is",
      "The girl is probably scared and might need intervention",
      "You have the power to potentially prevent a serious situation"
    ],
    whatNotToDo: [
      "Don't stay silent because you don't want to be 'that guy' who calls out your friend",
      "Don't encourage him or laugh it off as no big deal",
      "Don't wait until he actually shows up at her house to say something"
    ],
    whatToDoInstead: [
      "Tell him directly: 'Dude, that's stalking. You need to stop.'",
      "Explain that showing up at someone's house after they've ignored you isn't romantic, it's threatening",
      "If he won't listen, consider telling someone who can help—a coach, parent, or school counselor"
    ],
    realTalk: "Real friends stop their friends from doing dumb shit that can ruin their lives. You're not being a buzzkill—you're potentially saving him from criminal charges and saving her from being scared in her own home. Would you want someone to speak up if it was your sister?",
    keywords: ["my friend", "won't stop", "show up at her", "should I say something", "what should I do"]
  },
  {
    id: "sexual-coercion",
    title: "We've been dating 3 months, she still won't have sex",
    situation: "We've been dating for 3 months and she still won't have sex. I've been spending a lot of money on her. How do I make her see she owes me?",
    riskLevel: "red",
    assessment: "She doesn't owe you anything. Ever. Time together and money spent don't create a debt that's paid with sex. This mindset leads directly to sexual assault.",
    whatsHappening: [
      "You view sex as a transaction where your time and money should equal sexual access",
      "She's not ready for sex, and no amount of time or money changes that",
      "You're considering coercion, which is a form of sexual assault"
    ],
    whatNotToDo: [
      "Don't tell her she owes you sex because of money you've spent",
      "Don't pressure, guilt-trip, or manipulate her into sexual activity",
      "Don't stay in a relationship where you're keeping score of what you've done for her"
    ],
    whatToDoInstead: [
      "Accept that she's not ready for sex and respect that boundary completely",
      "Ask yourself if you're okay being in a relationship at this pace—if not, end it respectfully",
      "Understand that nobody ever owes anyone sex, regardless of circumstances"
    ],
    realTalk: "If you're only spending time and money on her to get sex, you're not actually interested in her—you're using her. Real relationships aren't transactions. If your paces don't match and that's a dealbreaker, break up. But you don't get to pressure someone into sex because you bought dinner.",
    keywords: ["owes me", "spent money", "won't have sex", "still won't", "make her"]
  },
  {
    id: "uncertainty",
    title: "Not sure if she's into me",
    situation: "I'm not sure if she's into me. We've hung out a few times. How do I know if I have a shot?",
    riskLevel: "yellow",
    assessment: "Uncertainty is normal. The best way to find out is through clear communication and paying attention to how she responds to you.",
    whatsHappening: [
      "You've spent time together but haven't gotten clear signals either way",
      "She might be interested but shy, or just enjoying your friendship",
      "The only way to know for sure is to create a low-pressure opportunity to find out"
    ],
    whatNotToDo: [
      "Don't overanalyze every interaction looking for hidden meanings",
      "Don't ask her friends to investigate for you",
      "Don't confess your feelings dramatically if you're not sure she's interested"
    ],
    whatToDoInstead: [
      "Ask her to hang out one-on-one in a clearly date-like context (not just 'hanging out')",
      "Pay attention to her response—does she seem excited and engaged or polite but distant?",
      "If you're still unsure after a clear date invite, ask directly but casually: 'Is this a date or are we just friends?'"
    ],
    realTalk: "The only way to know if someone likes you is to put yourself out there a bit. Ask her on an actual date—use the word 'date' if you need to. If she says no or makes excuses, you have your answer. If she says yes, great. Either way, you'll know and can move forward.",
    keywords: ["not sure", "how do I know", "have a shot", "into me", "likes me"]
  },
  {
    id: "clear-interest",
    title: "She texted asking to hang out this weekend",
    situation: "This girl texted me asking if I want to hang out this weekend. She said 'just the two of us 😊'. Does this mean she likes me?",
    riskLevel: "green",
    assessment: "Yes, this is a green flag! She's initiating one-on-one time and being clear about it. This is exactly what genuine interest looks like.",
    whatsHappening: [
      "She's taking the initiative to ask you out, which shows confidence and interest",
      "She specified 'just the two of us' which signals she wants it to be date-like",
      "The emoji suggests she's feeling positive and maybe a bit flirty about it"
    ],
    whatNotToDo: [
      "Don't overthink this or look for hidden meanings—take it at face value",
      "Don't play games by waiting days to respond to seem 'cool'",
      "Don't bring other people along or suggest a group hang"
    ],
    whatToDoInstead: [
      "Respond enthusiastically but not desperately: 'Yeah, that sounds great! What did you have in mind?'",
      "Suggest a specific activity and time to show you're taking it seriously",
      "Show up on time, be yourself, and see where it goes"
    ],
    realTalk: "This is what you want—someone who's clearly interested and takes initiative. Don't sabotage it by overthinking. Just say yes, plan something fun, and enjoy spending time with someone who actually wants to be around you. This is what it should feel like.",
    keywords: ["hang out", "just the two of us", "this weekend", "does she like me", "texted me"]
  },
  {
    id: "respectful-approach",
    title: "How to ask her out without being pushy",
    situation: "I like this girl but I'm not sure if she likes me back. What's a good way to ask her out without being pushy?",
    riskLevel: "green",
    assessment: "This is a green flag approach. You're thinking about how to be respectful and clear, which is exactly the right mindset.",
    whatsHappening: [
      "You're interested in someone but want to respect their boundaries",
      "You're aware that there's a right and wrong way to express interest",
      "You're seeking advice before acting, which shows emotional maturity"
    ],
    whatNotToDo: [
      "Don't confess your feelings dramatically before you know if there's mutual interest",
      "Don't corner her somewhere private where she might feel trapped",
      "Don't build it up into a huge deal in your head before you even ask"
    ],
    whatToDoInstead: [
      "Keep it simple and direct: 'Hey, would you want to grab coffee/see a movie sometime?'",
      "Ask in a setting where she can easily say no without it being awkward",
      "If she says no or seems hesitant, accept it gracefully: 'No worries, just thought I'd ask!'"
    ],
    realTalk: "This is the right approach. You're being thoughtful about how to express interest while respecting her autonomy. Keep it simple, be direct, and make it easy for her to say yes or no. If she says no, you move on with your dignity intact. If she says yes, great—you did it the right way.",
    keywords: ["how to ask", "without being pushy", "good way", "respectful", "should I ask"]
  }
];

import { analyzeWithAI } from "../lib/ai-analyzer";

export const analyzeScenario = async (text: string): Promise<Scenario> => {
  try {
    const aiResult = await analyzeWithAI(text);
    
    return {
      id: "ai-generated",
      title: "AI Analysis",
      situation: text,
      riskLevel: aiResult.riskLevel,
      assessment: aiResult.assessment,
      whatsHappening: aiResult.whatsHappening,
      whatNotToDo: aiResult.whatNotToDo,
      whatToDoInstead: aiResult.whatToDoInstead,
      realTalk: aiResult.realTalk,
      keywords: []
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Fallback to default response
    return {
      id: "error",
      title: "Analysis Error",
      situation: text,
      riskLevel: "yellow",
      assessment: "We're having trouble analyzing this right now. Please try again.",
      whatsHappening: ["The system is temporarily unavailable"],
      whatNotToDo: ["Don't proceed if you're uncertain"],
      whatToDoInstead: ["Try submitting again in a moment"],
      realTalk: "When in doubt, slow down and communicate clearly.",
      keywords: []
    };
  }
};
