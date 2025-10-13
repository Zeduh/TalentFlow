import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login e geração de JWT',
    description:
      'Endpoint público para autenticação de usuários já registrados.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'JWT gerado com sucesso',
    schema: {
      example: {
        access_token: 'jwt_token',
        user: {
          userId: 'uuid',
          email: 'admin.alpha@empresa.com',
          role: 'admin',
          organizationId: 'uuid',
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`POST /auth/login - payload: ${JSON.stringify(loginDto)}`);
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description:
      'Endpoint público para auto-registro de usuários. Use para onboarding inicial. Para criar usuários internos, utilize o endpoint /users (restrito a admins).',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        email: 'admin.alpha@empresa.com',
        name: 'Admin Alpha',
        role: 'admin',
        organizationId: 'uuid',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(
      `POST /auth/register - payload: ${JSON.stringify(registerDto)}`,
    );
    return this.authService.register(registerDto);
  }
}
