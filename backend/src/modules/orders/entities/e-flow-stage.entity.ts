import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkOrder } from './work-order.entity';

/**
 * Stage names follow the warehouse-centric e-flows from PDR §5:
 *  New:    pickup_from_store -> warehouse_inbound -> warehouse_outbound -> out_for_delivery -> delivered
 *  Return: pickup_from_customer -> warehouse_inbound -> warehouse_outbound -> out_for_delivery_to_store -> delivered
 */
export enum EFlowStageName {
  WO_CREATED = 'wo_created',
  PICKUP_FROM_STORE = 'pickup_from_store',
  PICKUP_FROM_CUSTOMER = 'pickup_from_customer',
  WAREHOUSE_INBOUND = 'warehouse_inbound',
  WAREHOUSE_OUTBOUND = 'warehouse_outbound',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  OUT_FOR_DELIVERY_TO_STORE = 'out_for_delivery_to_store',
  DELIVERED = 'delivered',
}

@Entity('e_flow_stages')
export class EFlowStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.stages, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @Column({ name: 'work_order_id' })
  workOrderId: string;

  @Column({ type: 'enum', enum: EFlowStageName })
  name: EFlowStageName;

  @Column({ type: 'varchar', length: 160, nullable: true })
  ownerLabel: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  enteredAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
