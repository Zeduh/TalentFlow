import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PAUSED = 'paused',
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.OPEN })
  @Index()
  status: JobStatus;

  @Column()
  @Index()
  organizationId: string; // Multi-tenant
}
