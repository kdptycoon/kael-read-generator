/**
 * Branched specific-shape data for Screen 12.
 *
 * Each stuck area key (lowercase) maps to:
 *   - label: human-readable name (used in Screen 12 headline:
 *     "What's going on with your <label>?")
 *   - shapes: 6 user-voice descriptions of the specific shape, paired
 *     with a distinct evocative emoji each.
 */

export interface ShapeOption {
  text: string;
  emoji: string;
}

export interface StuckArea {
  key: string;
  label: string;
  labelLower: string;
  shapes: ShapeOption[];
}

export const STUCK_AREAS: Record<string, StuckArea> = {
  career: {
    key: "career",
    label: "Career",
    labelLower: "career",
    shapes: [
      { text: "I keep starting things and not finishing", emoji: "🎢" },
      { text: "I feel behind everyone my age", emoji: "⏰" },
      { text: "I'm in the wrong thing but can't leave", emoji: "🪤" },
      { text: "I work hard but nothing compounds", emoji: "🌀" },
      { text: "I'm successful but it doesn't feel like mine", emoji: "🎭" },
      { text: "I can't tell what I actually want to do", emoji: "❓" },
    ],
  },
  relationships: {
    key: "relationships",
    label: "Relationships",
    labelLower: "relationships",
    shapes: [
      { text: "I push people away", emoji: "🚪" },
      { text: "I keep attracting the wrong people", emoji: "🧲" },
      { text: "I can't be myself around anyone", emoji: "🎭" },
      { text: "I'm lonely even when I'm not alone", emoji: "🌑" },
      { text: "I lose myself in relationships", emoji: "💫" },
      { text: "I avoid hard conversations", emoji: "🤐" },
    ],
  },
  money: {
    key: "money",
    label: "Money",
    labelLower: "money",
    shapes: [
      { text: "I earn it, then lose it", emoji: "💸" },
      { text: "I'm afraid to look at my finances", emoji: "🙈" },
      { text: "I undercharge / underearn", emoji: "⚖️" },
      { text: "I spend to feel better", emoji: "🛍️" },
      { text: "I sabotage right when I start making more", emoji: "🪤" },
      { text: "I hoard even when I have enough", emoji: "📦" },
    ],
  },
  health: {
    key: "health",
    label: "Health",
    labelLower: "health",
    shapes: [
      { text: "I know what's healthy but don't do it", emoji: "🤷" },
      { text: "I keep starting and stopping", emoji: "🔄" },
      { text: "I numb with food, alcohol, or scrolling", emoji: "📱" },
      { text: "I push myself until something breaks", emoji: "🥵" },
      { text: "I'm in a body that doesn't feel like mine", emoji: "🪞" },
      { text: "I take care of everyone but myself", emoji: "🤲" },
    ],
  },
  purpose: {
    key: "purpose",
    label: "Purpose",
    labelLower: "purpose",
    shapes: [
      { text: "I don't know what I actually care about", emoji: "🤷" },
      { text: "I built someone else's life", emoji: "🎭" },
      { text: "I'm successful but it doesn't feel meaningful", emoji: "🏆" },
      { text: "I lose interest in everything I start", emoji: "🍂" },
      { text: "I'm waiting for clarity that never comes", emoji: "⏳" },
      { text: "My values and my life don't match", emoji: "⚖️" },
    ],
  },
  discipline: {
    key: "discipline",
    label: "Discipline / habits",
    labelLower: "discipline",
    shapes: [
      { text: "I start strong, then fall off", emoji: "📉" },
      { text: "I know what to do but don't do it", emoji: "🤔" },
      { text: "I'm great with everyone else's stuff, not my own", emoji: "🪞" },
      { text: "I sabotage right when momentum builds", emoji: "🪤" },
      { text: "I do everything in extremes, all or nothing", emoji: "⚖️" },
      { text: "I wait until it's a crisis to act", emoji: "🚨" },
    ],
  },
};

export const STUCK_AREA_KEYS = ["career", "relationships", "money", "health", "purpose", "discipline"] as const;
