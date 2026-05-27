"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";
import { STUCK_AREAS } from "@/lib/stuck-areas";

const PATTERN_LABELS: Record<string, string> = {
  "high-standards": "High standards for myself",
  "in-head": "In my head a lot",
  "shut-down": "Shut down when it's too much",
  "emotions-best": "Emotions get the best of me",
  "escape": "Escape when things get heavy",
  "everyone-okay": "Make sure everyone else is okay",
  "hard-on-myself": "Hard on myself",
  "put-off": "Put things off",
  "control": "Need to feel in control",
  "motions": "Going through the motions",
};

const TRIED_LABELS: Record<string, string> = {
  therapy: "Therapy",
  books: "Books",
  courses: "Courses",
  podcasts: "Podcasts",
  apps: "Apps",
  journaling: "Journaling",
  meditation: "Meditation",
  friends: "Friends",
  pushing: "Pushing through",
  nothing: "Nothing yet",
};

const GOAL_LABELS: Record<string, string> = {
  confidence: "Real confidence",
  calm: "A calm mind",
  habits: "Better habits",
  trusting: "Trusting myself",
  close: "Close relationships",
  cycle: "Breaking the cycle",
  charge: "In charge of my life",
  alive: "Feeling alive again",
};

export default function Screen23StartingPoint() {
  const flow = useFlow();
  const next = useFlow((s) => s.next);
  const display = flow.name?.trim() || "you";

  const area = flow.stuckArea ? STUCK_AREAS[flow.stuckArea] : null;
  const pattern = flow.specificShape || flow.customShape;
  const truths = flow.patterns.map((p) => PATTERN_LABELS[p] ?? p).join(" · ");
  const tried = flow.whatTried.map((p) => TRIED_LABELS[p] ?? p).join(", ");
  const goalsList = flow.goals.map((g) => GOAL_LABELS[g] ?? g).join(" · ");

  return (
    <Screen cta={<PrimaryCTA label="Yes, start" onClick={next} />}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text={`Here's where you're **starting**, ${display}.`} size="lg" />
      </motion.div>

      {/* Premium card with shine */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
        className="mt-7 rounded-2xl overflow-hidden relative"
        style={{
          background:
            "linear-gradient(155deg, rgba(139,92,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(139,92,255,0.10) 100%)",
          border: "1px solid rgba(139,92,255,0.42)",
          boxShadow:
            "0 24px 48px -20px rgba(0,0,0,0.6), 0 0 48px rgba(139,92,255,0.22), inset 0 1px 0 rgba(255,255,255,0.16)",
        }}
      >
        {/* Shine sweep */}
        <motion.span
          initial={{ x: "-30%", opacity: 0 }}
          animate={{ x: "130%", opacity: [0, 0.35, 0] }}
          transition={{ duration: 2.4, delay: 0.6, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            width: 120,
            background:
              "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            transform: "skewX(-18deg)",
          }}
          aria-hidden
        />

        <div
          className="px-5 py-3 text-[11px] tracking-[0.18em] uppercase font-semibold flex items-center gap-2"
          style={{
            background: "rgba(139, 92, 255, 0.18)",
            color: "var(--accent-hi)",
            borderBottom: "1px solid rgba(139, 92, 255, 0.32)",
          }}
        >
          <span
            className="rounded-full"
            style={{ width: 6, height: 6, background: "var(--accent-hi)", boxShadow: "0 0 8px var(--accent-glow)" }}
          />
          Your starting point
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <Row label="Stuck area" value={area?.label ?? "—"} />
          {pattern && <Row label="Pattern" value={pattern} />}
          {truths && <Row label="What's true for you" value={truths} />}
          {tried && <Row label="Tried" value={tried} />}
          {goalsList && <Row label="Goal" value={goalsList} />}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="mt-6 text-[16.5px]"
        style={{ color: "var(--text-mute)" }}
      >
        This is what Kael&apos;s working with.{" "}
        <span style={{ color: "var(--text)", fontWeight: 600 }}>Ready?</span>
      </motion.p>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-[10.5px] tracking-[0.05em] uppercase font-semibold mb-1"
        style={{ color: "var(--text-faint)" }}
      >
        {label}
      </div>
      <div className="text-[15px] leading-snug" style={{ color: "rgba(255,255,255,0.95)" }}>
        {value}
      </div>
    </div>
  );
}
