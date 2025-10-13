import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from './tenant.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { FilterTenantDto } from './dto/filter-tenant.dto';
import {
  assertUnique,
  assertEntityExists,
} from '../../common/utils/validation.util';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { toTenantResponseDto } from '../../common/utils/dto-mapper.util';

// Removendo a definição de tipo não utilizada
// type EntityType<T> = T extends Repository<infer U> ? U : never;
// type TenantEntity = EntityType<Repository<Tenant>>;

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(data: CreateTenantDto): Promise<TenantResponseDto> {
    this.logger.log(`Criando tenant: ${JSON.stringify(data)}`);

    await assertUnique(
      { findByName: this.findByName.bind(this) },
      'name',
      data.name,
    );

    const tenant = this.tenantRepository.create({
      name: data.name,
    });

    try {
      const savedTenant = await this.tenantRepository.save(tenant);
      return toTenantResponseDto(savedTenant);
    } catch (error: unknown) {
      const dbError = error as { code?: string };
      if (dbError.code === '23505') {
        // Postgres unique violation
        throw new ConflictException('Nome de tenant já cadastrado');
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateTenantDto): Promise<TenantResponseDto> {
    this.logger.log(`Atualizando tenant ${id}: ${JSON.stringify(data)}`);

    await assertEntityExists(this, id, 'Tenant');

    if (data.name) {
      await assertUnique(
        { findByName: this.findByName.bind(this) },
        'name',
        data.name,
        id,
      );
    }

    await this.tenantRepository.update(id, data);
    const updatedTenant = await this.findById(id);
    if (!updatedTenant) throw new NotFoundException('Tenant não encontrado');
    return updatedTenant;
  }

  async findById(id: string): Promise<TenantResponseDto | null> {
    this.logger.log(`Buscando tenant ${id}`);

    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    return tenant ? toTenantResponseDto(tenant) : null;
  }

  findByName(name: string): Promise<Tenant | null> {
    this.logger.log(`Buscando tenant pelo nome: ${name}`);

    return this.tenantRepository.findOne({
      where: { name },
    });
  }

  async findAll(filter?: FilterTenantDto): Promise<TenantResponseDto[]> {
    this.logger.log(`Buscando tenants com filtro: ${JSON.stringify(filter)}`);

    const where: FindOptionsWhere<Tenant> = {};
    if (filter?.name) where.name = filter.name;

    const tenants = await this.tenantRepository.find({
      where,
    });

    return tenants.map((tenant) => toTenantResponseDto(tenant));
  }

  async remove(id: string) {
    this.logger.warn(`Removendo tenant ${id}`);

    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return this.tenantRepository.delete(id);
  }
}
