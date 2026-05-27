"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import ChatBubble from "@/components/ChatBubble";
import { STUCK_AREAS, STUCK_AREA_KEYS } from "@/lib/stuck-areas";
import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  TIME_STUCK_OPTIONS,
  PATTERN_OPTIONS,
  TRIED_OPTIONS,
  PATTERNS_MAX,
} from "@/lib/onboarding-options";

type Model = {
  id: string;
  name: string;
  pricing: { prompt: string | null; completion: string | null } | null;
};

type ReadResult = {
  recognition: string;
  hypothesis: string;
  the_work: string;
};

const PREFERRED = [
  "anthropic/claude-opus-4.7",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o",
  "openai/gpt-4.1",
  "google/gemini-2.5-pro",
];

const RANDOM_NAMES = [
  "Muni",
  "Liam", "Olivia", "Noah", "Emma", "Ethan", "Ava", "Mason", "Sophia",
  "Logan", "Isabella", "Lucas", "Mia", "Jackson", "Charlotte", "Aiden",
  "Amelia", "Caleb", "Harper", "Owen", "Evelyn", "Wyatt", "Abigail",
  "Hudson", "Riley",
];
const MUNI_PROBABILITY = 0.2;
function pickName(): string {
  if (Math.random() < MUNI_PROBABILITY) return "Muni";
  const others = RANDOM_NAMES.filter((n) => n !== "Muni");
  return others[Math.floor(Math.random() * others.length)];
}

const DEFAULT_FORM = {
  name: "Sumit",
  age: "25-34",
  gender: "male",
  stuck_area: "career",
  specific_shape: "I keep starting things and not finishing",
  custom_shape: "",
  time_stuck: "about-year",
  patterns: ["high-standards", "hard-on-myself", "put-off"] as string[],
  custom_patterns: "",
  tried: ["journaling", "therapy"] as string[],
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}
function randomForm(): typeof DEFAULT_FORM {
  const stuckKey = pick(STUCK_AREA_KEYS as readonly string[]);
  const stuck = STUCK_AREAS[stuckKey];
  const patternCount = 1 + Math.floor(Math.random() * PATTERNS_MAX);
  const triedCount = 1 + Math.floor(Math.random() * 4);
  const triedPool = TRIED_OPTIONS.filter((t) => t.key !== "nothing");
  const tried = Math.random() < 0.1
    ? ["nothing"]
    : pickN(triedPool, triedCount).map((t) => t.key);
  return {
    name: pickName(),
    age: pick(AGE_OPTIONS).key,
    gender: pick(GENDER_OPTIONS).key,
    stuck_area: stuckKey,
    specific_shape: pick(stuck.shapes).text,
    custom_shape: "",
    time_stuck: pick(TIME_STUCK_OPTIONS).key,
    patterns: pickN(PATTERN_OPTIONS, patternCount).map((p) => p.key),
    custom_patterns: "",
    tried,
  };
}

const TOKEN_KEY = "kael_tester_token";
const GUARD_N_KEY = "kael_tester_guard_n";
const GUARD_N_DEFAULT = 8;
const TEMP_KEY = "kael_tester_temperature";
const TEMP_DEFAULT = 0.8;
const TEMP_MIN = 0;
const TEMP_MAX = 2;
const TEMP_STEP = 0.05;

type ChatMsg = {
  role: "user" | "kael";
  content: string;
  options?: string[];
  close?: boolean;
  cta?: string;
};

type ChatUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  cost: number | null;
};

