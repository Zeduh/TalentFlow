import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FilterCandidateDto } from './dto/filter-candidate.dto';
import { assertEntityExists } from '../../common/utils/validation.util';
import { JobService } from '../jobs/job.service';

@Injectable()
export class CandidateService {
  private readonly logger = new Logger(CandidateService.name);

  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    private readonly jobService: JobService, // Adicione aqui
  ) {}

  async create(data: CreateCandidateDto) {
    this.logger.log(`Criando candidato: ${JSON.stringify(data)}`);

    await assertEntityExists(this.jobService, data.jobId, 'Job');

    // Verificação de duplicidade: mesmo email e jobId
    const existing = await this.candidateRepository.findOne({
      where: { email: data.email, jobId: data.jobId },
    });
    if (existing) {
      throw new ConflictException('Este candidato já está inscrito nesta vaga');
    }

    const candidate = this.candidateRepository.create(data);
    return this.candidateRepository.save(candidate);
  }

  async findAll(filter: FilterCandidateDto, organizationId: string) {
    this.logger.log(`Listando candidatos: ${JSON.stringify(filter)}`);
    const limit = filter.limit ?? 10;

    const where: FindOptionsWhere<Candidate> = {
      organizationId,
    };
    if (filter.status) where.status = filter.status;
    if (filter.jobId) where.jobId = filter.jobId;

    let query = this.candidateRepository
      .createQueryBuilder('candidate')
      .where(where);

    if (filter.cursor) {
      query = query.andWhere('candidate.id > :cursor', {
        cursor: filter.cursor,
      });
    }

    query = query.orderBy('candidate.id', 'ASC').limit(limit);

    const candidates = await query.getMany();
    const nextCursor =
      candidates.length > 0 ? candidates[candidates.length - 1].id : null;

    return {
      data: candidates,
      nextCursor,
      hasMore: candidates.length === limit,
    };
  }

  async findById(id: string) {
    this.logger.log(`Buscando candidato por ID: ${id}`);
    const candidate = await this.candidateRepository.findOne({ where: { id } });
    if (!candidate) {
      throw new NotFoundException('Candidato não encontrado');
    }
    return candidate;
  }

  async update(id: string, data: UpdateCandidateDto) {
    this.logger.log(`Atualizando candidato ${id}: ${JSON.stringify(data)}`);

    try {
      if (data.jobId)
        await assertEntityExists(this.jobService, data.jobId, 'Job');

      const current = await this.candidateRepository.findOne({ where: { id } });
      if (!current) {
        this.logger.error(`Candidato não encontrado: ${id}`);
        throw new NotFoundException('Candidato não encontrado');
      }

      // Filtra apenas os campos válidos da entidade
      const updateData: Partial<Candidate> = {
        name: data.name,
        email: data.email,
        status: data.status,
        jobId: data.jobId,
        organizationId: data.organizationId,
      };

      // Remove campos undefined
      Object.keys(updateData).forEach(
        (key) =>
          updateData[key as keyof Candidate] === undefined &&
          delete updateData[key as keyof Candidate],
      );

      await this.candidateRepository.update(id, updateData);
      return this.findById(id);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Erro ao atualizar candidato ${id}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  async remove(id: string) {
    this.logger.log(`Removendo candidato: ${id}`);

    const candidate = await this.candidateRepository.findOne({ where: { id } });
    if (!candidate) {
      throw new NotFoundException('Candidato não encontrado');
    }

    return this.candidateRepository.delete(id);
  }
}
