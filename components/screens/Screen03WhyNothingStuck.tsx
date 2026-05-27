"use client";

import { motion } from "framer-motion";
import { Lock, Zap, Shield, Gavel, type LucideIcon } from "lucide-react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

interface Script {
  Icon: LucideIcon;
  label: string;
  hint: string;
  color: string;
  glow: string;
}

const SCRIPTS: Script[] = [
  {
    Icon: Lock,
    label: "Limiting beliefs",
    hint: "absorbed before words",
    color: "#E26B7B",
    glow: "rgba(226, 107, 123, 0.32)",
  },
  {
    Icon: Zap,
    label: "Unconscious triggers",
    hint: "fire faster than thought",
    color: "#F2B863",
    glow: "rgba(242, 184, 99, 0.32)",
  },
  {
    Icon: Shield,
    label: "Coping mechanisms",
    hint: "old self-protection",
    color: "#7BC2D6",
    glow: "rgba(123, 194, 214, 0.32)",
  },
  {
    Icon: Gavel,
    label: "Inner critic",
    hint: "the voice you can't argue with",
    color: "#B98EFF",
    glow: "rgba(185, 142, 255, 0.32)",
  },
];

export default function Screen03WhyNothingStuck() {
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
          Below the surface
        </span>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="mt-3"
      >
        <Headline text="Meet the **scripts** running your life." size="2xl" />
      </motion.div>

      {/* Cascading layered cards */}
      <div className="mt-9 relative">
        {/* Vertical thread spanning from the first dot to the last dot */}
        <motion.span
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.1, delay: 0.7, ease: "easeOut" }}
          className="absolute origin-top pointer-events-none"
          style={{
            left: 10,
            top: 37,
            bottom: 37,
            width: 1,
            background:
              "linear-gradient(180deg, rgba(226,107,123,0.55) 0%, rgba(242,184,99,0.55) 33%, rgba(123,194,214,0.55) 66%, rgba(185,142,255,0.55) 100%)",
          }}
          aria-hidden
        />

        <div className="flex flex-col gap-3.5">
          {SCRIPTS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.32 + i * 0.12, ease: "easeOut" }}
              className="relative flex items-center"
              style={{ paddingLeft: 22 }}
            >
              {/* Layer dot on the thread */}
              <span
                className="absolute rounded-full"
                style={{
                  left: 6.5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 9,
                  height: 9,
                  background: s.color,
                  boxShadow: `0 0 12px ${s.glow}`,
                }}
                aria-hidden
              />

              {/* Card */}
              <div
                className="flex-1 relative rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(110deg, ${s.color}26 0%, ${s.color}08 60%, rgba(255,255,255,0.02) 100%)`,
                  border: `1px solid ${s.color}3d`,
                  padding: "16px 18px",
                  boxShadow: `0 8px 22px -14px ${s.glow}`,
                }}
              >
                <span
                  className="absolute -top-10 -right-10 rounded-full opacity-50 pointer-events-none"
                  style={{
                    width: 110,
                    height: 110,
                    background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
                  }}
                  aria-hidden
                />
                <div className="flex items-center gap-3.5 relative">
                  <span
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{
                      width: 42,
                      height: 42,
                      background: `${s.color}24`,
                      border: `1px solid ${s.color}55`,
                      color: s.color,
                    }}
                  >
                    <s.Icon size={20} strokeWidth={1.85} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[16.5px] font-semibold tracking-[-0.005em]"
                      style={{ color: "var(--text)" }}
                    >
                      {s.label}
                    </div>
                    <div
                      className="text-[12px] mt-0.5 lowercase tracking-[0.04em]"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {s.hint}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
