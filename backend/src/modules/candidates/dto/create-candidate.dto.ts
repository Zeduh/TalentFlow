import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail, IsEnum, IsUUID } from 'class-validator';
import { CandidateStatus } from '../candidate.entity';

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
}