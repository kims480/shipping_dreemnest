/**
 * Database seed — run once to populate zones, DFPs, users, end-customers, and
 * work orders with realistic Riyadh data.
 *
 * Usage:  npx ts-node -r tsconfig-paths/register src/seed.ts
 */
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  (globalThis as { crypto?: Crypto }).crypto = webcrypto as unknown as Crypto;
}

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

dotenv.config();

// ─── Entities ──────────────────────────────────────────────────────────────
import { Zone, ZoneRegion } from './modules/zones/entities/zone.entity';
import { Dfp, DfpKind } from './modules/zones/entities/dfp.entity';
import { User, UserRole } from './modules/identity/entities/user.entity';
import { EndCustomer } from './modules/orders/entities/end-customer.entity';
import { Address } from './modules/orders/entities/address.entity';
import { WorkOrder, WorkOrderType, WorkOrderStatus } from './modules/orders/entities/work-order.entity';
import { EFlowStage, EFlowStageName } from './modules/orders/entities/e-flow-stage.entity';
import { ProblemRecord, ProblemSource, ProblemStatus } from './modules/problem-management/entities/problem-record.entity';
import {
  NotificationTemplate,
  NotificationEvent,
  NotificationChannel,
} from './modules/notifications/entities/notification-template.entity';
import { NotificationLog } from './modules/notifications/entities/notification-log.entity';
import { DeliveryConfirmation } from './modules/fulfillment/entities/delivery-confirmation.entity';
import { Rating } from './modules/fulfillment/entities/rating.entity';
import { Payment } from './modules/accounting/entities/payment.entity';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'dreem_nest',
  password: process.env.DB_PASSWORD ?? 'dreem_nest',
  database: process.env.DB_NAME ?? 'dreem_nest',
  synchronize: true,
  logging: false,
  entities: [
    Zone, Dfp, User, EndCustomer, Address,
    WorkOrder, EFlowStage, ProblemRecord,
    NotificationTemplate, NotificationLog,
    DeliveryConfirmation, Rating, Payment,
  ],
});

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

