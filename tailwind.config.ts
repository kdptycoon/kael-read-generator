import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          from: "var(--bg-from)",
          to: "var(--bg-to)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hi: "var(--accent-hi)",
          glow: "var(--accent-glow)",
        },
        text: {
          DEFAULT: "var(--text)",
          mute: "var(--text-mute)",
          faint: "var(--text-faint)",
        },
        row: {
          bg: "var(--row-bg)",
          border: "var(--row-border)",
          "bg-selected": "var(--row-bg-selected)",
          "border-selected": "var(--row-border-selected)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        row: "14px",
        cta: "28px",
      },
      boxShadow: {
        cta: "0 12px 28px -8px rgba(139, 92, 255, 0.55), 0 6px 12px -6px rgba(139, 92, 255, 0.4)",
        glow: "0 0 32px rgba(139, 92, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
