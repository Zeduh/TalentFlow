import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Interview } from '../interviews/interview.entity';

export enum CandidateStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
}

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sequence_id', type: 'int', generated: 'increment', unique: true })
  sequenceId: number; // For cursor-based pagination

  @Column()
  name: string;

  @Column()
  @Index()
  email: string;

  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.APPLIED,
  })
  @Index()
  status: CandidateStatus;

  @OneToMany(() => Interview, (interview) => interview.candidate)
  interviews: Interview[];

  @Column()
  jobId: string;

  @ManyToOne(() => Job, { eager: false })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column()
  @Index()
  organizationId: string; // Multi-tenant

  @ManyToOne(() => Tenant, { eager: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Tenant;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}