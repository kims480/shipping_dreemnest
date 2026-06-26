'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { AnalyticsDashboard } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";
import type { EFlowStageName } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { ExportButton } from "@/components/ui/io-buttons";
import { exportCsv } from "@/lib/csv";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtHours(h: number | null): string {
  if (h === null) return '—';
  if (h < 1) return `${Math.round(h * 60)}m`;
  return `${h.toFixed(1)}h`;
}

function Spinner() {
  return <p className="py-12 text-center text-sm text-foreground/40">Loading…</p>;
}

// ─── Mini bar chart (CSS-only) ────────────────────────────────────────────────

function BarChart({
  data,
  valueKey,
  labelKey,
  color = 'bg-brand-purple',
}: {
  data: Record<string, unknown>[];
  valueKey: string;
  labelKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div className="space-y-1.5">
      {data.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-xs text-foreground/60 text-right">
              {String(d[labelKey])}
            </span>
            <div className="flex-1 h-5 bg-surface-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', color)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-xs font-semibold text-foreground/70 text-right">
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Volume trend (14-day sparkline) ─────────────────────────────────────────

function VolumeTrend({ trend }: { trend: AnalyticsDashboard['volumeTrend'] }) {
  const max = Math.max(...trend.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {trend.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div className="absolute bottom-7 hidden group-hover:block bg-foreground text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap z-10">
            {d.date.slice(5)}: {d.count} WOs, {d.delivered} del.
          </div>
          <div
            className="w-full rounded-t-sm bg-brand-purple/30 transition-all"
            style={{ height: `${Math.max(4, Math.round((d.count / max) * 72))}px` }}
          />
          {d.breached > 0 && (
            <div
              className="w-full rounded-t-sm bg-status-breached/60 -mt-1"
              style={{ height: `${Math.max(2, Math.round((d.breached / max) * 72))}px` }}
            />
          )}
          <span className="text-[9px] text-foreground/30 rotate-45 origin-left">
            {d.date.slice(8)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.getAnalyticsDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ov = data?.overview;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="mt-1 text-sm text-foreground/60">
            SLA compliance, stage cycle times, zone performance, and problem trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <>
              <ExportButton
                label="Export zones"
                onExport={() => {
                  exportCsv(`zone-performance-${new Date().toISOString().slice(0, 10)}.csv`,
                    ['zoneName', 'woCount', 'slaBreachCount', 'slaBreachRate', 'avgCompletionHours'],
                    data.zonePerformance.map((z) => [z.zoneName, z.woCount, z.slaBreachCount, z.slaBreachRate, z.avgCompletionHours ?? '']));
                }}
              />
              <ExportButton
                label="Export trend"
                onExport={() => {
                  exportCsv(`volume-trend-${new Date().toISOString().slice(0, 10)}.csv`,
                    ['date', 'count', 'delivered', 'breached'],
                    data.volumeTrend.map((d) => [d.date, d.count, d.delivered, d.breached]));
                }}
              />
            </>
          )}
          <button
            onClick={load}
            className="text-xs text-foreground/40 hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-status-breached/10 px-4 py-3 text-sm text-status-breached">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : !data ? null : (
        <div className="space-y-6">
          {/* ── Overview KPIs ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Total WOs', value: ov!.total, color: 'text-brand-purple' },
              { label: 'SLA Compliance', value: `${ov!.slaComplianceRate}%`, color: ov!.slaComplianceRate >= 90 ? 'text-status-on-track' : 'text-status-breached' },
              { label: 'Avg Completion', value: fmtHours(ov!.avgCompletionHours), color: 'text-foreground' },
              { label: 'Delivered Today', value: ov!.deliveredToday, color: 'text-status-on-track' },
              { label: 'This Week', value: ov!.deliveredThisWeek, color: 'text-brand-purple' },
              { label: 'Open Problems', value: (data.problemAnalytics.byStatus['open'] ?? 0) + (data.problemAnalytics.byStatus['in_review'] ?? 0) + (data.problemAnalytics.byStatus['escalated'] ?? 0), color: 'text-status-at-risk' },
            ].map(({ label, value, color }) => (
              <Card key={label} className="text-center">
                <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide mb-1">{label}</p>
                <p className={cn('text-2xl font-bold', color)}>{value}</p>
              </Card>
            ))}
          </div>

          {/* ── Status breakdown + Volume trend ───────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Status breakdown</CardTitle></CardHeader>
              <BarChart
                data={Object.entries(ov!.byStatus).map(([k, v]) => ({ label: k.replace('_', ' '), count: v }))}
                labelKey="label"
                valueKey="count"
              />
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Volume trend (14 days)</CardTitle>
                <span className="text-xs text-foreground/40">Purple = total · Red overlay = breached</span>
              </CardHeader>
              <VolumeTrend trend={data.volumeTrend} />
            </Card>
          </div>

          {/* ── Zone performance ───────────────────────────────────────────── */}
          <Card>
            <CardHeader><CardTitle>Zone performance</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-foreground/50 uppercase tracking-wide">
                    <th className="pb-3 pr-6 font-medium">Zone</th>
                    <th className="pb-3 pr-6 font-medium">WOs</th>
                    <th className="pb-3 pr-6 font-medium">SLA Breaches</th>
                    <th className="pb-3 pr-6 font-medium">Breach rate</th>
                    <th className="pb-3 font-medium">Avg completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.zonePerformance.map((z) => (
                    <tr key={z.zoneId} className="hover:bg-surface-muted/40">
                      <td className="py-3 pr-6 font-semibold">{z.zoneName}</td>
                      <td className="py-3 pr-6">{z.woCount}</td>
                      <td className="py-3 pr-6">
                        <span className={cn(z.slaBreachCount > 0 ? 'text-status-breached font-semibold' : 'text-foreground/50')}>
                          {z.slaBreachCount}
                        </span>
                      </td>
                      <td className="py-3 pr-6">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-surface-muted rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', z.slaBreachRate > 20 ? 'bg-status-breached' : z.slaBreachRate > 10 ? 'bg-status-at-risk' : 'bg-status-on-track')}
                              style={{ width: `${z.slaBreachRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{z.slaBreachRate}%</span>
                        </div>
                      </td>
                      <td className="py-3">{fmtHours(z.avgCompletionHours)}</td>
                    </tr>
                  ))}
                  {data.zonePerformance.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-sm text-foreground/40">No zone data yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── Stage cycle times ──────────────────────────────────────────── */}
          <Card>
            <CardHeader><CardTitle>Stage cycle times</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-foreground/50 uppercase tracking-wide">
                    <th className="pb-3 pr-6 font-medium">Stage</th>
                    <th className="pb-3 pr-6 font-medium">Samples</th>
                    <th className="pb-3 font-medium">Avg time in stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.stageCycleTimes.map((s) => (
                    <tr key={s.stage} className="hover:bg-surface-muted/40">
                      <td className="py-3 pr-6 font-medium">
                        {STAGE_LABELS[s.stage as EFlowStageName] ?? s.stage}
                      </td>
                      <td className="py-3 pr-6 text-foreground/60">{s.count}</td>
                      <td className="py-3">
                        <span className={cn('font-semibold', s.avgHours !== null && s.avgHours > 12 ? 'text-status-at-risk' : 'text-foreground')}>
                          {fmtHours(s.avgHours)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.stageCycleTimes.length === 0 && (
                    <tr><td colSpan={3} className="py-6 text-center text-sm text-foreground/40">No stage timing data yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── Problem analytics ──────────────────────────────────────────── */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Problems by status</CardTitle>
                <span className="text-xs text-foreground/40">Avg resolution: {fmtHours(data.problemAnalytics.avgResolutionHours)}</span>
              </CardHeader>
              <BarChart
                data={Object.entries(data.problemAnalytics.byStatus).map(([k, v]) => ({ label: k.replace('_', ' '), count: v }))}
                labelKey="label"
                valueKey="count"
                color="bg-status-at-risk"
              />
            </Card>
            <Card>
              <CardHeader><CardTitle>Problems by source</CardTitle></CardHeader>
              <BarChart
                data={Object.entries(data.problemAnalytics.bySource).map(([k, v]) => ({ label: k.replace(/_/g, ' '), count: v }))}
                labelKey="label"
                valueKey="count"
                color="bg-status-breached/70"
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
