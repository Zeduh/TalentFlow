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
  ApiForbiddenResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Interview } from './interview.entity';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { FilterInterviewDto } from './dto/filter-interview.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { InterviewStatus } from './interview.entity';

@ApiTags('Interviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('interviews')
export class InterviewController {
  private readonly logger = new Logger(InterviewController.name);

  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Agendar entrevista (mock calendário)' })
  @ApiBody({
    description:
      'Para admin: informe o organizationId desejado. Para recruiter: organizationId será ignorado e preenchido automaticamente.',
    type: CreateInterviewDto,
    examples: {
      admin: {
        summary: 'Admin',
        value: {
          candidateId: 'uuid-do-candidato',
          scheduledAt: '2025-10-12T10:00:00Z',
          status: 'scheduled',
          organizationId: 'uuid-da-organizacao',
        },
      },
      recruiter: {
        summary: 'Recruiter',
        value: {
          candidateId: 'uuid-do-candidato',
          scheduledAt: '2025-10-12T10:00:00Z',
          status: 'scheduled',
          // organizationId será ignorado se enviado pelo recruiter
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Entrevista agendada',
    schema: {
      example: {
        id: 'uuid',
        candidateId: 'uuid-do-candidato',
        scheduledAt: '2025-10-12T10:00:00Z',
        status: 'scheduled',
        calendarLink: 'https://calendar.mock/interview/abc123',
        organizationId: 'uuid-da-organizacao',
        sequenceId: 1,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async create(
    @Body() dto: CreateInterviewDto,
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(
      `POST /interviews - user: ${req.user.email} - payload: ${JSON.stringify(dto)}`,
    );
    if (req.user.role === UserRole.ADMIN) {
      return this.interviewService.create(dto);
    }
    return this.interviewService.create({
      ...dto,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Listar entrevistas com filtros e paginação cursor-based',
    description:
      'Admin pode filtrar por qualquer tenant usando organizationId. Demais perfis só visualizam entrevistas da própria organização.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(InterviewStatus),
    description: 'Filtrar por status da entrevista',
  })
  @ApiQuery({
    name: 'candidateId',
    required: false,
    type: String,
    description: 'Filtrar por UUID do candidato',
  })
  @ApiQuery({
    name: 'sequenceId',
    required: false,
    type: Number,
    description: 'Cursor para paginação (sequenceId)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de itens por página',
  })
  @ApiQuery({
    name: 'organizationId',
    required: false,
    type: String,
    description: 'UUID da organização (apenas para admin; ignorado para outros perfis)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de entrevistas',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            candidateId: 'uuid',
            scheduledAt: '2025-10-12T10:00:00Z',
            status: 'scheduled',
            calendarLink: 'https://calendar.mock/interview/abc123',
            organizationId: 'uuid',
            sequenceId: 1,
          },
        ],
        nextCursor: 2,
        hasMore: true,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async findAll(
    @Query() filter: FilterInterviewDto & { organizationId?: string },
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.log(
      `GET /interviews - user: ${req.user.email} - filtros: ${JSON.stringify(filter)}`,
    );
    if (req.user.role === UserRole.ADMIN && filter.organizationId) {
      return this.interviewService.findAll(filter, filter.organizationId);
    }
    return this.interviewService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Detalhar entrevista' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da entrevista',
    example: 'uuid-da-entrevista',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da entrevista',
    schema: {
      example: {
        id: 'uuid',
        candidateId: 'uuid-do-candidato',
        scheduledAt: '2025-10-12T10:00:00Z',
        status: 'scheduled',
        calendarLink: 'https://calendar.mock/interview/abc123',
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
    const interview = await this.interviewService.findById(id);
    if (
      req.user.role !== UserRole.ADMIN &&
      interview.organizationId !== req.user.organizationId
    ) {
      throw new Error('Acesso negado a esta entrevista');
    }
    return interview;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar entrevista' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da entrevista',
    example: 'uuid-da-entrevista',
  })
  @ApiBody({
    description:
      'Para admin: pode atualizar qualquer campo. Para recruiter: só pode atualizar entrevistas do próprio tenant.',
    type: UpdateInterviewDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Entrevista atualizada',
    schema: {
      example: {
        id: 'uuid',
        candidateId: 'uuid-do-candidato',
        scheduledAt: '2025-10-12T10:00:00Z',
        status: 'completed',
        calendarLink: 'https://calendar.mock/interview/abc123',
        organizationId: 'uuid-da-organizacao',
        sequenceId: 1,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInterviewDto,
    @Req() req: Request & { user: { organizationId: string; role: string } },
  ) {
    const interview = await this.interviewService.findById(id);

    // Sempre obtenha o organizationId do candidato relacionado
    const candidate = interview.candidate
      ? interview.candidate
      : await this.interviewService['candidateService'].findById(interview.candidateId);

    if (
      req.user.role !== UserRole.ADMIN &&
      candidate.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException('Acesso negado a esta entrevista');
    }
    return this.interviewService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover entrevista' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da entrevista',
    example: 'uuid-da-entrevista',
  })
  @ApiResponse({
    status: 200,
    description: 'Entrevista removida',
    schema: {
      example: {
        message: 'Entrevista removida com sucesso',
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { email: string; organizationId: string; role: string } },
  ) {
    this.logger.warn(`DELETE /interviews/${id} - user: ${req.user.email}`);
    const interview = await this.interviewService.findById(id);

    // Mesmo padrão: só admin, mas sempre cheque o tenant se necessário
    const candidate = interview.candidate
      ? interview.candidate
      : await this.interviewService['candidateService'].findById(interview.candidateId);

    if (
      req.user.role !== UserRole.ADMIN &&
      candidate.organizationId !== req.user.organizationId
    ) {
      throw new ForbiddenException('Acesso negado a esta entrevista');
    }

    return this.interviewService.remove(id);
  }
}