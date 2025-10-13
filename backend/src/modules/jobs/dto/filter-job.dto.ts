import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '../job.entity';

export class FilterJobDto {
  @ApiPropertyOptional({ example: 'open', enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ example: '5189d949-0dd7-40f5-8c26-a4a1b3839f8f' })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;
}
