"use client";

import { forwardRef } from "react";

interface Props {
  size?: number;
  color1?: string; // purple ring
  color2?: string; // cream ring
  className?: string;
  style?: React.CSSProperties;
}

const KaelLogo = forwardRef<SVGSVGElement, Props>(function KaelLogo(
  { size = 33, color1 = "#8B5CFF", color2 = "#EEEAE5", className, style },
  ref,
) {
  const ratio = 21 / 33;
  const w = size;
  const h = size * ratio;
  return (
    <svg
      ref={ref}
      width={w}
      height={h}
      viewBox="0 0 33 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M21.874 1.17773C26.8484 1.17784 30.8816 5.21282 30.8818 10.1914C30.8818 15.1702 26.8485 19.206 21.874 19.2061C16.8994 19.2061 12.8652 15.1703 12.8652 10.1914C12.8655 5.21276 16.8996 1.17773 21.874 1.17773Z"
        stroke={color1}
        strokeWidth="2.35585"
      />
      <path
        d="M10.1865 1.17773C15.1609 1.17784 19.1941 5.21282 19.1943 10.1914C19.1943 15.1702 15.161 19.206 10.1865 19.2061C5.21192 19.2061 1.17773 15.1703 1.17773 10.1914C1.17798 5.21276 5.21207 1.17773 10.1865 1.17773Z"
        stroke={color2}
        strokeWidth="2.35585"
      />
    </svg>
  );
});

export default KaelLogo;
