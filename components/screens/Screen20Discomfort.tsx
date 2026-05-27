"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Hand, Eye, MessageSquareWarning, type LucideIcon } from "lucide-react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

interface Bullet {
  Icon: LucideIcon;
  label: string;
}

const BULLETS: Bullet[] = [
  { Icon: ShieldAlert, label: "Push back when you dodge" },
  { Icon: Eye, label: "Catch excuses while you make them" },
  { Icon: Hand, label: "Point at things you'd rather ignore" },
  { Icon: MessageSquareWarning, label: "Say what you need to hear" },
];

export default function Screen20Discomfort() {
  const name = useFlow((s) => s.name);
  const next = useFlow((s) => s.next);
  const display = name?.trim() || "you";

  return (
    <Screen cta={<PrimaryCTA label="Bring it on" onClick={next} />}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-2"
      >
        <Headline text={`Winning requires **discomfort**, ${display}.`} size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="mt-6 text-[22px] font-semibold tracking-[-0.01em]"
        style={{ color: "rgba(255,255,255,0.95)" }}
      >
        Kael will:
      </motion.p>

      <ul className="mt-5 flex flex-col gap-4">
        {BULLETS.map((b, i) => (
          <motion.li
            key={b.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.28 + i * 0.08 }}
            className="flex items-center gap-3"
          >
            <span
              className="flex items-center justify-center shrink-0"
              style={{ width: 22, height: 22, color: "var(--accent-hi)" }}
            >
              <b.Icon size={18} strokeWidth={1.9} />
            </span>
            <span
              className="text-[16.5px] leading-snug"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              {b.label}
            </span>
          </motion.li>
        ))}
      </ul>

    </Screen>
  );
}
