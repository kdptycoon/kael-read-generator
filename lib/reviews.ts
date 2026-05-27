/**
 * Review data for Screens 5, 18, 21, and 24.
 * Placeholders until real beta-user reviews are collected.
 */

export interface Review {
  stars: number;
  body: string;
  tags?: string[];
  author: string;
  authorMeta?: string;
  goalKey?: string; // for matching to user's selected goals on Screen 21
}

export const AUTH_REVIEWS: Review[] = [
  {
    stars: 5,
    body:
      "I've done therapy, journaling, every app. Kael is the first thing that actually called me out on the same pattern showing up in different places. Three sessions in and something clicked.",
    tags: ["Sees my patterns", "Calls me out"],
    author: "Marcus T.",
    authorMeta: "Founder",
  },
  {
    stars: 5,
    body:
      "It catches me before I catch myself. The first week alone made me realize how often I was avoiding the actual question.",
    tags: ["Cuts through fog"],
    author: "Priya M.",
    authorMeta: "Designer",
  },
  {
    stars: 5,
    body:
      "I've tried so many self-help things. Kael felt different on day one. It actually held me to what I said.",
    tags: ["Holds the work"],
    author: "Jordan R.",
    authorMeta: "PM",
  },
];

export const REVIEW_ASK_REVIEW: Review = {
  stars: 5,
  body:
    "Kael saw something in me that 6 years of therapy didn't. I've never written a review before. This was worth it.",
  author: "Marcus T.",
};

/** Screen 21: 8 reviews, one per goal option. */
export const GOAL_REVIEWS: Review[] = [
  {
    stars: 5,
    body:
      "I stopped shrinking in meetings. The voice that told me I didn't belong got named, and once it had a name I could see it firing. Six weeks in I asked for the raise.",
    tags: ["Real confidence"],
    author: "Marcus T.",
    authorMeta: "34 · Real confidence",
    goalKey: "confidence",
  },
  {
    stars: 5,
    body:
      "My head used to spin until 2am every night. Kael caught the loop the first session and didn't let me hide from it. I sleep now. Actually sleep.",
    tags: ["A calm mind"],
    author: "Priya M.",
    authorMeta: "29 · A calm mind",
    goalKey: "calm",
  },
  {
    stars: 5,
    body:
      "I started 47 things this year. Finished maybe two. Kael caught the moment I quit, every single time. I've held my morning routine for 9 weeks now.",
    tags: ["Build better habits"],
    author: "Jordan R.",
    authorMeta: "27 · Build better habits",
    goalKey: "habits",
  },
  {
    stars: 5,
    body:
      "I used to text three friends before making any decision. Kael showed me the loop. Last month I made a career move without asking anyone. It was right.",
    tags: ["Trusting myself"],
    author: "Sara P.",
    authorMeta: "31 · Trusting myself",
    goalKey: "trusting",
  },
  {
    stars: 5,
    body:
      "I'd been dating for years without letting anyone close. Kael named the shutdown the second it started happening. I told him I loved him this month. First time.",
    tags: ["Close relationships"],
    author: "Aisha K.",
    authorMeta: "33 · Close relationships",
    goalKey: "close",
  },
  {
    stars: 5,
    body:
      "Eight years of binging at night. I'd tried everything. Kael caught the trigger every time I reached for it. After a while I caught it myself. Sixty-seven days clean.",
    tags: ["Breaking the cycle"],
    author: "David L.",
    authorMeta: "38 · Breaking the cycle",
    goalKey: "cycle",
  },
  {
    stars: 5,
    body:
      "I was reacting to everyone else's life for so long I forgot I had one. Kael kept asking what I actually wanted. I quit the job. Moved cities. It's mine now.",
    tags: ["In charge of my life"],
    author: "Chris W.",
    authorMeta: "36 · In charge of my life",
    goalKey: "charge",
  },
  {
    stars: 5,
    body:
      "I'd been going through the motions for four years. Kael wouldn't let me get away with the easy answers. I cried in the third session. Haven't felt numb since.",
    tags: ["Feeling alive again"],
    author: "Lena K.",
    authorMeta: "41 · Feeling alive again",
    goalKey: "alive",
  },
];

/** High-conversion fillers used when fewer than 5 goals selected (Screen 21). */
const HIGH_CONVERSION_FILLERS = ["confidence", "calm", "cycle", "alive"];

export function pickSocialProofReviews(selectedGoals: string[]): Review[] {
  const byKey: Record<string, Review> = {};
  GOAL_REVIEWS.forEach((r) => {
    if (r.goalKey) byKey[r.goalKey] = r;
  });

  const out: Review[] = [];
  const seen = new Set<string>();

  // Lead card: first selected goal
  for (const g of selectedGoals) {
    const r = byKey[g];
    if (r && !seen.has(g)) {
      out.push(r);
      seen.add(g);
    }
  }

  // Fill with remaining high-conversion fillers
  for (const g of HIGH_CONVERSION_FILLERS) {
    if (out.length >= 5) break;
    const r = byKey[g];
    if (r && !seen.has(g)) {
      out.push(r);
      seen.add(g);
    }
  }

  // Fill any remaining with rest
  for (const r of GOAL_REVIEWS) {
    if (out.length >= 5) break;
    if (r.goalKey && !seen.has(r.goalKey)) {
      out.push(r);
      seen.add(r.goalKey);
    }
  }

  return out.slice(0, 5);
}

/** Screen 24 testimonials (one per loading stage). */
export interface LoadingTestimonial {
  username: string;
  headline: string;
}

export const LOADING_TESTIMONIALS: LoadingTestimonial[] = [
  { username: "AlexM1985", headline: "Saw something in me that 6 years of therapy didn't." },
  { username: "SarahJH", headline: "First time I felt actually understood." },
  { username: "ChrisParker", headline: "It catches me before I catch myself." },
  { username: "JordanR", headline: "Like having a coach who actually remembers." },
];
