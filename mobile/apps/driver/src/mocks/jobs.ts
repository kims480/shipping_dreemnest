import type { WorkOrder } from "@dreem-nest/shared-types";

/**
 * Local mock data standing in for `driverOpsApi.myJobs()` until the backend
 * is available. Shapes follow `WorkOrder` from `@dreem-nest/shared-types`.
 */
export const MOCK_JOBS: Pick<
  WorkOrder,
  "id" | "reference" | "type" | "currentStage" | "slaState" | "merchantName"
>[] = [
  {
    id: "wo-1001",
    reference: "DN-RYD-1001",
    type: "NEW",
    currentStage: "OUT_FOR_DELIVERY",
    slaState: "AT_RISK",
    merchantName: "Noor Home Goods",
  },
  {
    id: "wo-1002",
    reference: "DN-RYD-1002",
    type: "RETURN",
    currentStage: "PICKUP",
    slaState: "ON_TRACK",
    merchantName: "Salla — Layan Boutique",
  },
  {
    id: "wo-1003",
    reference: "DN-RYD-1003",
    type: "NEW",
    currentStage: "OUT_FOR_DELIVERY",
    slaState: "BREACHED",
    merchantName: "TechSouq Electronics",
  },
];
