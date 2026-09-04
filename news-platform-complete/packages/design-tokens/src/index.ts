export const tokens = {
  font: {
    display: '"DM Serif Display", Georgia, serif',
    sans: '"Inter", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  color: {
    light: {
      background: "#F5F3EE",
      surface: "#FBFAF7",
      foreground: "#171717",
      muted: "#6B6A66",
      line: "#D9D6CF",
      accent: "#8B1E2D",
      live: "#B42318",
    },
    dark: {
      background: "#101110",
      surface: "#171917",
      foreground: "#F1F0EB",
      muted: "#A7A7A1",
      line: "#343632",
      accent: "#E6A7B0",
      live: "#F97066",
    },
  },
  radius: {
    sm: "2px",
    md: "6px",
    lg: "12px",
  },
  motion: {
    fast: "120ms",
    normal: "240ms",
    editorial: "500ms",
    cinematic: "800ms",
  },
  layout: {
    maxContent: "1440px",
    article: "720px",
  },
} as const;

export type DesignTokens = typeof tokens;
