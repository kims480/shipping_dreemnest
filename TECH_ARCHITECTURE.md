# Technical Architecture — Dreem Nest Platform

**Status**: Draft v1
**Companion to**: `PDR.md`
**Strategy**: Independent rebuild; migrate off the existing LogesTechs tenant over time (see §10)

---

## 1. Guiding Principles

1. **Modular monolith first, services later.** Start with a single, well-modularized backend organized around clear domain boundaries (Orders/E-Flow, Notifications, Tracking, Accounting/COD, Fulfillment, Problem Management, Identity). This is faster to build and operate with a small team, and each module can be extracted into its own service later if load demands it — without a rewrite, because boundaries are enforced from day one.
2. **One language across the stack.** TypeScript everywhere (backend, web, mobile) — smaller hiring surface in the Riyadh market, shared types/validation between client and server, and a single design system reused across Web and Mobile.
3. **Event-driven where it matters.** The e-flow (stage transitions), SLA timers, notifications, and location pings are naturally asynchronous — model them as events/jobs from the start rather than bolting on queues later.
4. **Data residency & compliance by design.** Saudi PDPL strongly favors keeping personal data within KSA (or at minimum the region); pick infrastructure accordingly (§9).
5. **Bilingual (AR-RTL/EN) and Hero-UI branding are first-class**, not an afterthought — baked into the design-system and i18n architecture from the first component built.

---

## 2. Recommended Technology Stack

| Layer | Recommendation | Why |
|---|---|---|
| **Backend language/framework** | **Node.js + NestJS (TypeScript)** | Strong typing, modular architecture out of the box (maps cleanly to the modular-monolith approach), excellent for I/O-heavy/real-time workloads (notifications, tracking, webhooks), huge regional talent pool |
| **Primary database** | **PostgreSQL** | Strong relational consistency for orders, SLA timers, COD/accounting — the existing system's COD depth (§11.1 of PDR) demands transactional integrity; PostGIS extension gives first-class geospatial queries for nearest-DFP assignment |
| **Cache / queues / real-time pub-sub** | **Redis** (+ **BullMQ** for job queues) | SLA timers, daily-reminder scheduling, location-ping ingestion, notification retries, WebSocket pub-sub backing |
| **Real-time channel** | **WebSocket (Socket.IO) / SSE** | Live e-flow stage updates, SLA countdowns, DFP location, role-scoped tracking views |
| **Web frontend** | **Next.js (React + TypeScript)** | SSR for public tracking/confirmation pages (fast load, good for SMS/WhatsApp link previews), strong i18n/RTL tooling, one React-based design system shared with mobile |
| **Mobile apps** | **React Native (TypeScript, Expo)** | Per your direction — cross-platform; shares types, API client, and much of the design system with the Next.js web app; three apps (Driver, DFP, End Customer) from one codebase with role-based bundles |
| **Search/reporting** | **PostgreSQL read-replicas + materialized views** to start; revisit **OpenSearch** only if/when full-text/cross-entity report search becomes a bottleneck | Avoids early over-engineering — the existing system's ~60 reports are mostly structured aggregations Postgres handles well |
| **Object storage** | **S3-compatible storage** (e.g., AWS S3 or a KSA-region equivalent) | Proof-of-delivery photos, signatures, package images, documents |
| **Maps & geocoding** | **Google Maps Platform** (Distance Matrix, Geocoding, Maps SDK) — strong Arabic-language and Saudi address support; Mapbox as a fallback option | Needed for nearest-DFP assignment, live tracking, address confirmation UX |
| **SMS & WhatsApp** | **Unifonic** (Saudi-based CPaaS, native SMS + WhatsApp Business API + strong KSA deliverability) | Regional reliability and compliance; alternative: Taqnyat or 360dialog for WhatsApp |
| **Email** | **AWS SES** or **SendGrid** | Transactional email at scale with template support |
| **Payments / payouts** | **Moyasar** or **HyperPay** (Saudi payment gateways — mada, Apple Pay, STC Pay support) | Required for SAR billing; integrates with the COD/accounting depth carried over from the existing system |
| **Cloud & data residency** | **AWS Middle East (Bahrain) region**, or **Azure UAE/KSA regions**, or **Google Cloud (Dammam, KSA — STC partnership)** | Pick whichever has the best in-region (or near-region) presence at contract time to satisfy PDPL data-residency expectations; architecture is cloud-agnostic (containerized) so the choice can be deferred |
| **Containers & orchestration** | **Docker + a managed Kubernetes service** (EKS/AKS/GKE) or a simpler managed-container platform (ECS Fargate / Azure Container Apps) for MVP | Keeps the modular monolith deployable as independently-scalable units (API, workers, websocket gateway) without full microservice complexity |
| **CI/CD** | **GitHub Actions** (or GitLab CI) | Standard, well-understood, integrates with containerized deploys |
| **Observability** | **Sentry** (errors) + **Grafana/Prometheus** or a managed APM (Datadog) | SLA-timer accuracy and notification delivery are operationally critical — need first-class monitoring and alerting from day one |

