import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Job, JobStatus } from '../jobs/job.entity';
import { Candidate } from '../candidates/candidate.entity';
import { Interview, InterviewStatus } from '../interviews/interview.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
    @InjectRepository(Candidate) private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(Interview) private readonly interviewRepo: Repository<Interview>,
  ) {}

  async getMetrics(organizationId: string) {
    // Vagas por status
    const jobs = await this.jobRepo
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('job.organizationId = :organizationId', { organizationId })
      .groupBy('job.status')
      .getRawMany();

    // Candidatos por status
    const candidates = await this.candidateRepo
      .createQueryBuilder('candidate')
      .select('candidate.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('candidate.organizationId = :organizationId', { organizationId })
      .groupBy('candidate.status')
      .getRawMany();

    // Entrevistas agendadas para hoje e semana
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const interviewsToday = await this.interviewRepo.count({
      where: {
        organizationId,
        scheduledAt: Between(today, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        status: InterviewStatus.SCHEDULED,
      },
    });

    const interviewsWeek = await this.interviewRepo.count({
      where: {
        organizationId,
        scheduledAt: Between(weekStart, weekEnd),
        status: InterviewStatus.SCHEDULED,
      },
    });

    return {
      jobs: {
        open: jobs.find(j => j.status === JobStatus.OPEN)?.count ?? 0,
        closed: jobs.find(j => j.status === JobStatus.CLOSED)?.count ?? 0,
        paused: jobs.find(j => j.status === JobStatus.PAUSED)?.count ?? 0,
      },
      candidates: Object.fromEntries(
        candidates.map(c => [c.status, Number(c.count)])
      ),
      interviews: {
        today: interviewsToday,
        week: interviewsWeek,
      },
    };
  }
}