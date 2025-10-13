import { IsEmail, IsString, MinLength, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  MANAGER = 'manager',
}

export class RegisterDto {
  @ApiProperty({
    example: 'email_unico_auth@empresa.com',
    description: 'Use um e-mail ainda não cadastrado.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Admin Alpha' })
  @IsString()
  name: string;

  @ApiProperty({ example: UserRole.ADMIN, enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: 'uuid-da-organizacao',
    description: 'Use um UUID válido para a organização.',
  })
  @IsString()
  @IsUUID()
  organizationId: string;
}
