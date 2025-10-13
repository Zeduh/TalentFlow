import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken'; // Adicione esta importação

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN
        ? (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'])
        : '7d',
    },
  }),
);
