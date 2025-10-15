import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USER', 'talentflow'),
  password: configService.get('DATABASE_PASSWORD', 'talentflow123'),
  database: configService.get('DATABASE_NAME', 'talentflow_db'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // NUNCA usar true em produção
  logging: true,
});
