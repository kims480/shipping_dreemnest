import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemRecord } from './entities/problem-record.entity';
import { ProblemManagementService } from './problem-management.service';
import { ProblemManagementController } from './problem-management.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProblemRecord])],
  providers: [ProblemManagementService],
  controllers: [ProblemManagementController],
  exports: [ProblemManagementService, TypeOrmModule],
})
export class ProblemManagementModule {}
