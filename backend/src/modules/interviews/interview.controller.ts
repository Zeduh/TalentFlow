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
} from '@nestjs/swagger';
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
  @ApiResponse({
    status: 201,
    description: 'Entrevista agendada',
    type: CreateInterviewDto,
  })
  async create(
    @Body() dto: CreateInterviewDto,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(
      `POST /interviews - user: ${req.user.email} - payload: ${JSON.stringify(dto)}`,
    );
    return this.interviewService.create({
      ...dto,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar entrevistas com filtros e paginação cursor-based',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(InterviewStatus),
  })
  @ApiQuery({ name: 'candidateId', required: false, type: String })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
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
          },
        ],
        nextCursor: 'uuid',
        hasMore: true,
      },
    },
  })
  async findAll(
    @Query() filter: FilterInterviewDto,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(
      `GET /interviews - user: ${req.user.email} - filtros: ${JSON.stringify(filter)}`,
    );
    return this.interviewService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar entrevista' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da entrevista',
    type: CreateInterviewDto,
  })
  async findById(@Param('id') id: string) {
    this.logger.log(`GET /interviews/${id}`);
    return this.interviewService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar entrevista' })
  @ApiResponse({
    status: 200,
    description: 'Entrevista atualizada',
    type: UpdateInterviewDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    this.logger.log(`PUT /interviews/${id} - payload: ${JSON.stringify(dto)}`);
    return this.interviewService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover entrevista' })
  @ApiResponse({ status: 200, description: 'Entrevista removida' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.warn(`DELETE /interviews/${id}`);
    return this.interviewService.remove(id);
  }
}
