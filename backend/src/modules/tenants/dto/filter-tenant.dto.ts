import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterTenantDto {
  @ApiPropertyOptional({
    example: 'Empresa XPTO',
    description: 'Filtrar pelo nome do tenant',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
