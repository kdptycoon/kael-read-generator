"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";

export default function Screen25Reveal() {
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
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <PrimaryCTA label="Continue" onClick={next} />
        </motion.div>
      }
    >
      {/* Radial halo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "12%",
          height: 480,
          background:
            "radial-gradient(closest-side, rgba(139,92,255,0.32) 0%, rgba(139,92,255,0.10) 45%, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "calc(100dvh - 200px)" }}>
        {/* Big animated checkmark */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, delay: 0.15, type: "spring", stiffness: 220, damping: 18 }}
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 116,
            height: 116,
            background:
              "linear-gradient(160deg, rgba(139,92,255,0.32) 0%, rgba(123,71,242,0.18) 100%)",
            border: "1.5px solid rgba(139, 92, 255, 0.55)",
            boxShadow:
              "0 0 64px rgba(139,92,255,0.45), inset 0 1px 0 rgba(255,255,255,0.16)",
          }}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.45, delay: 0.55, type: "spring", stiffness: 380, damping: 22 }}
          >
            <Check size={56} strokeWidth={2.6} color="#FFFFFF" />
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.6 }}
          className="mt-9 font-bold tracking-[-0.025em]"
          style={{ fontSize: 38, lineHeight: 1.06, color: "var(--text)" }}
        >
          <span className="emph">Kael</span> is ready,
          <br />
          {display}.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.95 }}
          className="mt-4 text-[16px]"
          style={{ color: "var(--text-mute)" }}
        >
          Calibrated to what you shared.
        </motion.p>
      </div>
    </Screen>
  );
}
