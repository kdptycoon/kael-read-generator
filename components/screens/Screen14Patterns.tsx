"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import Headline from "@/components/Headline";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";

interface Opt {
  key: string;
  text: string;
}

const OPTIONS: Opt[] = [
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
];

export default function Screen14Patterns() {
  const patterns = useFlow((s) => s.patterns);
  const togglePattern = useFlow((s) => s.togglePattern);
  const next = useFlow((s) => s.next);

  const capped = patterns.length >= 3;
  const canContinue = patterns.length >= 1;

  return (
    <Screen
      showProgress
      cta={<PrimaryCTA label="Continue" onClick={next} disabled={!canContinue} />}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text="Which of these feel **true**?" size="lg" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[15.5px] leading-snug flex items-center justify-between"
        style={{ color: "var(--text-mute)" }}
      >
        <span>Most people see themselves in a few.</span>
        <span className="tabular-nums text-[12.5px]" style={{ color: "var(--text-faint)" }}>
          {patterns.length}/3
        </span>
      </motion.p>

      <div className="mt-6 flex flex-col gap-2.5">
        {OPTIONS.map((o, i) => {
          const selected = patterns.includes(o.key);
          const disabled = capped && !selected;
          return (
            <motion.button
              key={o.key}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.14 + i * 0.035 }}
              whileTap={!disabled ? { scale: 0.985 } : undefined}
              onClick={() => togglePattern(o.key)}
              disabled={disabled}
              className="press relative w-full rounded-2xl py-[18px] px-5 text-center"
              style={{
                background: selected
                  ? "linear-gradient(180deg, rgba(139,92,255,0.18) 0%, rgba(139,92,255,0.06) 100%)"
                  : "rgba(255,255,255,0.035)",
                border: `1px solid ${selected ? "rgba(139,92,255,0.55)" : "rgba(255,255,255,0.07)"}`,
                boxShadow: selected ? "0 0 24px rgba(139,92,255,0.22)" : "none",
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <span
                className="text-[16.5px] leading-snug"
                style={{
                  fontStyle: "italic",
                  color: selected ? "var(--text)" : "rgba(255,255,255,0.78)",
                  fontWeight: selected ? 500 : 400,
                  letterSpacing: "-0.005em",
                  textShadow: selected ? "0 0 18px rgba(139, 92, 255, 0.45)" : "none",
                }}
              >
                {o.text}
              </span>
            </motion.button>
          );
        })}
      </div>
    </Screen>
  );
}
