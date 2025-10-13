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
    return this.candidateRepository.findOne({ where: { id } });
  }

  async update(id: string, data: UpdateCandidateDto) {
    this.logger.log(`Atualizando candidato ${id}: ${JSON.stringify(data)}`);

    if (data.jobId)
      await assertEntityExists(this.jobService, data.jobId, 'Job');

    // Buscar candidato atual
    const current = await this.candidateRepository.findOne({ where: { id } });

    // Só verifica duplicidade se email ou jobId forem alterados
    const emailToCheck = data.email ?? current?.email;
    const jobIdToCheck = data.jobId ?? current?.jobId;

    if ((data.email || data.jobId) && emailToCheck && jobIdToCheck) {
      const existing = await this.candidateRepository.findOne({
        where: { email: emailToCheck, jobId: jobIdToCheck },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Este candidato já está inscrito nesta vaga',
        );
      }
    }

    await this.candidateRepository.update(id, data);
    return this.findById(id);
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
