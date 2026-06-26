# Dreem Nest — Mobile

React Native (Expo, TypeScript) foundation for the **Driver**, **DFP** (Delivery
Focal Point), and **End Customer** apps described in `TECH_ARCHITECTURE.md` §8 and
`PDR.md` §15. This is a **scaffold**: structure, theming, i18n/RTL, navigation
skeletons, and placeholder screens are in place; feature logic is stubbed.

## Structure: npm-workspaces monorepo, three Expo apps

```
mobile/
├── apps/
│   ├── driver/         @dreem-nest/driver       — Expo Router app (job receipt, navigation, proof of action)
│   ├── dfp/            @dreem-nest/dfp          — Expo Router app (SLA dashboard, sign-off)
│   └── end-customer/   @dreem-nest/end-customer — Expo Router app (tracking, profile, address book)
└── packages/
    ├── shared-types/   @dreem-nest/shared-types — WorkOrder/EndCustomer/Address/DFP/... contracts (PDR §13)
    ├── shared-ui/      @dreem-nest/shared-ui    — themed component library ("Hero UI" brand)
    ├── api-client/     @dreem-nest/api-client   — typed fetch wrapper + endpoint stubs (PDR §14)
    └── i18n/           @dreem-nest/i18n         — ar/en locales + RTL sync hook
```

**Why three real Expo apps instead of one app with role flavors**: the PDR/architecture
explicitly calls for three *separate bundles* (different bundle IDs, app-store listings,
push-notification topics, and permission sets — e.g., the DFP app needs background
location, the Driver app needs camera/navigation, the End Customer app needs neither).
A single app with role-based stacks would still need to ship all three permission
profiles to every user. npm workspaces let the three apps share `packages/*` as normal
versioned dependencies (each `package.json` depends on `@dreem-nest/shared-ui`, etc., via
the `*` workspace protocol), so there is effectively no duplication — each `apps/*`
folder is just an Expo Router entry point, navigation tree, and a handful of screens.

If this proves too heavy to operate day-to-day, the natural fallback (mentioned in the
task brief) is to collapse `apps/*` into one Expo app with role-based navigation stacks
selected at runtime/build-time (e.g., via `app.config.ts` + `EXPO_PUBLIC_APP_ROLE`) —
the `packages/*` layer here is already structured to support that with no changes.

## Running locally

Requires Node ≥ 18.18 (Expo SDK 51 prefers ≥ 20; the scaffold installs and type-checks
fine on 18.17 but upgrade for `expo start` to avoid engine warnings) and the Expo Go app
or a simulator/emulator on a real machine with native tooling.

```bash
cd mobile
npm install              # installs and links all workspaces

# run a specific app (each starts its own Metro bundler / QR code)
npm run driver           # = npm run start --workspace=@dreem-nest/driver
npm run dfp
npm run customer

# or directly:
cd apps/dfp && npx expo start
```

Type-check everything (this is what was used to verify the scaffold — see "Verification" below):

```bash
npm run typecheck        # runs `tsc --noEmit` in every workspace that defines it
```

## Shared packages

- **`shared-types`** — minimal TS interfaces mirroring the data-model sketch in PDR §13:
  `WorkOrder`, `EndCustomer`, `Address`, `DFP`, `Driver`, `Zone`, `EFlowStage`,
  `DeliveryConfirmation`, `Rating`, `Complaint`, `AuthSession`, etc. Treat this as the
  contract apps code against until the backend's OpenAPI spec exists — at that point,
  prefer generating (or regenerating a superset of) these types from the spec.
- **`api-client`** — `apiRequest()`, a thin typed `fetch` wrapper (base URL, JSON
  encode/decode, bearer-token injection, timeout, `ApiError` normalization), plus
  endpoint-group stubs (`authApi`, `driverOpsApi`, `dfpOpsApi`, `endCustomerApi`) named
  to mirror the API surface in PDR §14. `BASE_URL` in `src/config.ts` is a placeholder —
  wire up per-environment values once the backend is deployed.
- **`shared-ui`** — themed component library (see "Theme" below): `ThemeProvider`/
  `useTheme`, `Text`, `Button`, `Card`, `Badge`, `StatusChip` (`SlaCountdownChip` +
  `WorkOrderTypeChip`), `TextField`, and `ScreenLayout`/`ScreenHeader`.
- **`i18n`** — `ar`/`en` resource bundles wired through `i18next`/`react-i18next`,
  `expo-localization` device-locale detection, and a `useSyncRtlWithLocale()` hook (see
  "i18n & RTL" below).

## Theme / design tokens (`packages/shared-ui/src/theme/tokens.ts`)

Derived directly from PDR §2 ("Brand & Visual Design Direction — Hero UI"):

