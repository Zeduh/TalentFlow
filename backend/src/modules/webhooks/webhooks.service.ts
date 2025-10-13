import { Injectable } from '@nestjs/common';
import { CalendarWebhookDto } from './dto/calendar-webhook.dto';

@Injectable()
export class WebhooksService {
  async handleCalendarWebhook(dto: CalendarWebhookDto): Promise<any> {
    // Lógica de processamento será implementada nas próximas etapas
    return { received: true };
  }
}