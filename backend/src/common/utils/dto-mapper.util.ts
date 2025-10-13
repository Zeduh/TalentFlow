import { User } from '../../modules/users/user.entity';
import { UserResponseDto } from '../../modules/users/dto/user-response.dto';
import { Tenant } from '../../modules/tenants/tenant.entity';
import { TenantResponseDto } from '../../modules/tenants/dto/tenant-response.dto';

/**
 * Converte um objeto User para UserResponseDto, removendo campos sensíveis
 */
export function toUserResponseDto(user: User): UserResponseDto {
  // Usando pick para selecionar apenas os campos necessários
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
}

/**
 * Converte um objeto Tenant para TenantResponseDto
 */
export function toTenantResponseDto(tenant: Tenant): TenantResponseDto {
  return {
    id: tenant.id,
    name: tenant.name,
  };
}