---

## 3. High-Level System Architecture

```
                         ┌─────────────────────────────┐
                         │         Clients             │
                         │  Next.js Web (Admin, DFP,   │
                         │  Merchant, EndCustomer)     │
                         │  React Native (Driver, DFP, │
                         │  EndCustomer apps)          │
                         └──────────────┬──────────────┘
                                         │ HTTPS / WSS
                         ┌──────────────▼──────────────┐
                         │   API Gateway / BFF layer    │
                         │ (NestJS — REST + WebSocket)  │
                         └──────────────┬──────────────┘
        ┌────────────────────┬──────────┴───────────┬─────────────────────┐
        ▼                    ▼                      ▼                     ▼
┌───────────────┐   ┌────────────────┐    ┌──────────────────┐   ┌──────────────────┐
│ Orders/E-Flow │   │  Notifications  │    │ Tracking/Location│   │ Problem Mgmt &   │
│ & SLA module  │   │  module (queue- │    │ module (WebSocket│   │ Ratings module   │
│ (PostGIS for  │   │  driven: SMS/   │    │ gateway + Redis  │   │                  │
│ assignment)   │   │  WhatsApp/Email)│    │ pub-sub)         │   │                  │
└───────┬───────┘   └────────┬────────┘    └────────┬─────────┘   └────────┬─────────┘
        │                    │                       │                      │
┌───────▼───────┐   ┌────────▼────────┐    ┌─────────▼────────┐   ┌─────────▼─────────┐
│ Fulfillment / │   │ Accounting/COD  │    │ Identity & Profile│  │ Integrations      │
│ Warehouse     │   │ module (ledger- │    │ module (multi-   │   │ module (Salla     │
│ module        │   │ style, parity   │    │ persona auth,    │   │ connector, e-comm │
│               │   │ w/ existing sys)│    │ end-customer     │   │ framework)        │
│               │   │                 │    │ address book)    │   │                   │
└───────┬───────┘   └────────┬────────┘    └─────────┬────────┘   └─────────┬─────────┘
        └────────────────────┴───────────┬───────────┴──────────────────────┘
                                          ▼
                         ┌─────────────────────────────┐
                         │   PostgreSQL (+ PostGIS)     │
                         │   Redis (cache/queues/pubsub)│
                         │   S3-compatible object store │
                         └─────────────────────────────┘

  Background workers (BullMQ): SLA-timer ticks, daily reminders, location-ping
  ingestion, notification dispatch/retry, report aggregation, Salla webhook processing
```

This is drawn as a modular monolith with clear internal module boundaries — each box is a NestJS module with its own database schema/tables, communicating in-process via well-defined service interfaces and domain events (an internal event bus). If a module's load outgrows the monolith (most likely candidates: **Notifications** and **Tracking/Location**, given their I/O-bound, bursty nature), it can be extracted into its own deployable service behind the same internal event-bus contract — no API redesign required.

---

## 4. Core Domain Modules (mapped to the PDR)

