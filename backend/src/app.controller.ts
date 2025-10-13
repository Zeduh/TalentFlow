import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { getRequestMetrics } from './common/interceptors/metrics.interceptor';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas de requisições por rota' })
  getMetrics() {
    return getRequestMetrics();
  }
}
