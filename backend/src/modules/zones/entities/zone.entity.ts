import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dfp } from './dfp.entity';

export enum ZoneRegion {
  NORTH_RIYADH = 'north_riyadh',
  WEST_RIYADH = 'west_riyadh',
  EAST_RIYADH = 'east_riyadh',
  SOUTH_RIYADH = 'south_riyadh',
}

/**
 * A geographic operating zone (PDR §4 — exactly 4 launch zones in Riyadh).
 * Boundary is stored as a PostGIS polygon for nearest-DFP / containment queries.
 */
@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'enum', enum: ZoneRegion, unique: true })
  region: ZoneRegion;

  /** Boundary stored as GeoJSON text until PostGIS is available on this server. */
  @Column({ type: 'text', nullable: true })
  boundaryGeoJson: string | null;

  @Column({ type: 'int', default: 48 })
  defaultSlaHours: number;

  @OneToMany(() => Dfp, (dfp) => dfp.zone)
  dfps: Dfp[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
