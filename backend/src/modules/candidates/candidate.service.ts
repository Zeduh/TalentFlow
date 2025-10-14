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

    // Busca a vaga e pega o organizationId dela
    const job = await this.jobService.findById(data.jobId);

    // Verificação de duplicidade: mesmo email e jobId
    const existing = await this.candidateRepository.findOne({
      where: { email: data.email, jobId: data.jobId },
    });
    if (existing) {
      throw new ConflictException('Este candidato já está inscrito nesta vaga');
    }

    // Sempre usa o organizationId da vaga
    const candidate = this.candidateRepository.create({
      ...data,
      organizationId: job.organizationId,
    });
    return this.candidateRepository.save(candidate);
  }

  async findAll(filter: FilterCandidateDto, organizationId: string) {
    this.logger.log(`Listando candidatos: ${JSON.stringify(filter)}`);
    const limit = filter.limit ?? 10;

    const where: FindOptionsWhere<Candidate> = { organizationId };
    if (filter.status) where.status = filter.status;
    if (filter.jobId) where.jobId = filter.jobId;

    let query = this.candidateRepository.createQueryBuilder('candidate').where(where);

    if (filter.sequenceId) {
      query = query.andWhere('candidate.sequenceId > :cursor', {
        cursor: filter.sequenceId,
      });
    }

    query = query.orderBy('candidate.sequenceId', 'ASC').limit(limit + 1);

    const candidates = await query.getMany();
    let nextCursor: number | null = null;
    let hasMore = false;

    if (candidates.length > limit) {
      hasMore = true;
      nextCursor = candidates[limit - 1].sequenceId;
      candidates.splice(limit);
    }

    return {
      data: candidates,
      nextCursor,
      hasMore,
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
      let organizationId: string | undefined;
      if (data.jobId) {
        const job = await this.jobService.findById(data.jobId);
        organizationId = job.organizationId;
      }

      const current = await this.candidateRepository.findOne({ where: { id } });
      if (!current) {
        this.logger.error(`Candidato não encontrado: ${id}`);
        throw new NotFoundException('Candidato não encontrado');
      }

      // Atualiza organizationId se jobId mudou, senão mantém o atual
      const updateData: Partial<Candidate> = {
        name: data.name,
        email: data.email,
        status: data.status,
        jobId: data.jobId,
        organizationId: organizationId ?? current.organizationId,
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
