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
  Req,
  Logger,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('Jobs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobController {
  private readonly logger = new Logger(JobController.name);

  constructor(private readonly jobService: JobService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Criar vaga' })
  @ApiBody({
    description:
      'Para admin: informe o organizationId desejado. Para recruiter: organizationId será ignorado e preenchido automaticamente.',
    type: CreateJobDto,
    examples: {
      admin: {
        summary: 'Admin',
        value: {
          title: 'Desenvolvedor Backend',
          status: 'open',
          organizationId: 'uuid-da-organizacao',
        },
      },
      recruiter: {
        summary: 'Recruiter',
        value: {
          title: 'Desenvolvedor Backend',
          status: 'open',
          // organizationId será ignorado se enviado pelo recruiter
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Vaga criada com sucesso',
    schema: {
      example: {
        id: 'uuid',
        title: 'Desenvolvedor Backend',
        status: 'open',
        organizationId: 'uuid-da-organizacao',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async create(
    @Body() dto: CreateJobDto,
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    if (req.user.role === UserRole.ADMIN) {
      // Admin pode criar para qualquer tenant (usa o organizationId do body)
      return this.jobService.create(dto);
    }
    // Recruiter só pode criar para seu tenant
    return this.jobService.create({
      ...dto,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Listar vagas com filtros e paginação cursor-based',
    description:
      'Admin pode filtrar por qualquer tenant usando organizationId. Demais perfis só visualizam vagas da própria organização.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'closed', 'paused'],
    description: 'Filtrar por status da vaga',
  })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor para paginação' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de itens por página' })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    type: String,
    description: 'UUID da organização (apenas para admin; ignorado para outros perfis)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de vagas',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            title: 'Desenvolvedor Backend',
            status: 'open',
            organizationId: 'uuid',
          },
        ],
        nextCursor: 'uuid',
        hasMore: true,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async findAll(
    @Query() filter: FilterJobDto & { organizationId?: string },
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(
      `GET /jobs - user: ${req.user.email} - filter: ${JSON.stringify(filter)}`,
    );

    // Admin pode filtrar por qualquer tenant
    if (req.user.role === UserRole.ADMIN) {
      return this.jobService.findAll(filter, filter.organizationId);
    }

    // Demais roles: sempre força o filtro do próprio tenant
    return this.jobService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Detalhar vaga' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da vaga',
    example: 'uuid-da-vaga',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da vaga',
    schema: {
      example: {
        id: 'uuid',
        title: 'Desenvolvedor Backend',
        status: 'open',
        organizationId: 'uuid-da-organizacao',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { organizationId: string; role: string } },
  ) {
    const job = await this.jobService.findById(id);
    if (
      req.user.role !== UserRole.ADMIN &&
      job.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException('Acesso negado a esta vaga');
    }
    return job;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar vaga' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da vaga',
    example: 'uuid-da-vaga',
  })
  @ApiBody({
    description:
      'Para admin: pode atualizar qualquer campo. Para recruiter: só pode atualizar vagas do próprio tenant.',
    type: UpdateJobDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Vaga atualizada',
    schema: {
      example: {
        id: 'uuid',
        title: 'Desenvolvedor Backend',
        status: 'open',
        organizationId: 'uuid-da-organizacao',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateJobDto,
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(
      `PUT /jobs/${id} - user: ${req.user.email} - payload: ${JSON.stringify(dto)}`,
    );
    const job = await this.jobService.findById(id);
    if (
      req.user.role !== UserRole.ADMIN &&
      job.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException('Acesso negado a esta vaga');
    }
    // Recruiter só pode atualizar vaga do seu tenant
    // Admin pode atualizar qualquer vaga
    return this.jobService.update(id, {
      ...dto,
      ...(req.user.role !== UserRole.ADMIN && { organizationId: req.user.organizationId }),
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover vaga' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da vaga',
    example: 'uuid-da-vaga',
  })
  @ApiResponse({
    status: 200,
    description: 'Vaga removida',
    schema: {
      example: {
        message: 'Vaga removida com sucesso',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(`DELETE /jobs/${id} - user: ${req.user.email}`);
    const job = await this.jobService.findById(id);
    return this.jobService.remove(id);
  }
}