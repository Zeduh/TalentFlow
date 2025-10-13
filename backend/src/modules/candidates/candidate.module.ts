import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { JobModule } from '../jobs/job.module';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate]), JobModule],
  providers: [CandidateService],
  controllers: [CandidateController],
  exports: [CandidateService],
})
export class CandidateModule {}
