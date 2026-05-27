"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import LaurelStars from "@/components/LaurelStars";
import { useFlow } from "@/lib/flow-store";
import { GOAL_REVIEWS } from "@/lib/reviews";

export default function Screen18ReviewAsk() {
  const next = useFlow((s) => s.next);
  const [rating, setRating] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShowFallback(true), 1500);
    return () => clearTimeout(id);
  }, []);

  // Two reviews, picked from the production review set
  const reviews = [GOAL_REVIEWS[0], GOAL_REVIEWS[5]];

  return (
    <Screen cta={<PrimaryCTA label="Next" onClick={next} hideArrow />}>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2 text-center font-bold tracking-[-0.025em]"
        style={{ fontSize: 32, lineHeight: 1.08, color: "var(--text)" }}
      >
        Give us a <span className="emph">rating</span>!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-4 text-center text-[17px] font-medium leading-snug"
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        Kael was designed for people like you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-7 flex flex-col items-center"
      >
        <LaurelStars starSize={20} laurelHeight={64} />
      </motion.div>

      {/* Fallback star tap UI */}
      {showFallback && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-5 flex flex-col items-center gap-1.5"
        >
          <div className="flex gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="press"
                aria-label={`${i + 1} stars`}
              >
                <Star
                  size={28}
                  strokeWidth={1.5}
                  fill={rating > i ? "#F5C247" : "transparent"}
                  color={rating > i ? "#F5C247" : "rgba(255,255,255,0.32)"}
                />
              </button>
            ))}
          </div>
          <span className="text-[11.5px]" style={{ color: "var(--text-faint)" }}>
            Tap to rate
          </span>
        </motion.div>
      )}

      <div className="mt-7 flex flex-col gap-3">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 + i * 0.1 }}
            className="rounded-2xl p-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 24px -16px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} size={13} fill="#F5C247" strokeWidth={0} />
              ))}
            </div>
            <p className="text-[14.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
              {r.body}
            </p>
            <div className="mt-3 text-[13px]" style={{ color: "var(--text-faint)" }}>
              <span className="font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                {r.author}
              </span>
              {r.authorMeta && <span>, {r.authorMeta}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
