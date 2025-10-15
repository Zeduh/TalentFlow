import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
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
  @ApiBody({
    type: CalendarWebhookDto,
    examples: {
      created: {
        summary: 'Entrevista criada',
        value: {
          eventId: 'evt_123',
          type: 'created',
          interviewId: 'uuid-da-entrevista',
          candidateId: 'uuid-do-candidato',
          scheduledAt: '2025-10-12T10:00:00Z',
          idempotencyKey: 'idem-key-abc123',
          signature: 'assinatura-mock',
        },
      },
      cancelled: {
        summary: 'Entrevista cancelada',
        value: {
          eventId: 'evt_456',
          type: 'cancelled',
          interviewId: 'uuid-da-entrevista',
          idempotencyKey: 'idem-key-xyz789',
          signature: 'assinatura-mock',
        },
      },
    },
  })
  async handleCalendarWebhook(
    @Body() dto: CalendarWebhookDto,
  ): Promise<
    | { processed: true; result: any; webhookCount: number }
    | { idempotent: true; webhookCount: number }
  > {
    return this.webhooksService.handleCalendarWebhook(dto);
  }
}
