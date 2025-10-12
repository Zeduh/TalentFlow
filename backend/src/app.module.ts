import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { TerminusModule } from '@nestjs/terminus';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { loggerConfig } from './config/logger.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = configService.get<TypeOrmModuleOptions>('database');
        if (!dbConfig) {
          throw new Error('Database configuration is missing');
        }
        return dbConfig;
      },
    }),

    // Logger
    WinstonModule.forRoot(loggerConfig),

    // Health Check
    TerminusModule,

    // Feature modules will be added here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
