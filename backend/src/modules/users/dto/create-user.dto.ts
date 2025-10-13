import { IsString, IsEmail, IsEnum, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(1, { message: 'O nome não pode ser vazio' })
  name: string;

  @ApiProperty({
    example: 'email_unico_users@empresa.com',
    description: 'Use um e-mail ainda não cadastrado.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaSegura123' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'manager', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 'uuid-da-organizacao',
    description: 'Use um UUID válido para a organização.',
  })
  @IsUUID()
  organizationId: string;
}
