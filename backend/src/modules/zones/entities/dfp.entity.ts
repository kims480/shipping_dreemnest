import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Zone } from './zone.entity';

export enum DfpKind {
  IN_HOUSE = 'in_house',
  SUBCONTRACTOR = 'subcontractor',
}

/**
 * Delivery Focal Point (PDR §4, §8): one default operator per zone, person or
 * 3rd-party subcontractor. Live location feeds the nearest-DFP assignment engine.
 */
@Entity('delivery_focal_points')
export class Dfp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Zone, (zone) => zone.dfps, { nullable: false })
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @Column({ name: 'zone_id' })
  zoneId: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'enum', enum: DfpKind, default: DfpKind.IN_HOUSE })
  kind: DfpKind;

  @Column({ type: 'varchar', length: 32 })
  phone: string;

  /** Most recently reported GPS position — stored as flat float columns
   *  while PostGIS is not yet installed; swap back to a geometry column once
   *  the postgis extension is available on the server. */
  @Column({ type: 'float', nullable: true })
  currentLng: number | null;

  @Column({ type: 'float', nullable: true })
  currentLat: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLocationAt: Date | null;

  /** Default 5 minutes; admin-configurable (PDR §8 / requirement #19). */
  @Column({ type: 'int', default: 5 })
  locationPingIntervalMinutes: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
