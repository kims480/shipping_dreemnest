import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { WorkOrder } from './work-order.entity';

/**
 * Recipient profile (PDR §2/§7): may start as a guest from a WO and later
 * self-register; carries notification preferences and a preferred delivery
 * time-window (round-2 requirement).
 */
@Entity('end_customers')
export class EndCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  fullName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  phone: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  isRegistered: boolean;

  @Column({ type: 'varchar', length: 40, nullable: true })
  preferredTimeWindow: string | null;

  @Column({ type: 'jsonb', default: () => `'{"sms": true, "whatsapp": true, "email": true}'` })
  notificationPreferences: { sms: boolean; whatsapp: boolean; email: boolean };

  @OneToMany(() => Address, (address) => address.endCustomer)
  addresses: Address[];

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.endCustomer)
  workOrders: WorkOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
