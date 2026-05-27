"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  hideArrow?: boolean;
}

/**
 * The single CTA used on every screen that has one. Identical color,
 * shape, position, and treatment across all 28 screens — by design.
 */
export default function PrimaryCTA({ label, onClick, disabled, ariaLabel, hideArrow }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      whileHover={disabled ? undefined : { y: -1 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="press w-full rounded-cta py-[18px] flex items-center justify-center gap-2 font-semibold text-white text-[16px] tracking-[-0.005em]"
      style={{
        background: disabled
          ? "linear-gradient(180deg, rgba(139,92,255,0.35) 0%, rgba(123,71,242,0.35) 100%)"
          : "linear-gradient(180deg, #9B6DFF 0%, #7B47F2 100%)",
        boxShadow: disabled
          ? "none"
          : "0 14px 30px -10px rgba(139, 92, 255, 0.6), 0 6px 12px -6px rgba(139, 92, 255, 0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span>{label}</span>
      {!hideArrow && <ArrowRight size={18} strokeWidth={2.5} />}
    </motion.button>
  );
}
