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
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
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

@ApiTags('candidates')
@ApiBearerAuth('JWT-auth')
@Controller('candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CandidateController {
  private readonly logger = new Logger(CandidateController.name);

  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Criar novo candidato' })
  @ApiResponse({ status: 201, description: 'Candidato criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `[POST /candidates] User: ${req.user.email}, Role: ${req.user.role}, Org: ${req.user.organizationId}`,
    );

    // Nota: a validação de organizationId é feita no service via jobId
    return this.candidateService.create(createCandidateDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar candidatos com filtros e paginação' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'applied',
      'screening',
      'interview_scheduled',
      'offer',
      'hired',
      'rejected',
    ],
  })
  @ApiQuery({ name: 'jobId', required: false, type: String })
  @ApiQuery({ name: 'sequenceId', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    description: 'Somente admin pode usar',
  })
  @ApiResponse({ status: 200, description: 'Lista de candidatos' })
  async findAll(
    @Query() filter: FilterCandidateDto & { organizationId?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `[GET /candidates] User: ${req.user.email}, Role: ${req.user.role}, Filters: ${JSON.stringify(filter)}`,
    );

    // Multi-tenant: Admin pode filtrar por organizationId, outros veem só a deles
    if (req.user.role === UserRole.ADMIN && filter.organizationId) {
      return this.candidateService.findAll(filter, filter.organizationId);
    }

    return this.candidateService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Buscar candidato por ID' })
  @ApiResponse({ status: 200, description: 'Candidato encontrado' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`[GET /candidates/${id}] User: ${req.user.email}`);

    const candidate = await this.candidateService.findById(id);

    // Multi-tenant: Admin vê tudo, outros só da sua org
    if (
      req.user.role !== UserRole.ADMIN &&
      candidate.organizationId !== req.user.organizationId
    ) {
      this.logger.warn(
        `[GET /candidates/${id}] FORBIDDEN: User tentou acessar candidato de outra org`,
      );
      throw new ForbiddenException(
        'Você não pode acessar candidatos de outra organização',
      );
    }

    return candidate;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar candidato' })
  @ApiResponse({ status: 200, description: 'Candidato atualizado' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`[PUT /candidates/${id}] User: ${req.user.email}`);

    const candidate = await this.candidateService.findById(id);

    // Multi-tenant: Recruiter só edita da sua org
    if (
      req.user.role === UserRole.RECRUITER &&
      candidate.organizationId !== req.user.organizationId
    ) {
      this.logger.warn(
        `[PUT /candidates/${id}] FORBIDDEN: Recruiter tentou editar candidato de outra org`,
      );
      throw new ForbiddenException(
        'Você só pode editar candidatos da sua organização',
      );
    }

    return this.candidateService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Deletar candidato' })
  @ApiResponse({ status: 200, description: 'Candidato deletado' })
  @ApiResponse({ status: 404, description: 'Candidato não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`[DELETE /candidates/${id}] User: ${req.user.email}`);

    const candidate = await this.candidateService.findById(id);

    // Multi-tenant: Recruiter só deleta da sua org
    if (
      req.user.role === UserRole.RECRUITER &&
      candidate.organizationId !== req.user.organizationId
    ) {
      this.logger.warn(
        `[DELETE /candidates/${id}] FORBIDDEN: Recruiter tentou deletar candidato de outra org`,
      );
      throw new ForbiddenException(
        'Você só pode deletar candidatos da sua organização',
      );
    }

    return this.candidateService.remove(id);
  }
}
