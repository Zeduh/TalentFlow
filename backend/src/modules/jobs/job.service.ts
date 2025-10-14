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

  async findAll(filter: FilterJobDto, organizationId?: string) {
    this.logger.log(`Listando vagas: ${JSON.stringify(filter)}`);
    const limit = filter.limit ?? 100;

    const where: FindOptionsWhere<Job> = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (filter.status) where.status = filter.status;

    let query = this.jobRepository.createQueryBuilder('job').where(where);

    if (filter.cursor) {
      // Use sequenceId para cursor (muito mais simples e confiável)
      const cursorId = parseInt(filter.cursor, 10);
      query = query.andWhere('job.sequenceId > :cursor', { cursor: cursorId });
    }

    query = query.orderBy('job.sequenceId', 'ASC'); // Ordena por sequenceId

    if (limit) {
      query = query.limit(limit + 1);
    }

    const jobs = await query.getMany();

    let nextCursor: string | null = null;
    let hasMore = false;

    if (limit && jobs.length > limit) {
      hasMore = true;
      nextCursor = String(jobs[limit - 1].sequenceId); // Cursor é o sequenceId
      jobs.splice(limit);
    }

    return {
      data: jobs,
      nextCursor,
      hasMore,
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