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
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
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
  @ApiBody({ type: CreateCandidateDto })
  @ApiResponse({
    status: 201,
    description: 'Candidato criado com sucesso',
    type: CreateCandidateDto,
  })
  async create(
    @Body() dto: CreateCandidateDto,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(
      `POST /candidates - user: ${req.user.email} - payload: ${JSON.stringify(dto)}`,
    );
    return this.candidateService.create({
      ...dto,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar candidatos com filtros e paginação cursor-based',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(CandidateStatus),
  })
  @ApiQuery({ name: 'jobId', required: false, type: String })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
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
            jobId: 'uuid',
            organizationId: 'uuid',
          },
        ],
        nextCursor: 'uuid',
        hasMore: true,
      },
    },
  })
  async findAll(
    @Query() filter: FilterCandidateDto,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(
      `GET /candidates - user: ${req.user.email} - filter: ${JSON.stringify(filter)}`,
    );
    return this.candidateService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar candidato' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do candidato',
    type: CreateCandidateDto,
  })
  async findById(@Param('id') id: string) {
    this.logger.log(`GET /candidates/${id}`);
    return this.candidateService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar candidato' })
  @ApiBody({ type: UpdateCandidateDto })
  @ApiResponse({
    status: 200,
    description: 'Candidato atualizado',
    type: UpdateCandidateDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    this.logger.log(`PUT /candidates/${id} - payload: ${JSON.stringify(dto)}`);
    return this.candidateService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover candidato' })
  @ApiResponse({ status: 200, description: 'Candidato removido' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.log(`DELETE /candidates/${id}`);
    return this.candidateService.remove(id);
  }
}
