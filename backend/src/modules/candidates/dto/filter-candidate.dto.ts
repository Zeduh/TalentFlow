import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { CandidateStatus } from '../candidate.entity';

export class FilterCandidateDto {
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @IsOptional()
  @IsUUID()
  jobId?: string;

  @IsOptional()
  @IsUUID()
  cursor?: string;

  @IsOptional()
  limit?: number;
}