export default function TestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenChecking, setTokenChecking] = useState(false);

  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState<string>("anthropic/claude-3.5-sonnet");
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [form, setForm] = useState(DEFAULT_FORM);

  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [defaultPrompt, setDefaultPrompt] = useState<string>("");
  const [promptOpen, setPromptOpen] = useState<boolean>(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawInput, setRawInput] = useState<string>("");
  const [rawContent, setRawContent] = useState<string>("");
  const [read, setRead] = useState<ReadResult | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [rawInputOpen, setRawInputOpen] = useState<boolean>(false);
  const [rawOutputOpen, setRawOutputOpen] = useState<boolean>(false);
  const diceRef = useRef<DotLottie | null>(null);

  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [defaultChatPrompt, setDefaultChatPrompt] = useState<string>("");
  const [chatPromptError, setChatPromptError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<"read" | "chat">("read");
  const [chatMode, setChatMode] = useState<boolean>(false);
  const [guardN, setGuardN] = useState<number>(GUARD_N_DEFAULT);
  const [guardNDraft, setGuardNDraft] = useState<string>(String(GUARD_N_DEFAULT));
  const [temperature, setTemperature] = useState<number>(TEMP_DEFAULT);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatSending, setChatSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatStarted, setChatStarted] = useState<boolean>(false);
  const [chatLocked, setChatLocked] = useState<boolean>(false);
  const [chatUsage, setChatUsage] = useState<ChatUsage | null>(null);
  const [chatRawInput, setChatRawInput] = useState<string>("");
  const [chatRawInputOpen, setChatRawInputOpen] = useState<boolean>(false);
  const [chatRawOutputOpen, setChatRawOutputOpen] = useState<boolean>(false);
  const [chatControlsHidden, setChatControlsHidden] = useState<boolean>(false);
  const chatReqIdRef = useRef<number>(0);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  function rollDice() {
    const dice = diceRef.current;
    if (dice) {
      try {
        dice.stop();
        dice.play();
      } catch {}
    }
    setForm(randomForm());
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch("/api/models", { headers: { "x-access-token": token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return setModelsError(d.error);
        setModels(d.models);
        const ids = new Set(d.models.map((m: Model) => m.id));
        const p = PREFERRED.find((x) => ids.has(x));
        if (p) setModel(p);
        else if (d.models[0]) setModel(d.models[0].id);
      })
      .catch((e) => setModelsError(String(e)));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/prompt", { headers: { "x-access-token": token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return setPromptError(d.error);
        setSystemPrompt(d.prompt);
        setDefaultPrompt(d.prompt);
      })
      .catch((e) => setPromptError(String(e)));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/prompt?type=chat", { headers: { "x-access-token": token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return setChatPromptError(d.error);
        setChatPrompt(d.prompt);
        setDefaultChatPrompt(d.prompt);
      })
      .catch((e) => setChatPromptError(String(e)));
  }, [token]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(GUARD_N_KEY);
    if (stored) {
      const n = parseInt(stored, 10);
      if (Number.isFinite(n) && n >= 1 && n <= 99) {
        setGuardN(n);
        setGuardNDraft(String(n));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUARD_N_KEY, String(guardN));
  }, [guardN]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(TEMP_KEY);
    if (stored != null) {
      const t = parseFloat(stored);
      if (Number.isFinite(t) && t >= TEMP_MIN && t <= TEMP_MAX) setTemperature(t);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TEMP_KEY, String(temperature));
  }, [temperature]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages, chatSending, chatError]);

  async function submitToken(e: React.FormEvent) {
    e.preventDefault();
    const value = tokenInput.replace(/\s+/g, "");
    if (!value) return;
    setTokenChecking(true);
    setTokenError(null);
    try {
      const res = await fetch("/api/models", { headers: { "x-access-token": value } });
      if (res.status === 401) {
        setTokenError(`Wrong access token (sent ${value.length} chars).`);
        return;
      }
      if (!res.ok) {
        setTokenError(`Server error: ${res.status}`);
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, value);
      setToken(value);
      setTokenInput("");
    } catch (e: any) {
      setTokenError(String(e?.message ?? e));
    } finally {
      setTokenChecking(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setModels([]);
    setSystemPrompt("");
    setDefaultPrompt("");
    setRead(null);
    setRawContent("");
    setRawInput("");
    setChatPrompt("");
    setDefaultChatPrompt("");
    setChatMessages([]);
    setChatInput("");
    setChatStarted(false);
    setChatLocked(false);
    setChatError(null);
    setChatUsage(null);
    setChatRawInput("");
    setChatMode(false);
  }

  const sortedModels = useMemo(() => {
    const preferredFirst = PREFERRED.filter((p) => models.find((m) => m.id === p)).map(
      (p) => models.find((m) => m.id === p)!,
    );
    const rest = models.filter((m) => !PREFERRED.includes(m.id));
    return [...preferredFirst, ...rest];
  }, [models]);

  const stuckArea = STUCK_AREAS[form.stuck_area] ?? STUCK_AREAS.career;
  const promptDirty = systemPrompt !== defaultPrompt && defaultPrompt.length > 0;
  const chatPromptDirty = chatPrompt !== defaultChatPrompt && defaultChatPrompt.length > 0;
  const selectedModel = useMemo(() => models.find((m) => m.id === model) ?? null, [models, model]);

  const chatUserReplyCount = useMemo(
    () => chatMessages.filter((m) => m.role === "user").length,
    [chatMessages],
  );
  const lastKaelMsg = useMemo(() => {
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].role === "kael") return chatMessages[i];
    }
    return null;
  }, [chatMessages]);
  const chatClosed = lastKaelMsg?.close === true;
  const guardTripped = !chatClosed && chatUserReplyCount >= guardN && chatStarted;
  const chatInputLocked = chatSending || chatClosed || guardTripped || chatLocked || !chatStarted;

  const chatCostInfo = useMemo(() => {
    if (!chatUsage) return null;
    const promptTok = Number(chatUsage.prompt_tokens ?? 0);
    const completionTok = Number(chatUsage.completion_tokens ?? 0);
    const promptPricePerTok = Number(selectedModel?.pricing?.prompt ?? 0);
    const completionPricePerTok = Number(selectedModel?.pricing?.completion ?? 0);
    const inputCost = promptTok * promptPricePerTok;
    const outputCost = completionTok * completionPricePerTok;
    const computedTotal = inputCost + outputCost;
    const reportedTotal = typeof chatUsage.cost === "number" ? chatUsage.cost : null;
    const total = reportedTotal ?? computedTotal;
    return {
      promptTok,
      completionTok,
      promptPricePerTok,
      completionPricePerTok,
      inputCost,
      outputCost,
      total,
      reportedTotal,
      hasPricing: promptPricePerTok > 0 || completionPricePerTok > 0 || reportedTotal != null,
    };
  }, [chatUsage, selectedModel]);

  const chatStatsInfo = useMemo(() => {
    let kaelMsgs = 0;
    let userMsgs = 0;
    let words = 0;
    for (const m of chatMessages) {
      if (m.role === "kael") kaelMsgs++;
      else if (m.role === "user") userMsgs++;
      words += (m.content.trim().match(/\S+/g) ?? []).length;
    }
    return { kaelMsgs, userMsgs, words, turns: chatMessages.length };
  }, [chatMessages]);

  const chatRawOutputJson = useMemo(() => {
    if (chatMessages.length === 0) return "";
    return JSON.stringify(
      chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.options && m.options.length ? { options: m.options } : null),
        ...(m.close ? { close: true } : null),
        ...(m.cta ? { cta: m.cta } : null),
      })),
      null,
      2,
    );
  }, [chatMessages]);

  const costInfo = useMemo(() => {
    if (!usage) return null;
    const promptTok = Number(usage.prompt_tokens ?? 0);
    const completionTok = Number(usage.completion_tokens ?? 0);
    const promptPricePerTok = Number(selectedModel?.pricing?.prompt ?? 0);
    const completionPricePerTok = Number(selectedModel?.pricing?.completion ?? 0);
    const inputCost = promptTok * promptPricePerTok;
    const outputCost = completionTok * completionPricePerTok;
    const computedTotal = inputCost + outputCost;
    const reportedTotal = typeof usage.cost === "number" ? usage.cost : null;
    const total = reportedTotal ?? computedTotal;
    return {
      promptTok,
      completionTok,
      promptPricePerTok,
      completionPricePerTok,
      inputCost,
      outputCost,
      total,
      reportedTotal,
      hasPricing: promptPricePerTok > 0 || completionPricePerTok > 0 || reportedTotal != null,
    };
  }, [usage, selectedModel]);

  function update<K extends keyof typeof DEFAULT_FORM>(k: K, v: (typeof DEFAULT_FORM)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function pickShape(text: string) {
    setForm((f) => ({
      ...f,
      specific_shape: f.specific_shape === text ? "" : text,
      custom_shape: f.specific_shape === text ? f.custom_shape : "",
    }));
  }
  function setCustomShape(v: string) {
    setForm((f) => ({ ...f, custom_shape: v, specific_shape: v ? "" : f.specific_shape }));
  }
  function changeStuckArea(k: string) {
    setForm((f) => ({ ...f, stuck_area: k, specific_shape: "", custom_shape: "" }));
  }
  function togglePattern(key: string) {
    setForm((f) => {
      const has = f.patterns.includes(key);
      if (has) return { ...f, patterns: f.patterns.filter((p) => p !== key) };
      if (f.patterns.length >= PATTERNS_MAX) return f;
      return { ...f, patterns: [...f.patterns, key] };
    });
  }
  function toggleTried(key: string) {
    setForm((f) => {
      const has = f.tried.includes(key);
      if (key === "nothing") {
        return { ...f, tried: has ? [] : ["nothing"] };
      }
      const without = f.tried.filter((t) => t !== key && t !== "nothing");
      return { ...f, tried: has ? without : [...without, key] };
    });
  }

  function buildFormInput() {
    const ageLabel = AGE_OPTIONS.find((o) => o.key === form.age)?.label ?? form.age;
    const genderLabel = GENDER_OPTIONS.find((o) => o.key === form.gender)?.label ?? form.gender;
    const timeLabel = TIME_STUCK_OPTIONS.find((o) => o.key === form.time_stuck)?.label ?? form.time_stuck;
    return {
      name: form.name.trim(),
      age: ageLabel,
      gender: genderLabel,
      stuck_area: stuckArea.labelLower,
      specific_shape: form.custom_shape.trim() || form.specific_shape,
      time_stuck: timeLabel,
      patterns: [
        ...form.patterns
          .map((k) => PATTERN_OPTIONS.find((p) => p.key === k)?.text as string | undefined)
          .filter((t): t is string => typeof t === "string" && t.length > 0),
        ...form.custom_patterns
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      ],
      tried: form.tried
        .map((k) => TRIED_OPTIONS.find((t) => t.key === k)?.label)
        .filter(Boolean),
    };
  }

  async function sendChat(history: ChatMsg[]) {
    chatReqIdRef.current += 1;
    const myId = chatReqIdRef.current;
    setChatSending(true);
    setChatError(null);
    try {
      const apiMessages = history.map((m) => ({
        role: m.role === "kael" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token ?? "",
        },
        body: JSON.stringify({
          model,
          formInput: buildFormInput(),
          systemPrompt: chatPrompt,
          messages: apiMessages,
          temperature,
        }),
      });
      const data = await res.json();
      if (chatReqIdRef.current !== myId) return;
      if (!res.ok) {
        setChatError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const msg: ChatMsg = {
        role: "kael",
        content: typeof data.message === "string" ? data.message : "",
        options: Array.isArray(data.options) ? data.options.filter((o: unknown) => typeof o === "string") : [],
        close: data.close === true,
        cta: typeof data.cta === "string" ? data.cta.trim() : "",
      };
      setChatMessages((prev) => [...prev, msg]);
      if (data.usage) {
        setChatUsage((prev) => ({
          prompt_tokens: (prev?.prompt_tokens ?? 0) + Number(data.usage.prompt_tokens ?? 0),
          completion_tokens: (prev?.completion_tokens ?? 0) + Number(data.usage.completion_tokens ?? 0),
          cost:
            typeof data.usage.cost === "number"
              ? (prev?.cost ?? 0) + Number(data.usage.cost)
              : prev?.cost ?? null,
        }));
      }
    } catch (e: any) {
      if (chatReqIdRef.current === myId) setChatError(String(e?.message ?? e));
    } finally {
      if (chatReqIdRef.current === myId) setChatSending(false);
    }
  }

  function startChat() {
    if (chatSending) return;
    chatReqIdRef.current += 1;
    setChatMessages([]);
    setChatInput("");
    setChatUsage(null);
    setChatError(null);
    setChatLocked(false);
    setChatStarted(true);
    setChatRawInput(JSON.stringify(buildFormInput(), null, 2));
    sendChat([]);
  }

  function runForCurrentMode() {
    if (chatMode) startChat();
    else run();
  }

  function submitUserChat(text: string) {
    const trimmed = text.trim();
    if (!trimmed || chatInputLocked) return;
    const next: ChatMsg[] = [...chatMessages, { role: "user", content: trimmed }];
    setChatMessages(next);
    setChatInput("");
    sendChat(next);
  }

  function resetChat() {
    chatReqIdRef.current += 1;
    setChatMessages([]);
    setChatInput("");
    setChatSending(false);
    setChatError(null);
    setChatStarted(false);
    setChatLocked(false);
    setChatUsage(null);
    setChatRawInput("");
  }

  function endChatWithDump(endState: "closed" | "guard" | "stopped") {
    chatReqIdRef.current += 1;
    const dump = {
      endState,
      transcript: chatMessages,
      formInput: buildFormInput(),
      chatPrompt,
      guardN,
      chatUsage,
      model,
      timestamp: new Date().toISOString(),
    };
    // eslint-disable-next-line no-console
    console.log("[Understanding You] chat ended:", dump);
    setChatSending(false);
    setChatLocked(true);
  }

  function restartChat() {
    if (chatSending && !chatLocked) {
      // cancel any in-flight response by bumping the request id
      chatReqIdRef.current += 1;
    }
    startChat();
  }

  async function run() {
    setLoading(true);
    setError(null);
    setRawInput("");
    setRawContent("");
    setRead(null);
    setUsage(null);
    setLatencyMs(null);

    const ageLabel = AGE_OPTIONS.find((o) => o.key === form.age)?.label ?? form.age;
    const genderLabel = GENDER_OPTIONS.find((o) => o.key === form.gender)?.label ?? form.gender;
    const timeLabel = TIME_STUCK_OPTIONS.find((o) => o.key === form.time_stuck)?.label ?? form.time_stuck;

    const input = {
      name: form.name.trim(),
      age: ageLabel,
      gender: genderLabel,
      stuck_area: stuckArea.labelLower,
      specific_shape: form.custom_shape.trim() || form.specific_shape,
      time_stuck: timeLabel,
      patterns: [
        ...form.patterns
          .map((k) => PATTERN_OPTIONS.find((p) => p.key === k)?.text as string | undefined)
          .filter((t): t is string => typeof t === "string" && t.length > 0),
        ...form.custom_patterns
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      ],
      tried: form.tried
        .map((k) => TRIED_OPTIONS.find((t) => t.key === k)?.label)
        .filter(Boolean),
    };

    const inputJson = JSON.stringify(input, null, 2);
    setRawInput(inputJson);

    const t0 = performance.now();
    try {
      const res = await fetch("/api/the-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token ?? "",
        },
        body: JSON.stringify({ model, input, systemPrompt, temperature }),
      });
      const data = await res.json();
      setLatencyMs(Math.round(performance.now() - t0));
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        if (data.raw) setRawContent(data.raw);
        return;
      }
      setRawContent(data.content ?? "");
      setRead(data.read ?? null);
      setUsage(data.usage ?? null);
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setLatencyMs(Math.round(performance.now() - t0));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: GATE_CSS }} />
        <div className="gate-page">
          <form onSubmit={submitToken} className="gate-card">
            <div className="gate-logo">
              <KaelLogo height={40} />
            </div>
            <h1 className="gate-title">Kael's Onboarding Act</h1>
            <p className="gate-sub">Enter the access token to continue.</p>
            <input
              type="password"
              autoFocus
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="access token"
              className="gate-input"
              spellCheck={false}
              autoComplete="off"
            />
            {tokenError && <div className="gate-error">{tokenError}</div>}
            <button type="submit" disabled={tokenChecking || !tokenInput.trim()} className="gate-btn">
              {tokenChecking ? "Checking…" : "Unlock"}
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #08070d;
          --bg-grad-1: #0e0a1c;
          --bg-grad-2: #07060c;
          --surface: #11101a;
          --surface-2: #16151f;
          --surface-3: #1c1b26;
          --border: rgba(255, 255, 255, 0.06);
          --border-strong: rgba(255, 255, 255, 0.10);
          --text: #f3f1f7;
          --text-mute: #a09cad;
          --text-faint: #6c6878;
          --accent: #b89dff;
          --accent-strong: #8b5cff;
          --accent-soft: rgba(139, 92, 255, 0.14);
          --accent-soft-2: rgba(139, 92, 255, 0.22);
          --danger: #ff7794;
          --danger-bg: rgba(255, 119, 148, 0.08);
        }
        body {
          background:
            radial-gradient(80% 50% at 50% -10%, rgba(139, 92, 255, 0.12), transparent 70%),
            linear-gradient(180deg, var(--bg-grad-1) 0%, var(--bg-grad-2) 100%) !important;
          background-attachment: fixed !important;
          color: var(--text);
        }
        html, body, .tester, .tester * {
          font-family: var(--font-dm-sans), "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
        .tester pre, .tester code, .tester .mono, .gate-input, pre, code {
          font-family: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace !important;
        }
        .tester {
          font-feature-settings: "ss01" 1, "ss02" 1, "ss03" 1, "cv11" 1, "tnum" 1;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        .tester *::-webkit-scrollbar { width: 10px; height: 10px; }
        .tester *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 999px; transition: background .2s; }
        .tester *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        .tester *::-webkit-scrollbar-track { background: transparent; }
        ::selection { background: rgba(139,92,255,0.35); color: #fff; }

        .chip {
          background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0)) , var(--surface-2);
          color: var(--text-mute);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: transform .18s cubic-bezier(.2,.7,.3,1), background .15s, border-color .15s, color .15s, box-shadow .2s;
          font-family: inherit;
          white-space: nowrap;
          letter-spacing: -0.005em;
        }
        .chip:hover:not(:disabled) {
          border-color: var(--border-strong);
          color: var(--text);
          transform: translateY(-1px);
        }
        .chip[data-selected="true"] {
          background: linear-gradient(180deg, rgba(177,144,255,0.28), rgba(124,78,232,0.22));
          border-color: rgba(177,144,255,0.55);
          color: #fff;
          box-shadow: 0 0 0 1px rgba(139,92,255,0.18), 0 8px 22px -8px rgba(139,92,255,0.55), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .chip:disabled { opacity: .32; cursor: not-allowed; transform: none; }

        .row-option {
          text-align: left;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)) , var(--surface-2);
          color: var(--text-mute);
          border: 1px solid var(--border);
          border-radius: 13px;
          padding: 13px 16px;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          transition: transform .18s cubic-bezier(.2,.7,.3,1), background .15s, border-color .15s, color .15s, box-shadow .2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .row-option:hover { border-color: var(--border-strong); color: var(--text); transform: translateY(-1px); }
        .row-option[data-selected="true"] {
          background: linear-gradient(180deg, rgba(177,144,255,0.18), rgba(124,78,232,0.10));
          border-color: rgba(177,144,255,0.55);
          color: #fff;
          box-shadow: 0 0 0 1px rgba(139,92,255,0.18), 0 8px 22px -10px rgba(139,92,255,0.45);
        }

        .field-input {
          background: var(--surface-2);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 11px;
          padding: 11px 14px;
          font-size: 14px;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color .15s, box-shadow .2s, background .15s;
          outline: none;
          letter-spacing: -0.005em;
        }
        .field-input:hover { border-color: var(--border-strong); }
        .field-input:focus { border-color: rgba(177,144,255,0.55); box-shadow: 0 0 0 4px rgba(139,92,255,0.14); background: var(--surface-3); }
        .field-input::placeholder { color: var(--text-faint); }

        .btn-primary {
          background: linear-gradient(180deg, #a481ff 0%, #7546e6 100%);
          color: white;
          border: none;
          border-radius: 11px;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: -0.01em;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.18) inset,
            0 -1px 0 rgba(0,0,0,0.20) inset,
            0 8px 20px -6px rgba(124,78,232,0.55),
            0 0 0 1px rgba(139,92,255,0.30);
          transition: transform .14s cubic-bezier(.2,.7,.3,1), box-shadow .18s, filter .15s;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.06);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.22) inset,
            0 -1px 0 rgba(0,0,0,0.20) inset,
            0 14px 28px -8px rgba(124,78,232,0.60),
            0 0 0 1px rgba(139,92,255,0.40);
        }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

        .btn-ghost {
          background: var(--surface-2);
          color: var(--text);
          border: 1px solid var(--border-strong);
          border-radius: 11px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background .15s, border-color .15s, transform .15s;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .btn-ghost:hover { background: var(--surface-3); border-color: rgba(255,255,255,0.20); transform: translateY(-1px); }

        .label {
          font-size: 10.5px;
          color: var(--text-faint);
          text-transform: uppercase;
          letter-spacing: 0.10em;
          font-weight: 600;
        }

        .topbar-sticky {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: saturate(160%) blur(14px);
          -webkit-backdrop-filter: saturate(160%) blur(14px);
          background: linear-gradient(180deg, rgba(8,7,13,0.78) 0%, rgba(8,7,13,0.55) 100%);
          border-bottom: 1px solid var(--border);
        }

        .pane-card {
          position: relative;
        }
        .pane-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          pointer-events: none;
        }

        .bubble-card {
          position: relative;
          overflow: hidden;
        }
        .bubble-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 60% at 0% 0%, rgba(139,92,255,0.07), transparent 60%);
          pointer-events: none;
        }

        .model-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: var(--surface-2);
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'><path d='M3 4.75L6 7.75L9 4.75' stroke='%23a09cad' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 12px;
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 9px 34px 9px 12px;
          font-size: 13px;
          min-width: 280px;
          max-width: 360px;
          cursor: pointer;
          outline: none;
          transition: border-color .15s, box-shadow .2s, background-color .15s;
          letter-spacing: -0.005em;
        }
        .model-select:hover {
          border-color: var(--border-strong);
          background-color: var(--surface-3);
        }
        .model-select:focus {
          border-color: rgba(177,144,255,0.55);
          box-shadow: 0 0 0 4px rgba(139,92,255,0.14);
        }
        .model-select option {
          background: #16151f;
          color: #f3f1f7;
          padding: 8px;
        }
        .mp-trigger {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--surface-2);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 11px;
          padding: 8px 12px 8px 14px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          min-width: 320px;
          max-width: 420px;
          transition: border-color .15s, box-shadow .2s, background .15s;
        }
        .mp-trigger:hover { border-color: var(--border-strong); background: var(--surface-3); }
        .mp-trigger[data-open="true"] {
          border-color: rgba(177,144,255,0.55);
          box-shadow: 0 0 0 4px rgba(139,92,255,0.14);
        }
        .mp-trigger:disabled { opacity: .5; cursor: not-allowed; }

        .mp-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 9px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          color: var(--text);
          text-align: left;
          transition: background .12s;
        }
        .mp-row:hover, .mp-row[data-active="true"] { background: rgba(255,255,255,0.04); }
        .mp-row[data-selected="true"] {
          background: linear-gradient(180deg, rgba(177,144,255,0.18), rgba(124,78,232,0.10));
          box-shadow: inset 0 0 0 1px rgba(177,144,255,0.35);
        }

        .cost-pill {
          font-size: 11px;
          font-weight: 600;
          color: #7ee2a8;
          background: rgba(126,226,168,0.10);
          border: 1px solid rgba(126,226,168,0.28);
          padding: 4px 10px;
          border-radius: 999px;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          letter-spacing: -0.005em;
          font-variant-numeric: tabular-nums;
        }
        @keyframes pulseK {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        .kael-pulse { animation: pulseK 1.6s ease-in-out infinite; }

        @keyframes kaelTyping {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
        .typing-dot { animation: kaelTyping 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }

        .option-pill:hover:not(:disabled) {
          background: var(--surface-3) !important;
          border-color: rgba(139,92,255,0.45) !important;
          transform: translateY(-1px);
        }
        .option-pill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .space-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .space-dot {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.35);
          animation: spaceTwinkle ease-in-out infinite;
          will-change: opacity, transform;
        }
        @keyframes spaceTwinkle {
          0%, 100% { opacity: var(--o, 0.2); transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        .space-meteor {
          position: absolute;
          top: 0;
          height: 1.6px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,1) 100%);
          border-radius: 999px;
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.85)) drop-shadow(0 0 14px rgba(184,157,255,0.45));
          transform-origin: right center;
          opacity: 0;
          animation: meteorFall linear infinite;
          will-change: transform, opacity;
        }
        .space-meteor::after {
          content: "";
          position: absolute;
          right: -3px;
          top: 50%;
          width: 5px;
          height: 5px;
          margin-top: -2.5px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 10px #fff, 0 0 18px rgba(184,157,255,0.8);
        }
        @keyframes meteorFall {
          0%   { transform: translate(0, -90px) rotate(60deg); opacity: 0; }
          3%   { opacity: 1; }
          15%  { transform: translate(150px, 170px) rotate(60deg); opacity: 1; }
          18%  { opacity: 0; }
          100% { transform: translate(150px, 170px) rotate(60deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .space-dot, .space-meteor, .kael-pulse { animation: none !important; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeInUp .35s cubic-bezier(.2,.7,.3,1) both; }
      ` }} />

      <div className="tester" style={S.page}>
        {/* Top bar */}
        <header className="topbar-sticky" style={S.topbar}>
          <TopbarSpace />
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
            <KaelLogo height={28} />
            <div style={S.title}>Kael's Onboarding Act</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <div style={S.modelGroup}>
              <span className="label" style={{ marginRight: 2 }}>Model</span>
              <ModelPicker
                models={sortedModels}
                preferredIds={PREFERRED}
                value={model}
                onChange={setModel}
              />
            </div>
            <TempControl value={temperature} onChange={setTemperature} />
            <button
              onClick={signOut}
              title="Forget access token (this browser)"
              style={S.signOut}
            >
              sign out
            </button>
          </div>
        </header>

        <div style={S.body}>
        {modelsError && <div style={S.errBanner}>Models error: {modelsError}</div>}

        {/* Unified system prompt card with Read/Chat tab + cat peeking behind */}
        <div style={S.promptWrap}>
          <div style={S.catBehind} aria-hidden="true">
            <DotLottieReact
              src="/cat-noir.lottie"
              autoplay
              loop
              mode="bounce"
              style={{ width: 110, height: 110, display: "block" }}
            />
          </div>
          <section className="pane-card" style={{ ...S.promptCard, position: "relative", zIndex: 1 }}>
            <div style={S.promptHeader}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span
                  onClick={() => setPromptOpen((o) => !o)}
                  style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                >
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color: "var(--text-faint)",
                      transform: promptOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 160ms ease",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  <span className="label">System prompt</span>
                </span>
                <PaneToggle
                  value={editingPrompt}
                  onChange={(v) => {
                    setEditingPrompt(v);
                    if (!promptOpen) setPromptOpen(true);
                  }}
                />
                {(editingPrompt === "read" ? promptDirty : chatPromptDirty) && (
                  <span style={S.badge}>edited</span>
                )}
                <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                  {(editingPrompt === "read" ? systemPrompt : chatPrompt).length.toLocaleString()} chars
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {editingPrompt === "chat" && (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-mute)" }}
                  >
                    <span>Guard N</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      value={guardNDraft}
                      onChange={(e) => setGuardNDraft(e.target.value.replace(/[^\d]/g, ""))}
                      onBlur={() => {
                        const n = parseInt(guardNDraft, 10);
                        if (Number.isFinite(n)) {
                          const clamped = Math.max(1, Math.min(99, n));
                          setGuardN(clamped);
                          setGuardNDraft(String(clamped));
                        } else {
                          setGuardNDraft(String(guardN));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
                      }}
                      style={S.guardInput}
                      aria-label="End chat after N user replies if Kael doesn't close"
                    />
                  </span>
                )}
                {(editingPrompt === "read" ? promptDirty : chatPromptDirty) && (
                  <span
                    onClick={() => {
                      if (editingPrompt === "read") setSystemPrompt(defaultPrompt);
                      else setChatPrompt(defaultChatPrompt);
                    }}
                    style={S.linkBtn}
                  >
                    reset to file
                  </span>
                )}
              </span>
            </div>
            {promptOpen && (
              editingPrompt === "read" ? (
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={promptError ? `Failed to load prompt.md: ${promptError}` : "System prompt…"}
                  style={S.promptArea}
                  spellCheck={false}
                />
              ) : (
                <textarea
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder={chatPromptError ? `Failed to load prompt-chat.md: ${chatPromptError}` : "Chat system prompt…"}
                  style={S.promptArea}
                  spellCheck={false}
                />
              )
            )}
          </section>
        </div>

        {/* Split */}
        <div style={S.split}>
          {/* Input */}
          <section className="pane-card" style={S.pane}>
            <div style={S.paneHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={S.paneTitle}>Input</h2>
                <PaneToggle
                  value={chatMode ? "chat" : "read"}
                  onChange={(v) => setChatMode(v === "chat")}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={rollDice} className="btn-ghost">
                  <span style={S.diceWrap}>
                    <DotLottieReact
                      src="/dice-flip.lottie"
                      autoplay={false}
                      loop={false}
                      dotLottieRefCallback={(d) => {
                        diceRef.current = d;
                      }}
                      style={{ width: 32, height: 32, display: "block" }}
                    />
                  </span>
                  <span style={{ lineHeight: 1 }}>Randomize</span>
                </button>
                <button
                  onClick={runForCurrentMode}
                  disabled={!model || (chatMode ? chatSending : loading)}
                  className="btn-primary"
                >
                  {chatMode
                    ? chatSending
                      ? "Starting…"
                      : chatStarted
                        ? "Restart chat"
                        : "Start chat"
                    : loading
                      ? "Running…"
                      : "Run read"}
                </button>
              </div>
            </div>

            <div style={S.paneBody}>
              <Group title="Identity">
                <Field label="name">
                  <input
                    className="field-input"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="First name"
                  />
                </Field>
                <Field label="age">
                  <ChipRow>
                    {AGE_OPTIONS.map((o) => (
                      <Chip key={o.key} selected={form.age === o.key} onClick={() => update("age", o.key)}>
                        {o.label}
                      </Chip>
                    ))}
                  </ChipRow>
                </Field>
                <Field label="gender">
                  <ChipRow>
                    {GENDER_OPTIONS.map((o) => (
                      <Chip key={o.key} selected={form.gender === o.key} onClick={() => update("gender", o.key)}>
                        <span style={{ marginRight: 6 }}>{o.emoji}</span>
                        {o.label}
                      </Chip>
                    ))}
                  </ChipRow>
                </Field>
              </Group>

              <Group title="What's stuck">
                <Field label="stuck_area">
                  <ChipRow>
                    {STUCK_AREA_KEYS.map((k) => (
                      <Chip key={k} selected={form.stuck_area === k} onClick={() => changeStuckArea(k)}>
                        {STUCK_AREAS[k].label}
                      </Chip>
                    ))}
                  </ChipRow>
                </Field>
                <Field label={`specific_shape · ${stuckArea.labelLower}`}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {stuckArea.shapes.map((s) => (
                      <RowOption
                        key={s.text}
                        selected={form.specific_shape === s.text}
                        onClick={() => pickShape(s.text)}
                      >
                        <span style={{ fontSize: 18 }}>{s.emoji}</span>
                        <span>{s.text}</span>
                      </RowOption>
                    ))}
                    <textarea
                      placeholder="Or in your own words…"
                      value={form.custom_shape}
                      onChange={(e) => setCustomShape(e.target.value)}
                      className="field-input"
                      style={{ height: 60, marginTop: 4, resize: "vertical" }}
                    />
                  </div>
                </Field>
                <Field label="time_stuck">
                  <ChipRow>
                    {TIME_STUCK_OPTIONS.map((o) => (
                      <Chip key={o.key} selected={form.time_stuck === o.key} onClick={() => update("time_stuck", o.key)}>
                        <span style={{ marginRight: 6 }}>{o.emoji}</span>
                        {o.label}
                      </Chip>
                    ))}
                  </ChipRow>
                </Field>
              </Group>

              <Group title="Self-read">
                <Field
                  label="patterns"
                  hint={`max ${PATTERNS_MAX} chips · ${form.patterns.length} selected${
                    form.custom_patterns.trim()
                      ? ` · +${form.custom_patterns.split("\n").map((s) => s.trim()).filter(Boolean).length} custom`
                      : ""
                  }`}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <ChipRow>
                      {PATTERN_OPTIONS.map((p) => {
                        const selected = form.patterns.includes(p.key);
                        const disabled = !selected && form.patterns.length >= PATTERNS_MAX;
                        return (
                          <Chip
                            key={p.key}
                            selected={selected}
                            disabled={disabled}
                            onClick={() => togglePattern(p.key)}
                          >
                            {p.text}
                          </Chip>
                        );
                      })}
                    </ChipRow>
                    <textarea
                      placeholder="Or describe your own pattern… (one per line)"
                      value={form.custom_patterns}
                      onChange={(e) => update("custom_patterns", e.target.value)}
                      className="field-input"
                      style={{ height: 64, resize: "vertical" }}
                    />
                  </div>
                </Field>
                <Field label="tried" hint={`${form.tried.length} selected`}>
                  <ChipRow>
                    {TRIED_OPTIONS.map((t) => (
                      <Chip
                        key={t.key}
                        selected={form.tried.includes(t.key)}
                        onClick={() => toggleTried(t.key)}
                      >
                        {t.label}
                      </Chip>
                    ))}
                  </ChipRow>
                </Field>
              </Group>

              <div style={S.runFooter}>
                <button
                  onClick={runForCurrentMode}
                  disabled={!model || (chatMode ? chatSending : loading)}
                  className="btn-primary"
                  style={{ width: "100%", padding: "13px 22px", fontSize: 15 }}
                >
                  {chatMode
                    ? chatSending
                      ? "Starting…"
                      : chatStarted
                        ? "Restart chat"
                        : "Start chat"
                    : loading
                      ? "Running…"
                      : "Run read"}
                </button>
              </div>
            </div>
          </section>

          {/* Output */}
          <section className="pane-card" style={S.pane}>
            <div style={S.paneHeader}>
              <PaneToggle
                value={chatMode ? "chat" : "read"}
                onChange={(v) => setChatMode(v === "chat")}
              />
              <div style={S.metaPills}>
                {!chatMode && latencyMs != null && <span style={S.pill}>{latencyMs} ms</span>}
                {!chatMode && usage?.completion_tokens != null && (
                  <span style={S.pill}>
                    {Number(usage.completion_tokens).toLocaleString()} out tok
                  </span>
                )}
                {!chatMode && costInfo && costInfo.hasPricing && (
                  <span className="cost-pill" data-static="true">
                    {formatUsd(costInfo.total)}
                  </span>
                )}
                {chatMode && chatUsage && (
                  <span style={S.pill}>
                    {Number(chatUsage.completion_tokens).toLocaleString()} out tok
                  </span>
                )}
                {chatMode && chatCostInfo && chatCostInfo.hasPricing && (
                  <span className="cost-pill" data-static="true">
                    {formatUsd(chatCostInfo.total)}
                  </span>
                )}
                {chatMode && chatStarted && !chatLocked && !chatClosed && !guardTripped && (
                  <span style={S.pill}>{chatUserReplyCount}/{guardN}</span>
                )}
              </div>
            </div>

            {!chatMode && (
              <div style={S.paneBody}>
                {error && <div style={S.errBanner}>{error}</div>}

                {!error && !loading && !read && !rawContent && (
                  <div style={S.empty}>
                    <KaelLogo height={56} />
                    <div style={{ fontSize: 15, color: "var(--text-mute)" }}>
                      Three messages from Kael, one shot.
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>
                      Recognition · Hypothesis · The Work
                    </div>
                    <button
                      onClick={run}
                      disabled={loading || !model}
                      className="btn-primary"
                      style={{ marginTop: 8 }}
                    >
                      {loading ? "Running…" : "Run read"}
                    </button>
                  </div>
                )}

                {loading && (
                  <div style={S.empty}>
                    <div className="kael-pulse">
                      <KaelLogo height={56} />
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-mute)" }}>
                      Calling <span style={{ color: "var(--text)" }}>{model}</span>…
                    </div>
                  </div>
                )}

                {read && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Bubble idx={1} title="Recognition" body={read.recognition} />
                    <Bubble idx={2} title="Hypothesis" body={read.hypothesis} />
                    <Bubble idx={3} title="The Work" body={read.the_work} />
                    <Stats read={read} />
                    {costInfo && costInfo.hasPricing && (
                      <CostBreakdown info={costInfo} modelName={selectedModel?.name ?? model} />
                    )}
                  </div>
                )}

                {!read && rawContent && (
                  <div style={S.warn}>Response was not valid JSON. See raw output below.</div>
                )}

                {(rawInput || rawContent) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {rawInput && (
                      <Disclosure
                        open={rawInputOpen}
                        onToggle={() => setRawInputOpen((o) => !o)}
                        label="Raw input"
                        meta={`${rawInput.length.toLocaleString()} chars`}
                      >
                        <pre style={S.pre}>{rawInput}</pre>
                      </Disclosure>
                    )}
                    {rawContent && (
                      <Disclosure
                        open={rawOutputOpen}
                        onToggle={() => setRawOutputOpen((o) => !o)}
                        label="Raw output"
                        meta={`${rawContent.length.toLocaleString()} chars${
                          read ? " · parsed" : " · unparsed"
                        }`}
                      >
                        <pre style={S.pre}>{rawContent}</pre>
                      </Disclosure>
                    )}
                  </div>
                )}
              </div>
            )}

            {chatMode && (
              <div style={S.chatPaneBody}>
                {!chatStarted ? (
                  <div style={S.empty}>
                    <KaelLogo height={56} />
                    <div style={{ fontSize: 15, color: "var(--text-mute)" }}>
                      Kael will ask you a few questions to understand the picture.
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>
                      Form data is sent as context. Guard ends chat after {guardN} replies if Kael doesn't.
                    </div>
                    <button
                      onClick={startChat}
                      disabled={!model || chatSending}
                      className="btn-primary"
                      style={{ marginTop: 8 }}
                    >
                      {chatSending ? "Starting…" : "Start chat"}
                    </button>
                    {chatError && <div style={{ ...S.errBanner, marginTop: 12 }}>{chatError}</div>}
                  </div>
                ) : (
                  <>
                    <div style={S.chatScrollWrap}>
                    <div ref={chatScrollRef} style={S.chatScroll}>
                      <div style={S.chatList}>
                        {chatMessages.map((m, idx) => {
                          const isLastKael = m.role === "kael" && idx === chatMessages.length - 1;
                          return (
                            <div key={idx} style={S.chatMsgWrap}>
                              <ChatBubble side={m.role}>{m.content}</ChatBubble>
                              {isLastKael && m.options && m.options.length > 0 && !chatClosed && !guardTripped && !chatLocked && (
                                <div style={S.pillRow}>
                                  {m.options.map((opt, i) => (
                                    <button
                                      key={i}
                                      onClick={() => submitUserChat(opt)}
                                      disabled={chatInputLocked}
                                      style={S.optionPill}
                                      className="option-pill"
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {chatSending && (
                          <div style={S.chatMsgWrap}>
                            <div style={S.typing}>
                              <span className="typing-dot" style={S.typingDot} />
                              <span className="typing-dot" style={S.typingDot} />
                              <span className="typing-dot" style={S.typingDot} />
                            </div>
                          </div>
                        )}
                        {chatError && <div style={S.errBanner}>{chatError}</div>}

                        {(chatClosed || guardTripped || chatLocked) && chatMessages.length > 0 && (
                          <div style={S.chatBottomInfo}>
                            <ChatStats info={chatStatsInfo} guardN={guardN} />
                            {chatCostInfo && chatCostInfo.hasPricing && (
                              <CostBreakdown info={chatCostInfo} modelName={selectedModel?.name ?? model} />
                            )}
                            {(chatRawInput || chatRawOutputJson) && (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {chatRawInput && (
                                  <Disclosure
                                    open={chatRawInputOpen}
                                    onToggle={() => setChatRawInputOpen((o) => !o)}
                                    label="Raw input"
                                    meta={`${chatRawInput.length.toLocaleString()} chars`}
                                  >
                                    <pre style={S.pre}>{chatRawInput}</pre>
                                  </Disclosure>
                                )}
                                {chatRawOutputJson && (
                                  <Disclosure
                                    open={chatRawOutputOpen}
                                    onToggle={() => setChatRawOutputOpen((o) => !o)}
                                    label="Raw output"
                                    meta={`${chatRawOutputJson.length.toLocaleString()} chars · ${chatStatsInfo.turns} turn${chatStatsInfo.turns === 1 ? "" : "s"}`}
                                  >
                                    <pre style={S.pre}>{chatRawOutputJson}</pre>
                                  </Disclosure>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {!chatClosed && !guardTripped && !chatLocked && (
                      <div style={S.chatFloatControls}>
                        {!chatControlsHidden && (
                          <>
                            <button
                              onClick={restartChat}
                              className="btn-ghost"
                              style={S.chatControlBtn}
                              title="Discard this conversation and start fresh"
                            >
                              ↻ Restart
                            </button>
                            <button
                              onClick={() => endChatWithDump("stopped")}
                              className="btn-ghost"
                              style={{ ...S.chatControlBtn, ...S.chatStopBtn }}
                              title="End the chat now and save no further tokens"
                            >
                              ■ Stop chat
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setChatControlsHidden((h) => !h)}
                          className="btn-ghost"
                          style={{ ...S.chatControlBtn, ...S.chatControlToggleBtn }}
                          title={chatControlsHidden ? "Show controls" : "Hide controls"}
                          aria-label={chatControlsHidden ? "Show controls" : "Hide controls"}
                        >
                          {chatControlsHidden ? "⋯" : "✕"}
                        </button>
                      </div>
                    )}
                    </div>

                    <div style={S.chatFooter}>
                      {chatClosed && !chatLocked && (
                        <button
                          onClick={() => endChatWithDump("closed")}
                          className="btn-primary"
                          style={{ width: "100%" }}
                        >
                          {(lastKaelMsg?.cta && lastKaelMsg.cta.trim()) || "I'm ready"}
                        </button>
                      )}
                      {!chatClosed && guardTripped && !chatLocked && (
                        <button
                          onClick={() => endChatWithDump("guard")}
                          className="btn-primary"
                          style={{ width: "100%" }}
                        >
                          Let's continue in chat
                        </button>
                      )}
                      {chatLocked && (
                        <div style={S.lockedRow}>
                          <span style={{ fontSize: 13, color: "var(--text-mute)" }}>
                            Chat ended · transcript dumped to console
                          </span>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={restartChat} className="btn-ghost" style={{ padding: "8px 14px" }}>
                              Restart
                            </button>
                            <button onClick={resetChat} className="btn-ghost" style={{ padding: "8px 14px" }}>
                              New chat
                            </button>
                          </div>
                        </div>
                      )}
                      {!chatClosed && !guardTripped && !chatLocked && (
                        <div style={S.chatInputRow}>
                          <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submitUserChat(chatInput);
                              }
                            }}
                            placeholder={
                              chatSending
                                ? "Kael is thinking…"
                                : "Type your reply (or use Mac dictation: Edit › Start Dictation)"
                            }
                            rows={2}
                            disabled={chatInputLocked}
                            style={S.chatInput}
                            spellCheck={true}
                          />
                          <button
                            onClick={() => submitUserChat(chatInput)}
                            disabled={chatInputLocked || !chatInput.trim()}
                            className="btn-primary"
                            style={{ alignSelf: "stretch" }}
                          >
                            Send
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
        </div>
      </div>
    </>
  );
}

function ModelPicker({
  models,
  preferredIds,
  value,
  onChange,
}: {
  models: Model[];
  preferredIds: string[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const selected = models.find((m) => m.id === value) ?? null;

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? models.filter(
          (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
        )
      : models;
    if (!q) {
      const preferred = preferredIds
        .map((p) => list.find((m) => m.id === p))
        .filter((m): m is Model => !!m);
      const rest = list.filter((m) => !preferredIds.includes(m.id));
      return { preferred, rest };
    }
    return { preferred: [] as Model[], rest: list };
  }, [models, query, preferredIds]);

  const flat = useMemo(() => [...filtered.preferred, ...filtered.rest], [filtered]);

  useEffect(() => {
    if (open) {
      const idx = flat.findIndex((m) => m.id === value);
      setActiveIdx(idx >= 0 ? idx : -1);
    } else {
      setActiveIdx(-1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  useEffect(() => {
    setActiveIdx(query ? 0 : -1);
  }, [query]);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[activeIdx]) pick(flat[activeIdx].id);
    }
  }

  return (
    <div ref={wrapperRef} style={S.mpWrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mp-trigger"
        data-open={open}
        disabled={!models.length}
      >
        <span style={S.mpTriggerName}>{selected?.name ?? (models.length ? "Select model" : "Loading…")}</span>
        {selected?.pricing && (
          <span style={S.mpTriggerPrice}>
            {priceShort(selected.pricing.prompt)} / {priceShort(selected.pricing.completion)}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 4.75L6 7.75L9 4.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      </button>

      {open && (
        <div style={S.mpPopover} className="fade-in">
          <div style={S.mpSearchRow}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.6 }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Search models…"
              style={S.mpSearch}
              spellCheck={false}
              autoComplete="off"
            />
            {query && (
              <button onClick={() => setQuery("")} style={S.mpClear} title="Clear">
                ×
              </button>
            )}
          </div>
          <div ref={listRef} style={S.mpList}>
            {filtered.preferred.length > 0 && (
              <div style={S.mpSection}>Preferred</div>
            )}
            {filtered.preferred.map((m, i) => (
              <ModelRow
                key={m.id}
                model={m}
                selected={m.id === value}
                active={i === activeIdx}
                onPick={() => pick(m.id)}
              />
            ))}
            {filtered.preferred.length > 0 && filtered.rest.length > 0 && (
              <div style={S.mpSection}>All models · {filtered.rest.length}</div>
            )}
            {filtered.rest.map((m, i) => (
              <ModelRow
                key={m.id}
                model={m}
                selected={m.id === value}
                active={i + filtered.preferred.length === activeIdx}
                onPick={() => pick(m.id)}
              />
            ))}
            {flat.length === 0 && (
              <div style={S.mpEmpty}>No models match "{query}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelRow({
  model,
  selected,
  active,
  onPick,
}: {
  model: Model;
  selected: boolean;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onPick();
      }}
      className="mp-row"
      data-selected={selected}
      data-active={active}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
        <span style={S.mpRowName}>{model.name}</span>
        <span style={S.mpRowId}>{model.id}</span>
      </div>
      <div style={S.mpRowPriceCol}>
        <span style={S.mpRowPriceLabel}>in</span>
        <span style={S.mpRowPrice}>{priceShort(model.pricing?.prompt)}</span>
        <span style={{ ...S.mpRowPriceLabel, marginLeft: 8 }}>out</span>
        <span style={S.mpRowPrice}>{priceShort(model.pricing?.completion)}</span>
      </div>
    </button>
  );
}

function priceShort(perTokenStr: string | null | undefined) {
  if (!perTokenStr) return "—";
  const v = Number(perTokenStr);
  if (!isFinite(v) || v === 0) return "free";
  const perM = v * 1_000_000;
  if (perM < 0.1) return `$${perM.toFixed(3)}`;
  if (perM < 10) return `$${perM.toFixed(2)}`;
  return `$${perM.toFixed(1)}`;
}

function TempControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const display = value.toFixed(2);
  const accent =
    value <= 0.3 ? "#7ee2a8" : value >= 1.3 ? "#ffd58a" : "var(--accent)";
  return (
    <div style={S.tempGroup}>
      <span className="label" style={{ marginRight: 2 }}>Temp</span>
      <input
        type="range"
        min={TEMP_MIN}
        max={TEMP_MAX}
        step={TEMP_STEP}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onDoubleClick={() => onChange(TEMP_DEFAULT)}
        title={`Temperature ${display} · double-click to reset to ${TEMP_DEFAULT}`}
        style={{ ...S.tempSlider, accentColor: accent } as React.CSSProperties}
        aria-label="Sampling temperature"
      />
      <span style={{ ...S.tempValue, color: accent }}>{display}</span>
    </div>
  );
}

function PaneToggle({
  value,
  onChange,
}: {
  value: "read" | "chat";
  onChange: (v: "read" | "chat") => void;
}) {
  return (
    <div style={S.paneToggle} role="tablist">
      <button
        role="tab"
        aria-selected={value === "read"}
        onClick={() => onChange("read")}
        style={value === "read" ? { ...S.paneToggleBtn, ...S.paneToggleBtnActive } : S.paneToggleBtn}
      >
        The Read
      </button>
      <button
        role="tab"
        aria-selected={value === "chat"}
        onClick={() => onChange("chat")}
        style={value === "chat" ? { ...S.paneToggleBtn, ...S.paneToggleBtnActive } : S.paneToggleBtn}
      >
        The chat
      </button>
    </div>
  );
}

function Disclosure({
  open,
  onToggle,
  label,
  meta,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={S.disclosure}>
      <button onClick={onToggle} style={S.disclosureHeader}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={S.caret}>{open ? "▾" : "▸"}</span>
          <span className="label">{label}</span>
          {meta && (
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{meta}</span>
          )}
        </span>
        {open && (
          <span
            onClick={async (e) => {
              e.stopPropagation();
              const text = (e.currentTarget.parentElement?.parentElement?.querySelector("pre")
                ?.textContent ?? "").trim();
              try {
                await navigator.clipboard.writeText(text);
              } catch {}
            }}
            style={S.linkBtn}
          >
            copy
          </span>
        )}
      </button>
      {open && <div style={S.disclosureBody}>{children}</div>}
    </div>
  );
}

const SPACE_DOTS = [
  { left: "3%",  top: "22%", size: 1.5, delay: "0.0s", duration: "3.2s", opacity: 0.85 },
  { left: "7%",  top: "70%", size: 2,   delay: "1.4s", duration: "2.6s", opacity: 0.95 },
  { left: "11%", top: "40%", size: 1,   delay: "0.6s", duration: "3.6s", opacity: 0.65 },
  { left: "15%", top: "12%", size: 1.5, delay: "2.1s", duration: "3.0s", opacity: 0.75 },
  { left: "19%", top: "88%", size: 1,   delay: "0.9s", duration: "4.2s", opacity: 0.6 },
  { left: "23%", top: "52%", size: 2,   delay: "1.7s", duration: "2.8s", opacity: 1 },
  { left: "27%", top: "18%", size: 1,   delay: "0.3s", duration: "3.4s", opacity: 0.7 },
  { left: "31%", top: "78%", size: 1.5, delay: "2.4s", duration: "2.4s", opacity: 0.85 },
  { left: "35%", top: "30%", size: 1,   delay: "1.1s", duration: "3.8s", opacity: 0.65 },
  { left: "39%", top: "60%", size: 2,   delay: "0.5s", duration: "3.0s", opacity: 0.95 },
  { left: "43%", top: "8%",  size: 1,   delay: "1.9s", duration: "2.6s", opacity: 0.7 },
  { left: "47%", top: "85%", size: 1.5, delay: "0.8s", duration: "3.6s", opacity: 0.8 },
  { left: "51%", top: "45%", size: 2,   delay: "2.2s", duration: "2.8s", opacity: 1 },
  { left: "55%", top: "20%", size: 1,   delay: "1.3s", duration: "3.4s", opacity: 0.7 },
  { left: "59%", top: "72%", size: 1.5, delay: "0.4s", duration: "3.0s", opacity: 0.85 },
  { left: "63%", top: "35%", size: 1,   delay: "1.6s", duration: "4.0s", opacity: 0.65 },
  { left: "67%", top: "10%", size: 2,   delay: "2.5s", duration: "2.6s", opacity: 0.95 },
  { left: "71%", top: "62%", size: 1,   delay: "0.7s", duration: "3.2s", opacity: 0.7 },
  { left: "75%", top: "82%", size: 1.5, delay: "1.8s", duration: "2.8s", opacity: 0.8 },
  { left: "79%", top: "25%", size: 1,   delay: "0.2s", duration: "3.6s", opacity: 0.65 },
  { left: "83%", top: "55%", size: 2,   delay: "2.0s", duration: "3.0s", opacity: 1 },
  { left: "87%", top: "15%", size: 1.5, delay: "1.0s", duration: "2.6s", opacity: 0.85 },
  { left: "91%", top: "78%", size: 1,   delay: "2.3s", duration: "3.4s", opacity: 0.7 },
  { left: "95%", top: "42%", size: 1.5, delay: "0.6s", duration: "3.0s", opacity: 0.85 },
  { left: "98%", top: "68%", size: 1,   delay: "1.5s", duration: "3.8s", opacity: 0.65 },
];

const METEORS = [
  { left: "22%", delay: "0s",   duration: "9s", length: 70 },
  { left: "58%", delay: "3.2s", duration: "9s", length: 80 },
  { left: "84%", delay: "6.4s", duration: "9s", length: 60 },
];

function TopbarSpace() {
  return (
    <div className="space-bg" aria-hidden="true">
      {SPACE_DOTS.map((d, i) => (
        <span
          key={`d${i}`}
          className="space-dot"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      {METEORS.map((m, i) => (
        <span
          key={`m${i}`}
          className="space-meteor"
          style={{
            left: m.left,
            width: m.length,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </div>
  );
}

function KaelLogo({ height = 24 }: { height?: number }) {
  const width = Math.round((height * 33) / 21);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 33 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M21.874 1.17773C26.8484 1.17784 30.8816 5.21282 30.8818 10.1914C30.8818 15.1702 26.8485 19.206 21.874 19.2061C16.8994 19.2061 12.8652 15.1703 12.8652 10.1914C12.8655 5.21276 16.8996 1.17773 21.874 1.17773Z"
        stroke="#8B5CFF"
        strokeWidth="2.35585"
      />
      <path
        d="M10.1865 1.17773C15.1609 1.17784 19.1941 5.21282 19.1943 10.1914C19.1943 15.1702 15.161 19.206 10.1865 19.2061C5.21192 19.2061 1.17773 15.1703 1.17773 10.1914C1.17798 5.21276 5.21207 1.17773 10.1865 1.17773Z"
        stroke="#EEEAE5"
        strokeWidth="2.35585"
      />
    </svg>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={S.group}>
      <div style={S.groupTitle}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="label">{label}</span>
        {hint && <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{children}</div>;
}

function Chip({
  selected,
  disabled,
  onClick,
  children,
}: {
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="chip" data-selected={!!selected}>
      {children}
    </button>
  );
}

function RowOption({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="row-option" data-selected={!!selected}>
      {children}
    </button>
  );
}

function Bubble({ idx, title, body }: { idx: number; title: string; body: string }) {
  return (
    <div className="bubble-card fade-in" style={S.bubble}>
      <div style={S.bubbleHeader}>
        <div style={S.bubbleAvatarWrap}>
          <KaelLogo height={16} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={S.bubbleName}>Kael</span>
          <span style={S.bubbleStep}>· {idx} of 3 · {title}</span>
        </div>
      </div>
      <div style={S.bubbleBody}>{body}</div>
    </div>
  );
}

function Stats({ read }: { read: ReadResult }) {
  const total = wc(read.recognition) + wc(read.hypothesis) + wc(read.the_work);
  const inRange = total >= 130 && total <= 200;
  return (
    <div style={S.statsRow}>
      <Stat label="recognition" value={`${wc(read.recognition)}w`} />
      <Stat label="hypothesis" value={`${wc(read.hypothesis)}w`} />
      <Stat label="the work" value={`${wc(read.the_work)}w`} />
      <Stat label="total" value={`${total}w`} accent={inRange ? "good" : "warn"} />
    </div>
  );
}

function ChatStats({
  info,
  guardN,
}: {
  info: { kaelMsgs: number; userMsgs: number; words: number; turns: number };
  guardN: number;
}) {
  const guardAccent: "good" | "warn" | undefined =
    info.userMsgs >= guardN ? "warn" : info.userMsgs >= Math.max(1, guardN - 1) ? "good" : undefined;
  return (
    <div style={S.statsRow}>
      <Stat label="kael" value={`${info.kaelMsgs}`} />
      <Stat label="you" value={`${info.userMsgs}/${guardN}`} accent={guardAccent} />
      <Stat label="turns" value={`${info.turns}`} />
      <Stat label="words" value={`${info.words}w`} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "good" | "warn" }) {
  const color = accent === "good" ? "#7ee2a8" : accent === "warn" ? "#ffd58a" : "var(--text-mute)";
  return (
    <div style={S.stat}>
      <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.08 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function wc(s: string) {
  return (s.trim().match(/\S+/g) ?? []).length;
}

function formatUsd(v: number) {
  if (!isFinite(v) || v === 0) return "$0";
  if (v < 0.0001) return `$${v.toExponential(2)}`;
  if (v < 0.01) return `$${v.toFixed(5)}`;
  if (v < 1) return `$${v.toFixed(4)}`;
  return `$${v.toFixed(3)}`;
}

function formatPerMillion(pricePerToken: number) {
  if (!pricePerToken) return "—";
  const perM = pricePerToken * 1_000_000;
  if (perM < 0.01) return `$${perM.toFixed(4)}/M`;
  if (perM < 1) return `$${perM.toFixed(3)}/M`;
  return `$${perM.toFixed(2)}/M`;
}

function CostBreakdown({
  info,
  modelName,
}: {
  info: NonNullable<ReturnType<typeof Object>>;
  modelName: string;
}) {
  const i = info as {
    promptTok: number;
    completionTok: number;
    promptPricePerTok: number;
    completionPricePerTok: number;
    inputCost: number;
    outputCost: number;
    total: number;
    reportedTotal: number | null;
  };
  return (
    <div className="fade-in" style={S.costCard}>
      <div style={S.costHeader}>
        <span className="label">Cost breakdown</span>
        <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{modelName}</span>
      </div>
      <div style={S.costGrid}>
        <CostRow
          label="Input"
          tokens={i.promptTok}
          rate={i.promptPricePerTok}
          cost={i.inputCost}
        />
        <CostRow
          label="Output"
          tokens={i.completionTok}
          rate={i.completionPricePerTok}
          cost={i.outputCost}
        />
        <div style={S.costDivider} />
        <CostRow
          label="Total"
          tokens={i.promptTok + i.completionTok}
          cost={i.total}
          isTotal
        />
        {i.reportedTotal != null && Math.abs(i.reportedTotal - (i.inputCost + i.outputCost)) > 1e-7 && (
          <div style={S.costNote}>
            Reported by OpenRouter: {formatUsd(i.reportedTotal)} · computed from per-token rates may differ slightly.
          </div>
        )}
      </div>
    </div>
  );
}

function CostRow({
  label,
  tokens,
  rate,
  cost,
  isTotal,
}: {
  label: string;
  tokens: number;
  rate?: number;
  cost: number;
  isTotal?: boolean;
}) {
  return (
    <div style={{ ...S.costRow, ...(isTotal ? S.costRowTotal : null) }}>
      <span style={S.costRowLabel}>{label}</span>
      <span style={S.costRowMeta}>
        {isTotal ? null : (
          <>
            {tokens.toLocaleString()} tok
            {rate != null && rate > 0 && (
              <span style={{ color: "var(--text-faint)" }}> · {formatPerMillion(rate)}</span>
            )}
          </>
        )}
      </span>
      <span style={isTotal ? S.costRowAmountTotal : S.costRowAmount}>{formatUsd(cost)}</span>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    height: "100vh",
    color: "var(--text)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    position: "sticky",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    padding: "12px clamp(16px, 3vw, 28px)",
    marginBottom: 0,
  },
  promptWrap: {
    position: "relative",
  },
  catBehind: {
    position: "absolute",
    left: "50%",
    top: -132,
    transform: "translateX(-50%)",
    width: 110,
    height: 110,
    zIndex: 25,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  title: { fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 },
  subtitle: { fontSize: 12.5, color: "var(--text-mute)", marginTop: 2 },
  modelGroup: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingLeft: 4,
    position: "relative",
  },
  tempGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    position: "relative",
  },
  tempSlider: {
    width: 110,
    height: 4,
    cursor: "pointer",
    accentColor: "var(--accent)",
  },
  tempValue: {
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    minWidth: 32,
    textAlign: "right",
    letterSpacing: 0.02,
  },
  mpWrap: { position: "relative" },
  mpTriggerName: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
    fontWeight: 500,
  },
  mpTriggerPrice: {
    fontSize: 11,
    color: "var(--text-faint)",
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  mpPopover: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: 480,
    maxWidth: "92vw",
    background: "var(--surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: 14,
    boxShadow: "0 28px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset",
    overflow: "hidden",
    zIndex: 50,
  },
  mpSearchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
  },
  mpSearch: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    letterSpacing: "-0.005em",
  },
  mpClear: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    padding: 2,
  },
  mpList: {
    maxHeight: 360,
    overflow: "auto",
    padding: 6,
  },
  mpSection: {
    fontSize: 10,
    color: "var(--text-faint)",
    textTransform: "uppercase",
    letterSpacing: 0.1,
    fontWeight: 600,
    padding: "10px 12px 6px",
  },
  mpRowName: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "var(--text)",
    letterSpacing: "-0.005em",
  },
  mpRowId: {
    fontSize: 11,
    color: "var(--text-faint)",
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
  },
  mpRowPriceCol: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 4,
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  mpRowPriceLabel: { fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.05 },
  mpRowPrice: { fontSize: 12.5, color: "var(--text)", fontWeight: 500 },
  mpEmpty: {
    padding: "20px 14px",
    fontSize: 13,
    color: "var(--text-faint)",
    textAlign: "center",
  },
  body: {
    padding: "20px clamp(16px, 3vw, 28px) 20px",
    maxWidth: 1640,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "visible",
  },
  promptCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset",
  },
  promptHeader: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "var(--text)",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  caret: { fontSize: 11, color: "var(--text-faint)", width: 12, display: "inline-block" },
  badge: {
    fontSize: 10,
    background: "var(--accent-soft-2)",
    color: "var(--accent)",
    border: "1px solid rgba(139,92,255,0.45)",
    padding: "2px 8px",
    borderRadius: 999,
    textTransform: "uppercase",
    letterSpacing: 0.08,
    fontWeight: 600,
  },
  linkBtn: { fontSize: 12, color: "var(--accent)", cursor: "pointer", fontWeight: 500 },
  promptArea: {
    width: "100%",
    height: 280,
    background: "#0a0911",
    color: "var(--text)",
    border: "none",
    borderTop: "1px solid var(--border)",
    padding: "16px 18px",
    fontSize: 12.5,
    lineHeight: 1.6,
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },
  split: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 16,
    flex: 1,
    minHeight: 0,
  },
  pane: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 18,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
    boxShadow: "0 20px 60px -28px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset",
  },
  paneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
  },
  paneEyebrow: {
    fontSize: 10,
    color: "var(--text-faint)",
    textTransform: "uppercase",
    letterSpacing: 0.12,
    fontWeight: 600,
    marginBottom: 4,
  },
  paneTitle: { fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" },
  paneBody: {
    padding: "18px 20px",
    overflow: "auto",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  group: { display: "flex", flexDirection: "column", gap: 16 },
  groupTitle: {
    fontSize: 11.5,
    fontWeight: 600,
    color: "var(--text)",
    textTransform: "uppercase",
    letterSpacing: 0.12,
    paddingBottom: 10,
    borderBottom: "1px solid var(--border)",
  },
  metaPills: { display: "flex", gap: 6, alignItems: "center" },
  pill: {
    fontSize: 11,
    color: "var(--text-mute)",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 500,
  },
  paneToggle: {
    display: "inline-flex",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  paneToggleBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-mute)",
    fontSize: 13,
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: 9,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background .15s, color .15s",
  },
  paneToggleBtnActive: {
    background: "var(--accent-soft-2)",
    color: "var(--text)",
    boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
  },
  guardInput: {
    width: 56,
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "4px 8px",
    fontSize: 12,
    fontFamily: "inherit",
    outline: "none",
  },
  chatPaneBody: {
    padding: 0,
    overflow: "hidden",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  chatScrollWrap: {
    position: "relative",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  chatScroll: {
    flex: 1,
    overflow: "auto",
    padding: "18px 20px",
    minHeight: 0,
  },
  chatFloatControls: {
    position: "absolute",
    right: 14,
    bottom: 12,
    display: "flex",
    gap: 8,
    pointerEvents: "auto",
    zIndex: 5,
  },
  chatList: { display: "flex", flexDirection: "column", gap: 12 },
  chatBottomInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px dashed var(--border)",
  },
  chatMsgWrap: { display: "flex", flexDirection: "column", gap: 8 },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 2 },
  optionPill: {
    fontSize: 13,
    color: "var(--text)",
    background: "var(--surface-2)",
    border: "1px solid var(--border-strong)",
    padding: "7px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    transition: "background .15s, border-color .15s, transform .1s",
  },
  chatFooter: {
    borderTop: "1px solid var(--border)",
    padding: "12px 16px",
    background: "var(--surface)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  chatInputRow: {
    display: "flex",
    gap: 8,
    alignItems: "stretch",
  },
  chatControlBtn: {
    fontSize: 12,
    padding: "6px 12px",
    color: "var(--text-mute)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 6px 20px -8px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04) inset",
  },
  chatStopBtn: {
    color: "var(--danger)",
    borderColor: "rgba(255,119,148,0.25)",
  },
  chatControlToggleBtn: {
    padding: "6px 10px",
    minWidth: 32,
    fontSize: 14,
    lineHeight: 1,
  },
  chatInput: {
    flex: 1,
    background: "#0a0911",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
  },
  lockedRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 6px",
    gap: 12,
  },
  typing: {
    display: "inline-flex",
    gap: 4,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    width: "fit-content",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "var(--text-mute)",
  },
  errBanner: {
    background: "var(--danger-bg)",
    color: "var(--danger)",
    border: "1px solid rgba(255,119,148,0.25)",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  warn: {
    background: "rgba(255,213,138,0.08)",
    color: "#ffd58a",
    border: "1px solid rgba(255,213,138,0.25)",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 320,
    textAlign: "center",
    gap: 16,
  },
  bubble: {
    background: "linear-gradient(180deg, var(--surface-3) 0%, var(--surface) 100%)",
    border: "1px solid var(--border-strong)",
    borderRadius: 18,
    padding: "16px 20px 20px",
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 40px -22px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,255,0.04)",
  },
  bubbleHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  bubbleAvatarWrap: {
    width: 36,
    height: 28,
    borderRadius: 9,
    background: "rgba(139,92,255,0.10)",
    border: "1px solid rgba(139,92,255,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleName: { fontSize: 13.5, fontWeight: 600, color: "var(--text)" },
  bubbleStep: { fontSize: 12, color: "var(--text-faint)", fontWeight: 500 },
  bubbleBody: {
    whiteSpace: "pre-wrap",
    fontSize: 15.5,
    lineHeight: 1.62,
    color: "var(--text)",
    letterSpacing: "-0.005em",
    position: "relative",
    zIndex: 1,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginTop: 4,
    padding: "14px 16px",
    background: "linear-gradient(180deg, var(--surface-3), var(--surface-2))",
    border: "1px solid var(--border)",
    borderRadius: 14,
    boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset",
  },
  stat: { textAlign: "center" },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    background: "#0a0911",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
    fontSize: 12.5,
    lineHeight: 1.6,
    color: "var(--text-mute)",
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    maxHeight: 360,
    overflow: "auto",
    margin: 0,
  },
  costCard: {
    background: "linear-gradient(180deg, var(--surface-3), var(--surface-2))",
    border: "1px solid rgba(126,226,168,0.20)",
    borderRadius: 14,
    padding: "14px 16px",
    boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset",
  },
  costHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  costGrid: { display: "flex", flexDirection: "column", gap: 8 },
  costRow: {
    display: "grid",
    gridTemplateColumns: "70px 1fr auto",
    alignItems: "baseline",
    gap: 12,
    fontSize: 13,
  },
  costRowTotal: { paddingTop: 8 },
  costRowLabel: { color: "var(--text-mute)", fontSize: 12, fontWeight: 500 },
  costRowMeta: { color: "var(--text)", fontSize: 12, fontVariantNumeric: "tabular-nums" },
  costRowAmount: { color: "var(--text)", fontWeight: 600, fontVariantNumeric: "tabular-nums" },
  costRowAmountTotal: {
    color: "#7ee2a8",
    fontWeight: 700,
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
  },
  costDivider: { height: 1, background: "var(--border)", margin: "2px 0" },
  costNote: {
    marginTop: 6,
    fontSize: 11,
    color: "var(--text-faint)",
    paddingTop: 8,
    borderTop: "1px dashed var(--border)",
  },
  disclosure: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
  },
  disclosureHeader: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "var(--text)",
    padding: "10px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  disclosureBody: {
    borderTop: "1px solid var(--border)",
    padding: 12,
  },
  runFooter: {
    marginTop: 12,
    paddingTop: 16,
    borderTop: "1px solid var(--border)",
    display: "flex",
  },
  diceWrap: {
    width: 32,
    height: 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: -4,
    marginTop: -15,
    marginBottom: -3,
    marginRight:-3,
  },
  signOut: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 12,
    cursor: "pointer",
    padding: "8px 4px",
    fontFamily: "inherit",
    textDecoration: "underline",
  },
};

const GATE_CSS = `
  body {
    background:
      radial-gradient(80% 50% at 50% -10%, rgba(139, 92, 255, 0.12), transparent 70%),
      linear-gradient(180deg, #0e0a1c 0%, #07060c 100%) !important;
    background-attachment: fixed !important;
    color: #f3f1f7;
  }
  .gate-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: var(--font-dm-sans), -apple-system, BlinkMacSystemFont, sans-serif;
  }
  .gate-card {
    width: 100%;
    max-width: 380px;
    background: #11101a;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 18px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    box-shadow: 0 20px 60px -20px rgba(0,0,0,0.6);
  }
  .gate-logo { padding: 6px 0 4px; }
  .gate-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #f3f1f7;
    letter-spacing: -0.01em;
  }
  .gate-sub {
    font-size: 13px;
    color: #a09cad;
    margin: 0 0 6px;
    text-align: center;
  }
  .gate-input {
    width: 100%;
    background: #16151f;
    color: #f3f1f7;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    letter-spacing: 0.02em;
  }
  .gate-input:focus {
    border-color: rgba(139,92,255,0.5);
    box-shadow: 0 0 0 3px rgba(139,92,255,0.14);
  }
  .gate-input::placeholder { color: #6c6878; }
  .gate-error {
    width: 100%;
    background: rgba(255,119,148,0.08);
    color: #ff7794;
    border: 1px solid rgba(255,119,148,0.25);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 12.5px;
    text-align: center;
  }
  .gate-btn {
    width: 100%;
    background: linear-gradient(180deg, #9d6dff 0%, #7c4ee8 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 11px 22px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: -0.01em;
    box-shadow: 0 6px 18px -6px rgba(139,92,255,0.6), inset 0 1px 0 rgba(255,255,255,0.18);
    transition: transform .12s, box-shadow .12s;
  }
  .gate-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px -6px rgba(139,92,255,0.7), inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .gate-btn:disabled { opacity: .5; cursor: not-allowed; }
`;
