# Product Design & Requirements Document (PDR)
# Dreem Nest — Riyadh Delivery & Fulfillment Platform

**Status**: Draft v1
**Owner**: Dreem Nest Product/Engineering
**Location**: Riyadh, Kingdom of Saudi Arabia

---

## 1. Overview & Problem Statement

Dreem Nest is a delivery and fulfillment platform headquartered in Riyadh, Saudi Arabia, built to serve merchants, e-commerce sellers, and their end customers across the Riyadh market with both **last-mile delivery** and **fulfillment (warehouse-based) delivery**, on **Web and Mobile**.

This PDR defines the **next-generation Dreem Nest platform** — a rebuild that:
1. **Replaces the current operational system** (a white-label Logestechs deployment at `admin-pro.logestechs.com/dreem nest`) with full feature parity (see §11.1 Feature-Parity Checklist), and
2. **Extends it** with a set of newly-specified capabilities centered on a transparent, warehouse-routed e-flow, strict SLA discipline, zone-based dispatch through Delivery Focal Points (DFPs), a rich end-customer experience (multi-channel notifications, profile/address management, sign-off & satisfaction capture, ratings, complaints), and a closed-loop Problem Management system.

**Vision**: Make Dreem Nest the most *transparent and accurate* delivery & fulfillment partner in Riyadh — every stakeholder (merchant, recipient, operator, admin) always knows exactly where an order is, when it will arrive, and can resolve issues quickly when something goes wrong.

**Goals**:
- Operational excellence: meet a 48-hour default SLA across the full pickup → warehouse → delivery e-flow
- Recipient accuracy: minimize failed/delayed deliveries via address confirmation, time-window preferences, and proactive reminders
- Multi-stakeholder transparency: the same order status is visible (in role-appropriate form) to Admins, End Customers, and Merchants
- Closed-loop quality: every delay and complaint is captured, triaged, and resolved through a single Problem Management system
- Bilingual by design: full Arabic (RTL) and English support across every surface and notification channel

---

## 2. Brand & Visual Design Direction

**Brand**: Dreem Nest — logo is a geometric "D" monogram combining a deep purple stroke and a lime/chartreuse-green accent, paired with a bold, modern wordmark ("DREEM NEST").

