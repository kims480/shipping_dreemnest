# Dreem Nest — Web

Next.js (App Router) web console for the Dreem Nest courier & fulfillment
platform — see `../PDR.md` and `../TECH_ARCHITECTURE.md` for the full spec.

## Stack

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS v3, themed to the Dreem Nest brand palette (deep purple
  `#4B2E6F` + lime/chartreuse `#B5D335`) per the Hero UI design direction
- `next/font` (Inter for Latin, IBM Plex Sans Arabic for AR-RTL surfaces)

> Pinned to Next 14 / React 18 / Tailwind v3 — the environment runs Node
> 18.17.1, and Next 16 + Tailwind v4 both require newer toolchains
> (Next 16 needs Node ≥20; Tailwind v4's oxide engine needs a native binding
> that fails to install on this platform/Node combination). Revisit these
> pins once the toolchain is upgraded.

## Structure

- `src/app/` — App Router routes (role-scoped surfaces will live under
  `/admin`, `/dfp`, `/merchant`, `/track`, mirroring the persona breakdown
  in PDR §3 / TECH_ARCHITECTURE §7)
- `src/components/ui/` — brand-themed primitives (`Button`, `Card`,
  `WorkOrderBadge`, `SlaBadge`, …) — the seed of the shared design system
- `src/lib/` — small framework-agnostic helpers (`cn` class-merging utility)
- `tailwind.config.ts` — maps brand color tokens (defined as CSS custom
  properties in `globals.css`) to Tailwind utilities
- `src/app/globals.css` — brand palette tokens + AR-RTL font fallback rule

## Getting started

```bash
npm install
npm run dev
```

- App: http://localhost:3000

## Notes

- The homepage (`src/app/page.tsx`) is a Hero UI–styled landing/dashboard
  preview showcasing the four stakeholder surfaces (Admin/Dispatch, DFP,
  Merchant, End Customer) and a sample live work-order queue with New/Return
  and SLA-status badges — replace the sample data with the backend API
  (`../backend`) once the API client is wired up.
- Full bilingual AR-RTL support requires per-locale routing
  (e.g. `next-intl` or App Router `[locale]` segments) plus `dir="rtl"` on
  `<html>` for Arabic — not yet wired; `globals.css` already declares the
  Arabic font fallback for `[dir="rtl"]`.
