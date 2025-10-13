import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CalendarWebhookDto } from './dto/calendar-webhook.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('calendar')
  @ApiOperation({
    summary: 'Recebe eventos de calendário para entrevistas (webhook)',
  })
  async handleCalendarWebhook(@Body() dto: CalendarWebhookDto) {
    return this.webhooksService.handleCalendarWebhook(dto);
  }
}
