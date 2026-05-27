/**
 * Token streaming utility for The Read (Screen 16).
 *
 * Splits text into chunks of ~1-3 chars and emits them at ~30 tokens/sec.
 * Returns a cancel handle so React can clean up if the screen unmounts mid-stream.
 */

const TOKENS_PER_SEC = 32;

interface Options {
  /** When "char", each tick emits one additional character (typing feel). Default "token". */
  mode?: "token" | "char";
  /** Override the rate (units per second). */
  rate?: number;
}

export function streamText(
  text: string,
  onTick: (partial: string) => void,
  onDone?: () => void,
  opts?: Options,
): () => void {
  const mode = opts?.mode ?? "token";
  const rate = opts?.rate ?? (mode === "char" ? 60 : TOKENS_PER_SEC);
  const tokens = mode === "char" ? Array.from(text) : chunkText(text);
  const interval = Math.max(12, Math.round(1000 / rate));
  let i = 0;
  let acc = "";
  let cancelled = false;

  const id = setInterval(() => {
    if (cancelled) return;
    if (i >= tokens.length) {
      clearInterval(id);
      onDone?.();
      return;
    }
    acc += tokens[i++];
    onTick(acc);
  }, interval);

  return () => {
    cancelled = true;
    clearInterval(id);
  };
}

/** Split into pseudo-tokens: words + adjacent punctuation, with single-char chunks for spaces. */
function chunkText(text: string): string[] {
  const out: string[] = [];
  let buf = "";
  for (const ch of text) {
    if (ch === " " || ch === "\n") {
      if (buf) {
        out.push(buf);
        buf = "";
      }
      out.push(ch);
    } else {
      buf += ch;
      // Split mid-word every 3-4 chars to feel more like token streaming
      if (buf.length >= 3) {
        out.push(buf);
        buf = "";
      }
    }
  }
  if (buf) out.push(buf);
  return out;
}
