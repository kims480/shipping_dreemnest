import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { WorkOrder } from '../../modules/orders/entities/work-order.entity';
import { ProblemRecord } from '../../modules/problem-management/entities/problem-record.entity';
import { NotificationsModule } from '../../modules/notifications/notifications.module';
import { SlaCheckProcessor } from './sla-check.processor';
import { DailyReminderProcessor } from './daily-reminder.processor';
import {
  DAILY_REMINDER_QUEUE,
  DFP_LOCATION_PING_QUEUE,
  NOTIFICATION_DISPATCH_QUEUE,
  SLA_CHECK_QUEUE,
} from './jobs.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: SLA_CHECK_QUEUE },
      { name: DAILY_REMINDER_QUEUE },
      { name: DFP_LOCATION_PING_QUEUE },
      { name: NOTIFICATION_DISPATCH_QUEUE },
    ),
    TypeOrmModule.forFeature([WorkOrder, ProblemRecord]),
    NotificationsModule,
  ],
  providers: [SlaCheckProcessor, DailyReminderProcessor],
})
export class JobsModule implements OnModuleInit {
  constructor(
    @InjectQueue(SLA_CHECK_QUEUE) private readonly slaQueue: Queue,
    @InjectQueue(DAILY_REMINDER_QUEUE) private readonly reminderQueue: Queue,
  ) {}

  /** Registers the repeatable sweeps: SLA check every 15 min, reminders daily at 09:00. */
  async onModuleInit(): Promise<void> {
    await this.slaQueue.upsertJobScheduler('sla-check-sweep', { every: 15 * 60 * 1000 }, { name: 'sweep' });
    await this.reminderQueue.upsertJobScheduler(
      'daily-reminder-sweep',
      { pattern: '0 9 * * *' },
      { name: 'sweep' },
    );
  }
}
