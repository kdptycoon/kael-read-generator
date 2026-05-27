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
  { key: "few-months", label: "A few months", emoji: "⏳" },
  { key: "about-year", label: "About a year", emoji: "📅" },
  { key: "two-three", label: "Two to three years", emoji: "🗓️" },
  { key: "four-five", label: "Four to five years", emoji: "📆" },
  { key: "longer", label: "Longer than that", emoji: "♾️" },
];

export default function Screen13HowLong() {
  const timeStuck = useFlow((s) => s.timeStuck);
  const setTimeStuck = useFlow((s) => s.setTimeStuck);
  const next = useFlow((s) => s.next);

  const select = (k: string) => {
    setTimeStuck(k);
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
        <Headline text="How **long** has this been going on?" size="lg" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[15.5px] leading-snug"
        style={{ color: "var(--text-mute)" }}
      >
        Be honest with yourself.
      </motion.p>

      <div className="mt-7 flex flex-col gap-2.5">
        {OPTIONS.map((o, i) => (
          <motion.div
            key={o.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.16 + i * 0.05 }}
          >
            <IconRow
              emoji={o.emoji}
              label={o.label}
              selected={timeStuck === o.key}
              onClick={() => select(o.key)}
            />
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
