import { IsString, IsUUID, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CalendarWebhookType {
  CREATED = 'created',
  UPDATED = 'updated',
  CANCELLED = 'cancelled',
}

export class CalendarWebhookDto {
  @ApiProperty({ example: 'evt_123', description: 'ID do evento no calendário' })
  @IsString()
  eventId: string;

  @ApiProperty({ example: 'created', enum: CalendarWebhookType })
  @IsEnum(CalendarWebhookType)
  type: CalendarWebhookType;

  @ApiProperty({ example: 'uuid-da-entrevista', description: 'UUID da entrevista' })
  @IsUUID()
  interviewId: string;

  @ApiProperty({ example: 'uuid-do-candidato', required: false })
  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @ApiProperty({ example: '2025-10-12T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ example: 'idem-key-abc123', description: 'Chave de idempotência' })
  @IsString()
  idempotencyKey: string;

  @ApiProperty({ example: 'assinatura-mock', description: 'Assinatura do webhook' })
  @IsString()
  signature: string;
}