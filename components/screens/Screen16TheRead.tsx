"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import KaelLogo from "@/components/KaelLogo";
import PrimaryCTA from "@/components/PrimaryCTA";
import TypingIndicator from "@/components/TypingIndicator";
import FirstReadDebug from "@/components/FirstReadDebug";
import { useFlow } from "@/lib/flow-store";
import {
  fetchFirstRead,
  FirstReadError,
  type ReadMessages,
} from "@/lib/first-read-client";
import { streamText } from "@/lib/stream-tokens";

type Phase =
  | "priming"
  | "transition"
  | "chat-empty"
  | "typing-1"
  | "msg-1"
  | "pause-1"
  | "typing-2"
  | "msg-2"
  | "pause-2"
  | "typing-3"
  | "msg-3-intro"
  | "msg-3-bullets"
  | "msg-3-closing"
  | "ready";

const PRIMING_MS = 2800;
const TRANSITION_MS = 600;
const EMPTY_MS = 600;
const TYPING_MS = 600;
const PAUSE_MS = 800;

const TYPING_PHASES = new Set<Phase>([
  "typing-1",
  "msg-1",
  "typing-2",
  "msg-2",
  "typing-3",
  "msg-3-intro",
  "msg-3-bullets",
  "msg-3-closing",
]);

interface DebugInfo {
  input: unknown;
  raw?: string;
  error?: {
    message: string;
    status?: number;
    detail?: unknown;
    raw?: unknown;
    input?: unknown;
  } | null;
}

