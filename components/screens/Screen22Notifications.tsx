"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import KaelLogo from "@/components/KaelLogo";
import { useFlow } from "@/lib/flow-store";

export default function Screen22Notifications() {
  const next = useFlow((s) => s.next);

  return (
    <Screen
      cta={<PrimaryCTA label="Turn on notifications" onClick={next} />}
      contentClassName="flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text="Kael follows up so **you do too**." size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-4 text-[17px] leading-snug font-medium"
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        Not &ldquo;don&apos;t forget to journal!&rdquo;
        <br />
        Real check-ins based on what you said matters.
      </motion.p>

      <div className="flex-1" />

      {/* Notification preview — vertically centered in available space */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
        className="mx-auto rounded-2xl p-4 relative"
        style={{
          maxWidth: 320,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "0 24px 48px -16px rgba(0,0,0,0.55), 0 0 36px rgba(139,92,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-2.5">
          <span
            className="flex items-center justify-center rounded-md shrink-0"
            style={{
              width: 26,
              height: 26,
              background:
                "linear-gradient(160deg, rgba(139,92,255,0.55) 0%, rgba(123,71,242,0.35) 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <KaelLogo size={18} />
          </span>
          <span className="text-[12.5px] font-semibold" style={{ color: "rgba(255,255,255,0.92)" }}>
            Kael
          </span>
          <span className="text-[11px] ml-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            now
          </span>
        </div>
        <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.95)" }}>
          You said you wanted to stop overthinking. Notice anything this week that pulled you back into your head?
        </p>
      </motion.div>

      <div className="flex-1" />
    </Screen>
  );
}
