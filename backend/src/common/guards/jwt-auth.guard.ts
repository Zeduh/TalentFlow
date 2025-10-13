import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (err || !user) {
      this.logger.warn(
        `Falha na autenticação JWT: ${err instanceof Error ? err.message : info}`,
      );
      throw err || new UnauthorizedException('JWT inválido ou ausente');
    }
    return user;
  }
}
