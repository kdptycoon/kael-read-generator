"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";

export default function Screen17Day1() {
  const name = useFlow((s) => s.name);
  const next = useFlow((s) => s.next);
  const display = name?.trim() || "you";

  return (
    <Screen
      showBack={false}
      cta={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.0 }}
        >
          <PrimaryCTA label="Keep going" onClick={next} />
        </motion.div>
      }
    >
      {/* Radial glow centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "20%",
          height: 480,
          background:
            "radial-gradient(closest-side, rgba(139,92,255,0.40) 0%, rgba(139,92,255,0.12) 40%, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "calc(100dvh - 220px)" }}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="text-[22px] font-semibold leading-snug tracking-[-0.01em]"
          style={{ color: "var(--text)" }}
        >
          You showed up, <span className="emph">{display}</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
          className="mt-6 font-bold tabular-nums relative"
          style={{
            fontSize: 112,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            color: "var(--text)",
            textShadow:
              "0 0 80px rgba(139,92,255,0.55), 0 0 36px rgba(139,92,255,0.4), 0 0 14px rgba(139,92,255,0.3)",
          }}
        >
          Day 1<span style={{ color: "var(--accent)" }}>.</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.5 }}
          className="mt-7 text-[16px] leading-snug max-w-[280px]"
          style={{ color: "var(--text-mute)" }}
        >
          Kael will remember this. Everything builds on it.
        </motion.p>
      </div>
    </Screen>
  );
}
