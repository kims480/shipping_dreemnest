import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentMethod {
  COD = 'cod',
  ONLINE = 'online',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  RECONCILED = 'reconciled',
  REFUNDED = 'refunded',
}

/**
 * COD collection / reconciliation record (PDR §11.1 parity checklist —
 * "Accounting / COD" module from the existing LogesTechs deployment).
 * Online gateway integration (Moyasar/HyperPay) plugs in via `integrations`.
 */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'work_order_id' })
  workOrderId: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 8, default: 'SAR' })
  currency: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  collectedByDfpId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reconciledAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
