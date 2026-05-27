import type { FlowState } from "./flow-store";

export interface ReadMessages {
  recognition: string;
  hypothesis: string;
  shapeIntro: string;
  shapeBullets: string[];
  closingQuestion: string;
}

export interface FirstReadResult {
  data: ReadMessages;
  debug: { input: unknown; raw: string };
}

export class FirstReadError extends Error {
  status: number;
  detail?: unknown;
  input?: unknown;
  raw?: unknown;
  constructor(opts: {
    message: string;
    status: number;
    detail?: unknown;
    input?: unknown;
    raw?: unknown;
  }) {
    super(opts.message);
    this.name = "FirstReadError";
    this.status = opts.status;
    this.detail = opts.detail;
    this.input = opts.input;
    this.raw = opts.raw;
  }
}

export async function fetchFirstRead(
  state: Partial<FlowState>,
): Promise<FirstReadResult> {
  const res = await fetch("/api/first-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: state.name,
      age: state.age,
      gender: state.gender,
      stuckArea: state.stuckArea,
      specificShape: state.specificShape,
      customShape: state.customShape,
      timeStuck: state.timeStuck,
      patterns: state.patterns,
      whatTried: state.whatTried,
    }),
  });

  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // leave as text
  }

  if (!res.ok) {
    const b = body as { error?: string; detail?: unknown; input?: unknown; raw?: unknown };
    throw new FirstReadError({
      message: b?.error ?? `request_failed:${res.status}`,
      status: res.status,
      detail: b?.detail,
      input: b?.input,
      raw: b?.raw,
    });
  }

  return body as FirstReadResult;
}
