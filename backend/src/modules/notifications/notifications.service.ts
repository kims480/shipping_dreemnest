import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog, NotificationStatus } from './entities/notification-log.entity';
import {
  NotificationChannel,
  NotificationEvent,
  NotificationTemplate,
} from './entities/notification-template.entity';

interface DispatchInput {
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient: string;
  workOrderId?: string;
  variables?: Record<string, string>;
  locale?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationTemplate) private readonly templateRepo: Repository<NotificationTemplate>,
    @InjectRepository(NotificationLog) private readonly logRepo: Repository<NotificationLog>,
  ) {}

  // ── Template management ───────────────────────────────────────────────────

  findAllTemplates(event?: NotificationEvent, channel?: NotificationChannel): Promise<NotificationTemplate[]> {
    const where: Record<string, unknown> = {};
    if (event) where.event = event;
    if (channel) where.channel = channel;
    return this.templateRepo.find({ where, order: { event: 'ASC', channel: 'ASC', locale: 'ASC' } });
  }

  async createTemplate(data: {
    event: string; channel: string; locale?: string; subject?: string; body: string; active?: boolean;
  }): Promise<NotificationTemplate> {
    return this.templateRepo.save(
      this.templateRepo.create({
        event: data.event as NotificationEvent,
        channel: data.channel as NotificationChannel,
        locale: data.locale ?? 'en',
        subject: data.subject ?? null,
        body: data.body,
        active: data.active ?? true,
      }),
    );
  }

  async updateTemplate(id: string, data: { subject?: string; body?: string; active?: boolean }): Promise<NotificationTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    if (data.subject !== undefined) template.subject = data.subject;
    if (data.body !== undefined) template.body = data.body;
    if (data.active !== undefined) template.active = data.active;
    return this.templateRepo.save(template);
  }

  // ── Dispatch ──────────────────────────────────────────────────────────────

  async dispatch(input: DispatchInput): Promise<NotificationLog> {
    const template = await this.templateRepo.findOne({
      where: { event: input.event, channel: input.channel, locale: input.locale ?? 'en', active: true },
    });

    const log = this.logRepo.create({
      event: input.event,
      channel: input.channel,
      recipient: input.recipient,
      workOrderId: input.workOrderId ?? null,
      status: NotificationStatus.QUEUED,
      attempts: 0,
    });
    await this.logRepo.save(log);

    const renderedBody = this.render(template?.body ?? input.event, input.variables ?? {});
    try {
      this.logger.log(`[${input.channel}] -> ${input.recipient}: ${renderedBody}`);
      log.status = NotificationStatus.SENT;
      log.attempts = 1;
    } catch (error) {
      log.status = NotificationStatus.FAILED;
      log.providerResponse = error instanceof Error ? error.message : String(error);
      log.attempts = 1;
    }
    return this.logRepo.save(log);
  }

  private render(template: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (text, [key, value]) => text.replaceAll(`{{${key}}}`, value),
      template,
    );
  }
}
