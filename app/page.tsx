"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import ReactMarkdown from "react-markdown";

type Model = {
  id: string;
  name: string;
  pricing: { prompt: string | null; completion: string | null } | null;
};

const PREFERRED = [
  "anthropic/claude-opus-4.7",
  "anthropic/claude-sonnet-4.5",
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o",
  "openai/gpt-4.1",
  "google/gemini-2.5-pro",
];

const TOKEN_KEY = "kael_tester_token";
const TEMP_KEY = "kael_tester_temperature";
const TEMP_DEFAULT = 0.8;
const TEMP_MIN = 0;
const TEMP_MAX = 2;
const TEMP_STEP = 0.05;

export default function TestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenChecking, setTokenChecking] = useState(false);

  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState<string>("anthropic/claude-3.5-sonnet");
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [defaultPrompt, setDefaultPrompt] = useState<string>("");
  const [promptOpen, setPromptOpen] = useState<boolean>(false);
  const [promptError, setPromptError] = useState<string | null>(null);

  const [temperature, setTemperature] = useState<number>(TEMP_DEFAULT);

  const [taskPrompt, setTaskPrompt] = useState<string>("");
  const [documentText, setDocumentText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawInput, setRawInput] = useState<string>("");
  const [rawContent, setRawContent] = useState<string>("");
  const [usage, setUsage] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [rawInputOpen, setRawInputOpen] = useState<boolean>(false);
  const [rawOutputOpen, setRawOutputOpen] = useState<boolean>(false);

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
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(TEMP_KEY);
    if (stored != null) {
      const t = parseFloat(stored);
      if (Number.isFinite(t) && t >= TEMP_MIN && t <= TEMP_MAX) {
        setTemperature(t);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TEMP_KEY, String(temperature));
  }, [temperature]);

  async function submitToken(e: React.FormEvent) {
    e.preventDefault();
    const value = tokenInput.replace(/\s+/g, "");
    if (!value) return;

    setTokenChecking(true);
    setTokenError(null);

    try {
      const res = await fetch("/api/models", {
        headers: { "x-access-token": value },
      });

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
    setTaskPrompt("");
    setDocumentText("");
    setOutputText("");
    setRawInput("");
    setRawContent("");
    setUsage(null);
    setError(null);
    setLatencyMs(null);
  }

  const sortedModels = useMemo(() => {
    const preferredFirst = PREFERRED.filter((p) =>
      models.find((m) => m.id === p),
    ).map((p) => models.find((m) => m.id === p)!);
    const rest = models.filter((m) => !PREFERRED.includes(m.id));
    return [...preferredFirst, ...rest];
  }, [models]);

  const selectedModel = useMemo(
    () => models.find((m) => m.id === model) ?? null,
    [models, model],
  );

  const promptDirty =
    systemPrompt !== defaultPrompt && defaultPrompt.length > 0;

  const costInfo = useMemo(() => {
    if (!usage) return null;
    const promptTok = Number(usage.prompt_tokens ?? 0);
    const completionTok = Number(usage.completion_tokens ?? 0);
    const promptPricePerTok = Number(selectedModel?.pricing?.prompt ?? 0);
    const completionPricePerTok = Number(
      selectedModel?.pricing?.completion ?? 0,
    );
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
      hasPricing:
        promptPricePerTok > 0 ||
        completionPricePerTok > 0 ||
        reportedTotal != null,
    };
  }, [usage, selectedModel]);

  async function run() {
    setLoading(true);
    setError(null);
    setRawInput("");
    setRawContent("");
    setOutputText("");
    setUsage(null);
    setLatencyMs(null);

    const payload = {
      model,
      systemPrompt,
      taskPrompt,
      documentText,
      temperature,
    };

    const inputJson = JSON.stringify(payload, null, 2);
    setRawInput(inputJson);

    const t0 = performance.now();

    try {
      const res = await fetch("/api/the-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token ?? "",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLatencyMs(Math.round(performance.now() - t0));

      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        if (data.raw) setRawContent(data.raw);
        return;
      }

      setRawContent(data.content ?? "");
      setOutputText(
        typeof data.output === "string"
          ? data.output
          : typeof data.content === "string"
            ? data.content
            : "",
      );
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
            <h1 className="gate-title">Kael Conversation Lab</h1>
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
            <button
              type="submit"
              disabled={tokenChecking || !tokenInput.trim()}
              className="gate-btn"
            >
              {tokenChecking ? "Checking…" : "Unlock"}
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
        .tester pre, .tester code, .tester .mono, .gate-input, pre, code, textarea {
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
        }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }

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

        /* ── Read card styling ── */
        .read-card-wrap {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .read-card {
          background: linear-gradient(180deg, var(--surface-3) 0%, var(--surface) 100%);
          border: 1px solid var(--border-strong);
          border-radius: 20px;
          padding: 28px 32px 24px;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.04) inset,
            0 20px 50px -20px rgba(0,0,0,0.55);
        }
        .read-hook {
          font-size: 15px;
          font-style: italic;
          color: rgba(255,255,255,0.50);
          line-height: 1.7;
          margin-bottom: 24px;
          padding-left: 16px;
          border-left: 2px solid rgba(139,92,255,0.35);
        }
        .read-header {
          margin-bottom: 28px;
        }
        .read-archetype-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
        }
        .read-title {
          font-size: 30px;
          font-weight: 700;
          line-height: 1.18;
          letter-spacing: -0.025em;
          color: #fff;
          margin: 0;
          font-family: "Georgia", "Times New Roman", "DM Serif Display", serif !important;
        }
        .read-section {
          margin-bottom: 24px;
        }
        .read-section:last-of-type { margin-bottom: 16px; }
        .read-section-heading {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.30);
          margin-bottom: 12px;
        }
        .read-section-body p {
          font-size: 15px !important;
          line-height: 1.75 !important;
          color: rgba(255,255,255,0.75) !important;
          margin: 0 0 12px !important;
          letter-spacing: -0.005em !important;
        }
        .read-section-body p:last-child { margin-bottom: 0 !important; }
        .read-section-body em {
          color: rgba(255,255,255,0.50) !important;
          font-style: italic !important;
        }
        .read-section-body strong {
          color: #fff !important;
          font-weight: 600 !important;
        }
        .read-section-body ul, .read-section-body ol {
          margin: 8px 0 12px !important;
          padding-left: 20px !important;
        }
        .read-section-body li {
          font-size: 15px !important;
          line-height: 1.7 !important;
          color: rgba(255,255,255,0.75) !important;
          margin-bottom: 6px !important;
        }
        .read-section-body li::marker { color: var(--accent) !important; }
        .read-share-row {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .read-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-mute);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: -0.005em;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .read-share-btn:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--border-strong);
          color: var(--text);
        }

        /* ── Markdown output styling ── */
        .markdown-output h1 {
          font-size: 26px; font-weight: 700; letter-spacing: -0.02em;
          margin: 28px 0 12px; line-height: 1.25;
          background: linear-gradient(135deg, #e0d4ff 0%, #b89dff 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .markdown-output h2 {
          font-size: 20px; font-weight: 700; letter-spacing: -0.015em;
          margin: 24px 0 10px; line-height: 1.3;
          color: var(--accent);
        }
        .markdown-output h3 {
          font-size: 16px; font-weight: 600; letter-spacing: -0.01em;
          margin: 20px 0 8px; line-height: 1.35;
          color: var(--text);
        }
        .markdown-output p {
          margin: 0 0 14px; line-height: 1.72; font-size: 15px;
          color: var(--text); letter-spacing: -0.005em;
        }
        .markdown-output em {
          color: var(--accent); font-style: italic;
        }
        .markdown-output strong {
          color: #fff; font-weight: 600;
        }
        .markdown-output blockquote {
          margin: 16px 0; padding: 14px 20px;
          border-left: 3px solid var(--accent-strong);
          background: var(--accent-soft);
          border-radius: 0 12px 12px 0;
          color: var(--text);
          font-style: italic;
        }
        .markdown-output blockquote p { margin: 0; }
        .markdown-output ul, .markdown-output ol {
          margin: 8px 0 14px; padding-left: 22px;
        }
        .markdown-output li {
          margin-bottom: 6px; line-height: 1.65; font-size: 15px;
          color: var(--text);
        }
        .markdown-output li::marker { color: var(--accent); }
        .markdown-output hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
          margin: 24px 0;
        }
        .markdown-output code {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 13px;
          color: var(--accent);
        }
        .markdown-output pre {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 18px;
          overflow-x: auto;
          margin: 12px 0;
        }
        .markdown-output pre code {
          background: none; border: none; padding: 0;
          font-size: 13px; color: var(--text);
        }
        .markdown-output a {
          color: var(--accent); text-decoration: underline;
          text-underline-offset: 3px;
        }
        .markdown-output a:hover { color: #d4c3ff; }
        .markdown-output > *:first-child { margin-top: 0; }
        .markdown-output > *:last-child { margin-bottom: 0; }
      `,
        }}
      />

      <div className="tester" style={S.page}>
        <header className="topbar-sticky" style={S.topbar}>
          <TopbarSpace />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
              zIndex: 1,
            }}
          >
            <KaelLogo height={28} />
            <div style={S.title}>Kael Conversation Lab</div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={S.modelGroup}>
              <span className="label" style={{ marginRight: 2 }}>
                Model
              </span>
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
          {modelsError && (
            <div style={S.errBanner}>Models error: {modelsError}</div>
          )}

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

            <section
              className="pane-card"
              style={{ ...S.promptCard, position: "relative", zIndex: 1 }}
            >
              <div style={S.promptHeader}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    onClick={() => setPromptOpen((o) => !o)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
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
                        transform: promptOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 160ms ease",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span className="label">System prompt</span>
                  </span>

                  {promptDirty && <span style={S.badge}>edited</span>}
                  <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                    {systemPrompt.length.toLocaleString()} chars
                  </span>
                </span>

                {promptDirty && (
                  <span
                    onClick={() => setSystemPrompt(defaultPrompt)}
                    style={S.linkBtn}
                  >
                    reset to file
                  </span>
                )}
              </div>

              {promptOpen && (
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={
                    promptError
                      ? `Failed to load prompt.md: ${promptError}`
                      : "System prompt…"
                  }
                  style={S.promptArea}
                  spellCheck={false}
                />
              )}
            </section>
          </div>

          <div style={S.split}>
            <section className="pane-card" style={S.pane}>
              <div style={S.paneHeader}>
                <h2 style={S.paneTitle}>Input</h2>
                <button
                  onClick={run}
                  disabled={!model || loading}
                  className="btn-primary"
                >
                  {loading ? "Running…" : "Run"}
                </button>
              </div>

              <div style={S.paneBody}>
                <Group title="Task">
                  <Field label="instruction">
                    <textarea
                      className="field-input"
                      value={taskPrompt}
                      onChange={(e) => setTaskPrompt(e.target.value)}
                      placeholder="What should the model do with this conversation history?"
                      style={{ minHeight: 96, resize: "vertical" }}
                    />
                  </Field>
                </Group>

                <Group title="Conversation history">
                  <Field
                    label="document_text"
                    hint={`${documentText.length.toLocaleString()} chars`}
                  >
                    <textarea
                      className="field-input"
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste .md, .txt, or extracted .pdf text here for now…"
                      style={{ minHeight: 320, resize: "vertical" }}
                    />
                  </Field>
                </Group>

                <div style={S.runFooter}>
                  <button
                    onClick={run}
                    disabled={!model || loading}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "13px 22px",
                      fontSize: 15,
                    }}
                  >
                    {loading ? "Running…" : "Run"}
                  </button>
                </div>
              </div>
            </section>

            <section className="pane-card" style={S.pane}>
              <div style={S.paneHeader}>
                <h2 style={S.paneTitle}>Output</h2>
                <div style={S.metaPills}>
                  {latencyMs != null && (
                    <span style={S.pill}>{latencyMs} ms</span>
                  )}
                  {usage?.completion_tokens != null && (
                    <span style={S.pill}>
                      {Number(usage.completion_tokens).toLocaleString()} out tok
                    </span>
                  )}
                  {costInfo && costInfo.hasPricing && (
                    <span className="cost-pill" data-static="true">
                      {formatUsd(costInfo.total)}
                    </span>
                  )}
                </div>
              </div>

              <div style={S.paneBody}>
                {error && <div style={S.errBanner}>{error}</div>}

                {!error && !loading && !outputText && !rawContent && (
                  <div style={S.empty}>
                    <KaelLogo height={56} />
                    <div style={{ fontSize: 15, color: "var(--text-mute)" }}>
                      Run the current prompt and conversation history.
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-faint)",
                        marginTop: 6,
                      }}
                    >
                      Plain output · raw payload · usage stats
                    </div>
                    <button
                      onClick={run}
                      disabled={loading || !model}
                      className="btn-primary"
                      style={{ marginTop: 8 }}
                    >
                      {loading ? "Running…" : "Run"}
                    </button>
                  </div>
                )}

                {loading && (
                  <div style={S.empty}>
                    <div style={{ fontSize: 14, color: "var(--text-mute)" }}>
                      Calling{" "}
                      <span style={{ color: "var(--text)" }}>{model}</span>…
                    </div>
                  </div>
                )}

                {outputText && (
                  <ReadPhoneCard
                    outputText={outputText}
                    costInfo={costInfo}
                    modelName={selectedModel?.name ?? model}
                  />
                )}

                {(rawInput || rawContent) && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
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
                        meta={`${rawContent.length.toLocaleString()} chars`}
                      >
                        <pre style={S.pre}>{rawContent}</pre>
                      </Disclosure>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={S.group}>
      <div style={S.groupTitle}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span className="label">{label}</span>
        {hint && (
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
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
          (m) =>
            m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
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

  const flat = useMemo(
    () => [...filtered.preferred, ...filtered.rest],
    [filtered],
  );

  useEffect(() => {
    if (open) {
      const idx = flat.findIndex((m) => m.id === value);
      setActiveIdx(idx >= 0 ? idx : -1);
    } else {
      setActiveIdx(-1);
    }
  }, [open, value, flat]);

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
        style={S.mpTrigger}
      >
        <span style={S.mpTriggerName}>
          {selected?.name ?? (models.length ? "Select model" : "Loading…")}
        </span>
        {selected?.pricing && (
          <span style={S.mpTriggerPrice}>
            {priceShort(selected.pricing.prompt)} /{" "}
            {priceShort(selected.pricing.completion)}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M3 4.75L6 7.75L9 4.75"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
        </svg>
      </button>

      {open && (
        <div style={S.mpPopover}>
          <div style={S.mpSearchRow}>
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
      style={{
        ...S.mpRow,
        ...(selected ? S.mpRowSelected : null),
        ...(active ? S.mpRowActive : null),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0,
          flex: 1,
        }}
      >
        <span style={S.mpRowName}>{model.name}</span>
        <span style={S.mpRowId}>{model.id}</span>
      </div>
      <div style={S.mpRowPriceCol}>
        <span style={S.mpRowPriceLabel}>in</span>
        <span style={S.mpRowPrice}>{priceShort(model.pricing?.prompt)}</span>
        <span style={{ ...S.mpRowPriceLabel, marginLeft: 8 }}>out</span>
        <span style={S.mpRowPrice}>
          {priceShort(model.pricing?.completion)}
        </span>
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
      <span className="label" style={{ marginRight: 2 }}>
        Temp
      </span>
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
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
              {meta}
            </span>
          )}
        </span>
      </button>
      {open && <div style={S.disclosureBody}>{children}</div>}
    </div>
  );
}

/* ── Parse model output into sections for the phone card ── */
function parseReadSections(text: string) {
  // Try to extract a title line (# heading or **bold** first line)
  const lines = text.split("\n");
  let title = "";
  let archetype = "";
  let bodyStart = 0;

  // Look for a blockquote at the very top (the one-liner hook)
  let hookLine = "";
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    if (l.startsWith(">")) {
      hookLine = l
        .replace(/^>\s*/, "")
        .replace(/^\*+|\*+$/g, "")
        .trim();
      bodyStart = i + 1;
      break;
    }
    // If first non-empty line is a heading, use it as title
    if (l.startsWith("# ")) {
      title = l.replace(/^#+\s*/, "");
      bodyStart = i + 1;
      break;
    }
    break;
  }

  // Now scan remaining for ## headings to create sections
  const sections: { heading: string; content: string }[] = [];
  let currentHeading = "";
  let currentContent: string[] = [];

  for (let i = bodyStart; i < lines.length; i++) {
    const l = lines[i];
    const trimmed = l.trim();
    if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
      if (currentHeading || currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
        });
      }
      currentHeading = trimmed.replace(/^#+\s*/, "");
      currentContent = [];
    } else {
      currentContent.push(l);
    }
  }
  if (currentHeading || currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
    });
  }

  // Try to extract archetype/title from first section if not found
  if (!title && sections.length > 0 && sections[0].heading) {
    // Check if the first heading looks like a title/archetype
    const first = sections[0];
    if (first.content.length < 200 && !first.content.includes("\n\n")) {
      title = first.heading;
      archetype = "YOUR READ";
    }
  }

  // If still no title, try to find one from the content
  if (!title) {
    // Use first heading as title
    for (const s of sections) {
      if (s.heading) {
        title = s.heading;
        break;
      }
    }
  }

  if (!archetype) archetype = "YOUR READ";

  return { title, archetype, hookLine, sections };
}

function ReadPhoneCard({
  outputText,
  costInfo,
  modelName,
}: {
  outputText: string;
  costInfo: any;
  modelName: string;
}) {
  const parsed = useMemo(() => parseReadSections(outputText), [outputText]);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="read-card-wrap">
      <div className="read-card">
        {/* Hook quote */}
        {parsed.hookLine && <div className="read-hook">{parsed.hookLine}</div>}

        {/* Archetype + Title */}
        {parsed.title && (
          <div className="read-header">
            <div className="read-archetype-label">ARCHETYPE</div>
            <h1 className="read-title">{parsed.title}</h1>
          </div>
        )}

        {/* Sections */}
        {parsed.sections.map((sec, i) => (
          <div key={i} className="read-section">
            {sec.heading && (
              <div className="read-section-heading">
                {sec.heading.toUpperCase()}
              </div>
            )}
            <div className="read-section-body markdown-output">
              <ReactMarkdown>{sec.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {/* Share */}
        <div className="read-share-row">
          <button onClick={handleShare} className="read-share-btn">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            {copied ? "Copied!" : "Share my read"}
          </button>
        </div>
      </div>

      {costInfo && costInfo.hasPricing && (
        <CostBreakdown info={costInfo} modelName={modelName} />
      )}
    </div>
  );
}

function CostBreakdown({ info, modelName }: { info: any; modelName: string }) {
  return (
    <div style={S.costBreakdown}>
      <div style={S.costRow}>
        <span style={S.costLabel}>Model</span>
        <span style={S.costValue}>{modelName}</span>
      </div>
      <div style={S.costRow}>
        <span style={S.costLabel}>Prompt tokens</span>
        <span style={S.costValue}>{info.promptTok.toLocaleString()}</span>
      </div>
      <div style={S.costRow}>
        <span style={S.costLabel}>Completion tokens</span>
        <span style={S.costValue}>{info.completionTok.toLocaleString()}</span>
      </div>
      <div style={S.costRow}>
        <span style={S.costLabel}>Total cost</span>
        <span style={S.costValue}>{formatUsd(info.total)}</span>
      </div>
    </div>
  );
}

function formatUsd(value: number) {
  if (!isFinite(value)) return "—";
  if (value < 0.0001) return `$${value.toFixed(6)}`;
  if (value < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(3)}`;
}