| Module | Responsibilities | PDR reference |
|---|---|---|
| **Orders / E-Flow & SLA** | WO lifecycle (creation → e-flow stages → closure), New/Return typing, SLA-clock management & breach detection, nearest-DFP assignment engine (PostGIS distance queries against live DFP locations) | PDR §4, §5, §8 |
| **Notifications** | Multi-channel templated dispatch (SMS/WhatsApp/Email/in-app), confirmation-link generation & validation, daily-reminder scheduler with stop-condition logic, admin template management | PDR §6, §7, §11 |
| **Tracking / Location** | WebSocket gateway for live stage/SLA/location updates; role-scoped status projections (Admin/EndCustomer/Merchant views from one shared status model); DFP location-ping ingestion | PDR §6, §8 |
| **Identity & Profile** | Multi-persona auth (Merchant, EndCustomer, Driver, DFP, Admin, Warehouse staff), end-customer address book (multi-address + default), time-window preferences, guest-vs-registered flows | PDR §3, §7 |
| **Fulfillment / Warehouse** | Inbound/Outbound processing, products/bins/stock/cycle-count, parity with the existing Fulfillment Center module | PDR §11.1 |
| **Accounting / COD** | Ledger-style transaction model for COD collection/settlement, invoices, fees, payouts — direct parity target with the existing system's extensive COD/accounting depth | PDR §11.1 |
| **Problem Management & Ratings** | Delay/complaint aggregation & triage, resolution workflow, post-delivery ratings, sign-off + satisfaction-questionnaire storage | PDR §9 |
| **Integrations** | Salla.com connector (webhook ingestion + API), extensible adapter framework for future e-commerce platforms | PDR §5, §11 |
| **Reporting** | The ~60 detailed/summary/admin reports from the existing system, built as parameterized queries/materialized views over the above modules' data | PDR §11.1 |

---

## 5. Data Architecture

- **Single PostgreSQL cluster** (managed service — RDS/Cloud SQL/Azure Database for PostgreSQL) with **PostGIS** enabled for geospatial queries (nearest-DFP matching, zone boundary checks).
- **Schema-per-module** within the same database initially (e.g., `orders`, `accounting`, `fulfillment`, `identity` schemas) — gives modules logical isolation and an easy extraction path to separate databases later, while keeping cross-module joins/transactions simple during MVP (e.g., a WO closure needs to atomically touch Orders, Accounting/COD, and Notifications).
- **Read replicas** for reporting workloads, so the ~60 reports never contend with operational transaction throughput.
- **Event log / outbox table** for the internal domain-event bus — guarantees at-least-once delivery of events like "WO stage changed" or "WO closed" to the Notifications, Tracking, and Problem Management modules without distributed-transaction complexity.
- **Object storage** (S3-compatible) for binary assets (signatures, photos, documents), referenced by URL/key from Postgres records — never stored as blobs in the database.

---

## 6. Real-Time & Event-Driven Architecture

Three asynchronous concerns drive most of the system's complexity — each maps to a well-understood pattern:

1. **SLA timers**: rather than polling, store `sla_deadline` on each WO and run a periodic worker (BullMQ repeatable job, e.g., every minute) that flags WOs crossing risk thresholds (e.g., 80% of SLA elapsed → "at risk", 100% → "breached" → emits a `DelayRecord` event consumed by Problem Management).
2. **Daily reminders**: a scheduled job queries unconfirmed WOs daily, applies the stop-condition policy (confirmed / delivered / max-days reached), and enqueues notification jobs per channel — fully decoupled from the request/response path.
3. **Live tracking & location pings**: DFP/driver mobile apps push location via a lightweight authenticated endpoint (or WebSocket) on the configurable interval (default 5 min); the Tracking module updates Redis-backed "current location" state (not a full history table per ping, to control write volume) and republishes to subscribed WebSocket clients (Admin map view, assignment engine).

