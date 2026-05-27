"use client";

import { motion } from "framer-motion";
import { Lock, Banknote, Share2, BrainCircuit, type LucideIcon } from "lucide-react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

interface Bullet {
  Icon: LucideIcon;
  label: string;
}

const BULLETS: Bullet[] = [
  { Icon: Banknote, label: "No selling." },
  { Icon: Share2, label: "No sharing." },
  { Icon: BrainCircuit, label: "No training other models." },
];

export default function Screen09Privacy() {
  const next = useFlow((s) => s.next);

  return (
    <Screen
      showProgress
      cta={<PrimaryCTA label="Got it" onClick={next} />}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mt-7 flex justify-center"
      >
        <span
          className="flex items-center justify-center rounded-3xl relative"
          style={{
            width: 80,
            height: 80,
            background:
              "linear-gradient(160deg, rgba(139,92,255,0.22) 0%, rgba(139,92,255,0.08) 100%)",
            border: "1px solid rgba(139,92,255,0.5)",
            boxShadow:
              "0 0 36px rgba(139,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <span
            className="absolute inset-0 rounded-3xl opacity-50"
            style={{
              background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.18), transparent 60%)",
            }}
            aria-hidden
          />
          <Lock size={32} strokeWidth={1.75} color="#C4A3FF" />
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="mt-7 text-center"
      >
        <Headline text="This stays between **you** and Kael." size="xl" className="text-center" />
      </motion.div>

      {/* Bullets */}
      <motion.ul
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.32 }}
        className="mt-7 flex flex-col gap-2.5"
      >
        {BULLETS.map((b, i) => (
          <motion.li
            key={b.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.4 + i * 0.08 }}
            className="rounded-2xl flex items-center gap-3 px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 36,
                height: 36,
                background: "rgba(139, 92, 255, 0.16)",
                border: "1px solid rgba(139, 92, 255, 0.36)",
                color: "var(--accent-hi)",
              }}
            >
              <b.Icon size={17} strokeWidth={1.85} />
            </span>
            <span className="text-[15.5px] font-medium" style={{ color: "var(--text)" }}>
              {b.label}
            </span>
          </motion.li>
        ))}
      </motion.ul>

    </Screen>
  );
}
