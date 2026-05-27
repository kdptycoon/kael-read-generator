"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Screen from "@/components/Screen";
import IconRow from "@/components/IconRow";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

interface Opt {
  key: string;
  label: string;
}

const OPTIONS: Opt[] = [
  { key: "18-24", label: "18 – 24" },
  { key: "25-34", label: "25 – 34" },
  { key: "35-44", label: "35 – 44" },
  { key: "45-54", label: "45 – 54" },
  { key: "55+", label: "55+" },
];

export default function Screen07Age() {
  const age = useFlow((s) => s.age);
  const setAge = useFlow((s) => s.setAge);
  const next = useFlow((s) => s.next);

  const select = (k: string) => {
    setAge(k);
    setTimeout(() => next(), 220);
  };

  return (
    <Screen showProgress>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text="How **old** are you?" size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[16.5px] leading-snug"
        style={{ color: "var(--text-mute)" }}
      >
        Different patterns show up at different stages.
      </motion.p>

      <div className="mt-9 flex flex-col gap-2.5">
        {OPTIONS.map((o, i) => (
          <motion.div
            key={o.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 + i * 0.05 }}
          >
            <AgeRow
              label={o.label}
              selected={age === o.key}
              onClick={() => select(o.key)}
            />
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}

function AgeRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 600, damping: 32 }}
      className="press w-full rounded-row px-5 py-[18px] text-left flex items-center justify-between"
      style={{
        background: selected ? "rgba(139, 92, 255, 0.14)" : "var(--row-bg)",
        border: `1px solid ${selected ? "rgba(139, 92, 255, 0.55)" : "var(--row-border)"}`,
        boxShadow: selected ? "0 0 24px rgba(139, 92, 255, 0.18)" : "none",
      }}
    >
      <span
        className="text-[16.5px] tabular-nums"
        style={{
          color: selected ? "var(--text)" : "rgba(255,255,255,0.85)",
          fontWeight: selected ? 600 : 500,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
      <span
        className="flex items-center justify-center rounded-full"
        style={{
          width: 22,
          height: 22,
          background: selected ? "var(--accent)" : "transparent",
          border: `1.5px solid ${selected ? "var(--accent)" : "rgba(255,255,255,0.18)"}`,
        }}
      >
        {selected && <Check size={13} strokeWidth={3} color="#FFFFFF" />}
      </span>
    </motion.button>
  );
}