export default function Screen16TheRead() {
  const flow = useFlow();
  const next = useFlow((s) => s.next);

  const [phase, setPhase] = useState<Phase>("priming");
  const [messages, setMessages] = useState<ReadMessages | null>(null);
  const [error, setError] = useState<FirstReadError | Error | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [m1, setM1] = useState("");
  const [m2, setM2] = useState("");
  const [m3Intro, setM3Intro] = useState("");
  const [m3BulletsRevealed, setM3BulletsRevealed] = useState(0);

  // Snapshot the input we'll send so the debug panel can show it even before the response lands.
  const sentInputRef = useRef<unknown>(null);
  if (sentInputRef.current === null) {
    sentInputRef.current = {
      name: flow.name,
      age: flow.age,
      gender: flow.gender,
      stuckArea: flow.stuckArea,
      specificShape: flow.specificShape,
      customShape: flow.customShape,
      timeStuck: flow.timeStuck,
      patterns: flow.patterns,
      whatTried: flow.whatTried,
    };
  }

  const [debugEnabled, setDebugEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDev = process.env.NODE_ENV !== "production";
    const flagged = new URLSearchParams(window.location.search).get("debug") === "1";
    setDebugEnabled(isDev || flagged);
  }, []);

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancel = false;
    setError(null);
    fetchFirstRead(flow)
      .then((r) => {
        if (cancel) return;
        setMessages(r.data);
        setDebug({ input: r.debug.input, raw: r.debug.raw, error: null });
      })
      .catch((e: Error) => {
        if (cancel) return;
        const fre = e as FirstReadError;
        setError(e);
        setDebug({
          input: (fre.input as unknown) ?? sentInputRef.current,
          raw: undefined,
          error: {
            message: e.message,
            status: fre.status,
            detail: fre.detail,
            raw: fre.raw,
          },
        });
      });
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  useEffect(() => {
    if (!error) return;
    // Snap to chat surface so the error is visible (skip the priming wait).
    if (phase === "priming" || phase === "transition") {
      setPhase("chat-empty");
    }
  }, [error, phase]);

  useEffect(() => {
    if (error) return;

    let cancelStream: null | (() => void) = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const advance = (to: Phase, ms: number) => {
      timer = setTimeout(() => setPhase(to), ms);
    };

    if (phase === "priming") {
      advance("transition", PRIMING_MS);
    } else if (phase === "transition") {
      advance("chat-empty", TRANSITION_MS);
    } else if (phase === "chat-empty") {
      advance("typing-1", EMPTY_MS);
    } else if (phase === "typing-1") {
      if (messages) advance("msg-1", TYPING_MS);
      else advance("typing-1", 100);
    } else if (phase === "msg-1") {
      if (!messages) return;
      cancelStream = streamText(
        messages.recognition,
        (p) => setM1(p),
        () => advance("pause-1", 0),
      );
    } else if (phase === "pause-1") {
      advance("typing-2", PAUSE_MS);
    } else if (phase === "typing-2") {
      advance("msg-2", TYPING_MS);
    } else if (phase === "msg-2") {
      if (!messages) return;
      cancelStream = streamText(
        messages.hypothesis,
        (p) => setM2(p),
        () => advance("pause-2", 0),
      );
    } else if (phase === "pause-2") {
      advance("typing-3", PAUSE_MS);
    } else if (phase === "typing-3") {
      advance("msg-3-intro", TYPING_MS);
    } else if (phase === "msg-3-intro") {
      if (!messages) return;
      cancelStream = streamText(
        messages.shapeIntro,
        (p) => setM3Intro(p),
        () => advance("msg-3-bullets", 200),
      );
    } else if (phase === "msg-3-bullets") {
      if (!messages) return;
      let i = 0;
      const id = setInterval(() => {
        i += 1;
        setM3BulletsRevealed(i);
        if (i >= messages.shapeBullets.length) {
          clearInterval(id);
          advance("msg-3-closing", 350);
        }
      }, 220);
      return () => clearInterval(id);
    } else if (phase === "msg-3-closing") {
      advance("ready", 700);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (cancelStream) cancelStream();
    };
  }, [phase, messages, error]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [m1, m2, m3Intro, m3BulletsRevealed, phase, error]);

  const showPriming = (phase === "priming" || phase === "transition") && !error;
  const showChat = phase !== "priming" || error !== null;
  const isTyping = TYPING_PHASES.has(phase) && !error;
  const statusText = error ? "error" : isTyping ? "typing…" : "online";

  return (
    <motion.section
      key="screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col"
      style={{
        minHeight: "100dvh",
        background: showPriming ? "#000" : "transparent",
        transition: "background 600ms ease-out",
      }}
    >
      {/* Priming overlay */}
      <AnimatePresence>
        {showPriming && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center"
            style={{ background: "#000", paddingBottom: 60 }}
          >
            <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full"
                  initial={{ scale: 0.45, opacity: 0 }}
                  animate={{ scale: [0.45, 1.6], opacity: [0, 0.55, 0] }}
                  transition={{
                    duration: 2.6,
                    delay: i * 0.85,
                    repeat: Infinity,
                    ease: "easeOut",
                    times: [0, 0.2, 1],
                  }}
                  style={{
                    width: 130,
                    height: 130,
                    border: "1px solid rgba(139, 92, 255, 0.55)",
                    boxShadow:
                      "0 0 22px rgba(139, 92, 255, 0.25), inset 0 0 18px rgba(139, 92, 255, 0.18)",
                  }}
                  aria-hidden
                />
              ))}

              <motion.span
                className="absolute rounded-full"
                animate={{
                  opacity: [0.55, 0.9, 0.55],
                  scale: [0.95, 1.06, 0.95],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 170,
                  height: 170,
                  background:
                    "radial-gradient(circle, rgba(139,92,255,0.35) 0%, rgba(139,92,255,0.10) 50%, transparent 75%)",
                  filter: "blur(2px)",
                }}
                aria-hidden
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  scale: phase === "transition" ? 0.92 : [1, 1.04, 1],
                }}
                transition={
                  phase === "transition"
                    ? { duration: 0.4, ease: "easeIn" }
                    : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.55 }
                }
                style={{ position: "relative", zIndex: 2 }}
              >
                <KaelLogo size={68} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "transition" ? 0 : 1 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="mt-7 flex items-center gap-2"
            >
              <TypeOn
                text="Kael is reading what you shared"
                start={650}
                rate={42}
              />
              <PrimingDots />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: "calc(var(--safe-top) + 12px)" }} />

      {showChat && (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="flex flex-col flex-1"
          style={{ minHeight: 0 }}
        >
          <div
            className="flex items-center gap-3 px-6 pt-2 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <KaelLogo size={28} />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
                Kael
              </span>
              <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
                {!isTyping && !error && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: "#3BD17F",
                      boxShadow: "0 0 6px rgba(59, 209, 127, 0.7)",
                    }}
                  />
                )}
                {error && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: "#E04877",
                      boxShadow: "0 0 6px rgba(224, 72, 119, 0.7)",
                    }}
                  />
                )}
                <motion.span
                  key={statusText}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    color: error
                      ? "rgba(224, 72, 119, 0.95)"
                      : isTyping
                        ? "var(--text-faint)"
                        : "rgba(59, 209, 127, 0.95)",
                  }}
                >
                  {statusText}
                </motion.span>
              </span>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 flex flex-col gap-4"
            style={{ minHeight: 0, paddingBottom: phase === "ready" ? 120 : 24 }}
          >
            {error && <ErrorBubble error={error} onRetry={() => setAttempt((a) => a + 1)} />}

            {!error && phase === "typing-1" && <TypingIndicator />}

            {!error &&
              (phase === "msg-1" ||
                phase === "pause-1" ||
                phase === "typing-2" ||
                phase === "msg-2" ||
                phase === "pause-2" ||
                phase === "typing-3" ||
                phase === "msg-3-intro" ||
                phase === "msg-3-bullets" ||
                phase === "msg-3-closing" ||
                phase === "ready") && <Bubble>{m1 || messages?.recognition}</Bubble>}

            {!error && phase === "typing-2" && <TypingIndicator />}

            {!error &&
              (phase === "msg-2" ||
                phase === "pause-2" ||
                phase === "typing-3" ||
                phase === "msg-3-intro" ||
                phase === "msg-3-bullets" ||
                phase === "msg-3-closing" ||
                phase === "ready") && <Bubble>{m2 || messages?.hypothesis}</Bubble>}

            {!error && phase === "typing-3" && <TypingIndicator />}

            {!error &&
              (phase === "msg-3-intro" ||
                phase === "msg-3-bullets" ||
                phase === "msg-3-closing" ||
                phase === "ready") &&
              messages && (
                <Bubble>
                  <div>{m3Intro || messages.shapeIntro}</div>
                  {(phase === "msg-3-bullets" ||
                    phase === "msg-3-closing" ||
                    phase === "ready") && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {messages.shapeBullets.slice(0, m3BulletsRevealed).map((b, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-2 items-start text-[14.5px]"
                          style={{ color: "rgba(255,255,255,0.95)" }}
                        >
                          <span
                            className="mt-2 shrink-0 rounded-full"
                            style={{ width: 5, height: 5, background: "var(--accent-hi)" }}
                          />
                          <span className="flex-1">{b}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                  {(phase === "msg-3-closing" || phase === "ready") &&
                    messages.closingQuestion && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-4 text-[15px]"
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontStyle: "italic",
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {messages.closingQuestion}
                      </motion.div>
                    )}
                </Bubble>
              )}
          </div>

          <AnimatePresence>
            {phase === "ready" && !error && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="absolute left-0 right-0 bottom-0 z-10"
                style={{
                  padding: "16px 24px calc(20px + var(--safe-bottom)) 24px",
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(14,8,32,0.85) 35%, rgba(14,8,32,0.98) 100%)",
                  pointerEvents: "none",
                }}
              >
                <div style={{ pointerEvents: "auto" }}>
                  <PrimaryCTA label="I'm ready" onClick={next} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {debugEnabled && debug && (
        <FirstReadDebug input={debug.input} raw={debug.raw} error={debug.error ?? null} />
      )}
    </motion.section>
  );
}

function TypeOn({ text, start = 0, rate = 40 }: { text: string; start?: number; rate?: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const interval = Math.max(20, Math.round(1000 / rate));
    const startTimer = setTimeout(() => {
      const tick = () => {
        if (i >= text.length) return;
        i += 1;
        setShown(text.slice(0, i));
        timer = setTimeout(tick, interval);
      };
      tick();
    }, start);
    return () => {
      clearTimeout(startTimer);
      if (timer) clearTimeout(timer);
    };
  }, [text, start, rate]);
  return (
    <span
      className="text-[15px] font-medium tracking-[-0.005em]"
      style={{ color: "rgba(255,255,255,0.85)" }}
    >
      {shown}
    </span>
  );
}

