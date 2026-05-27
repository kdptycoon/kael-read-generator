"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useMemo } from "react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";
import { pickSocialProofReviews } from "@/lib/reviews";

export default function Screen21SocialProof() {
  const goals = useFlow((s) => s.goals);
  const next = useFlow((s) => s.next);
  const reviews = useMemo(() => pickSocialProofReviews(goals), [goals]);

  return (
    <Screen cta={<PrimaryCTA label="Continue" onClick={next} />}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text="Real **people**, real wins." size="xl" />
      </motion.div>

      <div className="mt-7 flex flex-col pb-6">
        {reviews.map((r, i) => {
          const rotation = (i % 2 === 0 ? -1 : 1) * (0.5 + (i % 3) * 0.2);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: rotation }}
              transition={{ duration: 0.45, delay: 0.12 + i * 0.08, ease: "easeOut" }}
              className="rounded-2xl p-5"
              style={{
                background: "#FFFFFF",
                color: "#0E0820",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 10px 22px -14px rgba(0,0,0,0.35), 0 2px 6px -3px rgba(0,0,0,0.15)",
                marginTop: i === 0 ? 0 : -6,
                marginLeft: i % 2 === 0 ? -4 : 6,
                marginRight: i % 2 === 0 ? 6 : -4,
                zIndex: 10 - i,
              }}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={13} fill="#F5C247" strokeWidth={0} />
                ))}
              </div>
              <p className="text-[14.5px] leading-relaxed" style={{ color: "#1F1538" }}>
                {r.body}
              </p>
              {r.tags && r.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(139, 92, 255, 0.12)",
                        border: "1px solid rgba(139, 92, 255, 0.28)",
                        color: "#7B47F2",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 text-[12.5px]" style={{ color: "rgba(14, 8, 32, 0.55)" }}>
                <span className="font-semibold" style={{ color: "rgba(14, 8, 32, 0.85)" }}>
                  {r.author}
                </span>
                {r.authorMeta && <span>, {r.authorMeta}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Screen>
  );
}
