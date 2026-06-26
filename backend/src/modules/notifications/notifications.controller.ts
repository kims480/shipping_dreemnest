import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationChannel, NotificationEvent } from './entities/notification-template.entity';

interface DispatchDto {
  event: NotificationEvent;
  channel: NotificationChannel;
  recipient: string;
  workOrderId?: string;
  variables?: Record<string, string>;
  locale?: string;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('dispatch')
  dispatch(@Body() dto: DispatchDto) {
    return this.notificationsService.dispatch(dto);
  }

  @Get('templates')
  findAllTemplates(@Query('event') event?: string, @Query('channel') channel?: string) {
    return this.notificationsService.findAllTemplates(
      event as NotificationEvent | undefined,
      channel as NotificationChannel | undefined,
    );
  }

  @Post('templates')
  createTemplate(
    @Body() body: { event: string; channel: string; locale?: string; subject?: string; body: string; active?: boolean },
  ) {
    return this.notificationsService.createTemplate(body);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() body: { subject?: string; body?: string; active?: boolean },
  ) {
    return this.notificationsService.updateTemplate(id, body);
  }
}
