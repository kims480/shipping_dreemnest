import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderType, WorkOrderStatus } from './entities/work-order.entity';
import { EFlowStage, EFlowStageName } from './entities/e-flow-stage.entity';
import { EndCustomer } from './entities/end-customer.entity';
import { Address } from './entities/address.entity';

const NEW_FLOW: EFlowStageName[] = [
  EFlowStageName.WO_CREATED,
  EFlowStageName.PICKUP_FROM_STORE,
  EFlowStageName.WAREHOUSE_INBOUND,
  EFlowStageName.WAREHOUSE_OUTBOUND,
  EFlowStageName.OUT_FOR_DELIVERY,
];

const RETURN_FLOW: EFlowStageName[] = [
  EFlowStageName.WO_CREATED,
  EFlowStageName.PICKUP_FROM_CUSTOMER,
  EFlowStageName.WAREHOUSE_INBOUND,
  EFlowStageName.WAREHOUSE_OUTBOUND,
  EFlowStageName.OUT_FOR_DELIVERY_TO_STORE,
];

export interface InlineCustomerInput {
  fullName: string;
  phone: string;
  email?: string;
  address: {
    label: string;
    addressLine: string;
    city: string;
    lat?: number;
    lng?: number;
  };
}

export interface CreateWorkOrderInput {
  /** Auto-generated as DN-XXXXXX if omitted */
  reference?: string;
  type: WorkOrderType;
  merchantName: string;
  slaHours?: number;
  /** Option A: provide pre-existing IDs */
  endCustomerId?: string;
  deliveryAddressId?: string;
  /** Option B: create customer + address inline (find-or-create by phone) */
  customer?: InlineCustomerInput;
}

export interface WorkOrderFilters {
  reference?: string;
  type?: WorkOrderType;
  status?: WorkOrderStatus;
  assignedDfpId?: string;
  merchantName?: string;
}

function generateReference(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `DN-${num}`;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(WorkOrder) private readonly workOrderRepo: Repository<WorkOrder>,
    @InjectRepository(EFlowStage) private readonly stageRepo: Repository<EFlowStage>,
    @InjectRepository(EndCustomer) private readonly customerRepo: Repository<EndCustomer>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
  ) {}

  findAll(filters: WorkOrderFilters = {}): Promise<WorkOrder[]> {
    const qb = this.workOrderRepo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.stages', 'stages')
      .leftJoinAndSelect('wo.endCustomer', 'endCustomer')
      .leftJoinAndSelect('wo.deliveryAddress', 'deliveryAddress')
      .orderBy('wo.createdAt', 'DESC');

    if (filters.reference) {
      qb.andWhere('LOWER(wo.reference) LIKE :ref', { ref: `%${filters.reference.toLowerCase()}%` });
    }
    if (filters.type) qb.andWhere('wo.type = :type', { type: filters.type });
    if (filters.status) qb.andWhere('wo.status = :status', { status: filters.status });
    if (filters.assignedDfpId) qb.andWhere('wo.assignedDfpId = :dfpId', { dfpId: filters.assignedDfpId });
    if (filters.merchantName) {
      qb.andWhere('LOWER(wo.merchantName) LIKE :merchant', { merchant: `%${filters.merchantName.toLowerCase()}%` });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepo.findOne({
      where: { id },
      relations: { stages: true, endCustomer: true, deliveryAddress: true },
    });
    if (!workOrder) throw new NotFoundException(`Work order ${id} not found`);
    return workOrder;
  }

  async findByReference(reference: string): Promise<WorkOrder | null> {
    return this.workOrderRepo.findOne({
      where: { reference },
      relations: { stages: true, endCustomer: true, deliveryAddress: true },
    });
  }

  async create(input: CreateWorkOrderInput): Promise<WorkOrder> {
    let endCustomerId = input.endCustomerId;
    let deliveryAddressId = input.deliveryAddressId;

    // Find-or-create customer + address when provided inline
    if (input.customer) {
      const { customer } = input;
      let existing = await this.customerRepo.findOne({ where: { phone: customer.phone } });
      if (!existing) {
        existing = await this.customerRepo.save(
          this.customerRepo.create({
            fullName: customer.fullName,
            phone: customer.phone,
            email: customer.email ?? null,
          }),
        );
      }
      endCustomerId = existing.id;

      const addr = await this.addressRepo.save(
        this.addressRepo.create({
          endCustomerId: existing.id,
          label: customer.address.label,
          addressLine: customer.address.addressLine,
          city: customer.address.city,
          lat: customer.address.lat ?? null,
          lng: customer.address.lng ?? null,
          isDefault: true,
        }),
      );
      deliveryAddressId = addr.id;
    }

    if (!endCustomerId || !deliveryAddressId) {
      throw new Error('Must provide either customer object or endCustomerId + deliveryAddressId');
    }

    const slaHours = input.slaHours ?? 48;
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
    const flow = input.type === WorkOrderType.NEW ? NEW_FLOW : RETURN_FLOW;
    const reference = input.reference ?? generateReference();

    const workOrder = this.workOrderRepo.create({
      reference,
      type: input.type,
      merchantName: input.merchantName,
      endCustomerId,
      deliveryAddressId,
      slaHours,
      slaDeadline,
      currentStage: flow[0],
      stages: flow.map((name, index) =>
        this.stageRepo.create({ name, enteredAt: index === 0 ? now : null, completedAt: null }),
      ),
    });

    return this.workOrderRepo.save(workOrder);
  }

  async advanceStage(id: string): Promise<WorkOrder> {
    const workOrder = await this.findOne(id);
    const orderedStages = workOrder.stages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const currentIndex = orderedStages.findIndex((s) => s.name === workOrder.currentStage);
    const current = orderedStages[currentIndex];
    const next = orderedStages[currentIndex + 1];

    const now = new Date();
    if (current && !current.completedAt) {
      current.completedAt = now;
      await this.stageRepo.save(current);
    }

    if (next) {
      next.enteredAt = now;
      await this.stageRepo.save(next);
      workOrder.currentStage = next.name;
    } else {
      workOrder.currentStage = EFlowStageName.DELIVERED;
      workOrder.status = workOrder.status === 'problem' ? workOrder.status : ('delivered' as WorkOrder['status']);
    }

    return this.workOrderRepo.save(workOrder);
  }
}
