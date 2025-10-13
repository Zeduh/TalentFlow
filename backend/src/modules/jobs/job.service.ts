import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { assertEntityExists } from '../../common/utils/validation.util';
import { TenantService } from '../tenants/tenant.service';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly tenantService: TenantService,
  ) {}

  async create(data: CreateJobDto) {
    this.logger.log(`Criando vaga: ${JSON.stringify(data)}`);

    await assertEntityExists(this.tenantService, data.organizationId, 'Tenant');

    const job = this.jobRepository.create(data);
    return this.jobRepository.save(job);
  }

  async findAll(filter: FilterJobDto, organizationId: string) {
    this.logger.log(`Listando vagas: ${JSON.stringify(filter)}`);
    const limit = filter.limit ?? 10;

    const where: FindOptionsWhere<Job> = {
      organizationId,
    };
    if (filter.status) where.status = filter.status;

    let query = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.organization', 'organization') // EAGER LOADING DA ORGANIZAÇÃO
      .where(where);

    if (filter.cursor) {
      query = query.andWhere('job.id > :cursor', { cursor: filter.cursor });
    }

    query = query.orderBy('job.id', 'ASC').limit(limit);

    const jobs = await query.getMany();

    // Novo cursor para próxima página
    const nextCursor = jobs.length > 0 ? jobs[jobs.length - 1].id : null;

    return {
      data: jobs,
      nextCursor,
      hasMore: jobs.length === limit,
    };
  }

  async findById(id: string) {
    this.logger.log(`Buscando vaga por ID: ${id}`);
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }
    return job;
  }

  async update(id: string, data: UpdateJobDto) {
    this.logger.log(`Atualizando vaga ${id}: ${JSON.stringify(data)}`);

    if (data.organizationId)
      await assertEntityExists(
        this.tenantService,
        data.organizationId,
        'Tenant',
      );

    await this.jobRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: string) {
    this.logger.log(`Removendo vaga: ${id}`);
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada');
    }
    return this.jobRepository.delete(id);
  }
}
