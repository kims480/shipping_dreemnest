import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrder, WorkOrderStatus } from '../orders/entities/work-order.entity';
import { EFlowStage } from '../orders/entities/e-flow-stage.entity';
import { Dfp } from '../zones/entities/dfp.entity';
import { Zone } from '../zones/entities/zone.entity';
import { ProblemRecord, ProblemStatus } from '../problem-management/entities/problem-record.entity';

function diffHours(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / 3_600_000;
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(WorkOrder) private readonly woRepo: Repository<WorkOrder>,
    @InjectRepository(EFlowStage) private readonly stageRepo: Repository<EFlowStage>,
    @InjectRepository(Dfp) private readonly dfpRepo: Repository<Dfp>,
    @InjectRepository(Zone) private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(ProblemRecord) private readonly problemRepo: Repository<ProblemRecord>,
  ) {}

  async getDashboard() {
    const [wos, stages, dfps, zones, problems] = await Promise.all([
      this.woRepo.find(),
      this.stageRepo.find(),
      this.dfpRepo.find(),
      this.zoneRepo.find({ relations: ['dfps'] }),
      this.problemRepo.find(),
    ]);

    // ── Overview ──────────────────────────────────────────────────────────────
    const total = wos.length;
    const byStatus: Record<string, number> = {};
    for (const wo of wos) {
      byStatus[wo.status] = (byStatus[wo.status] ?? 0) + 1;
    }

    const delivered = wos.filter((w) => w.status === WorkOrderStatus.DELIVERED);
    const onTime = delivered.filter((w) => !w.slaBreached);
    const slaComplianceRate =
      delivered.length > 0 ? Math.round((onTime.length / delivered.length) * 100) : 100;

    const today = new Date();
    const todayStr = dateStr(today);
    const deliveredToday = delivered.filter((w) => dateStr(w.updatedAt) === todayStr).length;

    const weekAgo = new Date(today.getTime() - 7 * 86_400_000);
    const deliveredThisWeek = delivered.filter((w) => w.updatedAt >= weekAgo).length;

    // Avg completion hours for delivered WOs
    const completionHours: number[] = [];
    for (const wo of delivered) {
      completionHours.push(diffHours(wo.createdAt, wo.updatedAt));
    }
    const avgCompletionHours = avg(completionHours);

    // ── Volume trend (last 14 days) ───────────────────────────────────────────
    const trendMap: Record<string, { count: number; delivered: number; breached: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86_400_000);
      trendMap[dateStr(d)] = { count: 0, delivered: 0, breached: 0 };
    }
    for (const wo of wos) {
      const d = dateStr(wo.createdAt);
      if (trendMap[d]) {
        trendMap[d].count++;
        if (wo.status === WorkOrderStatus.DELIVERED) trendMap[d].delivered++;
        if (wo.slaBreached) trendMap[d].breached++;
      }
    }
    const volumeTrend = Object.entries(trendMap).map(([date, v]) => ({ date, ...v }));

    // ── Stage cycle times ─────────────────────────────────────────────────────
    const stageTimes: Record<string, number[]> = {};
    for (const s of stages) {
      if (s.enteredAt && s.completedAt) {
        const h = diffHours(s.enteredAt, s.completedAt);
        (stageTimes[s.name] ??= []).push(h);
      }
    }
    const stageCycleTimes = Object.entries(stageTimes).map(([stage, hours]) => ({
      stage,
      avgHours: avg(hours),
      count: hours.length,
    }));

    // ── Zone performance ──────────────────────────────────────────────────────
    const dfpZoneMap = new Map(dfps.map((d) => [d.id, d.zoneId]));
    const zoneMap = new Map(zones.map((z) => [z.id, z.name]));

    const zoneStats: Record<
      string,
      { name: string; woCount: number; slaBreachCount: number; completionHours: number[] }
    > = {};
    for (const z of zones) {
      zoneStats[z.id] = { name: z.name, woCount: 0, slaBreachCount: 0, completionHours: [] };
    }

    for (const wo of wos) {
      if (!wo.assignedDfpId) continue;
      const zoneId = dfpZoneMap.get(wo.assignedDfpId);
      if (!zoneId || !zoneStats[zoneId]) continue;
      zoneStats[zoneId].woCount++;
      if (wo.slaBreached) zoneStats[zoneId].slaBreachCount++;
      if (wo.status === WorkOrderStatus.DELIVERED) {
        zoneStats[zoneId].completionHours.push(diffHours(wo.createdAt, wo.updatedAt));
      }
    }

    const zonePerformance = Object.entries(zoneStats).map(([zoneId, s]) => ({
      zoneId,
      zoneName: s.name,
      woCount: s.woCount,
      slaBreachCount: s.slaBreachCount,
      slaBreachRate: s.woCount > 0 ? Math.round((s.slaBreachCount / s.woCount) * 100) : 0,
      avgCompletionHours: avg(s.completionHours),
    }));

    // ── Problem analytics ─────────────────────────────────────────────────────
    const probByStatus: Record<string, number> = {};
    const probBySource: Record<string, number> = {};
    const resolutionHours: number[] = [];

    for (const p of problems) {
      probByStatus[p.status] = (probByStatus[p.status] ?? 0) + 1;
      probBySource[p.source] = (probBySource[p.source] ?? 0) + 1;
      if (p.status === ProblemStatus.RESOLVED && p.resolvedAt) {
        resolutionHours.push(diffHours(p.createdAt, p.resolvedAt));
      }
    }

    const problemAnalytics = {
      total: problems.length,
      byStatus: probByStatus,
      bySource: probBySource,
      avgResolutionHours: avg(resolutionHours),
    };

    return {
      overview: {
        total,
        byStatus,
        slaComplianceRate,
        avgCompletionHours,
        deliveredToday,
        deliveredThisWeek,
      },
      volumeTrend,
      stageCycleTimes,
      zonePerformance,
      problemAnalytics,
    };
  }
}
