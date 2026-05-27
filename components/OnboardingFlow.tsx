"use client";

import { AnimatePresence } from "framer-motion";
import { useFlow } from "@/lib/flow-store";
import { useEffect } from "react";

import Screen01DoLifeBetter from "./screens/Screen01DoLifeBetter";
import Screen02NotBroken from "./screens/Screen02NotBroken";
import Screen02SoundFamiliar from "./screens/Screen02SoundFamiliar";
import Screen03WhyNothingStuck from "./screens/Screen03WhyNothingStuck";
import Screen04HowKaelWorks from "./screens/Screen04HowKaelWorks";
import Screen05MakeItAboutYou from "./screens/Screen05MakeItAboutYou";
import Screen06Name from "./screens/Screen06Name";
import Screen07Age from "./screens/Screen07Age";
import Screen08Gender from "./screens/Screen08Gender";
import Screen09Privacy from "./screens/Screen09Privacy";
import Screen10Honesty from "./screens/Screen10Honesty";
import Screen11StuckArea from "./screens/Screen11StuckArea";
import Screen12SpecificShape from "./screens/Screen12SpecificShape";
import Screen13HowLong from "./screens/Screen13HowLong";
import Screen14Patterns from "./screens/Screen14Patterns";
import Screen15WhatTried from "./screens/Screen15WhatTried";
import Screen16TheRead from "./screens/Screen16TheRead";
import Screen17Day1 from "./screens/Screen17Day1";
import Screen18ReviewAsk from "./screens/Screen18ReviewAsk";
import Screen19Goals from "./screens/Screen19Goals";
import Screen20Discomfort from "./screens/Screen20Discomfort";
import Screen21SocialProof from "./screens/Screen21SocialProof";
import Screen22Notifications from "./screens/Screen22Notifications";
import Screen23StartingPoint from "./screens/Screen23StartingPoint";
import Screen24Loading from "./screens/Screen24Loading";
import Screen25Reveal from "./screens/Screen25Reveal";
import Screen26SealIt from "./screens/Screen26SealIt";
import Screen27AllSet from "./screens/Screen27AllSet";
import Screen28Paywall from "./screens/Screen28Paywall";

const SCREENS = [
  Screen01DoLifeBetter,
  Screen02NotBroken,
  Screen02SoundFamiliar,
  Screen03WhyNothingStuck,
  Screen04HowKaelWorks,
  Screen05MakeItAboutYou,
  Screen06Name,
  Screen07Age,
  Screen08Gender,
  Screen09Privacy,
  Screen10Honesty,
  Screen11StuckArea,
  Screen12SpecificShape,
  Screen13HowLong,
  Screen14Patterns,
  Screen15WhatTried,
  Screen16TheRead,
  Screen17Day1,
  Screen18ReviewAsk,
  Screen19Goals,
  Screen20Discomfort,
  Screen21SocialProof,
  Screen22Notifications,
  Screen23StartingPoint,
  Screen24Loading,
  Screen25Reveal,
  Screen26SealIt,
  Screen27AllSet,
  Screen28Paywall,
];

export default function OnboardingFlow() {
  const step = useFlow((s) => s.currentStep);
  const Active = SCREENS[step] ?? SCREENS[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Active key={step} />
    </AnimatePresence>
  );
}
