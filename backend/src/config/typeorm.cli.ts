import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Carrega variáveis de ambiente
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'talentflow',
  password: process.env.DATABASE_PASSWORD || 'talentflow123',
  database: process.env.DATABASE_NAME || 'talentflow_db',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
