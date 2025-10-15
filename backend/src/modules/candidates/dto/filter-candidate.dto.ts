import { IsOptional, IsEnum, IsUUID, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CandidateStatus } from '../candidate.entity';

export class FilterCandidateDto {
  @ApiPropertyOptional({ example: 'applied', enum: CandidateStatus })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @ApiPropertyOptional({ example: 'uuid-da-vaga' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Cursor para paginação (sequenceId)',
  })
  @IsOptional()
  @IsInt()
  sequenceId?: number;
}