async function seed() {
  await ds.initialize();
  console.log('✔  DB connected');

  const zoneRepo = ds.getRepository(Zone);
  const dfpRepo = ds.getRepository(Dfp);
  const userRepo = ds.getRepository(User);
  const customerRepo = ds.getRepository(EndCustomer);
  const addressRepo = ds.getRepository(Address);
  const woRepo = ds.getRepository(WorkOrder);
  const stageRepo = ds.getRepository(EFlowStage);
  const problemRepo = ds.getRepository(ProblemRecord);

  // ─── Zones ─────────────────────────────────────────────────────────────────
  const zonesData = [
    { name: 'North Riyadh', region: ZoneRegion.NORTH_RIYADH },
    { name: 'West Riyadh',  region: ZoneRegion.WEST_RIYADH  },
    { name: 'East Riyadh',  region: ZoneRegion.EAST_RIYADH  },
    { name: 'South Riyadh', region: ZoneRegion.SOUTH_RIYADH },
  ];
  const zones: Record<string, Zone> = {};
  for (const z of zonesData) {
    let zone = await zoneRepo.findOne({ where: { region: z.region } });
    if (!zone) {
      zone = await zoneRepo.save(zoneRepo.create({ name: z.name, region: z.region, defaultSlaHours: 48 }));
      console.log(`  ✔  Zone: ${z.name}`);
    }
    zones[z.region] = zone;
  }

  // ─── DFPs ──────────────────────────────────────────────────────────────────
  const dfpsData = [
    { name: 'Ahmed Al-Rashid', zone: zones[ZoneRegion.NORTH_RIYADH], phone: '+966501112222', lat: 24.774, lng: 46.738 },
    { name: 'Sara Al-Ghamdi',  zone: zones[ZoneRegion.WEST_RIYADH],  phone: '+966502223333', lat: 24.699, lng: 46.685 },
    { name: 'Omar Al-Zahrani', zone: zones[ZoneRegion.EAST_RIYADH],  phone: '+966503334444', lat: 24.759, lng: 46.832 },
    { name: 'Fatima Al-Dosari',zone: zones[ZoneRegion.SOUTH_RIYADH], phone: '+966504445555', lat: 24.620, lng: 46.716 },
  ];
  const dfps: Record<string, Dfp> = {};
  for (const d of dfpsData) {
    let dfp = await dfpRepo.findOne({ where: { phone: d.phone } });
    if (!dfp) {
      dfp = await dfpRepo.save(dfpRepo.create({
        name: d.name, zoneId: d.zone.id, phone: d.phone, kind: DfpKind.IN_HOUSE,
        currentLat: d.lat, currentLng: d.lng, lastLocationAt: new Date(),
      }));
      console.log(`  ✔  DFP: ${d.name}`);
    }
    dfps[d.zone.id] = dfp;
  }

  // ─── Users ─────────────────────────────────────────────────────────────────
  const usersData = [
    { email: 'admin@dreemnest.sa',    password: 'Admin@123',    fullName: 'Admin User',      role: UserRole.ADMIN,     zoneId: null as string | null },
    { email: 'ahmed@dreemnest.sa',    password: 'Ahmed@123',    fullName: 'Ahmed Al-Rashid', role: UserRole.DFP,       zoneId: zones[ZoneRegion.NORTH_RIYADH].id as string | null },
    { email: 'sara@dreemnest.sa',     password: 'Sara@123',     fullName: 'Sara Al-Ghamdi',  role: UserRole.DFP,       zoneId: zones[ZoneRegion.WEST_RIYADH].id as string | null },
    { email: 'merchant@salla.sa',     password: 'Merchant@123', fullName: 'Salla Merchant',  role: UserRole.MERCHANT,  zoneId: null as string | null },
    { email: 'warehouse@dreemnest.sa',password: 'Wh@123',       fullName: 'Warehouse Ops',   role: UserRole.WAREHOUSE, zoneId: null as string | null },
  ];
  for (const u of usersData) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const { password: _pw, ...rest } = u;
      await userRepo.save(userRepo.create({ ...rest, passwordHash }));
      console.log(`  ✔  User: ${u.email}`);
    }
  }

  // ─── End Customers ─────────────────────────────────────────────────────────
  const customersData = [
    { fullName: 'Mohammed Al-Harbi', phone: '+966551234567', email: 'mharbi@gmail.com' },
    { fullName: 'Layla Al-Otaibi',   phone: '+966559876543', email: 'lotaibi@gmail.com' },
    { fullName: 'Noura Al-Qahtani', phone: '+966554567890', email: null },
    { fullName: 'Faisal Al-Anzi',   phone: '+966552345678', email: null },
    { fullName: 'Rana Al-Subaie',   phone: '+966553456789', email: 'rsubaie@gmail.com' },
  ];
  const addressesData = [
    { label: 'Home', addressLine: 'King Abdullah Rd, Al-Malaz', city: 'Riyadh', lat: 24.684, lng: 46.721 },
    { label: 'Work', addressLine: 'Prince Mohammed Bin Abdulaziz Rd, Al-Waha', city: 'Riyadh', lat: 24.761, lng: 46.664 },
    { label: 'Home', addressLine: 'Northern Ring Rd, Al-Nakheel', city: 'Riyadh', lat: 24.803, lng: 46.728 },
    { label: 'Home', addressLine: 'Al-Imam Saud Bin Abdulaziz Rd, Al-Rawdah', city: 'Riyadh', lat: 24.758, lng: 46.844 },
    { label: 'Home', addressLine: 'King Fahd Rd, Al-Sulimaniyah', city: 'Riyadh', lat: 24.702, lng: 46.685 },
  ];
  const customers: EndCustomer[] = [];
  for (let i = 0; i < customersData.length; i++) {
    const cd = customersData[i];
    let c = await customerRepo.findOne({ where: { phone: cd.phone } });
    if (!c) {
      c = await customerRepo.save(customerRepo.create({ ...cd }));
      const ad = addressesData[i];
      await addressRepo.save(addressRepo.create({ endCustomerId: c.id, ...ad, isDefault: true }));
      console.log(`  ✔  Customer: ${c.fullName}`);
    }
    customers.push(c);
  }

  // Reload customers with addresses
  const customersWithAddr = await customerRepo.find({ where: {}, relations: { addresses: true } });

  // ─── Work Orders ───────────────────────────────────────────────────────────
  const existingWoCount = await woRepo.count();

  if (existingWoCount > 0) {
    console.log(`  ⏭  Work orders already seeded (${existingWoCount} found), skipping`);
  }

  type WoSeed = {
    reference: string; type: WorkOrderType; merchantName: string;
    customer: EndCustomer; addressIdx: number;
    assignedDfpId: string; slaHours: number; createdHoursAgo: number;
    stages: { name: EFlowStageName; completedHoursAgo?: number; enteredHoursAgo?: number }[];
    status: WorkOrderStatus; slaBreached: boolean;
  };

  const woSeeds: WoSeed[] = [
    // DN-100291 — new, out for delivery, on track
    {
      reference: 'DN-100291', type: WorkOrderType.NEW, merchantName: 'Salla Store',
      customer: customersWithAddr[0], addressIdx: 0,
      assignedDfpId: dfps[zones[ZoneRegion.NORTH_RIYADH].id].id,
      slaHours: 48, createdHoursAgo: 6,
      stages: [
        { name: EFlowStageName.WO_CREATED,       completedHoursAgo: 5.5 },
        { name: EFlowStageName.PICKUP_FROM_STORE, completedHoursAgo: 4 },
        { name: EFlowStageName.WAREHOUSE_INBOUND, completedHoursAgo: 2 },
        { name: EFlowStageName.WAREHOUSE_OUTBOUND,completedHoursAgo: 1 },
        { name: EFlowStageName.OUT_FOR_DELIVERY,  enteredHoursAgo: 1 },
      ],
      status: WorkOrderStatus.IN_PROGRESS, slaBreached: false,
    },
    // DN-100288 — return, warehouse inbound, at risk (42h elapsed of 48h)
    {
      reference: 'DN-100288', type: WorkOrderType.RETURN, merchantName: 'Salla Store',
      customer: customersWithAddr[1], addressIdx: 0,
      assignedDfpId: dfps[zones[ZoneRegion.EAST_RIYADH].id].id,
      slaHours: 48, createdHoursAgo: 42,
      stages: [
        { name: EFlowStageName.WO_CREATED,          completedHoursAgo: 41 },
        { name: EFlowStageName.PICKUP_FROM_CUSTOMER, completedHoursAgo: 38 },
        { name: EFlowStageName.WAREHOUSE_INBOUND,    enteredHoursAgo: 38 },
        { name: EFlowStageName.WAREHOUSE_OUTBOUND },
        { name: EFlowStageName.OUT_FOR_DELIVERY_TO_STORE },
      ],
      status: WorkOrderStatus.IN_PROGRESS, slaBreached: false,
    },
    // DN-100275 — new, pickup from store, BREACHED (created 50h ago)
    {
      reference: 'DN-100275', type: WorkOrderType.NEW, merchantName: 'Salla Store',
      customer: customersWithAddr[3], addressIdx: 0,
      assignedDfpId: dfps[zones[ZoneRegion.EAST_RIYADH].id].id,
      slaHours: 48, createdHoursAgo: 50,
      stages: [
        { name: EFlowStageName.WO_CREATED,       completedHoursAgo: 49 },
        { name: EFlowStageName.PICKUP_FROM_STORE, enteredHoursAgo: 49 },
        { name: EFlowStageName.WAREHOUSE_INBOUND },
        { name: EFlowStageName.WAREHOUSE_OUTBOUND },
        { name: EFlowStageName.OUT_FOR_DELIVERY },
      ],
      status: WorkOrderStatus.IN_PROGRESS, slaBreached: true,
    },
    // DN-100270 — new, warehouse outbound, on track
    {
      reference: 'DN-100270', type: WorkOrderType.NEW, merchantName: 'Salla Store',
      customer: customersWithAddr[2], addressIdx: 0,
      assignedDfpId: dfps[zones[ZoneRegion.WEST_RIYADH].id].id,
      slaHours: 48, createdHoursAgo: 14,
      stages: [
        { name: EFlowStageName.WO_CREATED,        completedHoursAgo: 13 },
        { name: EFlowStageName.PICKUP_FROM_STORE,  completedHoursAgo: 11 },
        { name: EFlowStageName.WAREHOUSE_INBOUND,  completedHoursAgo: 8 },
        { name: EFlowStageName.WAREHOUSE_OUTBOUND, enteredHoursAgo: 1 },
        { name: EFlowStageName.OUT_FOR_DELIVERY },
      ],
      status: WorkOrderStatus.IN_PROGRESS, slaBreached: false,
    },
    // DN-100249 — new, DELIVERED
    {
      reference: 'DN-100249', type: WorkOrderType.NEW, merchantName: 'Salla Store',
      customer: customersWithAddr[4], addressIdx: 0,
      assignedDfpId: dfps[zones[ZoneRegion.SOUTH_RIYADH].id].id,
      slaHours: 48, createdHoursAgo: 36,
      stages: [
        { name: EFlowStageName.WO_CREATED,        completedHoursAgo: 35 },
        { name: EFlowStageName.PICKUP_FROM_STORE,  completedHoursAgo: 33 },
        { name: EFlowStageName.WAREHOUSE_INBOUND,  completedHoursAgo: 28 },
        { name: EFlowStageName.WAREHOUSE_OUTBOUND, completedHoursAgo: 20 },
        { name: EFlowStageName.OUT_FOR_DELIVERY,   completedHoursAgo: 4 },
      ],
      status: WorkOrderStatus.DELIVERED, slaBreached: false,
    },
  ];

  if (existingWoCount === 0) for (const seed of woSeeds) {
    const addr = seed.customer.addresses?.[0];
    if (!addr) { console.warn(`  ⚠  No address for ${seed.customer.fullName}`); continue; }

    const createdAt = hoursAgo(seed.createdHoursAgo);
    const slaDeadline = new Date(createdAt.getTime() + seed.slaHours * 3600 * 1000);
    const currentStage = seed.stages.find((s) => !s.completedHoursAgo && s.enteredHoursAgo !== undefined)?.name
      ?? seed.stages[seed.stages.length - 1].name;

    const stages = seed.stages.map((s) =>
      stageRepo.create({
        name: s.name,
        enteredAt: s.completedHoursAgo != null ? hoursAgo(s.completedHoursAgo + 1) : (s.enteredHoursAgo != null ? hoursAgo(s.enteredHoursAgo) : null),
        completedAt: s.completedHoursAgo != null ? hoursAgo(s.completedHoursAgo) : null,
      }),
    );
    // The last stage that was entered (active or delivered)
    const activeOrLast = seed.stages.findIndex((s) => !s.completedHoursAgo && s.enteredHoursAgo !== undefined);
    if (activeOrLast !== -1) stages[activeOrLast].enteredAt = hoursAgo(seed.stages[activeOrLast].enteredHoursAgo!);

    const wo = woRepo.create({
      reference: seed.reference,
      type: seed.type,
      merchantName: seed.merchantName,
      endCustomerId: seed.customer.id,
      deliveryAddressId: addr.id,
      assignedDfpId: seed.assignedDfpId,
      slaHours: seed.slaHours,
      slaDeadline,
      slaBreached: seed.slaBreached,
      currentStage: seed.status === WorkOrderStatus.DELIVERED ? EFlowStageName.DELIVERED : currentStage,
      status: seed.status,
      stages,
    });
    wo.createdAt = createdAt;
    await woRepo.save(wo);
    console.log(`  ✔  Work order: ${seed.reference}`);
  }

  // ─── Problems ──────────────────────────────────────────────────────────────
  const existingProblemCount = await problemRepo.count();
  const wo275 = await woRepo.findOne({ where: { reference: 'DN-100275' } });
  const wo288 = await woRepo.findOne({ where: { reference: 'DN-100288' } });
  if (existingProblemCount === 0 && wo275) {
    await problemRepo.save(problemRepo.create({
      workOrderId: wo275.id,
      source: ProblemSource.SLA_BREACH,
      status: ProblemStatus.OPEN,
      category: 'SLA Exceeded',
      description: 'Work order exceeded 48h SLA — still at pickup stage.',
    }));
    console.log('  ✔  Problem: DN-100275 SLA breach');
  }
  if (existingProblemCount === 0 && wo288) {
    await problemRepo.save(problemRepo.create({
      workOrderId: wo288.id,
      source: ProblemSource.END_CUSTOMER_COMPLAINT,
      status: ProblemStatus.IN_REVIEW,
      category: 'Delivery Delay',
      description: 'Customer called in to report package not yet picked up.',
    }));
    console.log('  ✔  Problem: DN-100288 customer complaint');
  }

  // ─── Notification Templates ────────────────────────────────────────────────
  const templateRepo = ds.getRepository(NotificationTemplate);
  const existingTemplateCount = await templateRepo.count();
  if (existingTemplateCount === 0) {
    const templates = [
      {
        event: NotificationEvent.WO_RECEIVED, channel: NotificationChannel.SMS, locale: 'en',
        subject: null,
        body: 'Dear {{customerName}}, your order {{reference}} from {{merchantName}} has been received. Expected delivery within {{slaHours}}h. Track at dreemnest.sa/track',
      },
      {
        event: NotificationEvent.WO_RECEIVED, channel: NotificationChannel.WHATSAPP, locale: 'en',
        subject: null,
        body: '🎉 Hi {{customerName}}! Your order *{{reference}}* from *{{merchantName}}* is confirmed.\n\n📦 Expected delivery: within {{slaHours}} hours\n🔍 Track: dreemnest.sa/track\n\nWe\'ll notify you at each stage.',
      },
      {
        event: NotificationEvent.WO_STAGE_CHANGED, channel: NotificationChannel.SMS, locale: 'en',
        subject: null,
        body: 'Order {{reference}} update: {{stage}}. Track at dreemnest.sa/track',
      },
      {
        event: NotificationEvent.WO_STAGE_CHANGED, channel: NotificationChannel.WHATSAPP, locale: 'en',
        subject: null,
        body: '📬 Order *{{reference}}* status update:\n\n*{{stage}}*\n\nTrack: dreemnest.sa/track',
      },
      {
        event: NotificationEvent.DAILY_REMINDER, channel: NotificationChannel.SMS, locale: 'en',
        subject: null,
        body: 'Reminder: Your order {{reference}} from {{merchantName}} is arriving today. Please ensure someone is available to receive it.',
      },
      {
        event: NotificationEvent.DELIVERY_CONFIRMATION, channel: NotificationChannel.SMS, locale: 'en',
        subject: null,
        body: '✅ Your order {{reference}} has been delivered. Rate your experience: dreemnest.sa/track',
      },
      {
        event: NotificationEvent.DELIVERY_CONFIRMATION, channel: NotificationChannel.EMAIL, locale: 'en',
        subject: 'Your order {{reference}} has been delivered',
        body: 'Hi {{customerName}},\n\nYour order {{reference}} was delivered successfully.\n\nPlease take a moment to rate your experience at dreemnest.sa/track\n\nThank you for using Dreem Nest!',
      },
      {
        event: NotificationEvent.DFP_ASSIGNMENT, channel: NotificationChannel.SYSTEM, locale: 'en',
        subject: 'New work order assigned',
        body: 'Work order {{reference}} has been assigned to you.\nCustomer: {{customerName}}\nPhone: {{customerPhone}}\nAddress: {{address}}\nSLA deadline: {{slaDeadline}}',
      },
      {
        event: NotificationEvent.DFP_ASSIGNMENT, channel: NotificationChannel.SMS, locale: 'en',
        subject: null,
        body: 'New delivery assigned: {{reference}}. Customer: {{customerName}} — {{address}}. SLA: {{slaDeadline}}',
      },
      {
        event: NotificationEvent.SLA_BREACH_WARNING, channel: NotificationChannel.SYSTEM, locale: 'en',
        subject: 'SLA breach warning',
        body: '⚠️ Work order {{reference}} is at risk of breaching its SLA. Time remaining: {{remaining}}. Stage: {{stage}}.',
      },
    ];

    for (const t of templates) {
      await templateRepo.save(templateRepo.create(t));
    }
    console.log(`  ✔  Notification templates: ${templates.length} created`);
  } else {
    console.log(`  ⏭  Notification templates already exist (${existingTemplateCount}), skipping`);
  }

  await ds.destroy();
  console.log('\n🎉  Seed complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
