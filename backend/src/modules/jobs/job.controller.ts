import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

// Interface para tipar o request com usuário autenticado
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
}

@ApiTags('jobs')
@ApiBearerAuth('JWT-auth')
@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JobController {
  private readonly logger = new Logger(JobController.name);

  constructor(private readonly jobService: JobService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Criar nova vaga' })
  @ApiResponse({ status: 201, description: 'Vaga criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(
    @Body() createJobDto: CreateJobDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `[POST /jobs] User: ${req.user.email}, Role: ${req.user.role}, Org: ${req.user.organizationId}`,
    );

    // Valida multi-tenant
    if (
      req.user.role === UserRole.RECRUITER &&
      createJobDto.organizationId !== req.user.organizationId
    ) {
      this.logger.warn(
        `[POST /jobs] FORBIDDEN: Recruiter tentou criar vaga em outra org`,
      );
      throw new ForbiddenException(
        'Você só pode criar vagas na sua organização',
      );
    }

    // Se admin não passou organizationId, usa a dele
    if (!createJobDto.organizationId) {
      createJobDto.organizationId = req.user.organizationId;
    }

    return this.jobService.create(createJobDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar vagas com filtros e paginação' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'closed', 'paused'],
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Somente admin pode usar',
  })
  @ApiResponse({ status: 200, description: 'Lista de vagas' })
  async findAll(
    @Query() filter: FilterJobDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `[GET /jobs] User: ${req.user.email}, Role: ${req.user.role}, Filters: ${JSON.stringify(filter)}`,
    );

    // Multi-tenant: Admin pode filtrar por organizationId, outros veem só a deles
    if (req.user.role === UserRole.ADMIN && filter.organizationId) {
      return this.jobService.findAll(filter, filter.organizationId);
    }

    return this.jobService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Buscar vaga por ID' })
  @ApiResponse({ status: 200, description: 'Vaga encontrada' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`[GET /jobs/${id}] User: ${req.user.email}`);

    const job = await this.jobService.findById(id);

    // Multi-tenant: Admin vê tudo, outros só da sua org
    if (
      req.user.role !== UserRole.ADMIN &&
      job.organizationId !== req.user.organizationId
    ) {
      this.logger.warn(
        `[GET /jobs/${id}] FORBIDDEN: User tentou acessar vaga de outra org`,
      );
      throw new ForbiddenException(
        'Você não pode acessar vagas de outra organização',
      );
    }

    return job;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar vaga' })
  @ApiResponse({ status: 200, description: 'Vaga atualizada' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`[PUT /jobs/${id}] User: ${req.user.email}`);

    const job = await this.jobService.findById(id);

    // Multi-tenant: Recruiter só edita da sua org
    if (
      req.user.role === UserRole.RECRUITER &&
      job.organizationId !== req.user.organizationId
    ) {
      this.logger.warn(
        `[PUT /jobs/${id}] FORBIDDEN: Recruiter tentou editar vaga de outra org`,
      );
      throw new ForbiddenException(
        'Você só pode editar vagas da sua organização',
      );
    }

    // Recruiter não pode mudar organizationId
    if (
      req.user.role === UserRole.RECRUITER &&
      updateJobDto.organizationId &&
      updateJobDto.organizationId !== job.organizationId
    ) {
      this.logger.warn(
        `[PUT /jobs/${id}] FORBIDDEN: Recruiter tentou mudar organizationId`,
      );
      throw new ForbiddenException(
        'Você não pode transferir vagas entre organizações',
      );
    }

    return this.jobService.update(id, updateJobDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Deletar vaga' })
  @ApiResponse({ status: 200, description: 'Vaga deletada' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`[DELETE /jobs/${id}] User: ${req.user.email}`);

    const job = await this.jobService.findById(id);

    // Multi-tenant: Recruiter só deleta da sua org
    if (
      req.user.role === UserRole.RECRUITER &&
      job.organizationId !== req.user.organizationId
    ) {
      this.logger.warn(
        `[DELETE /jobs/${id}] FORBIDDEN: Recruiter tentou deletar vaga de outra org`,
      );
      throw new ForbiddenException(
        'Você só pode deletar vagas da sua organização',
      );
    }

    return this.jobService.remove(id);
  }
}
