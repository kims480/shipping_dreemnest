import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EndCustomer } from './end-customer.entity';

/**
 * A saved delivery location (PDR §2 round-2 requirement: multiple addresses,
 * exactly one default). `isDefault` is enforced at the service layer
 * (unset previous default before setting a new one).
 */
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EndCustomer, (customer) => customer.addresses, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'end_customer_id' })
  endCustomer: EndCustomer;

  @Column({ name: 'end_customer_id' })
  endCustomerId: string;

  @Column({ type: 'varchar', length: 120 })
  label: string;

  @Column({ type: 'text' })
  addressLine: string;

  @Column({ type: 'varchar', length: 80 })
  city: string;

  @Column({ type: 'float', nullable: true })
  lat: number | null;

  @Column({ type: 'float', nullable: true })
  lng: number | null;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
