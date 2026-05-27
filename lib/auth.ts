import { NextResponse } from "next/server";

const HEADER = "x-access-token";

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function requireAccess(req: Request): NextResponse | null {
  const expected = process.env.ACCESS_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "Server misconfigured: ACCESS_TOKEN not set" },
      { status: 500 },
    );
  }
  const provided = req.headers.get(HEADER) ?? "";
  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
