"use client";

interface Props {
  /** 0–100 */
  percent: number;
}

/**
 * Full-width edge-to-edge thin progress bar shown across the form-filling
 * stretch (Screens 6 → 15). The percentage label is rendered separately
 * in the header (see Screen.tsx).
 */
export default function ProgressBar({ percent }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="w-full relative"
      style={{ height: 3, background: "rgba(255,255,255,0.08)" }}
      aria-label={`${Math.round(clamped)}% complete`}
    >
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${clamped}%`,
          background: "linear-gradient(90deg, var(--accent) 0%, var(--accent-hi) 100%)",
          boxShadow: "0 0 10px rgba(139, 92, 255, 0.55)",
          transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}
