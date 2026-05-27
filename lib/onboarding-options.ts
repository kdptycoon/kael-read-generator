export const AGE_OPTIONS = [
  { key: "18-24", label: "18 – 24" },
  { key: "25-34", label: "25 – 34" },
  { key: "35-44", label: "35 – 44" },
  { key: "45-54", label: "45 – 54" },
  { key: "55+", label: "55+" },
] as const;

export const GENDER_OPTIONS = [
  { key: "male", label: "Male", emoji: "👨" },
  { key: "female", label: "Female", emoji: "👩" },
  { key: "nonbinary", label: "Non-binary", emoji: "🧑" },
  { key: "skip", label: "Prefer not to say", emoji: "🌀" },
] as const;

export const TIME_STUCK_OPTIONS = [
  { key: "few-months", label: "A few months", emoji: "⏳" },
  { key: "about-year", label: "About a year", emoji: "📅" },
  { key: "two-three", label: "Two to three years", emoji: "🗓️" },
  { key: "four-five", label: "Four to five years", emoji: "📆" },
  { key: "longer", label: "Longer than that", emoji: "♾️" },
] as const;

export const PATTERN_OPTIONS = [
  { key: "high-standards", text: "I have high standards for myself" },
  { key: "in-head", text: "I'm in my head a lot" },
  { key: "shut-down", text: "I shut down when it's too much" },
  { key: "emotions-best", text: "My emotions get the best of me" },
  { key: "escape", text: "I escape when things get heavy" },
  { key: "everyone-okay", text: "I make sure everyone else is okay" },
  { key: "hard-on-myself", text: "I'm hard on myself" },
  { key: "put-off", text: "I put things off" },
  { key: "control", text: "I need to feel in control" },
  { key: "motions", text: "I'm going through the motions" },
] as const;

export const TRIED_OPTIONS = [
  { key: "books", label: "Books" },
  { key: "apps", label: "Apps" },
  { key: "therapy", label: "Therapy" },
  { key: "courses", label: "Courses" },
  { key: "podcasts", label: "Podcasts" },
  { key: "meditation", label: "Meditation" },
  { key: "journaling", label: "Journaling" },
  { key: "pushing", label: "Pushing through" },
  { key: "friends", label: "Talking to friends" },
  { key: "nothing", label: "Nothing really" },
] as const;

export const PATTERNS_MAX = 3;
