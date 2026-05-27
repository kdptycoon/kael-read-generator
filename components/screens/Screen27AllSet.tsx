"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";

export default function Screen27AllSet() {
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
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          <PrimaryCTA label="Let's go" onClick={next} />
        </motion.div>
      }
    >
      <Confetti />

      {/* Radial halo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "18%",
          height: 460,
          background:
            "radial-gradient(closest-side, rgba(139,92,255,0.32) 0%, rgba(139,92,255,0.10) 45%, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "calc(100dvh - 220px)" }}>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="font-bold tabular-nums tracking-[-0.03em]"
          style={{
            fontSize: 64,
            lineHeight: 1.04,
            color: "var(--text)",
            textShadow: "0 0 56px rgba(139,92,255,0.45), 0 0 18px rgba(139,92,255,0.3)",
          }}
        >
          Locked in, {display}
          <span className="emph">.</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 1.0 }}
          className="mt-6 text-[19px] font-semibold leading-snug"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          The work begins now.
        </motion.p>
      </div>
    </Screen>
  );
}

const CONFETTI_COLORS = ["#8B5CFF", "#A47BFF", "#C4A3FF", "#7B47F2", "#E5B043", "#FFFFFF"];

function Confetti() {
  // Real-feeling confetti: small rectangles falling from top with rotation drift
  const pieces = Array.from({ length: 38 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {pieces.map((i) => {
        const left = (i * 37 + 7) % 100;
        const w = 4 + ((i * 13) % 6);
        const h = 8 + ((i * 11) % 8);
        const dur = 4 + ((i * 7) % 5) * 0.7;
        const delay = (i * 0.18) % 5;
        const rotate = (i * 73) % 360;
        const drift = ((i * 19) % 60) - 30;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <motion.span
            key={i}
            initial={{ y: -40, x: 0, rotate: rotate, opacity: 0 }}
            animate={{
              y: ["-10vh", "110vh"],
              x: [0, drift, drift / 2, drift * 1.4],
              rotate: [rotate, rotate + 540],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: dur,
              delay,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "easeIn",
              times: [0, 0.1, 0.85, 1],
            }}
            className="absolute"
            style={{
              left: `${left}%`,
              top: 0,
              width: w,
              height: h,
              borderRadius: 1.5,
              background: color,
              boxShadow: `0 0 6px ${color}88`,
            }}
          />
        );
      })}
    </div>
  );
}
