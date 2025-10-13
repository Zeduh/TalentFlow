import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './user.entity';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Criar usuário (admin)',
    description:
      'Endpoint restrito a administradores para criar usuários internos na organização. Use /auth/register para auto-registro.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        email: 'novo.usuario@empresa.com',
        name: 'Novo Usuário',
        role: 'manager',
        organizationId: 'uuid',
      },
    },
  })
  async create(@Body() dto: CreateUserDto) {
    this.logger.log(`POST /users - payload: ${JSON.stringify(dto)}`);
    return this.userService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os usuários (apenas admin)' })
  async findAll() {
    return this.userService.findAll(); // Retorna todos os usuários
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado',
    type: UpdateUserDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    this.logger.log(`PUT /users/${id} - payload: ${JSON.stringify(dto)}`);
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.warn(`DELETE /users/${id}`);
    return this.userService.remove(id);
  }
}
