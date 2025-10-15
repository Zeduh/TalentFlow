import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { loggerConfig } from './config/logger.config';
import * as express from 'express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  const configService = app.get(ConfigService);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global request ID interceptor
  app.useGlobalInterceptors(new RequestIdInterceptor());

  // Global metrics interceptor
  app.useGlobalInterceptors(new MetricsInterceptor());

  // Cookie parser
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // Global prefix com exclusão do health check e versioning
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Increase payload limit for file uploads (if needed later)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('TalentFlow API')
    .setDescription(
      'API para gerenciamento de pipeline de candidatos e agendamento de entrevistas',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticação e autorização')
    .addTag('Tenants', 'Gerenciamento de organizações')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Jobs', 'Vagas de emprego')
    .addTag('Candidates', 'Candidatos')
    .addTag('Interviews', 'Entrevistas')
    .addTag('Webhooks', 'Webhooks de calendário')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('app.port', 3001);
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}
    📚 Swagger documentation: http://localhost:${port}/docs
    🔧 Environment: ${configService.get<string>('app.nodeEnv', 'development')}
    ❤️  Health check: http://localhost:${port}/health
  `);
}

void bootstrap();
