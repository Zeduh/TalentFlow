import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

// Interface para tipar o request com usuário autenticado
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
}

@ApiTags('dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Métricas do dashboard',
    description: 'Retorna contadores de vagas, candidatos e entrevistas',
  })
  async getMetrics(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.getMetrics(req.user.organizationId);
  }
}
