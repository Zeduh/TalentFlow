import { IsString, IsEmail, IsEnum, IsUUID, MinLength } from 'class-validator';
import { CandidateStatus } from '../candidate.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(1, { message: 'O nome não pode ser vazio' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: CandidateStatus.APPLIED, enum: CandidateStatus })
  @IsEnum(CandidateStatus)
  status: CandidateStatus;

  @ApiProperty({ example: 'uuid-da-vaga' })
  @IsUUID()
  jobId: string;

  @ApiProperty({ example: 'uuid-da-organizacao' })
  @IsUUID()
  organizationId: string;
}
