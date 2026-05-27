"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

export default function Screen06Name() {
  const name = useFlow((s) => s.name);
  const setName = useFlow((s) => s.setName);
  const next = useFlow((s) => s.next);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const canContinue = name.trim().length >= 1;

  return (
    <Screen
      showProgress
      cta={<PrimaryCTA label="Continue" onClick={next} disabled={!canContinue} />}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text="What should Kael **call** you?" size="xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8"
      >
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canContinue) next();
          }}
          placeholder="Your first name"
          autoComplete="given-name"
          autoCapitalize="words"
          className="w-full rounded-2xl text-[20px] font-medium outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "18px 18px",
            color: "var(--text)",
          }}
        />
      </motion.div>
    </Screen>
  );
}
