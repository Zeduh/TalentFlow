import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

export async function assertEntityExists<T extends { id?: string }>(
  service: { findById(id: string): Promise<T | null> },
  id: string,
  entityName: string,
): Promise<T> {
  const entity = await service.findById(id);
  if (!entity) throw new NotFoundException(`${entityName} não encontrado`);
  return entity;
}

export async function assertUnique<T extends { id?: string }>(
  service: Record<string, (value: string) => Promise<T | null>>,
  field: string,
  value: string,
  id?: string,
): Promise<void> {
  const methodName = `findBy${capitalize(field)}`;
  const finder = service[methodName] as (value: string) => Promise<T | null>;
  if (typeof finder !== 'function') {
    throw new BadRequestException(
      `Método ${methodName} não encontrado no serviço`,
    );
  }
  const existing = await finder(value);
  if (existing && (!id || existing.id !== id)) {
    throw new ConflictException(`${field} já cadastrado`);
  }
}

export function assertSameTenant(entityTenantId: string, userTenantId: string) {
  if (entityTenantId !== userTenantId) {
    throw new BadRequestException('Acesso negado: tenant diferente');
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
