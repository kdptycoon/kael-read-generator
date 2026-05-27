"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import IconRow from "@/components/IconRow";
import Headline from "@/components/Headline";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";
import { STUCK_AREAS } from "@/lib/stuck-areas";

interface Opt {
  key: string;
  label: string;
  emoji: string;
}

const OPTIONS: Opt[] = [
  { key: "career", label: STUCK_AREAS.career.label, emoji: "💼" },
  { key: "relationships", label: STUCK_AREAS.relationships.label, emoji: "💞" },
  { key: "money", label: STUCK_AREAS.money.label, emoji: "💰" },
  { key: "health", label: STUCK_AREAS.health.label, emoji: "🩺" },
  { key: "purpose", label: STUCK_AREAS.purpose.label, emoji: "🧭" },
  { key: "discipline", label: STUCK_AREAS.discipline.label, emoji: "🔁" },
];

export const STUCK_AREA_EMOJIS: Record<string, string> = Object.fromEntries(
  OPTIONS.map((o) => [o.key, o.emoji]),
);

export default function Screen11StuckArea() {
  const stuckArea = useFlow((s) => s.stuckArea);
  const setStuckArea = useFlow((s) => s.setStuckArea);
  const next = useFlow((s) => s.next);

  const canContinue = !!stuckArea;

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
        <Headline text="Which life area feels **most stuck** right now?" size="lg" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[16px] leading-snug"
        style={{ color: "var(--text-mute)" }}
      >
        We&apos;ll get to the others inside Kael.
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
              selected={stuckArea === o.key}
              onClick={() => setStuckArea(stuckArea === o.key ? "" : o.key)}
            />
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
