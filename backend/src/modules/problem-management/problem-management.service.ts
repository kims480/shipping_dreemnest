import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProblemRecord, ProblemSource, ProblemStatus } from './entities/problem-record.entity';

interface RaiseProblemInput {
  workOrderId: string;
  source: ProblemSource;
  category: string;
  description: string;
}

@Injectable()
export class ProblemManagementService {
  constructor(
    @InjectRepository(ProblemRecord) private readonly problemRepo: Repository<ProblemRecord>,
  ) {}

  findAll(status?: ProblemStatus): Promise<ProblemRecord[]> {
    return this.problemRepo.find(status ? { where: { status } } : {});
  }

  raise(input: RaiseProblemInput): Promise<ProblemRecord> {
    const record = this.problemRepo.create({ ...input, status: ProblemStatus.OPEN });
    return this.problemRepo.save(record);
  }

  async assign(id: string, userId: string): Promise<ProblemRecord | null> {
    await this.problemRepo.update(id, { assignedToUserId: userId, status: ProblemStatus.IN_REVIEW });
    return this.problemRepo.findOne({ where: { id } });
  }

  async resolve(id: string, resolutionNotes: string): Promise<ProblemRecord | null> {
    await this.problemRepo.update(id, {
      status: ProblemStatus.RESOLVED,
      resolutionNotes,
      resolvedAt: new Date(),
    });
    return this.problemRepo.findOne({ where: { id } });
  }
}
