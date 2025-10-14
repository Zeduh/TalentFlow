import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interview } from './interview.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { FilterInterviewDto } from './dto/filter-interview.dto';
import { assertEntityExists } from '../../common/utils/validation.util';
import { CandidateService } from '../candidates/candidate.service';
import { JobService } from '../jobs/job.service';
import { TenantService } from '../tenants/tenant.service';

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    private readonly candidateService: CandidateService,
    private readonly jobService: JobService,
    private readonly tenantService: TenantService,
  ) {}


  async create(data: CreateInterviewDto) {
    this.logger.log(`Agendando entrevista: ${JSON.stringify(data)}`);

    const candidate = await this.candidateService.findById(data.candidateId);

    // Converta para string primitiva antes de criar a data
    const scheduledAtDate = new Date(String(data.scheduledAt));

    const existing = await this.interviewRepository.findOne({
      where: {
        candidateId: data.candidateId,
        scheduledAt: scheduledAtDate,
        organizationId: candidate.organizationId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Já existe uma entrevista agendada para este candidato neste horário.',
      );
    }

    const calendarLink = `https://calendar.mock/interview/${Math.random().toString(36).substring(2, 10)}`;
    const interview = this.interviewRepository.create({
      ...data,
      scheduledAt: scheduledAtDate,
      organizationId: candidate.organizationId, // Sempre usa do candidato
      calendarLink,
    });
    return this.interviewRepository.save(interview);
  }

  async findAll(filter: FilterInterviewDto, organizationId: string) {
    this.logger.log(
      `Listando entrevistas - filtros: ${JSON.stringify(filter)}, org: ${organizationId}`,
    );
    const limit = filter.limit ?? 10;
    const where: FindOptionsWhere<Interview> = { organizationId };
    if (filter.status) where.status = filter.status;
    if (filter.candidateId) where.candidateId = filter.candidateId;

    let query = this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.candidate', 'candidate')
      .leftJoinAndSelect('candidate.job', 'job') // Candidate deve ter relação ManyToOne com Job
      .leftJoinAndSelect('candidate.organization', 'organization') // Candidate deve ter relação ManyToOne com Tenant
      .where(where);

    if (filter.sequenceId) {
      query = query.andWhere('interview.sequenceId > :cursor', {
        cursor: filter.sequenceId,
      });
    }
    query = query.orderBy('interview.sequenceId', 'ASC').limit(limit + 1);

    const interviews = await query.getMany();

    const data = interviews.map((interview) => ({
      ...interview,
      candidateName: interview.candidate?.name,
      jobTitle: interview.candidate?.job?.title,
      organizationName: interview.candidate?.organization?.name,
    }));

    let nextCursor: number | null = null;
    let hasMore = false;

    if (data.length > limit) {
      hasMore = true;
      nextCursor = data[limit - 1].sequenceId;
      data.splice(limit);
    }

    return {
      data,
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string) {
    this.logger.log(`Buscando entrevista por id: ${id}`);
    const interview = await this.interviewRepository.findOne({ where: { id } });
    if (!interview) {
      throw new NotFoundException('Entrevista não encontrada');
    }
    return interview;
  }

  async update(id: string, data: UpdateInterviewDto) {
    this.logger.log(`Atualizando entrevista ${id}: ${JSON.stringify(data)}`);

    if (data.candidateId)
      await assertEntityExists(
        this.candidateService,
        data.candidateId,
        'Candidate',
      );

    const current = await this.interviewRepository.findOne({ where: { id } });

    const candidateIdToCheck = data.candidateId ?? current?.candidateId;
    const scheduledAtToCheck = data.scheduledAt
      ? new Date(String(data.scheduledAt))
      : current?.scheduledAt;

    if (
      (data.candidateId || data.scheduledAt) &&
      candidateIdToCheck &&
      scheduledAtToCheck
    ) {
      const existing = await this.interviewRepository.findOne({
        where: {
          candidateId: candidateIdToCheck,
          scheduledAt: scheduledAtToCheck,
          organizationId: current?.organizationId,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Já existe uma entrevista agendada para este candidato neste horário.',
        );
      }
    }

    // Monte o objeto de atualização convertendo scheduledAt para Date se necessário
    const updateData: Partial<Interview> = {
      ...data,
      scheduledAt: data.scheduledAt
        ? new Date(String(data.scheduledAt))
        : undefined,
    };

    await this.interviewRepository.update(id, updateData);
    return this.findById(id);
  }

  async remove(id: string) {
    this.logger.warn(`Removendo entrevista ${id}`);

    const interview = await this.interviewRepository.findOne({ where: { id } });
    if (!interview) {
      throw new NotFoundException('Entrevista não encontrada');
    }

    return this.interviewRepository.delete(id);
  }

  async updateStatusFromWebhook(
    interviewId: string,
    status: string,
    scheduledAt?: string,
  ) {
    const interview = await this.interviewRepository.findOne({
      where: { id: interviewId },
    });
    if (!interview) {
      throw new NotFoundException('Entrevista não encontrada');
    }

    // Atualiza status e data se necessário
    interview.status = status as any;
    if (scheduledAt) {
      interview.scheduledAt = new Date(scheduledAt);
    }
    await this.interviewRepository.save(interview);

    this.logger.log(
      `Webhook: entrevista ${interviewId} atualizada para status ${status}` +
        (scheduledAt ? `, nova data: ${scheduledAt}` : ''),
    );

    return interview;
  }
}
