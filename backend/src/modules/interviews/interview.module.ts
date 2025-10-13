import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './interview.entity';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { CandidateModule } from '../candidates/candidate.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview]), CandidateModule],
  providers: [InterviewService],
  controllers: [InterviewController],
  exports: [InterviewService],
})
export class InterviewModule {}
