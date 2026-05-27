"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";
import { streamText } from "@/lib/stream-tokens";

export default function Screen10Honesty() {
  const name = useFlow((s) => s.name);
  const next = useFlow((s) => s.next);
  const display = name?.trim() ? name.trim() : "you";

  const lines = [
    "Kael works when you tell the truth.",
    "The polished version of yourself won't get read.",
    "The real one will.",
  ];

  const [revealed, setRevealed] = useState(["", "", ""]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let lineIdx = 0;
    let cancel: null | (() => void) = null;
    let between: ReturnType<typeof setTimeout> | undefined;

    const startLine = () => {
      if (lineIdx >= lines.length) {
        // small breath before CTA appears
        between = setTimeout(() => setDone(true), 300);
        return;
      }
      cancel = streamText(
        lines[lineIdx],
        (p) =>
          setRevealed((prev) => {
            const out = [...prev];
            out[lineIdx] = p;
            return out;
          }),
        () => {
          lineIdx += 1;
          between = setTimeout(startLine, 600);
        },
        { mode: "char", rate: 32 },
      );
    };

    // Initial delay so the headline lands first
    between = setTimeout(startLine, 600);

    return () => {
      if (cancel) cancel();
      if (between) clearTimeout(between);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen
      showProgress
      cta={
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <PrimaryCTA label="Yes, I'll be honest" onClick={next} />
            </motion.div>
          )}
        </AnimatePresence>
      }
    >
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        className="mt-4 font-bold tracking-[-0.025em]"
        style={{ fontSize: 44, lineHeight: 1.04, color: "var(--text)" }}
      >
        Here&apos;s the <span className="emph">thing</span>,
        <br />
        {display}.
      </motion.h1>

      <div className="mt-9 flex flex-col gap-5">
        {lines.map((line, i) => (
          <p
            key={i}
            className="text-[22px] leading-[1.32] font-semibold tracking-[-0.01em]"
            style={{
              color: "rgba(255,255,255,0.7)",
              minHeight: 30,
            }}
          >
            {revealed[i] || " "}
            {revealed[i] && revealed[i].length < line.length && <Cursor />}
          </p>
        ))}
      </div>
    </Screen>
  );
}

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block align-middle ml-[2px]"
      style={{
        width: 2,
        height: "1em",
        background: "rgba(255,255,255,0.65)",
        verticalAlign: "-0.15em",
      }}
    />
  );
}
