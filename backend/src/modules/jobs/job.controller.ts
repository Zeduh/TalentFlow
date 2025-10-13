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
  @ApiResponse({
    status: 201,
    description: 'Vaga criada com sucesso',
    type: CreateJobDto,
  })
  async create(
    @Body() dto: CreateJobDto,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(
      `POST /jobs - user: ${req.user.email} - payload: ${JSON.stringify(dto)}`,
    );
    return this.jobService.create({
      ...dto,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar vagas com filtros e paginação cursor-based',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'closed', 'paused'],
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
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
  async findAll(
    @Query() filter: FilterJobDto,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(
      `GET /jobs - user: ${req.user.email} - filter: ${JSON.stringify(filter)}`,
    );
    return this.jobService.findAll(filter, req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar vaga' })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da vaga',
    type: CreateJobDto,
  })
  async findById(@Param('id') id: string) {
    return this.jobService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER)
  @ApiOperation({ summary: 'Atualizar vaga' })
  @ApiResponse({
    status: 200,
    description: 'Vaga atualizada',
    type: UpdateJobDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(
      `PUT /jobs/${id} - user: ${req.user.email} - payload: ${JSON.stringify(dto)}`,
    );
    return this.jobService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover vaga' })
  @ApiResponse({ status: 200, description: 'Vaga removida' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request & { user: { email: string; organizationId: string } },
  ) {
    this.logger.log(`DELETE /jobs/${id} - user: ${req.user.email}`);
    return this.jobService.remove(id);
  }
}
