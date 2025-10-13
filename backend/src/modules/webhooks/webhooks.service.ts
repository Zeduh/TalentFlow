import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InterviewService } from '../interviews/interview.service';
import { CalendarWebhookDto, CalendarWebhookType } from './dto/calendar-webhook.dto';
import Redis from 'ioredis';

@Injectable()
export class WebhooksService {
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

  async handleCalendarWebhook(dto: CalendarWebhookDto): Promise<any> {
    const secret = this.configService.get<string>('WEBHOOK_SECRET');
    if (dto.signature !== secret) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

    const idemKey = `webhook:idempotency:${dto.idempotencyKey}`;
    const alreadyProcessed = await this.redis.get(idemKey);
    if (alreadyProcessed) {
      return { idempotent: true };
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

    return { processed: true, result };
  }
}