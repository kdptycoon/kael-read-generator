"use client";

import { motion } from "framer-motion";
import Screen from "@/components/Screen";
import PrimaryCTA from "@/components/PrimaryCTA";
import Headline from "@/components/Headline";
import { useFlow } from "@/lib/flow-store";

export default function Screen02NotBroken() {
  const next = useFlow((s) => s.next);

  return (
    <Screen
      cta={<PrimaryCTA label="Continue" onClick={next} />}
      contentClassName="flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-2"
      >
        <Headline text="You're not broken. You are stuck in a **loop**." size="2xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        className="flex-1 flex items-center justify-center mt-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/loop.png"
          alt="Same thoughts, same emotions, same actions, same life — a person running on a hamster wheel"
          className="block w-full"
          style={{ maxWidth: 340, height: "auto" }}
        />
      </motion.div>
    </Screen>
  );
}