function PrimingDots() {
  return (
    <span className="inline-flex gap-1 items-end">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
          style={{
            width: 4,
            height: 4,
            borderRadius: 999,
            background: "rgba(255,255,255,0.55)",
            display: "inline-block",
          }}
        />
      ))}
    </span>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl"
      style={{
        padding: "14px 16px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "var(--text)",
        maxWidth: "90%",
        fontSize: 15,
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        alignSelf: "flex-start",
      }}
    >
      {children}
    </motion.div>
  );
}

function ErrorBubble({
  error,
  onRetry,
}: {
  error: FirstReadError | Error;
  onRetry: () => void;
}) {
  const fre = error as FirstReadError;
  const detail = typeof fre.detail === "string" ? fre.detail : fre.detail ? JSON.stringify(fre.detail, null, 2) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl"
      style={{
        padding: "14px 16px",
        background: "rgba(224, 72, 119, 0.10)",
        border: "1px solid rgba(224, 72, 119, 0.45)",
        color: "rgba(255, 255, 255, 0.95)",
        maxWidth: "92%",
        fontSize: 14,
        lineHeight: 1.55,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 600, color: "rgba(255, 196, 215, 1)" }}>
        Couldn't generate The Read.
      </div>
      <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5 }}>
        {error.message}
        {fre.status ? `  ·  status ${fre.status}` : ""}
      </div>
      {detail && (
        <pre
          style={{
            margin: 0,
            padding: 8,
            borderRadius: 8,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 11.5,
            maxHeight: 200,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {detail}
        </pre>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="press self-start rounded-full"
        style={{
          padding: "8px 14px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "rgba(255,255,255,0.95)",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        Retry
      </button>
    </motion.div>
  );
}
