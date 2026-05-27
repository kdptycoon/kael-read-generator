"use client";

import { Fragment } from "react";

interface Props {
  /**
   * Full headline text. To emphasize a substring with italic + accent
   * purple, wrap it in **double-asterisks**. Period after a name like
   * "Kael." can also be wrapped if the period itself should be purple.
   *
   * Example: "Do life **better** with Kael**.**"
   *   → renders "Do life " + italic-purple "better" + " with Kael" + italic-purple "."
   */
  text: string;
  className?: string;
  size?: "lg" | "xl" | "2xl";
}

export default function Headline({ text, className, size = "xl" }: Props) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  const sizeCls =
    size === "2xl"
      ? "text-[44px] leading-[1.04]"
      : size === "xl"
        ? "text-[36px] leading-[1.08]"
        : "text-[28px] leading-[1.12]";
  return (
    <h1
      className={`font-bold tracking-[-0.02em] ${sizeCls} ${className ?? ""}`}
      style={{ color: "var(--text)" }}
    >
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i % 2 === 1 ? <span className="emph">{p}</span> : p}
        </Fragment>
      ))}
    </h1>
  );
}
