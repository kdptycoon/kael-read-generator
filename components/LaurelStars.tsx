"use client";

import StarRow from "./StarRow";

interface Props {
  starSize?: number;
  laurelHeight?: number;
  starGlow?: boolean;
}

/**
 * Five gold stars flanked by mirrored laurel-leaf cluster SVG paths.
 * Used on Screen 18 (Review ask) and Screen 24 (Loading testimonials).
 */
export default function LaurelStars({ starSize = 16, laurelHeight = 56, starGlow = true }: Props) {
  const lw = laurelHeight * 0.55;
  return (
    <div className="flex items-center justify-center gap-3">
      <Laurel side="left" width={lw} height={laurelHeight} />
      <StarRow size={starSize} glow={starGlow} />
      <Laurel side="right" width={lw} height={laurelHeight} />
    </div>
  );
}

function Laurel({ side, width, height }: { side: "left" | "right"; width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: side === "right" ? "scaleX(-1)" : undefined, opacity: 0.85 }}
      aria-hidden="true"
    >
      {/* Stem */}
      <path
        d="M34 8 C 26 22, 22 38, 24 56 C 26 64, 30 70, 34 74"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaves: 5 down the stem */}
      <Leaf cx={28} cy={20} rot={-30} />
      <Leaf cx={24} cy={32} rot={-20} />
      <Leaf cx={22} cy={44} rot={-8} />
      <Leaf cx={24} cy={56} rot={10} />
      <Leaf cx={28} cy={66} rot={28} />
    </svg>
  );
}

function Leaf({ cx, cy, rot }: { cx: number; cy: number; rot: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <path
        d="M0 0 C -3 -2, -10 -3, -14 -1 C -10 1, -3 2, 0 0 Z"
        fill="rgba(255,255,255,0.35)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="0.6"
      />
    </g>
  );
}
