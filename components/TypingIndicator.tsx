"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-2xl"
      style={{
        padding: "10px 14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        width: "fit-content",
      }}
      aria-label="Kael is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "rgba(255,255,255,0.7)",
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
}
