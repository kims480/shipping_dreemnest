import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Flat key-value configuration store for external integrations.
 * Keys are namespaced: `twilio.accountSid`, `whatsapp.apiKey`, etc.
 * Sensitive values (tokens, secrets) are stored as-is; production
 * deployments should encrypt at rest or reference a secrets manager.
 */
@Entity('system_configs')
export class SystemConfig {
  @PrimaryColumn({ type: 'varchar', length: 120 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  group: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  label: string | null;

  @Column({ type: 'boolean', default: false })
  sensitive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
