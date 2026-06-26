import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { LessThan, Not, Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from '../../modules/orders/entities/work-order.entity';
import {
  ProblemRecord,
  ProblemSource,
} from '../../modules/problem-management/entities/problem-record.entity';
import { SLA_CHECK_QUEUE } from './jobs.constants';

/**
 * Periodic SLA sweep (PDR §5/§9): flags any in-flight WO whose `slaDeadline`
 * has passed, marks it breached, and opens a Problem Management record.
 * Scheduled by a repeatable job registered in `JobsModule`.
 */
@Processor(SLA_CHECK_QUEUE)
export class SlaCheckProcessor extends WorkerHost {
  private readonly logger = new Logger(SlaCheckProcessor.name);

  constructor(
    @InjectRepository(WorkOrder) private readonly workOrderRepo: Repository<WorkOrder>,
    @InjectRepository(ProblemRecord) private readonly problemRepo: Repository<ProblemRecord>,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const breached = await this.workOrderRepo.find({
      where: {
        slaBreached: false,
        slaDeadline: LessThan(new Date()),
        status: Not(WorkOrderStatus.DELIVERED),
      },
    });

    for (const workOrder of breached) {
      workOrder.slaBreached = true;
      workOrder.status = WorkOrderStatus.PROBLEM;
      await this.workOrderRepo.save(workOrder);

      await this.problemRepo.save(
        this.problemRepo.create({
          workOrderId: workOrder.id,
          source: ProblemSource.SLA_BREACH,
          category: 'sla_breach',
          description: `Work order ${workOrder.reference} exceeded its ${workOrder.slaHours}h SLA deadline.`,
        }),
      );
    }

    if (breached.length > 0) {
      this.logger.warn(`Flagged ${breached.length} work order(s) as SLA-breached`);
    }
  }
}
