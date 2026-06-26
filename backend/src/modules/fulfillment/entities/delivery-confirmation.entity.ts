import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkOrder } from '../../orders/entities/work-order.entity';

/**
 * Captures the DFP-collected sign-off + satisfaction questionnaire on close
 * (PDR §8 round-3 requirement #21) that triggers the delivery-confirmation
 * notification and feeds the end-customer rating prompt.
 */
@Entity('delivery_confirmations')
export class DeliveryConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => WorkOrder, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @Column({ name: 'work_order_id' })
  workOrderId: string;

  @Column({ type: 'varchar', length: 160 })
  signedByName: string;

  @Column({ type: 'text', nullable: true })
  signatureImageUrl: string | null;

  @Column({ type: 'jsonb', default: () => `'{}'` })
  satisfactionAnswers: Record<string, string | number | boolean>;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  confirmedAt: Date;
}
