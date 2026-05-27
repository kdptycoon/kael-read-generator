"use client";

import { motion } from "framer-motion";
import { Apple, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import Screen from "@/components/Screen";
import Headline from "@/components/Headline";
import StarRow from "@/components/StarRow";
import { useFlow } from "@/lib/flow-store";
import { AUTH_REVIEWS } from "@/lib/reviews";

export default function Screen05MakeItAboutYou() {
  const next = useFlow((s) => s.next);
  const [reviewIdx, setReviewIdx] = useState(0);

  // Rotate auth reviews every 5s
  useEffect(() => {
    const id = setInterval(() => setReviewIdx((i) => (i + 1) % AUTH_REVIEWS.length), 5000);
    return () => clearInterval(id);
  }, []);
  const review = AUTH_REVIEWS[reviewIdx];

  return (
    <Screen
      noCta
      contentClassName="flex flex-col"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-2"
      >
        <Headline text="Let&apos;s make it **about** you." size="xl" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-3 text-[15.5px] leading-snug"
        style={{ color: "var(--text-mute)" }}
      >
        Kael remembers everything you share. Patterns, goals, breakthroughs. Every session builds on the last.
      </motion.p>

      {/* Review card */}
      <motion.div
        key={reviewIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 rounded-2xl p-5"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <StarRow size={13} glow />
        <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>
          &ldquo;{review.body}&rdquo;
        </p>
        {review.tags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {review.tags.map((t) => (
              <span
                key={t}
                className="text-[11.5px] px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(139, 92, 255, 0.14)",
                  border: "1px solid rgba(139, 92, 255, 0.32)",
                  color: "var(--accent-hi)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 text-[13px]" style={{ color: "var(--text-faint)" }}>
          <span className="font-semibold" style={{ color: "rgba(255,255,255,0.92)" }}>
            {review.author}
          </span>
          {review.authorMeta && <span>, {review.authorMeta}</span>}
        </div>
      </motion.div>

      <div className="flex-1" />

      {/* Auth buttons */}
      <div className="flex flex-col gap-3 mt-6 mb-2">
        <AuthBtn icon={<Apple size={18} fill="#FFFFFF" />} label="Continue with Apple" onClick={next} variant="white" />
        <AuthBtn icon={<GoogleGlyph />} label="Continue with Google" onClick={next} variant="dark" />
        <AuthBtn icon={<Mail size={18} strokeWidth={2} />} label="Continue with email" onClick={next} variant="dark" />
      </div>

      <p className="text-center text-[12px] leading-snug mt-3 mb-2" style={{ color: "var(--text-faint)" }}>
        By continuing, you agree to our{" "}
        <span className="underline" style={{ color: "var(--text-mute)" }}>
          Terms
        </span>{" "}
        and{" "}
        <span className="underline" style={{ color: "var(--text-mute)" }}>
          Privacy Policy
        </span>
        .
      </p>

      <div style={{ height: "calc(var(--safe-bottom) + 8px)" }} />
    </Screen>
  );
}

function AuthBtn({
  icon,
  label,
  onClick,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: "white" | "dark";
}) {
  const styles =
    variant === "white"
      ? { background: "#FFFFFF", color: "#0A0612", border: "1px solid #FFFFFF" }
      : {
          background: "rgba(255,255,255,0.06)",
          color: "var(--text)",
          border: "1px solid rgba(255,255,255,0.1)",
        };
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="press w-full rounded-cta py-[15px] flex items-center justify-center gap-2 text-[15px] font-semibold"
      style={styles}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71a5.41 5.41 0 0 1 0-3.42V4.958H.957a9 9 0 0 0 0 8.084l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
