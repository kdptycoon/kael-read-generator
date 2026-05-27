"use client";

import { useState } from "react";

interface Props {
  input: unknown;
  raw?: string;
  error?: {
    message: string;
    status?: number;
    detail?: unknown;
    raw?: unknown;
  } | null;
}

function formatJson(v: unknown): string {
  if (typeof v === "string") {
    try {
      return JSON.stringify(JSON.parse(v), null, 2);
    } catch {
      return v;
    }
  }
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export default function FirstReadDebug({ input, raw, error }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="fixed z-50"
      style={{
        right: 12,
        bottom: 12,
        width: open ? 420 : 140,
        maxWidth: "calc(100vw - 24px)",
        maxHeight: open ? "70vh" : 36,
        background: "rgba(10,8,22,0.96)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10,
        boxShadow: "0 10px 40px rgba(0,0,0,0.55)",
        color: "rgba(255,255,255,0.92)",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 11.5,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between px-3 py-2"
        style={{
          background: error ? "rgba(228, 72, 119, 0.25)" : "rgba(139,92,255,0.18)",
          borderBottom: open ? "1px solid rgba(255,255,255,0.08)" : "none",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontSize: 10.5,
        }}
      >
        <span>{error ? "first-read · error" : "first-read · debug"}</span>
        <span style={{ opacity: 0.7 }}>{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div
          style={{
            overflowY: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {error && (
            <Section label="Error">
              <pre style={preStyle}>
                {formatJson({
                  message: error.message,
                  status: error.status,
                  detail: error.detail,
                  raw: error.raw,
                })}
              </pre>
            </Section>
          )}

          <Section label="Input (sent to model)">
            <pre style={preStyle}>{formatJson(input)}</pre>
          </Section>

          {raw !== undefined && (
            <Section label="Output (raw model JSON)">
              <pre style={preStyle}>{formatJson(raw)}</pre>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

const preStyle: React.CSSProperties = {
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 6,
  padding: 8,
  lineHeight: 1.45,
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
