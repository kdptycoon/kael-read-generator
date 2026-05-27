"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import IconRow from "@/components/IconRow";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

interface Opt {
  key: string;
  label: string;
  emoji: string;
}

const OPTIONS: Opt[] = [
  { key: "male", label: "Male", emoji: "👨" },
  { key: "female", label: "Female", emoji: "👩" },
  { key: "nonbinary", label: "Non-binary", emoji: "🧑" },
  { key: "skip", label: "Prefer not to say", emoji: "🌀" },
];

export default function Screen08Gender() {
  const gender = useFlow((s) => s.gender);
  const setGender = useFlow((s) => s.setGender);
  const next = useFlow((s) => s.next);

  const select = (k: string) => {
    setGender(k);
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
        <Headline text="Your **gender**?" size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[15.5px] leading-snug"
        style={{ color: "var(--text-mute)" }}
      >
        Some patterns play out differently by gender. This helps Kael read you more accurately.
      </motion.p>

      <div className="mt-8 flex flex-col gap-2.5">
        {OPTIONS.map((o, i) => (
          <motion.div
            key={o.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.18 + i * 0.05 }}
          >
            <IconRow
              emoji={o.emoji}
              label={o.label}
              selected={gender === o.key}
              onClick={() => select(o.key)}
            />
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
