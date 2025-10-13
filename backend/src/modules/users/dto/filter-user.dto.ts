import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';

export class FilterUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
