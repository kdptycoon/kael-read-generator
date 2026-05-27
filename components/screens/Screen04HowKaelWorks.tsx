"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";

export default function Screen04HowKaelWorks() {
  const next = useFlow((s) => s.next);

  return (
    <Screen
      cta={<PrimaryCTA label="Let's get started" onClick={next} />}
      contentClassName="flex flex-col"
    >
      {/* Ambient halo behind the hero */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: 60,
          height: 380,
          background:
            "radial-gradient(closest-side at 50% 0%, rgba(139,92,255,0.20) 0%, rgba(139,92,255,0.06) 45%, transparent 75%)",
        }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-2 flex items-center gap-2.5"
      >
        <span
          className="block"
          style={{
            width: 18,
            height: 1,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(196,163,255,0.6) 100%)",
          }}
          aria-hidden
        />
        <span
          className="text-[10.5px] font-semibold uppercase"
          style={{ color: "rgba(196,163,255,0.85)", letterSpacing: "0.32em" }}
        >
          How it works
        </span>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center mt-2 relative z-[1]">
        {/* Phase 01 */}
        <PhaseBlock
          index={0}
          number="01"
          line1="Kael makes it"
          accent="visible"
          tail="."
          description="Names the script the moment it fires — in your own words, as it happens."
        />

        {/* Connector — animated descending dot down a thin gradient line */}
        <Connector delay={0.8} />

        {/* Phase 02 */}
        <PhaseBlock
          index={1}
          number="02"
          line1="Then helps you"
          accent="change"
          tail=" it."
          description="Catches the move when it shows up. Holds you across weeks, not just sessions."
        />
      </div>
    </Screen>
  );
}

function PhaseBlock({
  index,
  number,
  line1,
  accent,
  tail,
  description,
}: {
  index: number;
  number: string;
  line1: string;
  accent: string;
  tail: string;
  description: string;
}) {
  const baseDelay = index * 0.65;
  return (
    <div className="flex items-start gap-4">
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: baseDelay + 0.15 }}
        className="text-[12px] font-semibold tabular-nums tracking-[0.18em] mt-2"
        style={{ color: "var(--accent-hi)", minWidth: 24 }}
      >
        {number}
      </motion.span>

      <div className="flex-1 min-w-0">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: baseDelay + 0.2 }}
          className="font-bold tracking-[-0.025em]"
          style={{ fontSize: 32, lineHeight: 1.08, color: "var(--text)" }}
        >
          {line1} <span className="emph">{accent}</span>
          {tail}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: baseDelay + 0.4 }}
          className="mt-3 text-[15px] leading-[1.5]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {description}
        </motion.p>
      </div>
    </div>
  );
}

function Connector({ delay }: { delay: number }) {
  return (
    <div className="relative my-7 ml-[12px]" style={{ height: 56 }} aria-hidden>
      {/* Thin gradient line */}
      <motion.span
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.7, delay, ease: "easeOut" }}
        className="absolute left-0 top-0 bottom-0 origin-top"
        style={{
          width: 1,
          background:
            "linear-gradient(180deg, rgba(196,163,255,0.55) 0%, rgba(139,92,255,0.18) 50%, rgba(139,92,255,0.55) 100%)",
        }}
      />
      {/* Travelling dot */}
      <motion.span
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [0, 56], opacity: [0, 1, 0] }}
        transition={{
          duration: 2.6,
          delay: delay + 0.6,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.55, 1],
        }}
        className="absolute -left-[3px] rounded-full"
        style={{
          width: 7,
          height: 7,
          background: "var(--accent-hi)",
          boxShadow: "0 0 12px rgba(196, 163, 255, 0.85)",
        }}
      />
    </div>
  );
}
