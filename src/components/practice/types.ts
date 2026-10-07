export interface PracticeScenario {
  id: string;
  title: string;
  blurb: string;
  name: string;
  setup: string;
  opening: string;
  minutes: string | number;
  maxTurns: number;
}

export interface PracticeMsg {
  role: "user" | "assistant";
  content: string;
}

export interface PracticeTurn {
  kind: "partner" | "note";
  name?: string;
  text: string;
  ended: boolean;
  endReason?: string | null;
  closed: boolean;
  closeReason?: string | null;
  paused?: boolean;
  handoff?: "real" | "distress" | null | string;
  flag?: unknown;
  strike?: unknown;
  turnsLeft?: number;
}

export interface PracticeDebrief {
  headline: string;
  did_well: string[];
  missed: string[];
  try_next: string;
  checks?: unknown;
  endReason?: string;
}
