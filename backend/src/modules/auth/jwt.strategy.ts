import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    console.log('JwtStrategy constructor chamado');
    const secret = configService.get<string>('JWT_SECRET') || 'default_secret';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.logger.log(`JWT_SECRET usado: ${secret}`);
  }

  validate(payload: {
    sub: string;
    email: string;
    role: string;
    organizationId: string;
  }) {
    this.logger.debug(`Payload recebido no JWT: ${JSON.stringify(payload)}`);
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };
  }
}