const SPACE_DOTS = [
  {
    left: "7%",
    top: "30%",
    size: 1.5,
    delay: "0.2s",
    duration: "3.2s",
    opacity: 0.85,
  },
  {
    left: "23%",
    top: "52%",
    size: 2,
    delay: "1.7s",
    duration: "2.8s",
    opacity: 1,
  },
  {
    left: "47%",
    top: "85%",
    size: 1.5,
    delay: "0.8s",
    duration: "3.6s",
    opacity: 0.8,
  },
  {
    left: "67%",
    top: "10%",
    size: 2,
    delay: "2.5s",
    duration: "2.6s",
    opacity: 0.95,
  },
  {
    left: "83%",
    top: "55%",
    size: 2,
    delay: "2.0s",
    duration: "3.0s",
    opacity: 1,
  },
];

const METEORS = [
  { left: "22%", delay: "0s", duration: "9s", length: 70 },
  { left: "58%", delay: "3.2s", duration: "9s", length: 80 },
];

function TopbarSpace() {
  return (
    <div className="space-bg" aria-hidden="true">
      {SPACE_DOTS.map((d, i) => (
        <span
          key={`d${i}`}
          style={{
            position: "absolute",
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            borderRadius: "50%",
            background: "#fff",
          }}
        />
      ))}
      {METEORS.map((m, i) => (
        <span
          key={`m${i}`}
          style={{
            position: "absolute",
            left: m.left,
            top: 0,
            width: m.length,
            height: 1.6,
            opacity: 0.5,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,1) 100%)",
          }}
        />
      ))}
    </div>
  );
}

