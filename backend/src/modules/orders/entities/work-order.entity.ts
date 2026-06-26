import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EndCustomer } from './end-customer.entity';
import { Address } from './address.entity';
import { EFlowStage } from './e-flow-stage.entity';

export enum WorkOrderType {
  NEW = 'new',
  RETURN = 'return',
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  PROBLEM = 'problem',
  CANCELLED = 'cancelled',
}

export enum WorkOrderSourceChannel {
  SALLA = 'salla',
  MERCHANT_DIRECT = 'merchant_direct',
}

/**
 * Work Order (PDR §5/§13): the central unit of fulfillment. Carries the
 * warehouse-centric e-flow stage history and the SLA deadline derived from
 * `slaHours` (default 48, admin-adjustable per zone via Zone.defaultSlaHours).
 */
@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 40 })
  reference: string;

  @Column({ type: 'enum', enum: WorkOrderType })
  type: WorkOrderType;

  @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.PENDING })
  status: WorkOrderStatus;

  @Column({ type: 'enum', enum: WorkOrderSourceChannel, default: WorkOrderSourceChannel.MERCHANT_DIRECT })
  sourceChannel: WorkOrderSourceChannel;

  @Column({ type: 'varchar', length: 160 })
  merchantName: string;

  @ManyToOne(() => EndCustomer, (customer) => customer.workOrders, { nullable: false })
  @JoinColumn({ name: 'end_customer_id' })
  endCustomer: EndCustomer;

  @Column({ name: 'end_customer_id' })
  endCustomerId: string;

  @ManyToOne(() => Address, { nullable: false })
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress: Address;

  @Column({ name: 'delivery_address_id' })
  deliveryAddressId: string;

  @Column({ type: 'uuid', name: 'assigned_dfp_id', nullable: true })
  assignedDfpId: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  currentStage: string | null;

  @Column({ type: 'int', default: 48 })
  slaHours: number;

  @Column({ type: 'timestamptz' })
  slaDeadline: Date;

  @Column({ type: 'boolean', default: false })
  slaBreached: boolean;

  @OneToMany(() => EFlowStage, (stage) => stage.workOrder, { cascade: true })
  stages: EFlowStage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
