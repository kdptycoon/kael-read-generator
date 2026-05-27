"use client";

import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Screen from "@/components/Screen";
import LaurelStars from "@/components/LaurelStars";
import { useFlow } from "@/lib/flow-store";
import { LOADING_TESTIMONIALS } from "@/lib/reviews";

const STAGES = [
  "Mapping your patterns",
  "Connecting your answers",
  "Calibrating Kael's voice",
  "Preparing your first session",
];

const STAGE_MS = 2500;
const TOTAL_MS = STAGES.length * STAGE_MS;

export default function Screen24Loading() {
  const next = useFlow((s) => s.next);
  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<boolean[]>(STAGES.map(() => false));

  const pct = useMotionValue(0);
  const display = useTransform(pct, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    const ctrl = animate(pct, 100, { duration: TOTAL_MS / 1000, ease: "linear" });
    return ctrl.stop;
  }, [pct]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STAGES.forEach((_, i) => {
      timers.push(
        setTimeout(() => setActiveStage(i + 1), (i + 1) * STAGE_MS - 50),
      );
      timers.push(
        setTimeout(() => {
          setCompletedStages((prev) => {
            const out = [...prev];
            out[i] = true;
            return out;
          });
        }, (i + 1) * STAGE_MS - 80),
      );
    });
    timers.push(setTimeout(() => next(), TOTAL_MS + 200));
    return () => timers.forEach(clearTimeout);
  }, [next]);

  const testimonialIdx = Math.min(activeStage, LOADING_TESTIMONIALS.length - 1);

  return (
    <Screen showBack={false} noCta>
      <div className="flex flex-col items-center text-center pt-2">
        {/* Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="font-bold tabular-nums"
          style={{
            fontSize: 110,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 32px rgba(139,92,255,0.18)",
          }}
        >
          <motion.span>{display}</motion.span>
        </motion.div>

        {/* Testimonial */}
        <div className="mt-6 w-full" style={{ minHeight: 120 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <LaurelStars starSize={14} laurelHeight={48} />
              <p
                className="mt-3 text-[14.5px] leading-snug max-w-[280px]"
                style={{ color: "rgba(255,255,255,0.92)", fontStyle: "italic" }}
              >
                &ldquo;{LOADING_TESTIMONIALS[testimonialIdx].headline}&rdquo;
              </p>
              <p className="mt-2 text-[12px]" style={{ color: "var(--text-faint)" }}>
                @{LOADING_TESTIMONIALS[testimonialIdx].username}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-7 text-[13px]" style={{ color: "var(--text-faint)" }}>
          Personalizing your experience
        </p>
      </div>

      {/* Stage list */}
      <div className="mt-6 flex flex-col gap-3 px-2">
        {STAGES.map((stageName, i) => {
          const visible = i <= activeStage;
          const done = completedStages[i];
          const inProgress = i === activeStage && !done;
          return (
            <AnimatePresence key={stageName}>
              {visible && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span
                      className="text-[14px]"
                      style={{
                        color: done ? "var(--text)" : "var(--text-mute)",
                        fontWeight: done ? 500 : 400,
                      }}
                    >
                      {stageName}
                    </span>
                    {done && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 600, damping: 22 }}
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 18, height: 18, background: "var(--accent)" }}
                      >
                        <Check size={11} strokeWidth={3} color="#FFFFFF" />
                      </motion.span>
                    )}
                  </div>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: 3, background: "rgba(255,255,255,0.06)" }}
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: done ? "100%" : inProgress ? "100%" : "0%" }}
                      transition={{ duration: STAGE_MS / 1000, ease: "linear" }}
                      style={{
                        height: "100%",
                        background:
                          "linear-gradient(90deg, var(--accent) 0%, var(--accent-hi) 100%)",
                        boxShadow: "0 0 8px rgba(139,92,255,0.5)",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </Screen>
  );
}