**Recommended palette roles**:
| Role | Color | Usage |
|---|---|---|
| Primary (chrome/navigation/CTA) | Deep purple (~#4B2E6F) | App bars, primary buttons, active nav states, key headings |
| Accent (highlights/success/badges) | Lime/chartreuse green (~#B5D335) | Success states, "Completed"/"On-time" badges, progress highlights, secondary CTAs |
| Neutral backgrounds | Off-white / light neutrals | Content areas, cards, tables — keeps dense operational data readable |
| Status colors (semantic, layered on the above) | Amber/red/green | SLA countdown states (on-track / at-risk / breached), New vs. Return badges |

**Visual direction — "Hero UI"**: bold hero-section-led layouts on customer-facing surfaces (landing/tracking pages), confident typographic hierarchy, card- and section-based dashboards for operational surfaces (Admin/DFP/Merchant), generous whitespace, and a componentized design system (buttons, badges, cards, tables, forms, status chips) consistently themed in the brand palette — applied uniformly across Web and Mobile, with full Arabic-RTL mirroring.

**Accessibility note**: the lime-green accent is bright; pair it with sufficiently dark text/backgrounds to maintain WCAG AA contrast, and reserve it for accents/highlights rather than large text blocks or body backgrounds.

---

## 3. Target Users & Personas

| Persona | Description | Primary Surface |
|---|---|---|
| **Merchant / Store Owner** | Creates Work Orders directly or via a connected e-commerce platform (e.g., Salla.com); tracks order progress and outcomes | Web portal |
| **End Customer / Recipient** | Receives "New" deliveries or is the source of "Return" pickups; may register a profile; confirms info, tracks shipments, signs off, rates, complains | Web (links/tracking) + Mobile app |
| **Driver (Courier)** | Executes pickup and delivery legs of the e-flow under DFP/dispatch direction | Mobile app |
| **Delivery Focal Point (DFP)** | Zone-level operator (in-house person or 3rd-party subcontractor), default 1 per zone; manages the zone's WO queue, assigns drivers, captures delivery sign-off | Web + Mobile dashboard |
| **Dispatch / HQ Admin** | Oversees all zones, configures SLA/notifications/assignment rules, manages integrations & onboarding, resolves problems, runs reports | Web admin console |
| **Warehouse / Fulfillment Staff** | Executes Inbound/Outbound stages of the e-flow for both New and Return orders; manages stock, bins, cycle counts | Web warehouse console |

---

## 4. Geography & Zone Model

- **HQ**: Riyadh, Saudi Arabia
- **Launch zones**: exactly **4** — North Riyadh, West Riyadh, East Riyadh, South Riyadh — each independently configurable for capacity, pricing, and staffing
- **Delivery Focal Point (DFP)**: each zone has **one default DFP** (extensible to more as volume grows); a DFP may be an in-house employee or a contracted 3rd-party subcontractor
- **Nearest-DFP assignment**: incoming Work Orders are matched to the DFP geographically nearest to the end customer's confirmed location, using the DFP's most recent reported location (see §8)
- **Cross-zone edge cases**: orders near a zone boundary should be assignable to the nearest DFP regardless of formal zone lines, with admin override capability
- **Warehouse placement**: MVP assumes a **single centralized HQ warehouse** serving all 4 zones (simplest to operate, lowest infrastructure cost); Phase 2 evaluates **per-zone warehouse hubs** to reduce cross-zone transit time and SLA risk as volume grows
- **Expansion template**: the zone model (zone → DFP → drivers, with its own SLA/capacity config) is designed to be replicated for future cities/regions beyond Riyadh

---

## 5. Order Intake, WO Types & the Warehouse-Centric E-Flow

### 5.1 Intake paths
1. **E-commerce integration**: merchants connect their store (e.g., **Salla.com**, with an extensible connector framework for future platforms) via API/webhook; orders flow in automatically as Work Orders
2. **Direct merchant trigger**: store owners create a Work Order directly through the merchant portal

### 5.2 Work Order (WO) data contract
Each WO carries (at minimum):
- End customer: name, phone, Saudi National address/location (pre-filled by default — see §7)
- Package/order details (description, quantity, value, special handling notes)
- **Type badge**: `New` or `Return` (see below)
- `created_at` timestamp and **`sla_deadline`** (default `created_at + 48 hours`, admin-adjustable globally and per-WO)
- Linked merchant/store and (if applicable) source integration

### 5.3 WO type badge — New vs. Return
Every WO is explicitly typed and visually badged (in DFP dashboards, tracking views, and reports):
- **New** — deliver an item *to* the end customer
- **Return** — collect an item *from* the end customer (to send back to the store/retail origin)

### 5.4 The warehouse-centric e-flow

**New WO e-flow**:
`WO Creation → Pickup from Store/Retail → Warehouse Inbound → Warehouse Outbound → Out for Delivery → (End-customer sign-off & questionnaire) → Closed`

**Return WO e-flow**:
`WO Creation → Pickup from End Customer → Warehouse Inbound → Warehouse Outbound → Out for Delivery (back to Store/Retail) → Closed`

| Stage | Owning Actor | Notes |
|---|---|---|
| WO Creation | System / Merchant | Triggers SLA clock start, end-customer notification |
| Pickup (from Store or from End Customer) | Driver / DFP | Proof-of-pickup capture |
| Warehouse Inbound | Warehouse staff | Scan-in, condition check, bin assignment |
| Warehouse Outbound | Warehouse staff | Scan-out, routing to destination zone/DFP |
| Out for Delivery | Driver / DFP | Final-mile leg to recipient or back to store |
| Sign-off & Questionnaire (New only, at delivery) | DFP | Closes the WO, triggers confirmation + rating flows |
| Closed | System | Final state; opens rating/complaint window |

Every stage is a **trackable, timestamped status** with an owning actor, and **counts against the WO's SLA clock** — the 48-hour target spans the entire flow, not just the final delivery leg. Stage slippage beyond expected thresholds raises a **delay record**, which feeds the Problem Management system (§9).

---

## 6. Cross-Stakeholder Tracking & Visibility

A **single shared status model** (the e-flow stages above) is surfaced through three role-scoped views, so Admins, End Customers, and Merchants are always looking at the same underlying truth, presented at the right altitude for each:

| View | What it shows |
|---|---|
| **Admin** | Full e-flow detail, SLA countdowns, exceptions/delay flags, cross-zone aggregate view |
| **End Customer** | Simplified stage tracker (e.g., "Picked up → At warehouse → Out for delivery → Delivered"), push/SMS/WhatsApp notifications at key transitions |
| **Merchant / Store Owner** | Per-WO status plus an aggregate view of all their orders' progress, delays, and outcomes |

Stage names and all surrounding copy are maintained bilingually (Arabic RTL + English) and kept consistent across all three views and all notification channels.

---

## 7. End-Customer (Recipient) Experience

This is a deliberate differentiator for Dreem Nest — most of the operational risk in last-mile delivery comes from inaccurate recipient data, so the platform invests heavily in getting it right *before* a driver is dispatched.

- **Multi-channel notification on WO receipt**: the moment a WO is created, the end customer is notified via **SMS, WhatsApp, and Email** simultaneously, each containing a secure, tokenized **confirmation link**
- **Confirmation flow**: the link lets the recipient confirm or update their **location, phone, and email** before delivery is attempted. The system **defaults to the Saudi National address on file**; the recipient must explicitly **confirm or edit** it
- **Daily reminder notifications**: until the recipient confirms/updates their info, they receive a **recurring daily reminder** (multi-channel) for that pending WO. Stop conditions (admin-configurable policy): reminders cease once the recipient confirms, once the WO is delivered/closed, or after a maximum number of days (default suggestion: stop after 5 days or on first response, to balance accuracy against notification fatigue)
- **Guest vs. registered profile**: recipients can act as guests (one-off confirmation) or **register a profile** to streamline future deliveries — registration is incentivized by faster checkout, saved preferences, full delivery history, and tracking
- **Address book**: registered recipients can store **multiple delivery addresses**, and must designate **exactly one as the default**
- **Preferred delivery time window**: recipients can select and persist a **preferred delivery time window** on their profile, which the dispatch/assignment engine takes into account when scheduling the final-mile leg
- **Stage-by-stage tracking**: recipients can track their shipment through the simplified stage view (§6) on web or mobile
- **Delivery confirmation notification**: once the DFP closes the WO (after sign-off & questionnaire), the recipient receives a **delivery-confirmation notification**
- **Post-delivery rating**: the recipient receives a **web rating interface** to rate their delivery experience for that specific WO
- **Complaints**: recipients can **raise a complaint** at any point — mid-delivery (e.g., delay) or post-delivery (e.g., DFP attitude, poor package handling) — and can see the status of their complaint through to resolution

---

## 8. Delivery Focal Point (DFP) Operations

- **Dashboard (Web + Mobile)**: a single operational view of the zone's WO queue, showing for each WO:
  - **New / Return badge**
  - **Live SLA countdown** (color-coded: on-track / at-risk / breached)
  - Current e-flow stage
  - Assignment & status-update controls (assign to driver, mark stage transitions, escalate)
  - A performance summary view (on-time rate, volume, satisfaction trend)
- **Notifications**: DFPs receive **system + SMS notifications** when a WO is newly assigned to them or when there's a relevant update; **all notification templates are customizable by the system admin** (so HQ can adjust tone, language, and content without engineering changes)
- **Live location reporting**: the DFP mobile app reports the DFP's current location on a **default 5-minute interval** (admin-configurable), which feeds the nearest-DFP assignment engine (§4)
- **End-customer sign-off & satisfaction capture**: at the point of delivery, the DFP interface presents a **sign-off form** that captures:
  - The end customer's confirmation/signature that the delivery occurred
  - A short **satisfaction questionnaire** (satisfied / not satisfied) with an optional **free-text remarks** field
  - Submitting this form **closes the WO**, which in turn triggers the recipient's delivery-confirmation notification and rating prompt

---

## 9. Problem Management

A centralized, admin-facing **Problem Management Interface** aggregates every recorded **delay** (SLA breaches, stage slippage flags) and every **complaint** (in-flight or post-delivery, including DFP-attitude or package-handling issues) into a single triage queue.

Capabilities:
- Categorize each problem record (delay type, complaint type, severity)
- Assign ownership (DFP / zone / warehouse / HQ) for resolution
- Track resolution status and time-to-resolution against an internal SLA
- Link every problem record back to its originating WO and the specific e-flow stage where it arose
- Surface analytics on recurring patterns (e.g., "Zone X has 3x the delay rate of other zones during Outbound", "DFP Y has a below-average satisfaction questionnaire score")

---

## 10. Core User Flows

**Merchant**: connect Salla store (or create a direct WO) → monitor e-flow progress for their orders in the merchant portal → review delay/complaint outcomes affecting their orders

**End Customer — New WO**: receive multi-channel notification → confirm/update location, contact info, and preferred time window (optionally register a profile) → receive daily reminders until confirmed → track the shipment stage-by-stage → complete sign-off + satisfaction questionnaire at delivery → receive confirmation notification → rate the experience → optionally raise a complaint

**End Customer — Return WO**: receive notification of a pickup request → confirm/update pickup info → track the item's journey back through the warehouse to the store → receive confirmation once closed

**Driver**: go online → receive a job (New or Return, with full context) from the DFP or auto-dispatch → execute the pickup or out-for-delivery leg within the SLA window and the recipient's preferred time window → capture proof of action → get paid

**Warehouse Staff**: receive Inbound scans for arriving items (New pickups or Return collections) → process/condition-check/bin → trigger Outbound when ready for the next leg → hand off to the DFP/driver

**DFP**: open the SLA-aware dashboard → see assigned WOs with type badges and countdowns → manage assignment to drivers → execute/oversee the delivery or pickup → capture sign-off & questionnaire → close the WO

**HQ Admin**: configure SLA defaults/overrides, notification templates, DFP location-ping interval, and reminder policy → manage zones, warehouse operations, and integrations → onboard DFPs/drivers/merchants → triage and resolve items via the Problem Management Interface → run reports

---

## 11. Functional Requirements

Grouped by module:

- **Integrations**: Salla.com connector (webhook/API ingestion), extensible e-commerce connector framework for future platforms, direct merchant WO-creation portal
- **Notifications**: multi-channel (SMS / WhatsApp / Email / in-app system) templated messaging; admin-managed, bilingual templates; secure tokenized confirmation links with expiry; a **daily reminder engine** with configurable cadence and stop conditions; stage-transition alerts; delivery-confirmation and rating-prompt triggers; channel retry/fallback
- **End-customer profile & address book**: self-registration, multiple saved addresses with exactly one default, national-address pre-fill with confirm/edit workflow, preferred time-window storage, stage-tracking view, complaint submission & history, rating submission
- **SLA engine**: 48-hour default timer spanning the entire e-flow (not just final delivery), globally and per-WO admin-adjustable defaults/overrides, live countdown surfaced on the DFP dashboard, automatic breach detection feeding Problem Management
- **Assignment engine**: nearest-DFP matching using end-customer confirmed location vs. most recent DFP-reported location; configurable DFP location-ping interval (default 5 minutes); cross-zone override capability
- **Warehouse operations**: Inbound/Outbound processing for both New and Return flows, scan-in/scan-out, condition checks, bin assignment, stock/cycle-count management, handoff to DFP/driver
- **DFP operational interface**: SLA- and badge-aware WO queue, assignment tools, delivery sign-off + satisfaction-questionnaire capture, performance view
- **Cross-stakeholder tracking**: shared e-flow status model exposed through three role-scoped views (Admin / End Customer / Merchant)
- **Problem Management Interface**: delay & complaint aggregation, categorization, assignment, resolution tracking, pattern analytics
- **Booking & quoting**: address input (Saudi formats), package/order details, pricing engine, scheduling that respects confirmed time windows
- **Real-time tracking**: live status and (where applicable) live location, on Web and Mobile
- **Payments & payouts**: SAR billing, ZATCA-compliant e-invoicing, driver/DFP payout and commission handling, subcontractor settlement, **and full COD (cash-on-delivery) accounting** (see §11.1 — this is a major existing-system capability that must be preserved)
- **Ratings & complaints**: post-delivery rating capture, complaint intake/routing/resolution workflow for both in-flight and post-delivery issues
- **Admin / ops dashboard**: zone management, integration management, SLA/template/interval/reminder configuration, onboarding & verification, analytics and reporting

### 11.1 Feature-Parity Checklist (baseline from the existing system)

The current operational system (`admin-pro.logestechs.com/dreem nest`, a white-label Logestechs deployment) already runs a broad, mature logistics back-office. **All of the following must be available in the new system** — captured here from a direct walkthrough of its navigation, grouped by area:

**Dashboard & live operations**
- Live operational dashboard: shipment-status counters (Submitted, Ready for dispatching, Picked, Returned by recipient, Postponed delivery, Completed), live map with hub/city/driver filters and route view, driver list with package counts and on-time %

**Shipment management**
- Manage Shipments: Receiving packages, Swapped packages, Pickup packages, Delivered, In-car shipment, Delivered to sender
- Manage Returned (shipment side): Receiving at sorting center, Brought, Delivered, Swapped, Transferred out, Exported by a third party, Pending pickup

**Fulfillment Center (full warehouse module)**
- Fulfillment dashboard
- Manage Fulfillment Orders: Created, Pending items, Picked, Packed, Returned, Cancelled, Follow-ups
- Manage Warehouses, Manage Warehouse Stocks, Cycle Count
- Manage Products, Manage Bins, Inbound, Inventory Items, Reported Item Issues
- Fulfillment accounting: Additional Services, Fulfillment Rates, ASN Fees, Storage Fees, Order Fees, Invoices
- Manage Returned (fulfillment side): Rejected, Returned, Damaged-location tracking, Damaged Items Management
- Fulfillment reports: SKU Movements, Low Stock Items, Inbound/Outbound Report

**Drivers, vehicles, branches, users**
- Manage Vehicles, Manage Users, Branches
- Drivers Reports, Drivers Custody Reports, Hubs Reports, Active Customers Report
- Drivers Earnings, Private Drivers Earnings, Drivers Earnings Report

**Partners & third-party management**
- Logestechs Partners: Partner Evaluations, LSN, Unreviewed-partner COD report
- Third-party Management: Third party, Accounting, Third-party Evaluation, Smart Shipping Rules
- Marketplace, Printed Reports

**Accounting & COD (cash-on-delivery) — extensive**
- Receive COD, Sort COD, Exported COD, Invoices, Delivered COD, Mass COD reports, In-car COD, COD mismatch, Delayed COD report
- Expenses, Financial Report, Shipping Rates, Pricing Table, Profit Report, Additional Fees
- COD Reports (admin): Financial uncollected COD packages, All COD reports, Future COD reports, COD with customer reports, COD-at-hand reports, Received COD without custody

**Administration**
- Manage Zones, Manage Recipients, Shipping Lines, Manage Cost Collection Methods
- Account Settings, Manage Partner, Manage Labels, Warehouse Logs, Company Settings, Company Configurations

**Reports — detailed**
- Customer Packages, Salesperson Monthly, Idle Customers, Driver Packages, Delayed Packages, Packages Delivery, Undelivered Packages, Time-Bound Packages, Drivers Communication Attempts, Revenue, Customer Balance, Drivers Evaluation, Delivery Attempts, Packages Per Service Type

**Reports — summary**
- Total Customer Packages, Total Delivered Packages by Driver, Total Packages by Origin/Destination City, Delivered/Undelivered COD Sum by Destination City, Total Undelivered Packages/Customers Packages by Destination City, Delivery Performance, Sales, Daily Hub Status

**Reports — administrative**
- Average Customer Delivery Time, Customer Activity, Archived Shipments, Archived Mass COD Reports

**Notifications & Knowledge Center**
- In-app notifications; Knowledge Center (Guidance, Resources, FAQs)

> **Parity principle**: every module above must have an equivalent (ideally improved) capability in the new Dreem Nest system. Where the new platform's e-flow/SLA/DFP/Problem-Management model supersedes an old workflow (e.g., the old "Manage Shipments" + "Manage Returned" screens), the new system should *subsume* that functionality within the new model rather than dropping it — the underlying operational data (COD accounting, fulfillment orders, reports, etc.) must remain fully available.

---

## 12. Non-Functional Requirements

- **Bilingual**: full Arabic (RTL) and English support across Web, Mobile, and every notification channel (SMS/WhatsApp/Email/in-app), including all admin-customizable templates
- **Scalability**: architecture supports adding zones/cities, e-commerce integrations, warehouse hubs, and DFPs per zone without redesign
- **Reliability**: uptime appropriate for a logistics-critical, notification-dependent system; SLA-timer accuracy and timely breach alerts
- **Performance**: handles location pings at ~5-minute intervals at scale, real-time tracking updates, and notification delivery (including daily batch reminders) without degradation
- **Security & compliance**: Saudi PDPL (personal data protection), secure tokenized confirmation links with expiry, integrity of signature/questionnaire records, payment-data security, ZATCA e-invoicing compliance, WhatsApp Business API policy compliance, sensible rate-limiting/anti-spam design for daily reminders
- **Brand-consistent, accessible UI**: the Hero UI design system (§2) applied consistently, meeting WCAG AA contrast standards despite the bright accent color

---

## 13. High-Level Data Model Sketch

**Core entities**:
- `Merchant` / `Store`, `Integration` (e.g., Salla connection)
- `WorkOrder` (type: New/Return; current_stage; sla_deadline; status)
- `EFlowStage` (ordered, timestamped, per-WO: stage name, owning actor)
- `EndCustomer` / `Recipient` (guest or registered)
- `Address` (multiple per recipient, `is_default` flag)
- `TimeWindowPreference`
- `Zone`, `Warehouse`, `DFP` (incl. live location & ping interval), `Driver`
- `NotificationLog` / `NotificationTemplate` (incl. daily-reminder schedule & state)
- `DeliveryConfirmation` (signature + questionnaire responses + remarks)
- `Rating`, `Complaint` / `DelayRecord` → `ProblemRecord` (category, linked stage, owner, resolution status)
- `Payment` / `CODTransaction` (reflecting the existing system's extensive COD accounting model)
- Fulfillment-specific: `FulfillmentOrder`, `Product`, `WarehouseStock`, `Bin`, `InventoryItem`

**Key relationships**:
- `WorkOrder` ↔ ordered `EFlowStage`s ↔ `Warehouse` / `DFP` / `Driver` / `Merchant` / `EndCustomer`
- `WorkOrder` ↔ `EndCustomer` ↔ `Address`(es) / `TimeWindowPreference`
- `WorkOrder` ↔ `Zone` ↔ nearest-`DFP` ↔ `Driver`
- `WorkOrder` ↔ `DeliveryConfirmation` ↔ `Rating` / `Complaint`
- `Complaint` / `DelayRecord` ↔ `ProblemRecord` (Problem Management)
- `sla_deadline` and SLA-clock state attached to `WorkOrder`, spanning all stages

---

## 14. API Surface (high-level)

Endpoint groups:
- **Auth** (all personas)
- **Merchants & Integrations** (Salla connector, webhook ingestion, store management)
- **Work Orders** (creation, type, stage transitions, SLA fields)
- **E-Flow / Stage Updates** (pickup, warehouse inbound/outbound, out-for-delivery)
- **Notifications** (multi-channel dispatch, template management, reminder scheduler)
- **End-Customer** (profile, addresses, time-window preferences, complaints, ratings)
- **Zones & Warehouse Ops** (zone config, warehouse/bin/stock management)
- **DFP Ops** (WO queue, location ping, sign-off & questionnaire capture)
- **Tracking** (role-scoped status views for Admin / End Customer / Merchant)
- **Payments & COD** (billing, payouts, COD accounting — reflecting the existing system's depth)
- **Driver Ops** (job assignment, status updates, proof-of-action capture)
- **Problem Management** (delay/complaint triage, assignment, resolution)
- **Admin** (SLA config, notification templates, assignment-interval & reminder-policy config, reporting)

**Real-time channels** (WebSocket/SSE): e-flow stage transitions, SLA countdowns, zone WO queues, DFP location updates, role-scoped tracking views.

---

## 15. Platform Strategy: Web vs. Mobile

| Surface | Web | Mobile |
|---|---|---|
| HQ Admin | ✅ Full console (incl. Problem Management, SLA/template/interval/reminder config, all reports & COD accounting) | — |
| DFP | ✅ Dashboard | ✅ App (dashboard, location auto-ping, sign-off & questionnaire capture) |
| Merchant | ✅ Portal (Salla connection, direct WO creation, e-flow tracking for their orders) | — (Phase 2 candidate) |
| End Customer | ✅ Confirmation / tracking / rating / complaint pages (reached via notification links) | ✅ App (profile, address book, time-window preferences, tracking, daily-reminder inbox) |
| Driver | — | ✅ App (job receipt, navigation, proof of action, earnings) |
| Warehouse Staff | ✅ Console (inbound/outbound scanning, stock, bins, cycle counts) | — |

All surfaces share a common backend/API and the same status model; all are themed per the Hero UI brand direction (§2), fully RTL-aware, and tolerant of low-connectivity conditions for drivers/DFPs/warehouse scanning (offline queuing with sync-on-reconnect).

---

## 16. Competitive Landscape (brief)

Dreem Nest competes with regional players such as **Mrsool**, **Aramex/SMSA**, and **Salla's own shipping partners** — and, critically, with the **status quo of its own current system**. Its differentiation is:
- **Full e-flow transparency** to all three stakeholder types (not just internal ops)
- **SLA discipline spanning the entire warehouse + last-mile journey**, not just the final leg
- **Nearest-DFP dispatch** for faster, more localized service
- **A genuine closed feedback loop**: confirmation → sign-off & satisfaction capture → rating → complaint resolution, all linked back to the originating order and stage
- **Parity-plus**: retains the operational depth (COD accounting, fulfillment center, extensive reporting) the business already relies on, while modernizing the experience for every stakeholder

---

## 17. Scope: MVP vs. Future Phases

**MVP** (Riyadh launch):
- All 4 zones live (North/West/East/South Riyadh), each with its DFP
- New + Return e-flows running through a single centralized HQ warehouse
- Salla.com integration plus direct merchant WO creation
- 48-hour SLA engine with admin-configurable overrides and breach detection
- Multi-channel notifications (SMS/WhatsApp/Email) including the daily reminder engine
- Nearest-DFP auto-assignment with 5-minute (configurable) location pinging
- DFP dashboard with SLA countdowns, New/Return badges, sign-off & satisfaction-questionnaire capture
- Cross-stakeholder tracking views (Admin / End Customer / Merchant)
- Problem Management Interface
- End-customer profile, address book, time-window preferences, ratings, and complaints
- **Full feature parity** with the existing system's core operational modules (shipment management, fulfillment center, COD accounting, reporting) — see §11.1
- Hero UI brand rollout across all surfaces

**Phase 2+**:
- Per-zone warehouse hubs (reducing cross-zone transit and SLA risk)
- Broader fulfillment/inventory capabilities beyond MVP parity
- Additional e-commerce integrations beyond Salla
- Expansion beyond Riyadh, replicating the zone/DFP model
- Route optimization and advanced analytics on SLA, satisfaction, and problem trends
- Merchant mobile app

---

## 18. Success Metrics

- **SLA compliance rate** across the full e-flow (% of WOs delivered within the 48-hour target / adjusted target)
- **Stage-to-stage cycle times** (e.g., Inbound → Outbound dwell time, Pickup → Inbound transit time)
- **Notification confirmation rate** and **daily-reminder response rate**
- **Delivery accuracy / first-attempt success rate**
- **Average DFP-to-recipient assignment distance**
- **Sign-off questionnaire satisfaction %**
- **Average post-delivery rating**
- **Problem-record volume and time-to-resolution**
- **Registered-profile adoption rate**
- **Migration success**: % of existing-system features and operational data successfully carried over with no loss of capability

---

## 19. Risks & Open Questions

- **Centralized vs. per-zone warehouse trade-off**: a single HQ warehouse is simpler and cheaper to launch but may strain the 48-hour SLA for zones farther from it — needs validation against real Riyadh transit-time data
- **WhatsApp Business API**: approval timeline, cost, and deliverability need to be confirmed early, as the entire confirmation/reminder flow depends on it
- **SMS gateway reliability** in the Saudi market — needs a vetted provider with strong delivery rates
- **Daily-reminder fatigue**: recurring notifications risk annoying recipients — the stop/cap policy (proposed default: stop after confirmation, delivery, or 5 days) should be tuned based on early data and allow opt-out
- **GPS/battery impact**: 5-minute location pings from DFP devices need to be balanced against battery drain — consider adaptive intervals (e.g., less frequent when idle)
- **DFP/subcontractor SLA enforcement**: contractual and operational mechanisms are needed to hold 3rd-party DFPs accountable across a multi-stage e-flow they don't fully control
- **Sign-off vs. later-complaint conflicts**: a recipient may sign off as "satisfied" and later complain — the system needs a clear policy for handling such conflicting signals
- **Salla API contract changes**: the integration must be resilient to upstream API/webhook changes
- **Fraud/abuse**: guest WOs, ratings, and complaints all present potential abuse vectors that need basic safeguards
- **Brand accent-color accessibility**: the lime-green accent must be applied carefully to maintain contrast/accessibility standards

---

## 20. Milestones & Rough Timeline

1. **Discovery** — finalize SLA/assignment parameters against real operational data; confirm WhatsApp/SMS provider selection; validate the existing-system feature inventory (§11.1) against live data exports
2. **MVP Build** — zones & DFP model, warehouse e-flow (New & Return), SLA engine, nearest-DFP assignment & location pinging, multi-channel notifications incl. daily reminders, sign-off & questionnaire capture, cross-stakeholder tracking views, Problem Management Interface, ratings & complaints, and the full feature-parity baseline (§11.1), all themed in the Hero UI brand system
3. **Pilot** — launch in 1–2 zones to validate SLA achievability, notification effectiveness, and DFP operations
4. **Full Rollout** — all 4 Riyadh zones live
5. **Phase 2** — per-zone warehouse hubs, broader fulfillment capabilities, additional integrations, advanced analytics
6. **Expansion** — replicate the zone/DFP model beyond Riyadh


# Whatsapp Integration
whatsapp integration will be via wapilot.net
API Token: 5rFF5Tiiz8SE0OJAh50NhbacHaProX1cU0W2vkFS0S

exapmle for message sending 
curl -X POST "https://api.wapilot.net/api/v2/INSTANCE_ID/send-message" \ -H "token: YOUR_API_TOKEN" \ -H "Idempotency-Key: send-text-001" \ -H "Content-Type: application/json" \ -d '{"chat_id":"201001234567","text":"Hello from API v2"}'

API Endpoints
https://api.wapilot.net/api/v2


GET
List API instances
Returns API-enabled instances available to the authenticated token.

Endpoint
https://api.wapilot.net/api/v2/instances
Request Headers
Header	Required	Description
token	Yes	Your API token.