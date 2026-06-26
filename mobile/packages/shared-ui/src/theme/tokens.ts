/**
 * Dreem Nest design tokens — derived from PDR §2 "Brand & Visual Design Direction".
 *
 * Palette roles:
 *  - Primary (chrome/navigation/CTA): deep purple ~#4B2E6F
 *  - Accent (highlights/success/badges): lime/chartreuse green ~#B5D335
 *  - Neutral backgrounds: off-white / light neutrals
 *  - Status colors: amber/red/green for SLA states; New/Return badge colors
 *
 * The lime accent is bright — per the PDR's accessibility note, it is reserved
 * for small accents/badges/highlights against dark text or dark backgrounds,
 * never as a body-text or large-surface color (WCAG AA contrast).
 */

export const palette = {
  purple900: "#2E1B45",
  purple700: "#3D2760",
  purple: "#4B2E6F", // primary
  purple300: "#7B5DA0",
  purple100: "#E5DCEF",

  lime: "#B5D335", // accent
  limeDark: "#8FA827",
  limeTint: "#EFF6D6",

  white: "#FFFFFF",
  offWhite: "#F7F6FA",
  neutral100: "#EFEDF3",
  neutral200: "#DEDAE6",
  neutral400: "#A8A2B5",
  neutral600: "#6F6A7C",
  neutral800: "#352F45",
  ink: "#1F1A2B",

  success: "#3FA34D",
  successTint: "#E3F4E6",
  warning: "#E0A622",
  warningTint: "#FBF1DA",
  danger: "#D64545",
  dangerTint: "#FBE4E4",
  info: "#3E7BD6",
  infoTint: "#E2EBFA",
} as const;

/** Semantic SLA-countdown states (PDR §8 — color-coded on-track / at-risk / breached). */
export const slaColors = {
  ON_TRACK: { fg: palette.success, bg: palette.successTint, label: "On track" },
  AT_RISK: { fg: palette.warning, bg: palette.warningTint, label: "At risk" },
  BREACHED: { fg: palette.danger, bg: palette.dangerTint, label: "Breached" },
} as const;

/** New vs. Return WO type badge colors (PDR §5.3). */
export const woTypeColors = {
  NEW: { fg: palette.purple, bg: palette.purple100, label: "New" },
  RETURN: { fg: palette.limeDark, bg: palette.limeTint, label: "Return" },
} as const;

export const colors = {
  primary: palette.purple,
  primaryDark: palette.purple900,
  primaryLight: palette.purple100,
  accent: palette.lime,
  accentDark: palette.limeDark,
  background: palette.offWhite,
  surface: palette.white,
  border: palette.neutral200,
  textPrimary: palette.ink,
  textSecondary: palette.neutral600,
  textOnPrimary: palette.white,
  textOnAccent: palette.ink,
  ...palette,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** Bold, confident typographic hierarchy ("Hero UI" direction — PDR §2). */
export const typography = {
  display: { fontSize: 32, fontWeight: "800" as const, lineHeight: 38 },
  h1: { fontSize: 26, fontWeight: "700" as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: "700" as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 22 },
  bodyStrong: { fontSize: 16, fontWeight: "600" as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: "600" as const, lineHeight: 14 },
} as const;

export const shadows = {
  card: {
    shadowColor: palette.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  slaColors,
  woTypeColors,
} as const;

export type Theme = typeof theme;
