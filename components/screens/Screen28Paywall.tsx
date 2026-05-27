"use client";

import { motion } from "framer-motion";
import {
  MessagesSquare,
  History,
  Repeat,
  Lightbulb,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";

interface Feature {
  Icon: LucideIcon;
  label: string;
}

const FEATURES: Feature[] = [
  { Icon: MessagesSquare, label: "Unlimited conversations with Kael" },
  { Icon: History, label: "Memory that connects your story over time" },
  { Icon: Repeat, label: "Spots the loops you keep repeating" },
  { Icon: Lightbulb, label: "Gives you experiments and follows up" },
];

export default function Screen28Paywall() {
  const [plan, setPlan] = useState<"yearly" | "monthly">("yearly");

  return (
    <Screen
      showBack={false}
      contentClassName="flex flex-col"
      cta={
        <div className="flex flex-col gap-2.5">
          <PrimaryCTA label="Start 7-Day Free Trial" onClick={() => {/* purchase flow */}} />

          <p
            className="text-[12.5px] font-medium leading-snug text-center"
            style={{ color: "rgba(255,255,255,0.82)" }}
          >
            Cancel in seconds. No charge if you don&apos;t love it.
          </p>
          <p
            className="text-[11px] leading-snug text-center"
            style={{ color: "var(--text-faint)" }}
          >
            Free for 7 days. Then auto-renews unless canceled at least 24 hours before the trial ends.
          </p>
          <div className="flex justify-center gap-5 mt-1 mb-0.5">
            <FootLink>Restore</FootLink>
            <FootLink>Terms</FootLink>
            <FootLink>Privacy</FootLink>
          </div>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-2"
      >
        <Headline text="Start 7 days **free** with Kael." size="xl" />
      </motion.div>

      {/* What you get */}
      <div className="mt-7">
        <div
          className="text-[11.5px] tracking-[0.16em] uppercase font-semibold mb-3"
          style={{ color: "var(--accent-hi)" }}
        >
          What you get
        </div>
        <ul className="flex flex-col gap-3">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.label}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
              className="flex gap-3 items-center"
            >
              <span
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(139, 92, 255, 0.14)",
                  border: "1px solid rgba(139, 92, 255, 0.32)",
                  color: "var(--accent-hi)",
                }}
              >
                <f.Icon size={16} strokeWidth={1.85} />
              </span>
              <span className="text-[15px] leading-snug" style={{ color: "rgba(255,255,255,0.95)" }}>
                {f.label}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Social proof — single review card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.55 }}
        className="mt-6 rounded-2xl p-4 flex items-start gap-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 18px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex gap-0.5 mb-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} fill="#F5C247" strokeWidth={0} />
            ))}
          </div>
          <p
            className="text-[14px] leading-snug font-medium"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            &ldquo;Six weeks in, I asked for the raise.&rdquo;
          </p>
          <div className="mt-1.5 text-[12px]" style={{ color: "var(--text-faint)" }}>
            <span className="font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>
              Marcus T.
            </span>
            , 34
          </div>
        </div>
      </motion.div>

      {/* Plan cards — anchored to bottom of content, right above the CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.55 }}
        className="mt-auto pt-7 flex flex-col gap-2.5"
      >
        <PlanCard
          selected={plan === "yearly"}
          onClick={() => setPlan("yearly")}
          title="Yearly"
          price="$99/year"
          priceWas="$180"
          subline="$8.25/month, billed annually"
          badge="RECOMMENDED"
          note="Save 45%"
        />
        <PlanCard
          selected={plan === "monthly"}
          onClick={() => setPlan("monthly")}
          title="Monthly"
          price="$14.99/month"
          subline="Billed monthly"
        />
      </motion.div>
    </Screen>
  );
}

function PlanCard({
  selected,
  onClick,
  title,
  price,
  priceWas,
  subline,
  badge,
  note,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  price: string;
  priceWas?: string;
  subline: string;
  badge?: string;
  note?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
      className="press text-left rounded-2xl p-4 flex items-center gap-3 relative"
      style={{
        background: selected ? "rgba(139, 92, 255, 0.10)" : "rgba(255,255,255,0.04)",
        border: `1.5px solid ${selected ? "rgba(139, 92, 255, 0.55)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: selected ? "0 0 24px rgba(139, 92, 255, 0.18)" : "none",
      }}
    >
      <span
        className="flex items-center justify-center rounded-full shrink-0"
        style={{
          width: 22,
          height: 22,
          background: selected ? "var(--accent)" : "transparent",
          border: `1.5px solid ${selected ? "var(--accent)" : "rgba(255,255,255,0.22)"}`,
        }}
      >
        {selected && <span className="rounded-full" style={{ width: 8, height: 8, background: "#FFFFFF" }} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[15.5px] font-semibold" style={{ color: "var(--text)" }}>
              {title}
            </div>
            <div className="text-[12.5px] mt-0.5" style={{ color: "var(--text-mute)" }}>
              {subline}
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-baseline gap-1.5">
              {priceWas && (
                <span
                  className="text-[13px] tabular-nums"
                  style={{
                    color: "rgba(255,255,255,0.42)",
                    textDecoration: "line-through",
                    textDecorationColor: "rgba(255,255,255,0.55)",
                  }}
                >
                  {priceWas}
                </span>
              )}
              <span className="text-[15px] font-semibold tabular-nums" style={{ color: "var(--text)" }}>
                {price}
              </span>
            </div>
            {note && (
              <span
                className="mt-1 rounded-full text-[11px] font-bold tracking-[0.04em] uppercase tabular-nums"
                style={{
                  background: "rgba(59, 209, 127, 0.16)",
                  border: "1px solid rgba(59, 209, 127, 0.45)",
                  color: "#5BE39A",
                  padding: "2px 8px",
                }}
              >
                {note}
              </span>
            )}
          </div>
        </div>
      </div>
      {badge && (
        <span
          className="absolute right-4 -top-2.5 rounded-full text-[10px] font-bold tracking-[0.08em] px-2 py-1"
          style={{
            background: "linear-gradient(180deg, #9B6DFF 0%, #7B47F2 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 10px -2px rgba(139,92,255,0.5)",
          }}
        >
          {badge}
        </span>
      )}
    </motion.button>
  );
}

function FootLink({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="text-[11.5px]" style={{ color: "var(--text-faint)" }}>
      {children}
    </button>
  );
}
