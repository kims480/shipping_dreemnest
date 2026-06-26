import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProblemSource {
  SLA_BREACH = 'sla_breach',
  END_CUSTOMER_COMPLAINT = 'end_customer_complaint',
  DFP_REPORTED = 'dfp_reported',
  MERCHANT_REPORTED = 'merchant_reported',
}

export enum ProblemStatus {
  OPEN = 'open',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

/**
 * Centralized Problem Management record (PDR §9): aggregates SLA breaches
 * and complaints raised by any stakeholder, drives assignment/resolution
 * tracking and zone/DFP/stage analytics.
 */
@Entity('problem_records')
export class ProblemRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'work_order_id' })
  workOrderId: string;

  @Column({ type: 'enum', enum: ProblemSource })
  source: ProblemSource;

  @Column({ type: 'enum', enum: ProblemStatus, default: ProblemStatus.OPEN })
  status: ProblemStatus;

  @Column({ type: 'varchar', length: 160 })
  category: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', name: 'assigned_to_user_id', nullable: true })
  assignedToUserId: string | null;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
