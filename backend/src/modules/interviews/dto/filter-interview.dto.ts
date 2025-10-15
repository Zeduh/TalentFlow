import { IsOptional, IsEnum, IsUUID, IsInt } from 'class-validator';
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

  @ApiPropertyOptional({
    example: 1,
    description: 'Cursor para paginação (sequenceId)',
  })
  @IsOptional()
  @IsInt()
  sequenceId?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}
