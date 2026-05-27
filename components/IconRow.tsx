"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { withAlpha } from "@/lib/colors";

interface Props {
  icon?: LucideIcon | (() => ReactNode);
  iconNode?: ReactNode;
  emoji?: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  accentColor?: string; // when set, selected state uses this hue instead of the default purple
  capped?: boolean; // multi-select cap reached and this row isn't selected
}

export default function IconRow({ icon: Icon, iconNode, emoji, label, selected, onClick, accentColor, capped }: Props) {
  const baseBg = "var(--row-bg)";
  const baseBorder = "var(--row-border)";
  const selBg = accentColor ? withAlpha(accentColor, 0.16) : "var(--row-bg-selected)";
  const selBorder = accentColor ? withAlpha(accentColor, 0.55) : "var(--row-border-selected)";
  const checkBg = accentColor ?? "var(--accent)";
  const iconTint = accentColor ?? "var(--accent)";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={capped && !selected}
      whileTap={{ scale: capped && !selected ? 1 : 0.985 }}
      transition={{ type: "spring", stiffness: 600, damping: 32 }}
      className="press w-full rounded-row flex items-center gap-4 px-4 py-[14px] text-left"
      style={{
        background: selected ? selBg : baseBg,
        border: `1px solid ${selected ? selBorder : baseBorder}`,
        opacity: capped && !selected ? 0.45 : 1,
        cursor: capped && !selected ? "not-allowed" : "pointer",
      }}
    >
      <span
        className="flex items-center justify-center shrink-0 rounded-full"
        style={{
          width: 36,
          height: 36,
          background: selected
            ? withAlpha(accentColor ?? "#8B5CFF", 0.22)
            : emoji
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.04)",
          border: `1px solid ${selected ? withAlpha(accentColor ?? "#8B5CFF", 0.4) : "rgba(255,255,255,0.07)"}`,
          color: selected ? (accentColor ?? "var(--accent)") : "var(--text-mute)",
        }}
      >
        {emoji ? (
          <span style={{ fontSize: 19, lineHeight: 1 }}>{emoji}</span>
        ) : iconNode ? (
          iconNode
        ) : Icon ? (
          <Icon size={18} strokeWidth={1.75} color={selected ? iconTint : undefined} />
        ) : null}
      </span>
      <span
        className="flex-1 text-[15.5px] leading-snug"
        style={{ color: selected ? "var(--text)" : "rgba(255,255,255,0.82)", fontWeight: selected ? 500 : 400 }}
      >
        {label}
      </span>
      <span
        className="flex items-center justify-center rounded-full shrink-0"
        style={{
          width: 22,
          height: 22,
          background: selected ? checkBg : "transparent",
          border: `1.5px solid ${selected ? checkBg : "rgba(255,255,255,0.18)"}`,
        }}
      >
        {selected && <Check size={13} strokeWidth={3} color="#FFFFFF" />}
      </span>
    </motion.button>
  );
}
