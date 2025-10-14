import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PAUSED = 'paused',
}

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryGeneratedColumn({ name: 'sequence_id' })
  sequenceId: number; // For cursor-based pagination

  @Column()
  title: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.OPEN })
  @Index()
  status: JobStatus;

  @Column()
  @Index()
  organizationId: string; // Multi-tenant

  @CreateDateColumn()
  @Index()
  createdAt: Date; 
}
