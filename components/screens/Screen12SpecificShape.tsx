"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import IconRow from "@/components/IconRow";
import Headline from "@/components/Headline";
import PrimaryCTA from "@/components/PrimaryCTA";
import { useFlow } from "@/lib/flow-store";
import { STUCK_AREAS } from "@/lib/stuck-areas";

export default function Screen12SpecificShape() {
  const stuckArea = useFlow((s) => s.stuckArea);
  const specificShape = useFlow((s) => s.specificShape);
  const customShape = useFlow((s) => s.customShape);
  const setSpecificShape = useFlow((s) => s.setSpecificShape);
  const setCustomShape = useFlow((s) => s.setCustomShape);
  const next = useFlow((s) => s.next);

  const area = stuckArea && STUCK_AREAS[stuckArea] ? STUCK_AREAS[stuckArea] : STUCK_AREAS.career;
  const canContinue = !!specificShape || customShape.trim().length > 0;

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
        <Headline text={`What's going on with your **${area.labelLower}**?`} size="lg" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[15.5px] leading-snug"
        style={{ color: "var(--text-mute)" }}
      >
        Tap one that fits, or describe it your way.
      </motion.p>

      <div className="mt-6 flex flex-col gap-2">
        {area.shapes.map((shape, i) => (
          <motion.div
            key={shape.text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14 + i * 0.04 }}
          >
            <IconRow
              emoji={shape.emoji}
              label={shape.text}
              selected={specificShape === shape.text}
              onClick={() => {
                setSpecificShape(shape.text);
                if (customShape) setCustomShape("");
              }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
        className="mt-4 mb-4"
      >
        <textarea
          value={customShape}
          onChange={(e) => {
            setCustomShape(e.target.value);
            if (e.target.value && specificShape) setSpecificShape("");
          }}
          placeholder="Or in your own words..."
          rows={2}
          className="w-full rounded-2xl text-[15px] outline-none resize-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: "14px 16px",
            color: "var(--text)",
            lineHeight: 1.5,
          }}
        />
      </motion.div>
    </Screen>
  );
}