All cross-module reactions (e.g., "WO closed → trigger rating prompt + confirmation notification + unlock complaint window") are modeled as **domain events** published to an internal bus (backed by the Postgres outbox + Redis pub-sub), keeping modules loosely coupled and making the eventual extraction of any module into its own service a configuration change rather than a redesign.

---

## 7. Integration Architecture

- **Salla.com connector**: implemented as an adapter behind a generic `EcommerceConnector` interface (methods like `parseIncomingOrder`, `mapToWorkOrder`, `pushStatusUpdate`). Salla webhooks land on a dedicated, authenticated endpoint, get validated/queued, and are transformed into WOs by a background worker — isolating the rest of the system from Salla's API quirks and making it straightforward to add new platforms later without touching core Order logic.
- **SMS/WhatsApp/Email**: a `NotificationProvider` abstraction with per-channel adapters (Unifonic for SMS/WhatsApp, SES/SendGrid for email) so providers can be swapped if deliverability or cost issues arise — all dispatch goes through the queue with retry/fallback policy (e.g., WhatsApp fails → fall back to SMS).
- **Maps/geocoding**: a thin `GeoProvider` abstraction over Google Maps Platform (geocoding for address confirmation, distance/ETA for assignment and tracking) — keeps the door open to Mapbox if pricing/coverage requires a switch.
- **Payments/COD**: integrate a Saudi gateway (Moyasar/HyperPay) for digital payments; the COD module itself is largely an internal ledger system (cash collected by drivers/DFPs, reconciled at hubs) mirroring the existing system's COD reports — this is internal accounting logic, not a third-party integration, but its data model must support the parity report set (§11.1 of the PDR).

---

## 8. Mobile Architecture (React Native)

- **Single React Native (Expo) monorepo**, producing **three app bundles** — Driver, DFP, End Customer — from shared code:
  - Shared: API client (typed, generated from the NestJS OpenAPI spec), design-system components (themed to the Hero UI brand palette, RTL-aware), auth/session handling, push-notification plumbing, offline-queue infrastructure
  - Per-app: role-specific screens and navigation (e.g., DFP gets the SLA dashboard + sign-off form; Driver gets job/navigation/earnings; End Customer gets tracking/profile/address-book/reminders)
- **Offline tolerance**: local queue (e.g., WatermelonDB or a simple SQLite-backed outbox) for actions taken in low-connectivity zones (proof-of-delivery capture, location pings, sign-off forms) — synced on reconnect.
- **Location services**: background location reporting on the configurable interval, with adaptive throttling (less frequent when the DFP/driver is stationary) to manage battery impact — a risk flagged in the PDR (§19).
- A **shared TypeScript package** (types, validation schemas via Zod, API client) is consumed by both the Next.js web app and the React Native apps — single source of truth for data contracts.

---

## 9. Web Architecture (Next.js)

- A single Next.js application with **role-based routing/bundles** rather than separate apps per persona — simpler to operate, and the personas share substantial UI (auth, notifications, design system):
  - `/admin/*` — HQ Admin console (Problem Management, SLA/template/config, reports, COD accounting)
  - `/dfp/*` — DFP web dashboard
  - `/merchant/*` — Merchant portal (Salla connection, direct WO creation, e-flow tracking)
  - `/track/*`, `/confirm/*`, `/rate/*`, `/complaint/*` — public, link-driven End Customer pages reached via notification channels (SSR for fast load and good link-preview behavior on WhatsApp/SMS)
  - `/warehouse/*` — Warehouse staff console
