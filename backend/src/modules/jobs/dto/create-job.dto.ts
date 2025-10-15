import { IsString, IsEnum, MinLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../job.entity';

export class CreateJobDto {
  @ApiProperty({
    example: 'Desenvolvedor Backend',
    description: 'Título da vaga',
  })
  @IsString()
  @MinLength(1, { message: 'O título não pode ser vazio' })
  title: string;

  @ApiProperty({
    example: 'open',
    enum: JobStatus,
    description: 'Status da vaga',
  })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiProperty({
    example: 'uuid-da-organizacao',
    description:
      'UUID da organização. Obrigatório para admin. Ignorado para recruiter (será preenchido automaticamente).',
  })
  @IsUUID()
  organizationId: string;
}
