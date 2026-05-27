import { NextResponse } from "next/server";
import { requireAccess } from "@/lib/auth";
import { withLog } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withLog("models", async (req: Request) => {
  const denied = requireAccess(req);
  if (denied) return denied;

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: `OpenRouter ${res.status}` }, { status: 502 });
  }

  const data = await res.json();
  const models = (data.data ?? [])
    .map((m: any) => ({
      id: m.id as string,
      name: (m.name as string) ?? m.id,
      pricing: m.pricing
        ? {
            prompt: m.pricing.prompt ?? null,
            completion: m.pricing.completion ?? null,
          }
        : null,
    }))
    .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

  return NextResponse.json({ models });
});
