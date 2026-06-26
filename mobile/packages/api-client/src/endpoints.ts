import type {
  AuthSession,
  Complaint,
  DeliveryConfirmation,
  EndCustomer,
  LoginCredentials,
  WorkOrder,
} from "@dreem-nest/shared-types";
import { apiRequest, type RequestOptions } from "./httpClient";

/**
 * Stub endpoint groups, named to mirror PDR §14's API surface.
 *
 * These are placeholders: real request/response shapes will come from the
 * NestJS OpenAPI spec. They exist so screens can call a stable,
 * typed surface today and swap the implementation later without
 * touching call sites.
 */

type AuthToken = Pick<RequestOptions, "token">;

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiRequest<AuthSession>("/auth/login", { method: "POST", body: credentials }),
  logout: (auth: AuthToken) => apiRequest<void>("/auth/logout", { method: "POST", ...auth }),
};

export const driverOpsApi = {
  myJobs: (auth: AuthToken) => apiRequest<WorkOrder[]>("/driver/jobs", { ...auth }),
  jobDetail: (jobId: string, auth: AuthToken) =>
    apiRequest<WorkOrder>(`/driver/jobs/${jobId}`, { ...auth }),
};

export const dfpOpsApi = {
  /** Zone WO queue — powers the SLA dashboard (PDR §8). */
  woQueue: (auth: AuthToken) => apiRequest<WorkOrder[]>("/dfp/work-orders", { ...auth }),
  submitSignOff: (
    workOrderId: string,
    payload: Pick<DeliveryConfirmation, "signedByName" | "satisfaction" | "remarks">,
    auth: AuthToken
  ) =>
    apiRequest<DeliveryConfirmation>(`/dfp/work-orders/${workOrderId}/sign-off`, {
      method: "POST",
      body: payload,
      ...auth,
    }),
  reportLocation: (lat: number, lng: number, auth: AuthToken) =>
    apiRequest<void>("/dfp/location-ping", { method: "POST", body: { lat, lng }, ...auth }),
};

export const endCustomerApi = {
  myDeliveries: (auth: AuthToken) => apiRequest<WorkOrder[]>("/customer/work-orders", { ...auth }),
  profile: (auth: AuthToken) => apiRequest<EndCustomer>("/customer/profile", { ...auth }),
  raiseComplaint: (
    workOrderId: string,
    payload: Pick<Complaint, "category" | "description">,
    auth: AuthToken
  ) =>
    apiRequest<Complaint>(`/customer/work-orders/${workOrderId}/complaints`, {
      method: "POST",
      body: payload,
      ...auth,
    }),
};
