// ─── Enums ────────────────────────────────────────────────────────────────────

export type WorkOrderType = 'new' | 'return';
export type WorkOrderStatus = 'pending' | 'in_progress' | 'delivered' | 'problem' | 'cancelled';
export type EFlowStageName =
  | 'wo_created'
  | 'pickup_from_store'
  | 'pickup_from_customer'
  | 'warehouse_inbound'
  | 'warehouse_outbound'
  | 'out_for_delivery'
  | 'out_for_delivery_to_store'
  | 'delivered';

export type ProblemSource = 'sla_breach' | 'end_customer_complaint' | 'dfp_reported' | 'merchant_reported';
export type ProblemStatus = 'open' | 'in_review' | 'resolved' | 'escalated';
export type UserRole = 'admin' | 'dispatch' | 'dfp' | 'merchant' | 'warehouse' | 'driver';
export type DfpKind = 'in_house' | 'subcontractor';
export type ZoneRegion = 'north_riyadh' | 'west_riyadh' | 'east_riyadh' | 'south_riyadh';

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  endCustomerId: string;
  label: string;
  addressLine: string;
  city: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: string;
}

export interface EndCustomer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  isRegistered: boolean;
  preferredTimeWindow: string | null;
  notificationPreferences: { sms: boolean; whatsapp: boolean; email: boolean };
  addresses: Address[];
  createdAt: string;
}

export interface EFlowStage {
  id: string;
  workOrderId: string;
  name: EFlowStageName;
  ownerLabel: string | null;
  enteredAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  reference: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  sourceChannel: 'salla' | 'merchant_direct';
  merchantName: string;
  endCustomer: EndCustomer;
  endCustomerId: string;
  deliveryAddress: Address;
  deliveryAddressId: string;
  assignedDfpId: string | null;
  currentStage: EFlowStageName | null;
  slaHours: number;
  slaDeadline: string;
  slaBreached: boolean;
  stages: EFlowStage[];
  createdAt: string;
  updatedAt: string;
}

export interface Dfp {
  id: string;
  zoneId: string;
  name: string;
  kind: DfpKind;
  phone: string;
  currentLng: number | null;
  currentLat: number | null;
  lastLocationAt: string | null;
  locationPingIntervalMinutes: number;
  active: boolean;
}

export interface Zone {
  id: string;
  name: string;
  region: ZoneRegion;
  defaultSlaHours: number;
  dfps: Dfp[];
}

export interface ProblemRecord {
  id: string;
  workOrderId: string;
  source: ProblemSource;
  status: ProblemStatus;
  category: string;
  description: string;
  assignedToUserId: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  zoneId: string | null;
  active: boolean;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsDashboard {
  overview: {
    total: number;
    byStatus: Record<string, number>;
    slaComplianceRate: number;
    avgCompletionHours: number | null;
    deliveredToday: number;
    deliveredThisWeek: number;
  };
  volumeTrend: Array<{ date: string; count: number; delivered: number; breached: number }>;
  stageCycleTimes: Array<{ stage: string; avgHours: number | null; count: number }>;
  zonePerformance: Array<{
    zoneId: string; zoneName: string; woCount: number;
    slaBreachCount: number; slaBreachRate: number; avgCompletionHours: number | null;
  }>;
  problemAnalytics: {
    total: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    avgResolutionHours: number | null;
  };
}

export interface SystemConfig {
  key: string;
  value: string | null;
  group: string | null;
  label: string | null;
  sensitive: boolean;
  updatedAt: string;
}

export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'pending' | 'collected' | 'reconciled' | 'refunded';

export interface Payment {
  id: string;
  workOrderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  currency: string;
  collectedByDfpId: string | null;
  reconciledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationEventType =
  | 'wo_received' | 'wo_stage_changed' | 'daily_reminder'
  | 'delivery_confirmation' | 'dfp_assignment' | 'sla_breach_warning';

export type NotificationChannelType = 'sms' | 'whatsapp' | 'email' | 'system';

export interface NotificationTemplate {
  id: string;
  event: NotificationEventType;
  channel: NotificationChannelType;
  locale: string;
  subject: string | null;
  body: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface LoginDto { email: string; password: string }
export interface LoginResponse { accessToken: string; user: User }

export interface CreateWorkOrderDto {
  reference?: string;
  type: WorkOrderType;
  merchantName: string;
  slaHours?: number;
  endCustomerId?: string;
  deliveryAddressId?: string;
  customer?: {
    fullName: string;
    phone: string;
    email?: string;
    address: { label: string; addressLine: string; city: string; lat?: number; lng?: number };
  };
}

export interface WorkOrderFilters {
  reference?: string;
  type?: WorkOrderType;
  status?: WorkOrderStatus;
  assignedDfpId?: string;
  merchantName?: string;
}

export interface RaiseProblemDto {
  workOrderId: string;
  source: ProblemSource;
  category: string;
  description: string;
}

export interface ConfirmDeliveryDto {
  workOrderId: string;
  signedByName: string;
  satisfactionAnswers?: Record<string, string | number | boolean>;
  remarks?: string;
}

export interface SubmitRatingDto {
  workOrderId: string;
  score: number;
  comment?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const STAGE_LABELS: Record<EFlowStageName, string> = {
  wo_created: 'Order received',
  pickup_from_store: 'Picked up from store',
  pickup_from_customer: 'Picked up from customer',
  warehouse_inbound: 'Arrived at warehouse',
  warehouse_outbound: 'Dispatched from warehouse',
  out_for_delivery: 'Out for delivery',
  out_for_delivery_to_store: 'Out for delivery to store',
  delivered: 'Delivered',
};

export function slaState(wo: WorkOrder): 'on_track' | 'at_risk' | 'breached' {
  if (wo.slaBreached) return 'breached';
  const remaining = new Date(wo.slaDeadline).getTime() - Date.now();
  if (remaining < 2 * 3600 * 1000) return 'at_risk';
  return 'on_track';
}

export function slaRemaining(wo: WorkOrder): string {
  if (wo.status === 'delivered') return 'Delivered';
  if (wo.slaBreached) {
    const over = Date.now() - new Date(wo.slaDeadline).getTime();
    const h = Math.floor(over / 3600000);
    return `Overdue ${h}h`;
  }
  const ms = new Date(wo.slaDeadline).getTime() - Date.now();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h left` : `${m}m left`;
}
