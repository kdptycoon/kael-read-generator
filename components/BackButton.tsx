"use client";

import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useFlow, isBackEnabled } from "@/lib/flow-store";

export default function BackButton() {
  const step = useFlow((s) => s.currentStep);
  const back = useFlow((s) => s.back);
  const enabled = isBackEnabled(step);
  if (!enabled) return <span style={{ width: 36, height: 36 }} />;

  return (
    <motion.button
      type="button"
      onClick={back}
      whileTap={{ scale: 0.92 }}
      aria-label="Back"
      className="flex items-center justify-center rounded-full press"
      style={{
        width: 36,
        height: 36,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <ArrowLeft size={18} strokeWidth={2} />
    </motion.button>
  );
}
