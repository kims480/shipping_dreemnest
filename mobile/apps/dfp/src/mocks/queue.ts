import type { SlaState, WorkOrderType } from "@dreem-nest/shared-types";

export interface MockQueueItem {
  id: string;
  reference: string;
  type: WorkOrderType;
  recipientName: string;
  district: string;
  stage: string;
  slaState: SlaState;
  countdownLabel: string;
}

/**
 * Local mock data standing in for `dfpOpsApi.woQueue()` — shaped to drive
 * the dashboard's New/Return badges and SLA-countdown chips (PDR §8).
 * Sorted by urgency to mirror how a real queue would prioritize.
 */
export const MOCK_QUEUE: MockQueueItem[] = [
  {
    id: "wo-2001",
    reference: "DN-RYD-2001",
    type: "NEW",
    recipientName: "Abdullah Al-Qahtani",
    district: "Al Olaya",
    stage: "Out for delivery",
    slaState: "BREACHED",
    countdownLabel: "Overdue 22m",
  },
  {
    id: "wo-2002",
    reference: "DN-RYD-2002",
    type: "RETURN",
    recipientName: "Lama Al-Otaibi",
    district: "Al Naseem",
    stage: "Awaiting pickup",
    slaState: "AT_RISK",
    countdownLabel: "18m left",
  },
  {
    id: "wo-2003",
    reference: "DN-RYD-2003",
    type: "NEW",
    recipientName: "Khalid Al-Harbi",
    district: "Al Malqa",
    stage: "Out for delivery",
    slaState: "AT_RISK",
    countdownLabel: "41m left",
  },
  {
    id: "wo-2004",
    reference: "DN-RYD-2004",
    type: "NEW",
    recipientName: "Sara Al-Dosari",
    district: "Al Yasmin",
    stage: "Warehouse outbound",
    slaState: "ON_TRACK",
    countdownLabel: "2h 05m left",
  },
  {
    id: "wo-2005",
    reference: "DN-RYD-2005",
    type: "RETURN",
    recipientName: "Faisal Al-Mutairi",
    district: "Al Sahafa",
    stage: "Returned to warehouse",
    slaState: "ON_TRACK",
    countdownLabel: "5h 30m left",
  },
];

export const MOCK_PERFORMANCE = {
  onTimeRate: 0.91,
  volumeToday: 27,
  satisfactionTrend: "+0.4 vs last week",
};
