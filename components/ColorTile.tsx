"use client";

import { Check, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  Icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Hex color for the tile gradient. */
  color: string;
  /** Multi-select cap reached and this tile isn't selected. */
  capped?: boolean;
}

/**
 * A square gradient tile with an icon top-left, label below, and a
 * white-on-purple checkmark in the top-right corner when selected.
 * Used by Screens 15 (Tried) and 19 (Goals).
 */
export default function ColorTile({ Icon, label, selected, onClick, color, capped }: Props) {
  const dim = capped && !selected;
  // Lighter and darker variants for the gradient
  const from = mix(color, "#FFFFFF", 0.08);
  const to = mix(color, "#000000", 0.34);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={dim}
      whileTap={!dim ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 600, damping: 32 }}
      className="press relative w-full rounded-2xl overflow-hidden text-left block"
      style={{
        aspectRatio: "1 / 1",
        background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
        border: `1px solid ${selected ? "rgba(255,255,255,0.85)" : `${color}55`}`,
        boxShadow: selected
          ? `0 0 28px ${color}55, 0 14px 28px -14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)`
          : `0 12px 24px -14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)`,
        transform: selected ? "translateY(-1px)" : undefined,
        opacity: dim ? 0.4 : 1,
        cursor: dim ? "not-allowed" : "pointer",
      }}
    >
      {/* radial highlight */}
      <span
        className="absolute -top-12 -right-12 rounded-full opacity-40 pointer-events-none"
        style={{
          width: 110,
          height: 110,
          background: `radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      <div className="absolute inset-0 p-4 flex flex-col">
        <span
          className="flex items-center justify-center rounded-xl"
          style={{
            width: 38,
            height: 38,
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#FFFFFF",
          }}
        >
          <Icon size={18} strokeWidth={1.85} />
        </span>
        <span
          className="mt-auto text-[15.5px] font-semibold leading-tight"
          style={{
            color: "#FFFFFF",
            textShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}
        >
          {label}
        </span>
      </div>

      {/* TR corner checkmark when selected */}
      {selected && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 700, damping: 22 }}
          className="absolute top-3 right-3 flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            background: "#FFFFFF",
            color: color,
            boxShadow: "0 4px 10px -2px rgba(0,0,0,0.3)",
          }}
        >
          <Check size={13} strokeWidth={3} />
        </motion.span>
      )}
    </motion.button>
  );
}

/** Mix two hex colors. p=0 → a, p=1 → b. */
function mix(a: string, b: string, p: number): string {
  const ap = parseHex(a);
  const bp = parseHex(b);
  const r = Math.round(ap.r + (bp.r - ap.r) * p);
  const g = Math.round(ap.g + (bp.g - ap.g) * p);
  const bl = Math.round(ap.b + (bp.b - ap.b) * p);
  return `rgb(${r}, ${g}, ${bl})`;
}

function parseHex(h: string): { r: number; g: number; b: number } {
  const m = h.replace("#", "");
  return {
    r: parseInt(m.slice(0, 2), 16),
    g: parseInt(m.slice(2, 4), 16),
    b: parseInt(m.slice(4, 6), 16),
  };
}
