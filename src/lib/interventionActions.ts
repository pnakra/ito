import type { StructuredSignals } from "@/types/signals";

export type InterventionId = "direct" | "distract" | "delegate" | "document" | "delay";

export interface InterventionAction {
  id: InterventionId;
  fiveD: string;
  fiveC: string;
  reason: string;
}

export const INTERVENTION_ACTIONS: Record<InterventionId, InterventionAction> = {
  direct: {
    id: "direct",
    fiveD: "Direct",
    fiveC: "Challenge",
    reason: "Names the problem plainly and interrupts the idea that everyone in the group agrees.",
  },
  distract: {
    id: "distract",
    fiveD: "Distract",
    fiveC: "Change the space",
    reason: "Interrupts the moment without requiring a confrontation or a speech.",
  },
  delegate: {
    id: "delegate",
    fiveD: "Delegate",
    fiveC: "Call in support",
    reason: "Brings in someone who can help act, so it does not all sit with one person.",
  },
  document: {
    id: "document",
    fiveD: "Document",
    fiveC: "Collect evidence",
    reason: "Keeps details available while leaving decisions about sharing them with the person targeted.",
  },
  delay: {
    id: "delay",
    fiveD: "Delay",
    fiveC: "Check in",
    reason: "Offers support after the moment and lets the person targeted decide what happens next.",
  },
};

const MATCHERS: Record<InterventionId, RegExp[]> = {
  direct: [
    /\b(say|reply|respond|speak up|tell him|tell them|call out|challenge|push back|name it)\b/i,
    /\b(not okay|not ok|nobody'?s going|no one'?s going|drop it|stop it)\b/i,
  ],
  distract: [
    /\b(distract|interrupt|change the subject|make an excuse|excuse to leave|create a diversion)\b/i,
    /\b(get|walk|bring|take) (her|him|them|the person) (out|away|home|somewhere)\b/i,
    /\b(their ride|water|food|bathroom|outside for air)\b/i,
  ],
  delegate: [
    /\b(delegate|report|moderator|platform|administrator|admin|title ix|ra\b|resident advisor|security|campus|police)/i,
    /\b(friend|friends|host|sober monitor|chapter leader|house leader|trusted adult|advocate|counselor|rainn)\b/i,
    /\b(ask|get|find|tell|contact|call) (someone|somebody|a friend|their friends|help|security|an ra)\b/i,
  ],
  document: [
    /\b(document|save|screenshot|screen recording|record|evidence|timestamp|url|link)\b/i,
    /\b(write down|keep a copy|back up|photograph the screen|preserve)\b/i,
  ],
  delay: [
    /\b(check in|check on|check up|follow up|afterward|afterwards|later|the next day|tomorrow)\b/i,
    /\b(are you okay|are you ok|let them lead|let her lead|let him lead|offer support|listen)\b/i,
  ],
};

/** Add a plain-language 5 D / 5 C label without changing the AI suggestion itself. */
export function getInterventionAction(text: string): InterventionAction {
  const scores: Record<InterventionId, number> = { direct: 0, distract: 0, delegate: 0, document: 0, delay: 0 };
  for (const id of Object.keys(MATCHERS) as InterventionId[]) {
    for (const matcher of MATCHERS[id]) if (matcher.test(text)) scores[id] += 1;
  }
  const best = (Object.keys(scores) as InterventionId[]).reduce((current, id) =>
    scores[id] > scores[current] ? id : current
  , "delegate" as InterventionId);
  return INTERVENTION_ACTIONS[scores[best] > 0 ? best : "delegate"];
}

/** Online pile-ons need a different safety rule: engagement can spread the harm. */
export function isOnlineWitnessContext(text: string): boolean {
  return /\b(sidechat|fizz|group ?chat|groupme|snapchat|instagram|tiktok|discord|reddit|social media|anonymous app|online|comment thread|direct message|dm|text thread)\b/i.test(text)
    || /\b(post|repost|reposted|comment|comments|screenshot|thread)\b/i.test(text);
}

/** Deterministic display guard: safety answers and anti-amplification outrank AI wording. */
export function getWitnessSuggestionOverride(
  signals: Partial<StructuredSignals> | null | undefined,
  online: boolean,
  originalSuggestion: string,
): string | null {
  switch (signals?.targetPreference) {
    case "no-share":
      return "Keep the post, screenshots, and their story private. Ask what they want before reporting or sharing anything; if someone is in immediate danger, call 911.";
    case "no-report":
      return "Check in privately and ask what support, if any, they want. Do not report or share identifying details without their permission unless someone is in immediate danger.";
    case "no-contact":
      return "Ask someone they trust to check in instead of contacting them yourself. Keep any evidence private and ask before sharing it.";
  }
  if (signals?.witnessSafety === "self" || signals?.witnessSafety === "both") {
    return "Use a lower-profile option: report through the platform or ask someone trusted to step in. You do not have to confront anyone.";
  }
  if (signals?.witnessSafety === "target") {
    return "Check in privately and ask someone trusted to help without drawing more attention to them. Avoid a public confrontation.";
  }
  if (online && /\b(reply|comment|quote|repost|tag|share (it|the|this)|send it to|post (it|the|this))\b/i.test(originalSuggestion)) {
    return "Do not reply or repost. Report the content in the app, save evidence privately, and ask the person targeted what they want shared.";
  }
  return null;
}

export function getWitnessSafetyNotes(signals?: Partial<StructuredSignals> | null): string[] {
  if (!signals) return [];
  const notes: string[] = [];
  if (signals.witnessSafety === "self" || signals.witnessSafety === "both") {
    notes.push("You do not have to confront anyone. Use a lower-profile option or ask someone else to step in if this could make you a target.");
  }
  if (signals.witnessSafety === "target" || signals.witnessSafety === "both") {
    notes.push("Avoid pulling more attention toward the person targeted. Check in privately and use help that does not expose them.");
  }
  switch (signals.targetPreference) {
    case "no-report":
      notes.push("They asked you not to report. If they are an adult and no one is in immediate danger, do not report or share identifying details without checking with them first.");
      break;
    case "no-share":
      notes.push("They asked you not to share it. Keep screenshots and details private, and ask before passing them to anyone.");
      break;
    case "no-contact":
      notes.push("They asked for space. Do not contact them directly; ask someone they trust to check in instead.");
      break;
    case "unknown":
      notes.push("If you can, ask what they want before sharing their story or reporting it. Let them lead when there is no immediate danger.");
      break;
  }
  return notes;
}
