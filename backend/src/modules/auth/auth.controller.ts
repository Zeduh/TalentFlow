import { Controller, Post, Body, Logger, Res, UseGuards, Get, Req } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(dto);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });

    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { path: '/' });
    return { message: 'Logout realizado' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  async me(@Req() req) {
    return { user: req.user };
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