function KaelLogo({ height = 28 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        display: "inline-flex",
        alignItems: "center",
        fontWeight: 700,
        color: "var(--text)",
        letterSpacing: "-0.03em",
      }}
    >
      ◉◌
    </div>
  );
}

const GATE_CSS = `
  body {
    margin: 0;
    background:
      radial-gradient(80% 50% at 50% -10%, rgba(139, 92, 255, 0.12), transparent 70%),
      linear-gradient(180deg, #0e0a1c 0%, #07060c 100%);
    color: #f3f1f7;
    font-family: var(--font-dm-sans), "DM Sans", sans-serif;
  }
  .gate-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
  }
  .gate-card {
    width: min(440px, 100%);
    background: rgba(17,16,26,0.92);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 24px 80px -30px rgba(0,0,0,0.6);
  }
  .gate-logo {
    margin-bottom: 18px;
  }
  .gate-title {
    margin: 0 0 8px;
    font-size: 24px;
    line-height: 1.1;
  }
  .gate-sub {
    margin: 0 0 16px;
    color: #a09cad;
    font-size: 14px;
  }
  .gate-input {
    width: 100%;
    background: #16151f;
    color: #f3f1f7;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 12px 14px;
    box-sizing: border-box;
    outline: none;
  }
  .gate-btn {
    width: 100%;
    margin-top: 14px;
    border: none;
    border-radius: 12px;
    padding: 12px 16px;
    background: linear-gradient(180deg, #a481ff 0%, #7546e6 100%);
    color: white;
    font-weight: 600;
    cursor: pointer;
  }
  .gate-btn:disabled {
    opacity: .5;
    cursor: not-allowed;
  }
  .gate-error {
    margin-top: 10px;
    color: #ff7794;
    font-size: 13px;
  }
`;

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
  title: {
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
  },
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
  signOut: {
    background: "transparent",
    color: "var(--text-faint)",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
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
  linkBtn: {
    fontSize: 12,
    color: "var(--accent)",
    cursor: "pointer",
    fontWeight: 500,
  },
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
    boxShadow:
      "0 20px 60px -28px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset",
  },
  paneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
  },
  paneTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    letterSpacing: "-0.01em",
  },
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
  runFooter: {
    marginTop: "auto",
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
  errBanner: {
    background: "var(--danger-bg)",
    color: "var(--danger)",
    border: "1px solid rgba(255,119,148,0.25)",
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
  outputCard: {
    background:
      "linear-gradient(180deg, var(--surface-3) 0%, var(--surface) 100%)",
    border: "1px solid var(--border-strong)",
    borderRadius: 18,
    padding: "16px 20px 20px",
    boxShadow:
      "0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 40px -22px rgba(0,0,0,0.55)",
  },
  outputLabel: {
    fontSize: 11,
    color: "var(--text-faint)",
    textTransform: "uppercase",
    letterSpacing: 0.1,
    marginBottom: 12,
  },
  outputText: {
    whiteSpace: "pre-wrap",
    fontSize: 15.5,
    lineHeight: 1.62,
    color: "var(--text)",
    letterSpacing: "-0.005em",
    margin: 0,
  },
  markdownWrap: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "var(--text)",
    letterSpacing: "-0.005em",
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 12,
    lineHeight: 1.6,
    color: "var(--text)",
  },
  disclosure: {
    border: "1px solid var(--border)",
    borderRadius: 12,
    overflow: "hidden",
    background: "var(--surface-2)",
  },
  disclosureHeader: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "var(--text)",
    padding: "12px 14px",
    textAlign: "left",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  disclosureBody: {
    padding: "0 14px 14px",
    borderTop: "1px solid var(--border)",
  },
  caret: {
    fontSize: 11,
    color: "var(--text-faint)",
    width: 12,
    display: "inline-block",
  },
  costBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  costRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 12,
  },
  costLabel: {
    color: "var(--text-faint)",
  },
  costValue: {
    color: "var(--text)",
    fontVariantNumeric: "tabular-nums",
  },
  mpWrap: { position: "relative" },
  mpTrigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 11,
    padding: "8px 12px 8px 14px",
    fontSize: 13,
    fontFamily: "inherit",
    cursor: "pointer",
    minWidth: 320,
    maxWidth: 420,
  },
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
    boxShadow:
      "0 28px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset",
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
  mpRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "9px 12px",
    background: "transparent",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    color: "var(--text)",
    textAlign: "left",
  },
  mpRowSelected: {
    background:
      "linear-gradient(180deg, rgba(177,144,255,0.18), rgba(124,78,232,0.10))",
  },
  mpRowActive: {
    outline: "1px solid rgba(177,144,255,0.35)",
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
  mpRowPriceLabel: {
    fontSize: 10,
    color: "var(--text-faint)",
    textTransform: "uppercase",
    letterSpacing: 0.05,
  },
  mpRowPrice: { fontSize: 12.5, color: "var(--text)", fontWeight: 500 },
  mpEmpty: {
    padding: "20px 14px",
    fontSize: 13,
    color: "var(--text-faint)",
    textAlign: "center",
  },
};
