"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  side?: "kael" | "user";
}

export default function ChatBubble({ children, side = "kael" }: Props) {
  const isKael = side === "kael";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="rounded-2xl"
      style={{
        padding: "12px 16px",
        background: isKael ? "rgba(255,255,255,0.06)" : "linear-gradient(180deg, #9B6DFF, #7B47F2)",
        border: isKael ? "1px solid rgba(255,255,255,0.08)" : "none",
        color: isKael ? "var(--text)" : "#FFFFFF",
        maxWidth: "84%",
        marginLeft: isKael ? 0 : "auto",
        fontSize: 15,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </motion.div>
  );
}
