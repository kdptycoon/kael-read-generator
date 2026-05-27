"use client";

import { motion } from "framer-motion";
import {
  Sofa,
  BookOpen,
  GraduationCap,
  Headphones,
  Smartphone,
  PenLine,
  Flower2,
  MessageCircle,
  Dumbbell,
  Circle,
  type LucideIcon,
} from "lucide-react";
import Screen from "@/components/Screen";
import Headline from "@/components/Headline";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";

interface Opt {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
}

// Ordered shortest → longest so the wrap packs into clean rows
const OPTIONS: Opt[] = [
  { key: "books", label: "Books", Icon: BookOpen, color: "#3BA77E" },
  { key: "apps", label: "Apps", Icon: Smartphone, color: "#3FA3C5" },
  { key: "therapy", label: "Therapy", Icon: Sofa, color: "#5B7BD9" },
  { key: "courses", label: "Courses", Icon: GraduationCap, color: "#D8A246" },
  { key: "podcasts", label: "Podcasts", Icon: Headphones, color: "#A26AE8" },
  { key: "meditation", label: "Meditation", Icon: Flower2, color: "#3BA7A7" },
  { key: "journaling", label: "Journaling", Icon: PenLine, color: "#E04877" },
  { key: "pushing", label: "Pushing through", Icon: Dumbbell, color: "#C64655" },
  { key: "friends", label: "Talking to friends", Icon: MessageCircle, color: "#E87158" },
  { key: "nothing", label: "Nothing really", Icon: Circle, color: "#8B86A1" },
];

export default function Screen15WhatTried() {
  const whatTried = useFlow((s) => s.whatTried);
  const toggleWhatTried = useFlow((s) => s.toggleWhatTried);
  const next = useFlow((s) => s.next);

  const canContinue = whatTried.length >= 1;

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
        <Headline text="Ways you've tried to **fix** this." size="lg" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[15.5px] leading-snug"
        style={{ color: "var(--text-mute)" }}
      >
        Pick all that apply.
      </motion.p>

      <div className="mt-7 flex flex-wrap gap-2.5">
        {OPTIONS.map((o, i) => {
          const selected = whatTried.includes(o.key);
          return (
            <motion.button
              key={o.key}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.14 + i * 0.035 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleWhatTried(o.key)}
              className="press inline-flex items-center gap-2 rounded-full"
              style={{
                padding: "10px 16px",
                background: selected
                  ? `linear-gradient(180deg, ${o.color}55 0%, ${o.color}22 100%)`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${selected ? `${o.color}aa` : "rgba(255,255,255,0.10)"}`,
                color: selected ? "#FFFFFF" : "rgba(255,255,255,0.78)",
                fontWeight: selected ? 500 : 400,
                fontSize: 14.5,
                boxShadow: selected ? `0 0 18px ${o.color}3a` : "none",
              }}
            >
              <o.Icon
                size={15}
                strokeWidth={1.85}
                color={selected ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
              />
              <span>{o.label}</span>
            </motion.button>
          );
        })}
      </div>
    </Screen>
  );
}
