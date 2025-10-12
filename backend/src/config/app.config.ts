import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT ?? '3000',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
}));
