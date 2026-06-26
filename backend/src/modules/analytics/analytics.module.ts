import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from '../orders/entities/work-order.entity';
import { EFlowStage } from '../orders/entities/e-flow-stage.entity';
import { Dfp } from '../zones/entities/dfp.entity';
import { Zone } from '../zones/entities/zone.entity';
import { ProblemRecord } from '../problem-management/entities/problem-record.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, EFlowStage, Dfp, Zone, ProblemRecord])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
