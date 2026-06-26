import type {
  WorkOrder, WorkOrderFilters, CreateWorkOrderDto,
  Zone, Dfp, ProblemRecord, RaiseProblemDto, ProblemStatus,
  EndCustomer, ConfirmDeliveryDto, SubmitRatingDto,
  LoginDto, LoginResponse, User, NotificationTemplate,
  Payment, PaymentMethod, PaymentStatus,
  AnalyticsDashboard, SystemConfig,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dn_token');
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new ApiError(res.status, err.message ?? `HTTP ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function toQuery(params?: Record<string, string | undefined>): string {
  if (!params) return '';
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (filtered.length === 0) return '';
  return '?' + new URLSearchParams(filtered as [string, string][]).toString();
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (dto: LoginDto) => req<LoginResponse>('POST', '/auth/login', dto),

  // ── Work Orders ───────────────────────────────────────────────────────────
  getWorkOrders: (filters?: WorkOrderFilters) =>
    req<WorkOrder[]>('GET', '/work-orders' + toQuery(filters as Record<string, string | undefined>)),

  getWorkOrder: (id: string) => req<WorkOrder>('GET', `/work-orders/${id}`),

  createWorkOrder: (dto: CreateWorkOrderDto) =>
    req<WorkOrder>('POST', '/work-orders', dto),

  advanceStage: (id: string) => req<WorkOrder>('PATCH', `/work-orders/${id}/advance`),

  // ── End Customers ─────────────────────────────────────────────────────────
  getCustomers: (params?: { phone?: string; name?: string }) =>
    req<EndCustomer[]>('GET', '/end-customers' + toQuery(params as Record<string, string | undefined>)),

  createCustomer: (dto: {
    fullName: string; phone: string; email?: string;
    address: { label: string; addressLine: string; city: string; lat?: number; lng?: number };
  }) => req<EndCustomer>('POST', '/end-customers', dto),

  // ── Zones ─────────────────────────────────────────────────────────────────
  getZones: () => req<Zone[]>('GET', '/zones'),

  reportDfpLocation: (dfpId: string, longitude: number, latitude: number) =>
    req<void>('POST', `/zones/dfps/${dfpId}/location`, { longitude, latitude }),

  // ── Problems ──────────────────────────────────────────────────────────────
  getProblems: (status?: ProblemStatus) =>
    req<ProblemRecord[]>('GET', '/problems' + (status ? `?status=${status}` : '')),

  raiseProblem: (dto: RaiseProblemDto) => req<ProblemRecord>('POST', '/problems', dto),

  resolveProblem: (id: string, resolutionNotes: string) =>
    req<ProblemRecord>('PATCH', `/problems/${id}/resolve`, { resolutionNotes }),

  assignProblem: (id: string, userId: string) =>
    req<ProblemRecord>('PATCH', `/problems/${id}/assign`, { userId }),

  // ── Fulfillment ───────────────────────────────────────────────────────────
  confirmDelivery: (dto: ConfirmDeliveryDto) =>
    req<unknown>('POST', '/fulfillment/delivery-confirmations', dto),

  submitRating: (dto: SubmitRatingDto) =>
    req<unknown>('POST', '/fulfillment/ratings', dto),

  // ── Settings: Zones ───────────────────────────────────────────────────────
  updateZone: (id: string, data: { name?: string; defaultSlaHours?: number }) =>
    req<Zone>('PATCH', `/zones/${id}`, data),

  getAllDfps: () => req<Dfp[]>('GET', '/zones/dfps'),

  createDfp: (data: { name: string; phone: string; kind: string; zoneId: string; locationPingIntervalMinutes?: number }) =>
    req<Dfp>('POST', '/zones/dfps', data),

  updateDfp: (id: string, data: { name?: string; phone?: string; kind?: string; active?: boolean; locationPingIntervalMinutes?: number }) =>
    req<Dfp>('PATCH', `/zones/dfps/${id}`, data),

  // ── Settings: Users ───────────────────────────────────────────────────────
  getUsers: (role?: string) =>
    req<User[]>('GET', '/auth/users' + (role ? `?role=${role}` : '')),

  createUser: (data: { email: string; password: string; fullName: string; role: string; zoneId?: string }) =>
    req<User>('POST', '/auth/register', data),

  updateUser: (id: string, data: { fullName?: string; role?: string; zoneId?: string | null; active?: boolean }) =>
    req<User>('PATCH', `/auth/users/${id}`, data),

  // ── Analytics ─────────────────────────────────────────────────────────────
  getAnalyticsDashboard: () => req<AnalyticsDashboard>('GET', '/analytics/dashboard'),

  // ── System Config / Integrations ──────────────────────────────────────────
  getSystemConfig: (group?: string) =>
    req<SystemConfig[]>('GET', '/system-config' + (group ? `?group=${group}` : '')),

  upsertSystemConfig: (key: string, data: { value: string | null; group?: string; label?: string; sensitive?: boolean }) =>
    req<SystemConfig>('PUT', `/system-config/${key}`, data),

  // ── Accounting / Payments ─────────────────────────────────────────────────
  getPayments: (params?: { status?: PaymentStatus; method?: PaymentMethod }) =>
    req<Payment[]>('GET', '/payments' + toQuery(params as Record<string, string | undefined>)),

  getPaymentsByWorkOrder: (workOrderId: string) =>
    req<Payment[]>('GET', `/payments/work-order/${workOrderId}`),

  recordPayment: (data: { workOrderId: string; method: PaymentMethod; amount: string; currency?: string }) =>
    req<Payment>('POST', '/payments', data),

  reconcilePayment: (id: string) =>
    req<Payment>('PATCH', `/payments/${id}/reconcile`, {}),

  // ── Settings: Notification Templates ─────────────────────────────────────
  getTemplates: (params?: { event?: string; channel?: string }) =>
    req<NotificationTemplate[]>('GET', '/notifications/templates' + toQuery(params as Record<string, string | undefined>)),

  createTemplate: (data: { event: string; channel: string; locale?: string; subject?: string; body: string }) =>
    req<NotificationTemplate>('POST', '/notifications/templates', data),

  updateTemplate: (id: string, data: { subject?: string; body?: string; active?: boolean }) =>
    req<NotificationTemplate>('PATCH', `/notifications/templates/${id}`, data),
};

export { ApiError };
