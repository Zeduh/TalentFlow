import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { FilterTenantDto } from './dto/filter-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Tenants')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar tenant' })
  @ApiBody({ type: CreateTenantDto })
  @ApiResponse({
    status: 201,
    description: 'Tenant criado com sucesso',
    type: CreateTenantDto,
  })
  async create(@Body() dto: CreateTenantDto) {
    this.logger.log(`POST /tenants - payload: ${JSON.stringify(dto)}`);
    return this.tenantService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tenants (com filtro)' })
  @ApiResponse({ status: 200, description: 'Lista de tenants' })
  async findAll(@Query() filter: FilterTenantDto) {
    this.logger.log(`GET /tenants - filtros: ${JSON.stringify(filter)}`);
    return this.tenantService.findAll(filter);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar tenant' })
  @ApiBody({ type: UpdateTenantDto })
  @ApiResponse({
    status: 200,
    description: 'Tenant atualizado',
    type: UpdateTenantDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    this.logger.log(`PUT /tenants/${id} - payload: ${JSON.stringify(dto)}`);
    return this.tenantService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover tenant' })
  @ApiResponse({ status: 200, description: 'Tenant removido' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.warn(`DELETE /tenants/${id}`);
    return this.tenantService.remove(id);
  }
}
