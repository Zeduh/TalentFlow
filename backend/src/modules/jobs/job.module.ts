import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TenantModule } from '../tenants/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), TenantModule],
  providers: [JobService],
  controllers: [JobController],
  exports: [JobService],
})
export class JobModule {}
