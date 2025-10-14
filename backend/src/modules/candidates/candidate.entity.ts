import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

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

  @Column()
  jobId: string;

  @Column()
  @Index()
  organizationId: string; // Multi-tenant

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}