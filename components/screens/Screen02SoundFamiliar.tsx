"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

interface Item {
  label: string;
  desc: string;
}

const ITEMS: Item[] = [
  { label: "Books", desc: "that hyped you up for a week." },
  { label: "Apps", desc: "you opened twice." },
  { label: "Podcasts", desc: "you binged, then forgot." },
  { label: "Motivation", desc: "that died by Wednesday." },
];

export default function Screen02SoundFamiliar() {
  const next = useFlow((s) => s.next);

  return (
    <Screen
      cta={<PrimaryCTA label="Continue" onClick={next} />}
      contentClassName="flex flex-col"
    >
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
          The cycle
        </span>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mt-3"
      >
        <Headline text="You know how **this** goes." size="2xl" />
      </motion.div>

      {/* Numbered list of failures */}
      <ul className="mt-10 flex flex-col">
        {ITEMS.map((it, i) => (
          <motion.li
            key={it.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.32 + i * 0.12, ease: "easeOut" }}
            className="relative py-5"
            style={{
              borderTop: i === 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-baseline gap-4">
              <span
                className="font-semibold tabular-nums tracking-[0.18em] text-[11px]"
                style={{ color: "var(--accent-hi)", minWidth: 22 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[20px] font-semibold tracking-[-0.01em]"
                  style={{ color: "var(--text)" }}
                >
                  {it.label}
                </div>
                <div
                  className="mt-1 text-[15px] leading-snug"
                  style={{ color: "rgba(255,255,255,0.62)" }}
                >
                  {it.desc}
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </Screen>
  );
}
