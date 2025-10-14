import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Job } from '../jobs/job.entity';
import { Candidate } from '../candidates/candidate.entity';
import { Interview } from '../interviews/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Candidate, Interview])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}