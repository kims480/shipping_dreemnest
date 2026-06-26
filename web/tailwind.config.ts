import type { Config } from "tailwindcss";

/**
 * Dreem Nest brand palette (from the "D" monogram logo): deep purple as the
 * primary chrome/CTA color, lime/chartreuse green as the high-energy accent.
 * Hero UI direction = bold hero sections, card-based layouts, generous
 * whitespace, confident type — themed to these two colors plus neutrals.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "brand-purple": "var(--color-brand-purple)",
        "brand-purple-dark": "var(--color-brand-purple-dark)",
        "brand-purple-light": "var(--color-brand-purple-light)",
        "brand-lime": "var(--color-brand-lime)",
        "brand-lime-dark": "var(--color-brand-lime-dark)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        border: "var(--color-border)",
        "status-on-track": "var(--color-status-on-track)",
        "status-at-risk": "var(--color-status-at-risk)",
        "status-breached": "var(--color-status-breached)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
