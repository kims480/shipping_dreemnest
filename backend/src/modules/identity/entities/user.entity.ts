import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Multi-persona roles (PDR §3): one account model spans every stakeholder
 * surface — HQ admin, zone DFP operators, merchants/store owners, warehouse
 * staff, and drivers. End customers are modeled separately (EndCustomer).
 */
export enum UserRole {
  ADMIN = 'admin',
  DISPATCH = 'dispatch',
  DFP = 'dfp',
  MERCHANT = 'merchant',
  WAREHOUSE = 'warehouse',
  DRIVER = 'driver',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 160 })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'uuid', name: 'zone_id', nullable: true })
  zoneId: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
