import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationChannel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  SYSTEM = 'system',
}

export enum NotificationEvent {
  WO_RECEIVED = 'wo_received',
  WO_STAGE_CHANGED = 'wo_stage_changed',
  DAILY_REMINDER = 'daily_reminder',
  DELIVERY_CONFIRMATION = 'delivery_confirmation',
  DFP_ASSIGNMENT = 'dfp_assignment',
  SLA_BREACH_WARNING = 'sla_breach_warning',
}

/**
 * Admin-customizable templates per channel/event/locale (PDR §8 round-3
 * requirement: DFP notification templates configurable by admin; same
 * mechanism backs end-customer multi-channel messaging incl. daily reminders).
 */
@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationEvent })
  event: NotificationEvent;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ type: 'varchar', length: 8, default: 'en' })
  locale: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
