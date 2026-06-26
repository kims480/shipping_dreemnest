import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Not, Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from '../../modules/orders/entities/work-order.entity';
import { NotificationsService } from '../../modules/notifications/notifications.service';
import {
  NotificationChannel,
  NotificationEvent,
} from '../../modules/notifications/entities/notification-template.entity';
import { DAILY_REMINDER_QUEUE } from './jobs.constants';

/**
 * Daily reminder sweep (PDR §7 round-4 requirement): nudges end customers
 * about unconfirmed/in-flight work orders until they confirm or the WO closes.
 * A per-recipient cap/opt-out policy belongs in NotificationsService once the
 * notificationPreferences/consent model is wired to provider delivery receipts.
 */
@Processor(DAILY_REMINDER_QUEUE)
export class DailyReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(DailyReminderProcessor.name);

  constructor(
    @InjectRepository(WorkOrder) private readonly workOrderRepo: Repository<WorkOrder>,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    const pending = await this.workOrderRepo.find({
      where: { status: Not(WorkOrderStatus.DELIVERED) },
      relations: { endCustomer: true },
    });

    for (const workOrder of pending) {
      await this.notificationsService.dispatch({
        event: NotificationEvent.DAILY_REMINDER,
        channel: NotificationChannel.SMS,
        recipient: workOrder.endCustomer.phone,
        workOrderId: workOrder.id,
        variables: { reference: workOrder.reference, stage: workOrder.currentStage ?? '' },
      });
    }

    this.logger.log(`Dispatched ${pending.length} daily reminder(s)`);
  }
}
