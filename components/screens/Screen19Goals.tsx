"use client";

import { motion } from "framer-motion";
import {
  Star,
  Moon,
  CheckCircle2,
  Compass,
  Heart,
  Unlink,
  Crown,
  Flame,
  type LucideIcon,
} from "lucide-react";
import Screen from "@/components/Screen";
import ColorTile from "@/components/ColorTile";
import Headline from "@/components/Headline";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";

interface Opt {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
}

const OPTIONS: Opt[] = [
  { key: "confidence", label: "Real confidence", Icon: Star, color: "#E5B043" },
  { key: "calm", label: "A calm mind", Icon: Moon, color: "#5B7BD9" },
  { key: "habits", label: "Better habits", Icon: CheckCircle2, color: "#3BA77E" },
  { key: "trusting", label: "Trusting myself", Icon: Compass, color: "#3FA3C5" },
  { key: "close", label: "Close relationships", Icon: Heart, color: "#E87158" },
  { key: "cycle", label: "Breaking the cycle", Icon: Unlink, color: "#C64655" },
  { key: "charge", label: "In charge of my life", Icon: Crown, color: "#A26AE8" },
  { key: "alive", label: "Feeling alive again", Icon: Flame, color: "#F08146" },
];

export default function Screen19Goals() {
  const goals = useFlow((s) => s.goals);
  const toggleGoal = useFlow((s) => s.toggleGoal);
  const next = useFlow((s) => s.next);

  const capped = goals.length >= 3;
  const canContinue = goals.length >= 1;

  return (
    <Screen cta={<PrimaryCTA label="Continue" onClick={next} disabled={!canContinue} />}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text="What does **winning** look like?" size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[15.5px] flex items-center justify-between"
        style={{ color: "var(--text-mute)" }}
      >
        <span>Pick up to 3.</span>
        <span className="tabular-nums text-[13px]" style={{ color: "var(--text-faint)" }}>
          {goals.length}/3
        </span>
      </motion.p>

      <div className="mt-7 grid grid-cols-2 gap-3">
        {OPTIONS.map((o, i) => (
          <motion.div
            key={o.key}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.16 + i * 0.045, ease: "easeOut" }}
          >
            <ColorTile
              Icon={o.Icon}
              label={o.label}
              selected={goals.includes(o.key)}
              onClick={() => toggleGoal(o.key)}
              color={o.color}
              capped={capped}
            />
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
