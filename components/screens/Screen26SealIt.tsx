"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Fingerprint } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Screen from "@/components/Screen";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

const COMMITMENTS = [
  "Being honest with myself, even when it's hard",
  "Choosing growth over comfort",
  "Doing the work, not just thinking about it",
];

const HOLD_MS = 1500;

export default function Screen26SealIt() {
  const name = useFlow((s) => s.name);
  const next = useFlow((s) => s.next);
  const display = name?.trim() || "you";

  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sealed, setSealed] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const hapticRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPress = () => {
    if (sealed) return;
    setPressing(true);
    startTimeRef.current = performance.now();
    if ("vibrate" in navigator) {
      hapticRef.current = setInterval(() => {
        navigator.vibrate?.(15);
      }, 180);
    }
    const tick = (t: number) => {
      const start = startTimeRef.current ?? t;
      const p = Math.min(1, (t - start) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        completePress();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const cancelPress = () => {
    if (sealed) return;
    setPressing(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (hapticRef.current) clearInterval(hapticRef.current);
    setProgress(0);
    startTimeRef.current = null;
  };

  const completePress = () => {
    setSealed(true);
    setProgress(1);
    setPressing(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (hapticRef.current) clearInterval(hapticRef.current);
    if ("vibrate" in navigator) navigator.vibrate?.(120);
    setTimeout(() => setOverlay(true), 250);
    setTimeout(() => next(), 1200);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hapticRef.current) clearInterval(hapticRef.current);
    };
  }, []);

  return (
    <Screen showBack={false} noCta contentClassName="flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text={`${display}, let's make a **contract**.`} size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-4 text-[15.5px] font-medium"
        style={{ color: "var(--text-mute)" }}
      >
        From this day, I commit to:
      </motion.p>

      <ul className="mt-5 flex flex-col gap-3">
        {COMMITMENTS.map((c, i) => (
          <motion.li
            key={c}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }}
            className="flex gap-3 items-start"
          >
            <span
              className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
              style={{
                width: 22,
                height: 22,
                background: "rgba(139, 92, 255, 0.16)",
                border: "1px solid rgba(139, 92, 255, 0.4)",
                color: "var(--accent-hi)",
              }}
            >
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-[15px] leading-snug" style={{ color: "rgba(255,255,255,0.95)" }}>
              {c}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* Spacer pushing pad to the bottom thumb-reach zone */}
      <div className="flex-1" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-col items-center pb-8"
        style={{ paddingBottom: `calc(40px + var(--safe-bottom))` }}
      >
        <button
          type="button"
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          aria-label="Press and hold to seal"
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: 144,
            height: 144,
            background:
              "radial-gradient(circle at 35% 30%, rgba(139, 92, 255, 0.32), rgba(139, 92, 255, 0.10) 70%)",
            border: "1.5px solid rgba(139, 92, 255, 0.5)",
            boxShadow: pressing
              ? "0 0 60px rgba(139, 92, 255, 0.55), 0 0 120px rgba(139, 92, 255, 0.2)"
              : "0 0 32px rgba(139, 92, 255, 0.28)",
            cursor: sealed ? "default" : "pointer",
            transition: "box-shadow 200ms ease-out",
          }}
        >
          <svg
            width="144"
            height="144"
            viewBox="0 0 144 144"
            className="absolute inset-0 -rotate-90"
            style={{ pointerEvents: "none" }}
          >
            <circle
              cx="72"
              cy="72"
              r="68"
              fill="none"
              stroke="url(#sealGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 68}`}
              strokeDashoffset={`${(1 - progress) * 2 * Math.PI * 68}`}
              style={{ transition: "stroke-dashoffset 80ms linear" }}
            />
            <defs>
              <linearGradient id="sealGrad" x1="0" y1="0" x2="144" y2="144">
                <stop offset="0%" stopColor="#A47BFF" />
                <stop offset="100%" stopColor="#8B5CFF" />
              </linearGradient>
            </defs>
          </svg>

          <span
            className="absolute rounded-full"
            style={{
              width: 144,
              height: 144,
              background: `radial-gradient(circle at center, rgba(139,92,255,${0.15 + progress * 0.5}) 0%, transparent ${30 + progress * 50}%)`,
              transition: "background 100ms linear",
            }}
          />

          <Fingerprint
            size={52}
            strokeWidth={1.5}
            color="#FFFFFF"
            style={{
              filter: pressing ? "drop-shadow(0 0 12px rgba(255,255,255,0.6))" : "none",
              transition: "filter 200ms ease-out",
            }}
          />
        </button>

        <p className="mt-4 text-[12.5px] text-center" style={{ color: "var(--text-faint)" }}>
          Press and hold to seal.
          <br />
          Your thumbprint won&apos;t be saved or shared.
        </p>
      </motion.div>

      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #8B5CFF 0%, #4F2EB5 60%, #2A1474 100%)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Fingerprint size={88} strokeWidth={1.5} color="#FFFFFF" />
              </motion.div>
              <p className="mt-6 text-[18px] font-semibold tracking-[0.02em]" style={{ color: "#FFFFFF" }}>
                Locking it in...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
