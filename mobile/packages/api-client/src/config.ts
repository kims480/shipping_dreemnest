/**
 * Placeholder API configuration.
 *
 * Replace `BASE_URL` with the deployed NestJS API origin per environment
 * (see TECH_ARCHITECTURE §3 for the backend overview). Once the OpenAPI
 * spec is published, this client should be regenerated/extended from it
 * rather than hand-maintained — this stub exists so app code has a single,
 * stable import to build against today.
 */
export const API_CONFIG = {
  /** TODO: wire up per-environment base URLs (dev/staging/prod) via app config / env. */
  BASE_URL: "https://api.dreemnest.example/v1",
  TIMEOUT_MS: 15000,
} as const;
