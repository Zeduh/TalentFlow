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
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CandidateStatus } from './candidate.entity';

@ApiTags('Candidates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('candidates')
export class CandidateController {
  private readonly logger = new Logger(CandidateController.name);

  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Criar candidato' })
  @ApiBody({
    description:
      'Para admin: informe o organizationId desejado. Para recruiter: organizationId será ignorado e preenchido automaticamente.',
    type: CreateCandidateDto,
    examples: {
      admin: {
        summary: 'Admin',
        value: {
          name: 'João Silva',
          email: 'joao@email.com',
          status: 'applied',
          jobId: 'uuid-da-vaga'
        },
      },
      recruiter: {
        summary: 'Recruiter',
        value: {
          name: 'João Silva',
          email: 'joao@email.com',
          status: 'applied',
          jobId: 'uuid-da-vaga',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Candidato criado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        name: 'João Silva',
        email: 'joao@email.com',
        status: 'applied',
        jobId: 'uuid-da-vaga',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async create(
    @Body() dto: CreateCandidateDto,
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(
      `POST /candidates - user: ${req.user.email} - payload: ${JSON.stringify(dto)}`,
    );
    if (req.user.role === UserRole.ADMIN) {
      return this.candidateService.create(dto);
    }
    return this.candidateService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Listar candidatos com filtros e paginação cursor-based',
    description:
      'Admin pode filtrar por qualquer tenant usando organizationId. Demais perfis só visualizam candidatos da própria organização.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(CandidateStatus),
    description: 'Filtrar por status do candidato',
  })
  @ApiQuery({ name: 'jobId', required: false, type: String, description: 'UUID da vaga' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Cursor para paginação (sequenceId)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de itens por página' })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    type: String,
    description: 'UUID da organização (apenas para admin; ignorado para outros perfis)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de candidatos',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'João Silva',
            email: 'joao@email.com',
            status: 'applied',
            jobId: 'uuid-da-vaga',
            organizationId: 'uuid-da-organizacao',
            sequenceId: 1,
          },
        ],
        nextCursor: '2',
        hasMore: true,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async findAll(
    @Query() filter: FilterCandidateDto & { organizationId?: string },
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(
      `GET /candidates - user: ${req.user.email} - filter: ${JSON.stringify(filter)}`,
    );
    if (req.user.role === UserRole.ADMIN && filter.organizationId) {
      return this.candidateService.findAll(filter, filter.organizationId);
    }
    return this.candidateService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Detalhar candidato' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do candidato',
    example: 'uuid-do-candidato',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do candidato',
    schema: {
      example: {
        id: 'uuid',
        name: 'João Silva',
        email: 'joao@email.com',
        status: 'applied',
        jobId: 'uuid-da-vaga',
        organizationId: 'uuid-da-organizacao',
        sequenceId: 1,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { organizationId: string; role: string } },
  ) {
    const candidate = await this.candidateService.findById(id);
    if (
      req.user.role !== UserRole.ADMIN &&
      candidate.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException('Acesso negado a este candidato');
    }
    return candidate;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar candidato' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do candidato',
    example: 'uuid-do-candidato',
  })
  @ApiBody({
    description:
      'Para admin: pode atualizar qualquer campo. Para recruiter: só pode atualizar candidatos do próprio tenant.',
    type: UpdateCandidateDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Candidato atualizado',
    schema: {
      example: {
        id: 'uuid',
        name: 'João Silva',
        email: 'joao@email.com',
        status: 'screening',
        jobId: 'uuid-da-vaga',
        organizationId: 'uuid-da-organizacao',
        sequenceId: 1,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCandidateDto,
    @Req() req: Request & { user: { organizationId: string; role: string } },
  ) {
    const candidate = await this.candidateService.findById(id);
    if (
      req.user.role !== UserRole.ADMIN &&
      candidate.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException('Acesso negado a este candidato');
    }
    return this.candidateService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover candidato' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID do candidato',
    example: 'uuid-do-candidato',
  })
  @ApiResponse({
    status: 200,
    description: 'Candidato removido',
    schema: {
      example: {
        message: 'Candidato removido com sucesso',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(`DELETE /candidates/${id} - user: ${req.user.email}`);
    const candidate = await this.candidateService.findById(id);
    return this.candidateService.remove(id);
  }
}