import type { Address, SlaState, WorkOrderType } from "@dreem-nest/shared-types";

export interface MockDelivery {
  id: string;
  reference: string;
  type: WorkOrderType;
  merchantName: string;
  stage: string;
  slaState: SlaState;
}

/** Local mock data standing in for `endCustomerApi.myDeliveries()`. */
export const MOCK_DELIVERIES: MockDelivery[] = [
  {
    id: "wo-3001",
    reference: "DN-RYD-3001",
    type: "NEW",
    merchantName: "Noor Home Goods",
    stage: "Out for delivery",
    slaState: "ON_TRACK",
  },
  {
    id: "wo-3002",
    reference: "DN-RYD-3002",
    type: "RETURN",
    merchantName: "Salla — Layan Boutique",
    stage: "Picked up — en route to warehouse",
    slaState: "ON_TRACK",
  },
  {
    id: "wo-3003",
    reference: "DN-RYD-3003",
    type: "NEW",
    merchantName: "TechSouq Electronics",
    stage: "Delivered",
    slaState: "ON_TRACK",
  },
];

/** Local mock data standing in for `endCustomerApi.profile()` addresses. */
export const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    city: "Riyadh",
    zone: "NORTH_RIYADH",
    district: "Al Yasmin",
    street: "King Salman Rd, Bldg 14",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    city: "Riyadh",
    zone: "EAST_RIYADH",
    district: "Al Naseem",
    street: "Al Amir Mishari St, Tower 3, Floor 8",
    isDefault: false,
  },
];
