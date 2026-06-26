/**
 * Shared TypeScript data-contract types for Dreem Nest mobile apps.
 *
 * These mirror the high-level data model sketch in PDR.md §13, kept
 * intentionally minimal for the foundation scaffold. Once the backend's
 * OpenAPI spec exists, prefer generating these (or a superset of these)
 * directly from that spec — this file documents the target shape in the
 * meantime so app code has something concrete to build against.
 */

/** WO type — drives the New/Return badge throughout DFP & tracking surfaces (PDR §5.3). */
export type WorkOrderType = "NEW" | "RETURN";

/** Coarse WO lifecycle status. */
export type WorkOrderStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CLOSED"
  | "PROBLEM";

/** SLA clock state — drives the color-coded countdown chip (PDR §8). */
export type SlaState = "ON_TRACK" | "AT_RISK" | "BREACHED";

/** Ordered e-flow stage names (simplified — PDR §5.4 / §6). */
export type EFlowStageName =
  | "INTAKE"
  | "PICKUP"
  | "WAREHOUSE_INBOUND"
  | "WAREHOUSE_OUTBOUND"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED_TO_STORE";

export interface EFlowStage {
  name: EFlowStageName;
  /** Actor responsible for this stage (warehouse, DFP, driver, etc.). */
  owningActor: "WAREHOUSE" | "DFP" | "DRIVER" | "SYSTEM";
  enteredAt: string | null;
  completedAt: string | null;
}

export interface Address {
  id: string;
  label: string;
  city: string;
  zone: ZoneName;
  district: string;
  street: string;
  buildingNumber?: string;
  additionalInfo?: string;
  /** Saudi National Address short code, when available. */
  nationalAddressCode?: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

export interface TimeWindowPreference {
  /** 24h "HH:mm" format. */
  startTime: string;
  endTime: string;
  /** ISO weekday numbers 1 (Mon) – 7 (Sun); empty = any day. */
  daysOfWeek: number[];
}

export interface EndCustomer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  /** Guests have not completed registration. */
  isGuest: boolean;
  addresses: Address[];
  preferredTimeWindow?: TimeWindowPreference;
  preferredLocale: SupportedLocale;
}

/** The four launch zones (PDR §4) — kept as a literal union for the MVP. */
export type ZoneName = "NORTH_RIYADH" | "WEST_RIYADH" | "EAST_RIYADH" | "SOUTH_RIYADH";

export interface Zone {
  id: string;
  name: ZoneName;
  displayNameEn: string;
  displayNameAr: string;
}

export interface DFP {
  id: string;
  fullName: string;
  phone: string;
  zoneId: string;
  /** Last reported live location (PDR §8 — default 5-minute ping interval). */
  lastKnownLocation?: { lat: number; lng: number; reportedAt: string };
  locationPingIntervalMinutes: number;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  zoneId: string;
  isOnline: boolean;
  vehicleType?: "MOTORBIKE" | "CAR" | "VAN";
}

export interface WorkOrder {
  id: string;
  reference: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  currentStage: EFlowStageName;
  stages: EFlowStage[];
  zoneId: string;
  merchantName: string;
  endCustomer: EndCustomer;
  deliveryAddress: Address;
  slaDeadline: string;
  slaState: SlaState;
  assignedDfpId?: string;
  assignedDriverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryConfirmation {
  id: string;
  workOrderId: string;
  signedByName: string;
  signatureImageUri?: string;
  satisfaction: "SATISFIED" | "NOT_SATISFIED";
  remarks?: string;
  capturedAt: string;
  capturedByDfpId: string;
}

export interface Rating {
  id: string;
  workOrderId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
}

export type ComplaintCategory = "DELAY" | "DFP_ATTITUDE" | "PACKAGE_HANDLING" | "OTHER";
export type ComplaintStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";

export interface Complaint {
  id: string;
  workOrderId: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  description: string;
  createdAt: string;
}

/** Locales supported across all three apps — Arabic is the RTL primary. */
export type SupportedLocale = "ar" | "en";

/** Auth/session shapes shared by login screens across all three app roles. */
export type AppRole = "DRIVER" | "DFP" | "END_CUSTOMER";

export interface AuthSession {
  token: string;
  role: AppRole;
  userId: string;
  displayName: string;
  expiresAt: string;
}

export interface LoginCredentials {
  /** Phone or email — the platform supports either as a login identifier. */
  identifier: string;
  password: string;
}
