import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAccess } from "@/lib/auth";
import { withLog } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withLog("prompt", async (req: Request) => {
  const denied = requireAccess(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const file = type === "chat" ? "prompt-chat.md" : "prompt.md";
  const promptPath = path.join(process.cwd(), file);
  try {
    const text = await fs.readFile(promptPath, "utf8");
    return NextResponse.json({ prompt: text });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
});
