import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Empresa XPTO',
    description: 'Nome da organização/tenant',
  })
  @IsString()
  @MinLength(1, { message: 'O nome do tenant não pode ser vazio' })
  name: string;
}
