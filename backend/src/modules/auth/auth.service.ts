import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../users/user.service';
import { TenantService } from '../tenants/tenant.service';
import { assertEntityExists } from '../../common/utils/validation.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
  ) {}

  async validateUser(email: string, password: string) {
    this.logger.log(`Validando usuário: ${email}`);
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Usuário não encontrado: ${email}`);
      throw new UnauthorizedException('Usuário não encontrado');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      this.logger.warn(`Senha inválida para usuário: ${email}`);
      throw new UnauthorizedException('Senha inválida');
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login solicitado para: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    this.logger.log(`Login bem-sucedido para: ${loginDto.email}`);
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registro solicitado para: ${registerDto.email}`);

    // Validação de e-mail único
    const existing = await this.userService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Validação de tenant
    await assertEntityExists(
      this.tenantService,
      registerDto.organizationId,
      'Tenant',
    );

    const hashed = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({
      ...registerDto,
      password: hashed,
    });
    this.logger.log(`Usuário registrado: ${user.email}`);
    return user;
  }
}
