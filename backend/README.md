# Dreem Nest — Backend

NestJS modular-monolith API for the Dreem Nest courier & fulfillment platform
(see `../PDR.md` and `../TECH_ARCHITECTURE.md` for the full spec).

## Stack

- NestJS 11 + TypeScript
- PostgreSQL + PostGIS (geospatial nearest-DFP queries) via TypeORM
- Redis + BullMQ (SLA sweeps, daily reminders, notification dispatch, DFP location pings)
- Socket.IO (`/tracking` namespace) for real-time WO/DFP updates
- JWT (passport-jwt) auth with role-based guards

## Modules

| Module | Responsibility |
| --- | --- |
| `zones` | Zones, DFPs, nearest-DFP assignment, location pings |
| `orders` | Work orders, e-flow stages, end customers, addresses |
| `identity` | Users, auth (register/login), JWT + role guards |
| `notifications` | Templates, dispatch log, multi-channel sending seam |
| `tracking` | WebSocket gateway for live WO/DFP broadcasts |
| `fulfillment` | Delivery confirmations (sign-off + questionnaire), ratings |
| `accounting` | COD / payment records and reconciliation |
| `problem-management` | Centralized complaint/SLA-breach tracking |
| `integrations` | External connectors (Salla intake, etc.) |
| `common/jobs` | BullMQ processors: SLA check, daily reminders |

## Getting started

```bash
cp .env.example .env
docker compose up -d        # Postgres+PostGIS and Redis
npm install
npm run start:dev
```

- API: http://localhost:3000
- Swagger docs: http://localhost:3000/docs
- Health check: http://localhost:3000/health

`DB_SYNCHRONIZE=true` (the default in `.env.example`) auto-creates tables for
local development. Replace with TypeORM migrations before any shared environment.

## Notes

- PostGIS extension must be enabled on the database (`CREATE EXTENSION postgis;`)
  — the `postgis/postgis` Docker image ships with it pre-installed.
- `integrations/connectors/salla.connector.ts` is a normalization-layer stub;
  webhook signature verification and OAuth token exchange still need real
  Salla credentials (see `.env.example`).
- `notifications.service.ts` logs rendered payloads instead of calling a live
  provider — wire Unifonic (SMS/WhatsApp) and an email provider through
  `integrations/connectors` once accounts are provisioned.
