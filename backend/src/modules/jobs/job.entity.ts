import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  status: JobStatus;

  @Column()
  organizationId: string; // Multi-tenant
}
