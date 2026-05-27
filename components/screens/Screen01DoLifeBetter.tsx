"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import KaelLogo from "@/components/KaelLogo";
import { useFlow } from "@/lib/flow-store";

export default function Screen01DoLifeBetter() {
  const next = useFlow((s) => s.next);

  return (
    <Screen
      showBack={false}
      showSettings
      cta={<PrimaryCTA label="Find your path forward" onClick={next} />}
      contentClassName="flex flex-col"
    >
      {/* Multi-layer ambient halo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side at 50% 38%, rgba(139,92,255,0.32) 0%, rgba(139,92,255,0.12) 35%, transparent 65%), radial-gradient(closest-side at 50% 38%, rgba(196,163,255,0.18) 0%, transparent 30%)",
        }}
      />

      {/* Soft vignette at edges so the center reads brighter */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-[1]">
        {/* Logo with breathing scale + slow concentric pulse */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              initial={{ scale: 0.55, opacity: 0 }}
              animate={{ scale: [0.55, 1.6], opacity: [0, 0.4, 0] }}
              transition={{
                duration: 5,
                delay: 0.6 + i * 2.5,
                repeat: Infinity,
                ease: "easeOut",
                times: [0, 0.18, 1],
              }}
              style={{
                width: 130,
                height: 130,
                border: "1px solid rgba(196, 163, 255, 0.32)",
              }}
              aria-hidden
            />
          ))}

          {/* breathing inner glow */}
          <motion.span
            className="absolute rounded-full"
            animate={{
              opacity: [0.5, 0.85, 0.5],
              scale: [0.9, 1.04, 0.9],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 160,
              height: 160,
              background:
                "radial-gradient(circle, rgba(139,92,255,0.32) 0%, rgba(139,92,255,0.10) 50%, transparent 75%)",
              filter: "blur(2px)",
            }}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: [1, 1.035, 1] }}
            transition={{
              opacity: { duration: 0.9, ease: "easeOut" },
              scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ position: "relative", zIndex: 2 }}
          >
            <KaelLogo size={92} />
          </motion.div>
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mt-6 flex items-center gap-2.5"
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
            style={{
              color: "rgba(196,163,255,0.85)",
              letterSpacing: "0.32em",
            }}
          >
            Welcome to
          </span>
          <span
            className="block"
            style={{
              width: 18,
              height: 1,
              background:
                "linear-gradient(90deg, rgba(196,163,255,0.6) 0%, transparent 100%)",
            }}
            aria-hidden
          />
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.7, ease: "easeOut" }}
          className="mt-3 font-bold"
          style={{
            fontSize: 76,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            color: "var(--text)",
            textShadow:
              "0 0 56px rgba(139,92,255,0.45), 0 0 18px rgba(139,92,255,0.3)",
          }}
        >
          Kael<span style={{ color: "var(--accent-hi)" }}>.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
          className="mt-7 text-[20px] leading-[1.4] font-medium max-w-[320px]"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          A coach that helps you get <span className="emph">unstuck</span> in life.
        </motion.p>
      </div>
    </Screen>
  );
}
