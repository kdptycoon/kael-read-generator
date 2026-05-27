"use client";

import { motion } from "framer-motion";
import { Settings, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import BackButton from "./BackButton";
import ProgressBar from "./ProgressBar";
import KaelLogo from "./KaelLogo";
import { useFlow, progressPercentFor, isBackEnabled } from "@/lib/flow-store";

interface Props {
  children: ReactNode;
  cta?: ReactNode;
  showBack?: boolean;
  /** When true, shows the global continuous progress bar derived from currentStep. */
  showProgress?: boolean;
  showLogo?: boolean;
  showSettings?: boolean;
  /** Pure black bg — used by Screen 16 (The Read) priming. */
  blackBg?: boolean;
  /** Hide the standard sticky CTA shell (used when a screen pins its own thing). */
  noCta?: boolean;
  contentClassName?: string;
}

/**
 * Layout wrapper. When showProgress is true, the header is a single row
 * combining the back button + full-width progress bar + percentage label.
 * Otherwise the header is the classic [back] [logo?] [settings?] row.
 */
export default function Screen({
  children,
  cta,
  showBack = true,
  showProgress = false,
  showLogo = false,
  showSettings = false,
  blackBg = false,
  noCta = false,
  contentClassName,
}: Props) {
  const step = useFlow((s) => s.currentStep);
  const back = useFlow((s) => s.back);
  const percent = showProgress ? progressPercentFor(step) : null;
  const backEnabled = showBack && isBackEnabled(step);

  return (
    <motion.section
      key="screen"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative flex flex-col"
      style={{ background: blackBg ? "#000" : "transparent", height: "100dvh" }}
    >
      <div style={{ height: "calc(var(--safe-top) + 12px)" }} />

      {percent != null ? (
        // Progress mode: back arrow + bar + % in a single row
        <div className="px-6 pt-1 pb-2 flex items-center gap-3">
          {backEnabled ? (
            <button
              type="button"
              onClick={back}
              aria-label="Back"
              className="press flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 30,
                height: 30,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <ArrowLeft size={15} strokeWidth={2.25} />
            </button>
          ) : (
            <span className="shrink-0" style={{ width: 30, height: 30 }} />
          )}
          <ProgressBar percent={percent} />
          <span
            className="text-[12px] font-semibold tabular-nums tracking-wider shrink-0"
            style={{ color: "var(--text-mute)", minWidth: 30, textAlign: "right" }}
          >
            {Math.round(percent)}%
          </span>
        </div>
      ) : (
        // Classic mode (no progress)
        <header className="relative flex items-center justify-between px-6 pt-2 pb-3 z-10">
          {showBack ? <BackButton /> : <span style={{ width: 36, height: 36 }} />}

          {showLogo ? (
            <span className="flex items-center justify-center">
              <KaelLogo size={36} />
            </span>
          ) : (
            <span />
          )}

          {showSettings ? (
            <button
              type="button"
              aria-label="Settings"
              className="flex items-center justify-center rounded-full press"
              style={{
                width: 36,
                height: 36,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <Settings size={16} strokeWidth={2} />
            </button>
          ) : (
            <span style={{ width: 36, height: 36 }} />
          )}
        </header>
      )}

      <div
        className={`flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-2 relative z-[1] ${contentClassName ?? ""}`}
        style={{ minHeight: 0 }}
      >
        {children}
      </div>

      {cta && !noCta && <div className="cta-shell">{cta}</div>}
      {!cta && !noCta && <div style={{ height: "calc(var(--safe-bottom) + 12px)" }} />}
    </motion.section>
  );
}
