/**
 * Categorical color palette.
 *
 * Color is reserved for screens with multiple meaningful options:
 *   - Stuck area (Screen 11) and its sub-shapes (Screen 12) — same hue
 *     carries between the parent area and its 6 child shapes.
 *   - Goals (Screen 19).
 *
 * Hues were chosen for narrative meaning (warm = connection, cool =
 * steadiness, etc.) and muted enough to read on the navy-purple bg
 * without competing with the accent purple CTA.
 *
 * Patterns (Screen 14) is monochromatic accent purple — these are
 * pattern names, not categories. All other screens stay on the dark
 * bg + accent purple system.
 */

export const STUCK_AREA_COLORS: Record<string, string> = {
  career: "#4F6AE8",        // indigo — mature work
  relationships: "#E87158", // warm coral — connection
  money: "#3BA77E",         // deep green — growth
  health: "#D9434E",        // crimson — vital
  purpose: "#3FA3C5",       // cool cyan — compass
  discipline: "#D8A246",    // amber — control
};

export const GOAL_COLORS: Record<string, string> = {
  confidence: "#E5B043",    // gold star
  calm: "#7CA3D6",          // pale blue
  habits: "#3BA77E",        // green — compounding
  trusting: "#3FA3C5",      // teal — compass
  close: "#E87158",         // coral — connection
  cycle: "#C64655",         // deep red — broken chain
  charge: "#A26AE8",        // royal purple — crown
  alive: "#F08146",         // sunrise orange
};

/**
 * Tile-style colors used on Screen 1 (the opposing carousels).
 * Right column (aspirational) uses saturated category colors.
 * Left column (problem states) uses muted/desaturated treatments.
 */
export const TILE_PROBLEM = {
  bg: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.08)",
  iconBg: "rgba(217, 67, 78, 0.18)",
  iconColor: "rgba(255, 180, 180, 0.8)",
  labelColor: "rgba(255, 255, 255, 0.55)",
};

export const TILE_ASPIRATIONAL: Record<string, { from: string; to: string; iconBg: string }> = {
  honesty: {
    from: "#E97A3A",
    to: "#C25A26",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
  steadiness: {
    from: "#5B7BD9",
    to: "#3F5BB5",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
  momentum: {
    from: "#E04877",
    to: "#A02E5A",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
  clarity: {
    from: "#3FA3C5",
    to: "#1F7B9C",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
  selftrust: {
    from: "#A26AE8",
    to: "#6B3FB5",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
  followthrough: {
    from: "#3BA77E",
    to: "#1F7A58",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
  boundaries: {
    from: "#D8A246",
    to: "#A87826",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
  doing: {
    from: "#E5B043",
    to: "#A87826",
    iconBg: "rgba(255, 255, 255, 0.18)",
  },
};

export function withAlpha(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
