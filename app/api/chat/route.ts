import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAccess } from "@/lib/auth";
import { withLog, logEvent } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiMsg = { role: "user" | "assistant"; content: string };

const RULES_REMINDER = `Before you respond, check yourself:

**You're not coaching, you're showing them what coaching is.** No experiments. No homework. No "try this between now and next time." The work begins after the close, not here. If you're reaching for a coaching move (assignment, micro-action, dare), cut it. Talk about the work, don't assign it.

**One reframe shape per close. Not the same one every time.** The defense reframe ("X isn't the problem, it's protecting you from Y") is one shape. There are others: contradiction-naming, wrong-variable, strategy-that-worked-then-didn't. The shape comes from what surfaced, not from a template. If every close you write is a defense reframe, you're pattern-matching.

**Earn the hypothesis.** If you're constructing language to sound deep instead of feeling a real read, you don't have one. Either ask one more sharp question or close honestly without a reframe. A polished fake hypothesis kills conversion worse than no hypothesis. See \`<when_not_to_hypothesize>\`.

**Options on every non-close message. No exceptions.** Holds get options. Single-word acknowledgments paired with a question get options. Short messages get options. The only message with \`options: null\` is the close. If you're tempted to skip them because the moment feels intimate, you're wrong. Generate options.

**Length applies to message field only.** Options don't count against the word budget.

**Use exchange_count to drive behavior, never to talk about it.** You know the turn number. The user doesn't. Never say "we're at turn 7" or "a few more turns." Awareness shows up in how you behave (moving toward close, fewer new threads), not what you say.

**Close in the right format.** When closing: \`close: true\`, \`cta\` set to a phrase that pairs with your closing question, \`options: null\`. When not closing: no \`close\` field, no \`cta\` field, options array required. Wrong format breaks the UI even if the message is good.

**Don't run past the close window.** If exchange_count is past CLOSE_RANGE and you haven't closed, the next message is the close. Good conversations that never close don't convert.

**Stay in character.** You just know things about this person. Never say "as an AI," "system prompt," "context," "the read," "onboarding," or any internal term. The Read messages were a different system; don't reference them as such.

**Mentor, not salesperson.** No urgency, no hype, no "unlock your potential." Confident yes, sales-coded no. The user buys themselves into it. You offer.`;

export const POST = withLog("chat", async (req: Request) => {
  const denied = requireAccess(req);
  if (denied) return denied;

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    model,
    formInput,
    systemPrompt: clientPrompt,
    messages: clientMessages,
    temperature: clientTemperature,
  } = body as {
    model?: string;
    formInput?: Record<string, unknown>;
    systemPrompt?: string;
    messages?: ApiMsg[];
    temperature?: number;
  };
  const temperature =
    typeof clientTemperature === "number" && Number.isFinite(clientTemperature)
      ? Math.max(0, Math.min(2, clientTemperature))
      : 0.8;
  if (!model) return NextResponse.json({ error: "model required" }, { status: 400 });
  if (!formInput) return NextResponse.json({ error: "formInput required" }, { status: 400 });

  let basePrompt = clientPrompt;
  if (!basePrompt || !basePrompt.trim()) {
    const promptPath = path.join(process.cwd(), "prompt-chat.md");
    basePrompt = await fs.readFile(promptPath, "utf8");
  }

  const systemPrompt = `${basePrompt}\n\n<user_form>\n${JSON.stringify(formInput, null, 2)}\n</user_form>`;

  const history: ApiMsg[] = Array.isArray(clientMessages) ? clientMessages.filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
  ) : [];

  const turn = history.filter((m) => m.role === "assistant").length + 1;

  const remindersBlock = RULES_REMINDER;
  const turnMarker = `<exchange_count>${turn}</exchange_count>`;

  // Prompt caching uses two breakpoints:
  //   1. basePrompt + form          → cached (per-conversation, big)
  //   2. rules + format reminders   → cached (global, ~1.2k tokens, same for all users)
  // The turn marker is the only non-cached block, so token cost per turn is
  // just the marker itself plus the user message and the response.
  const messages: { role: "system" | "user" | "assistant"; content: any }[] = [
    {
      role: "system",
      content: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
        { type: "text", text: remindersBlock, cache_control: { type: "ephemeral" } },
        { type: "text", text: turnMarker },
      ],
    },
    ...(history.length === 0 ? [{ role: "user" as const, content: "Begin the conversation." }] : history),
  ];

  await logEvent("chat.upstream", {
    model,
    turn,
    historyLength: history.length,
    cachedSystemPromptChars: systemPrompt.length,
    cachedRemindersChars: remindersBlock.length,
    turnMarker,
  });

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
      messages,
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

  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  let message = "";
  let options: string[] = [];
  let close = false;
  let cta = "";
  let parseError = false;

  try {
    const obj = JSON.parse(trimmed);
    message = typeof obj?.message === "string" ? obj.message : "";
    options = Array.isArray(obj?.options)
      ? obj.options.filter((o: unknown): o is string => typeof o === "string").slice(0, 5)
      : [];
    close = obj?.close === true;
    cta = typeof obj?.cta === "string" ? obj.cta.trim().slice(0, 60) : "";
    if (!message) {
      parseError = true;
      message = content;
    }
  } catch {
    parseError = true;
    message = content;
  }

  return NextResponse.json({ message, options, close, cta, parseError, raw: content, usage });
});
