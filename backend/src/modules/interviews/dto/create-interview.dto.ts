import { IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewStatus } from '../interview.entity';

export class CreateInterviewDto {
  @ApiProperty({
    example: 'UUID do candidato valido',
    description: 'UUID do candidato',
  })
  @IsUUID()
  candidateId: string;

  @ApiProperty({
    example: '2025-10-12T10:00:00Z',
    description: 'Data e hora agendada da entrevista',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    example: 'scheduled',
    enum: InterviewStatus,
    description: 'Status da entrevista',
  })
  @IsEnum(InterviewStatus)
  status: InterviewStatus;

  @ApiProperty({
    example: 'UUID da organização valido',
    description: 'UUID da organização',
  })
  @IsUUID()
  organizationId: string;
}
