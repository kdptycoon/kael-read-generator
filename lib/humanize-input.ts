import type { FlowState } from "./flow-store";
import { STUCK_AREAS } from "./stuck-areas";

const PATTERN_LABELS: Record<string, string> = {
  "high-standards": "high standards for myself",
  "in-head": "in my head a lot",
  "shut-down": "shut down when it's too much",
  "emotions-best": "my emotions get the best of me",
  "escape": "escape when things get heavy",
  "everyone-okay": "make sure everyone else is okay",
  "hard-on-myself": "hard on myself",
  "put-off": "put things off",
  "control": "need to feel in control",
  "motions": "going through the motions",
};

const TRIED_LABELS: Record<string, string> = {
  books: "books",
  apps: "apps",
  therapy: "therapy",
  courses: "courses",
  podcasts: "podcasts",
  meditation: "meditation",
  journaling: "journaling",
  pushing: "pushing through",
  friends: "talking to friends",
  nothing: "nothing really",
};

const TIME_LABELS: Record<string, string> = {
  "few-months": "a few months",
  "about-year": "about a year",
  "two-three": "two to three years",
  "four-five": "four to five years",
  "longer": "longer than that",
};

export interface HumanizedInput {
  name: string;
  age: string;
  gender: string;
  stuck_area: string;
  specific_shape: string;
  time_stuck: string;
  patterns: string[];
  tried: string[];
}

export function humanizeInput(s: Partial<FlowState>): HumanizedInput {
  const area = s.stuckArea ? STUCK_AREAS[s.stuckArea]?.labelLower ?? s.stuckArea : "";
  return {
    name: (s.name ?? "").trim(),
    age: s.age ?? "",
    gender: s.gender ?? "",
    stuck_area: area,
    specific_shape: (s.customShape || s.specificShape || "").trim(),
    time_stuck: s.timeStuck ? TIME_LABELS[s.timeStuck] ?? s.timeStuck : "",
    patterns: (s.patterns ?? []).map((k) => PATTERN_LABELS[k] ?? k),
    tried: (s.whatTried ?? []).map((k) => TRIED_LABELS[k] ?? k),
  };
}
