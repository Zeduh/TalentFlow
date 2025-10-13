import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CalendarWebhookDto } from './dto/calendar-webhook.dto';
import Redis from 'ioredis';

@Injectable()
export class WebhooksService {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
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
      // Idempotente: já processado
      return { idempotent: true };
    }

    // Processamento do webhook (a implementar)
    // ...

    // Salva chave de idempotência por 24h
    await this.redis.set(idemKey, '1', 'EX', 60 * 60 * 24);

    return { processed: true };
  }
}