import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InterviewService } from '../interviews/interview.service';
import {
  CalendarWebhookDto,
  CalendarWebhookType,
} from './dto/calendar-webhook.dto';
import Redis from 'ioredis';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private static webhookCount = 0; // métrica simples

  private redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly interviewService: InterviewService,
  ) {
    this.redis = new Redis({
      host: configService.get('REDIS_HOST'),
      port: Number(configService.get('REDIS_PORT')),
    });
  }

  async handleCalendarWebhook(
    dto: CalendarWebhookDto,
  ): Promise<
    | { processed: true; result: any; webhookCount: number }
    | { idempotent: true; webhookCount: number }
  > {
    const secret = this.configService.get<string>('WEBHOOK_SECRET');
    if (dto.signature !== secret) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

    const idemKey = `webhook:idempotency:${dto.idempotencyKey}`;
    const alreadyProcessed = await this.redis.get(idemKey);
    if (alreadyProcessed) {
      this.logger.log(
        JSON.stringify({
          event: 'calendar_webhook_received',
          interviewId: dto.interviewId,
          type: dto.type,
          idempotencyKey: dto.idempotencyKey,
          processed: false,
          timestamp: new Date().toISOString(),
        }),
      );
      WebhooksService.webhookCount++;
      return { idempotent: true, webhookCount: WebhooksService.webhookCount };
    }

    // Atualiza status da entrevista conforme tipo do evento
    let result;
    switch (dto.type) {
      case CalendarWebhookType.CREATED:
      case CalendarWebhookType.UPDATED:
        result = await this.interviewService.updateStatusFromWebhook(
          dto.interviewId,
          'interview_scheduled',
          dto.scheduledAt,
        );
        break;
      case CalendarWebhookType.CANCELLED:
        result = await this.interviewService.updateStatusFromWebhook(
          dto.interviewId,
          'cancelled',
        );
        break;
      default:
        throw new NotFoundException('Tipo de evento desconhecido');
    }

    await this.redis.set(idemKey, '1', 'EX', 60 * 60 * 24);

    this.logger.log(
      JSON.stringify({
        event: 'calendar_webhook_processed',
        interviewId: dto.interviewId,
        type: dto.type,
        idempotencyKey: dto.idempotencyKey,
        processed: true,
        timestamp: new Date().toISOString(),
      }),
    );
    WebhooksService.webhookCount++;

    return {
      processed: true,
      result,
      webhookCount: WebhooksService.webhookCount,
    };
  }
}
