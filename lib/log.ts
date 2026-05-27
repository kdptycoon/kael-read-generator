import { promises as fs } from "fs";
import path from "path";

const LOGS_DIR = path.join(process.cwd(), "logs");

function dateStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function logEvent(
  event: string,
  data: Record<string, unknown> = {},
) {
  const ts = new Date().toISOString();
  const entry = { ts, event, ...data };

  console.log(`\n──── [${ts}] ${event} ────`);
  console.log(JSON.stringify(data, null, 2));

  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    await fs.appendFile(
      path.join(LOGS_DIR, `api-${dateStr()}.jsonl`),
      JSON.stringify(entry) + "\n",
      "utf8",
    );
  } catch (e) {
    console.error("[log] file write failed:", e);
  }
}

type RouteHandler<T extends Request = Request> = (req: T) => Promise<Response> | Response;

async function safeReadBody(res: Response | Request): Promise<unknown> {
  try {
    const clone = res.clone();
    const text = await clone.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return undefined;
  }
}

export function withLog<T extends Request = Request>(
  name: string,
  handler: RouteHandler<T>,
): RouteHandler<T> {
  return async (req: T) => {
    const startedAt = Date.now();
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams);

    const reqBody =
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await safeReadBody(req);

    await logEvent(`${name}.request`, {
      method: req.method,
      path: url.pathname,
      ...(Object.keys(query).length ? { query } : {}),
      ...(reqBody !== undefined ? { body: reqBody } : {}),
    });

    let res: Response;
    try {
      res = await handler(req);
    } catch (e) {
      await logEvent(`${name}.error`, {
        path: url.pathname,
        latencyMs: Date.now() - startedAt,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }

    const resBody = await safeReadBody(res);
    await logEvent(`${name}.response`, {
      status: res.status,
      latencyMs: Date.now() - startedAt,
      ...(resBody !== undefined ? { body: resBody } : {}),
    });

    return res;
  };
}