| Token | Value | Role |
|---|---|---|
| `colors.primary` | `#4B2E6F` (deep purple) | chrome, navigation, primary CTAs, headings |
| `colors.accent` | `#B5D335` (lime/chartreuse) | highlights, secondary CTAs, "default" badges — used sparingly, with dark text, per the PDR's WCAG-AA accessibility note |
| `colors.background` / `surface` | off-white / white | content areas, cards |
| `slaColors.ON_TRACK / AT_RISK / BREACHED` | green / amber / red (+ tints) | SLA-countdown chip states (PDR §8) |
| `woTypeColors.NEW / RETURN` | purple / lime-tinted | New vs. Return WO badges (PDR §5.3) |

Also exported: `spacing`, `radii`, `typography` (a bold display→micro type scale for the
"confident typographic hierarchy, generous whitespace" Hero UI direction), and `shadows`.
All components consume these via `useTheme()` rather than hard-coded values, so a brand
refresh only touches `tokens.ts`.

**Components built**: `Button` (primary/accent/outline/ghost variants), `Card`,
`Badge`, `StatusChip` (`SlaCountdownChip`, `WorkOrderTypeChip`), `TextField`,
`Text` (variant-driven typography), and `ScreenLayout`/`ScreenHeader` (safe-area +
branded hero header + scrollable content — the shared screen scaffold every screen uses).

## i18n & RTL (`packages/i18n`)

- `ar` and `en` resource files (`src/locales/{ar,en}.ts`) cover every string used by the
  scaffolded screens (login, dashboard, sign-off, deliveries, profile, WO-type/SLA labels).
- `resolveDeviceLocale()` uses `expo-localization` to pick a supported locale from the
  device, falling back to English.
- `useSyncRtlWithLocale()` (called once from each app's root `_layout.tsx`) calls
  `I18nManager.allowRTL`/`forceRTL` to mirror the layout when Arabic is active, per
  TECH_ARCHITECTURE §8's "full Arabic-RTL mirroring" requirement. **Note**: `forceRTL`
  only takes visual effect after a reload — in production, follow it with
  `Updates.reloadAsync()` (or a prompt to restart) when the RTL flag actually flips.
- To verify RTL manually: change your device/simulator language to Arabic (or call
  `i18n.changeLanguage("ar")` and reload) — `ScreenLayout`, `Card`, badges, and text
  alignment all flip via RN's automatic RTL layout once `I18nManager.isRTL` is true.

## Screens implemented per app (placeholders, themed, navigable)

All screens use `ScreenLayout`/`ScreenHeader` + the shared primitives, so branding is
consistent across all three apps out of the box.

- **Driver** (`apps/driver/app/`): `index` (Login) → `jobs/index` (My Jobs — mocked list
  with `WorkOrderTypeChip`/`SlaCountdownChip`) → `jobs/[jobId]` (Job Detail).
- **DFP** (`apps/dfp/app/`): `index` (Login) → `dashboard` (**Zone Dashboard** — the
  central PDR §8 surface: performance-summary strip, an urgency banner, and a mocked WO
  queue with New/Return badges + color-coded SLA-countdown chips, district, and stage —
  built to feel like a real, considered operational screen) → `sign-off/[woId]`
  (Delivery Sign-off — recipient name, satisfaction questionnaire, remarks, and a stubbed
  signature-capture area).
- **End Customer** (`apps/end-customer/app/`): `index` (Login / Continue as Guest) →
  `deliveries` (My Deliveries — mocked tracking list with stage + SLA chip) → `profile`
  (Profile / Address Book — mocked addresses with a "Default" badge, plus a stubbed
  preferred-time-window card).

## What's stubbed vs. built

**Built**: monorepo/workspace wiring; shared types mirroring PDR §13; themed component
library + design tokens; i18n with `ar`/`en` + RTL sync; Expo Router navigation trees;
all screens listed above with mocked data, fully themed and bilingual.

**Stubbed (intentionally, for follow-up work)**:
- `api-client` — real request/response shapes await the backend's OpenAPI spec; `BASE_URL`
  is a placeholder; no retry/offline-queue logic yet (TECH_ARCHITECTURE §8 calls for a
  WatermelonDB/SQLite-backed outbox for low-connectivity zones — not yet scaffolded).
- Auth/session persistence (`authApi.login` is called nowhere yet — screens just navigate).
- Push notifications, background location reporting (DFP 5-minute ping), signature capture,
  camera/proof-of-action capture — all noted as `TODO`s at their call sites.
- App icons/splash are 1×1 placeholder PNGs in each `apps/*/assets/` — replace with real
  brand assets (the geometric "D" monogram per PDR §2) before any store submission.

## Verification performed

```bash
cd mobile && npm install        # ✅ installs cleanly (1210 packages; only EBADENGINE
                                #    warnings because this environment has Node 18.17,
                                #    Expo SDK 51 prefers ≥ 20 — upgrade Node for `expo start`)
npm run typecheck               # ✅ `tsc --noEmit` passes with zero errors across
                                #    shared-types, api-client, shared-ui, i18n, driver, dfp, end-customer
npx expo config --type public   # ✅ Expo CLI resolves and validates each app's config
```

All packages/apps use `"strict": true` TypeScript (via `tsconfig.base.json`, extended by
shared packages, and `expo/tsconfig.base` + `"strict": true` in each app).
