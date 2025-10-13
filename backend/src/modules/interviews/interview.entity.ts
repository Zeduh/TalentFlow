import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Candidate } from '../candidates/candidate.entity';

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Candidate)
  candidate: Candidate;

  @Column()
  @Index()
  candidateId: string;

  @Column()
  scheduledAt: Date;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  @Index()
  status: InterviewStatus;

  @Column()
  calendarLink: string; // Mock link

  @Column()
  @Index()
  organizationId: string;
}
