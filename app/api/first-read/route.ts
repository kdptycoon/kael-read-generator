import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { humanizeInput, type HumanizedInput } from "@/lib/humanize-input";
import type { FlowState } from "@/lib/flow-store";
import { withLog } from "@/lib/log";

export const runtime = "nodejs";

const SYSTEM_PROMPT = readFileSync(
  path.join(process.cwd(), "prompt.md"),
  "utf8",
);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4.5";

interface ReadMessages {
  recognition: string;
  hypothesis: string;
  shapeIntro: string;
  shapeBullets: string[];
  closingQuestion: string;
}

interface ParsedTheWork {
  intro: string;
  bullets: string[];
  closing: string;
}

function stripJsonFences(s: string): string {
  let t = s.trim();
  // ```json ... ``` or ``` ... ```
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i;
  const m = t.match(fence);
  if (m) t = m[1].trim();
  return t;
}

function parseTheWork(raw: string): ParsedTheWork | null {
  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length < 3) return null;

  const intro = blocks[0];
  const closing = blocks[blocks.length - 1];

  const bulletBlock = blocks.slice(1, -1).join("\n");
  const bullets = bulletBlock
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-") || l.startsWith("•"))
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  if (bullets.length < 3) return null;
  if (!closing) return null;

  return { intro, bullets, closing };
}

export const POST = withLog<NextRequest>("first-read", async (req) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not set" },
      { status: 500 },
    );
  }

  let body: Partial<FlowState>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const input: HumanizedInput = humanizeInput(body);

  const referer =
    req.headers.get("origin") ??
    req.headers.get("referer") ??
    "http://localhost:3000";

  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Kael Onboarding",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "openrouter_fetch_failed",
        detail: e instanceof Error ? e.message : String(e),
        input,
      },
      { status: 502 },
    );
  }

  const responseText = await res.text();

  if (!res.ok) {
    return NextResponse.json(
      {
        error: `openrouter:${res.status}`,
        detail: responseText,
        input,
      },
      { status: 502 },
    );
  }

  let envelope: { choices?: Array<{ message?: { content?: string } }> };
  try {
    envelope = JSON.parse(responseText);
  } catch {
    return NextResponse.json(
      {
        error: "openrouter_envelope_not_json",
        raw: responseText,
        input,
      },
      { status: 502 },
    );
  }

  const content = envelope.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "no_content_in_response", raw: envelope, input },
      { status: 502 },
    );
  }

  // Some models wrap JSON in ```json ... ``` fences despite response_format and
  // explicit instructions. Strip them defensively before parsing.
  const stripped = stripJsonFences(content);

  let parsed: { recognition?: unknown; hypothesis?: unknown; the_work?: unknown };
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return NextResponse.json(
      { error: "model_returned_non_json", raw: content, input },
      { status: 502 },
    );
  }

  const { recognition, hypothesis, the_work } = parsed;
  if (
    typeof recognition !== "string" ||
    typeof hypothesis !== "string" ||
    typeof the_work !== "string" ||
    !recognition.trim() ||
    !hypothesis.trim() ||
    !the_work.trim()
  ) {
    return NextResponse.json(
      { error: "schema_violation", raw: parsed, input },
      { status: 502 },
    );
  }

  const work = parseTheWork(the_work);
  if (!work) {
    return NextResponse.json(
      { error: "the_work_parse_failed", raw: the_work, input },
      { status: 502 },
    );
  }

  const data: ReadMessages = {
    recognition,
    hypothesis,
    shapeIntro: work.intro,
    shapeBullets: work.bullets,
    closingQuestion: work.closing,
  };

  return NextResponse.json({
    data,
    debug: { input, raw: content },
  });
});
