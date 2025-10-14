import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.RECRUITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Métricas agregadas para o dashboard' })
  @ApiOkResponse({
    description: 'Métricas agregadas do dashboard',
    schema: {
      example: {
        jobs: { open: 3, closed: 2, paused: 1 },
        candidates: { applied: 5, screening: 2, hired: 1 },
        interviews: { today: 2, week: 5 },
      },
    },
  })
  async getMetrics(@Req() req: any) {
    return this.dashboardService.getMetrics(req.user.organizationId);
  }
}