"use client";

import { Star } from "lucide-react";

interface Props {
  count?: number;
  size?: number;
  glow?: boolean;
}

export default function StarRow({ count = 5, size = 14, glow }: Props) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={0}
          fill="#F5C247"
          style={glow ? { filter: "drop-shadow(0 0 6px rgba(245, 194, 71, 0.6))" } : undefined}
        />
      ))}
    </div>
  );
}
