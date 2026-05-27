import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAccess } from "@/lib/auth";
import { withLog } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withLog("the-read", async (req: Request) => {
  const denied = requireAccess(req);
  if (denied) return denied;

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const { model, input, systemPrompt: clientPrompt, temperature: clientTemperature } = body as {
    model?: string;
    input?: Record<string, unknown>;
    systemPrompt?: string;
    temperature?: number;
  };
  if (!model) return NextResponse.json({ error: "model required" }, { status: 400 });
  if (!input) return NextResponse.json({ error: "input required" }, { status: 400 });
  const temperature =
    typeof clientTemperature === "number" && Number.isFinite(clientTemperature)
      ? Math.max(0, Math.min(2, clientTemperature))
      : 0.8;

  let systemPrompt = clientPrompt;
  if (!systemPrompt || !systemPrompt.trim()) {
    const promptPath = path.join(process.cwd(), "prompt.md");
    systemPrompt = await fs.readFile(promptPath, "utf8");
  }

  const userPayload = JSON.stringify(input, null, 2);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Kael Prompt Tester",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPayload },
      ],
      temperature,
      usage: { include: true },
    }),
  });

  const raw = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json({ error: `OpenRouter ${upstream.status}`, raw }, { status: 502 });
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Non-JSON response from OpenRouter", raw }, { status: 502 });
  }

  const content: string = parsed?.choices?.[0]?.message?.content ?? "";
  const usage = parsed?.usage ?? null;

  let read: { recognition: string; hypothesis: string; the_work: string } | null = null;
  try {
    const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    read = JSON.parse(trimmed);
  } catch {
    read = null;
  }

  return NextResponse.json({ content, read, usage });
});