- **i18n**: built on `next-intl` (or equivalent) with full AR-RTL and EN support from the first page built — not retrofitted.
- **Design system**: a themed component library (buttons, cards, badges incl. SLA-status and New/Return chips, tables, forms) built once in the brand palette (§2 of the PDR) and shared conceptually (and via the shared TS package's tokens) with the React Native apps.

---

## 10. Migration Strategy: Independent Rebuild, Phased Cutover from LogesTechs

Per your direction (full independent rebuild, migrate off LogesTechs over time), the recommended path avoids a risky "big-bang" cutover:

1. **Phase 0 — Parity audit & data export**: before/while building, obtain a full data export (or API-based extraction via the LogesTechs Postman API collection found at their workspace) of historical shipments, COD records, customer/recipient data, and fulfillment records — this both de-risks the parity checklist (PDR §11.1) and seeds the new system's database.
2. **Phase 1 — Build & run in parallel**: launch the new Dreem Nest platform for **new** Work Orders (starting with one pilot zone), while the LogesTechs system continues handling in-flight orders created before cutover. A thin reconciliation job keeps shared reference data (zones, customers, COD ledgers) in sync during the overlap window.
3. **Phase 2 — Zone-by-zone cutover**: extend the new platform zone by zone (matching the PDR's pilot → full-rollout plan), redirecting new-order intake (Salla webhooks, merchant portal) to Dreem Nest as each zone goes live, while the old system "drains" its remaining open orders.
4. **Phase 3 — Historical data migration**: once no open orders remain on the old system, migrate historical/archival data (for reporting continuity — many of the existing "Archived..." reports in §11.1) into the new system's reporting schema.
5. **Phase 4 — Decommission**: retire the LogesTechs tenant once parity is confirmed in production and the migration window has closed (retain an export/archive for compliance/audit purposes).

This phased approach means the business never stops operating, risk is contained to one zone at a time, and the parity checklist (§11.1) becomes the acceptance criteria for each zone's cutover rather than a single high-stakes go-live.

---

## 11. Security & Compliance Architecture

- **Auth**: JWT-based session auth with refresh tokens; separate scopes/roles per persona (Merchant, EndCustomer, Driver, DFP, Admin, Warehouse); OAuth2/social login optional for End-Customer registration to reduce friction
- **Tokenized confirmation links**: short-lived, single-use, cryptographically signed tokens (JWT or HMAC-signed opaque tokens) embedded in SMS/WhatsApp/Email links — validated server-side with expiry and replay protection
- **PDPL compliance**: personal data (names, phone numbers, addresses, national location) encrypted at rest; data-residency satisfied by choosing an in-region (or designated-adequate) cloud provider (§2); access-logging on all PII reads for audit
- **Payment/COD security**: PCI-relevant data never touches Dreem Nest servers directly — handled via the payment gateway's hosted fields/tokenization; internal COD ledger stores only transaction references and amounts
- **WhatsApp Business API compliance**: template pre-approval workflow built into the admin template-management UI, respecting Meta's policy on business-initiated conversations

---

## 12. Phased Build Roadmap (aligned to PDR §17 & §20)

1. **Foundation** (Sprints 1-3): NestJS modular-monolith skeleton, Postgres+PostGIS schema for Orders/Identity, auth, Next.js shell with i18n/RTL + Hero UI design-system foundation, CI/CD pipeline, observability baseline
2. **Core E-Flow & SLA** (Sprints 4-6): WO creation (direct + Salla webhook stub), New/Return e-flow stage machine, SLA engine & breach detection, nearest-DFP assignment (PostGIS), zone/DFP management
3. **Notifications & End-Customer Experience** (Sprints 7-9): multi-channel notification module (SMS/WhatsApp/Email via Unifonic+SES), confirmation-link flow, address book/time-window preferences, daily-reminder engine, public tracking pages
4. **DFP & Driver Mobile** (Sprints 10-12): React Native DFP app (dashboard, location ping, sign-off+questionnaire) and Driver app (job receipt, navigation, proof-of-action)
5. **Problem Management, Ratings & Reporting** (Sprints 13-14): complaint/delay aggregation & triage, rating capture, initial report set
6. **Parity Modules** (Sprints 15-18, can run partly in parallel): Fulfillment/Warehouse module, Accounting/COD ledger & reports, remaining detailed/summary reports — sized against the §11.1 checklist
7. **Pilot Launch** (per PDR §20): one zone live in parallel with LogesTechs; iterate based on real SLA/notification/assignment data
8. **Full Rollout & Migration** (per §10 above): zone-by-zone cutover, historical data migration, decommission
