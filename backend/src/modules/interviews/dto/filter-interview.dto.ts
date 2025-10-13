import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterviewStatus } from '../interview.entity';

export class FilterInterviewDto {
  @ApiPropertyOptional({ example: 'scheduled', enum: InterviewStatus })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiPropertyOptional({ example: 'UUID do candidato valido' })
  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @ApiPropertyOptional({ example: 'UUID do cursor valido' })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}
