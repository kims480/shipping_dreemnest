'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { slaState, slaRemaining, STAGE_LABELS } from "@/lib/types";
import type { WorkOrder, Zone, ProblemRecord, CreateWorkOrderDto, WorkOrderType } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderBadge, SlaBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";
import { ExportButton, ImportButton, ImportResultToast, ImportProgressModal, TemplateButton } from "@/components/ui/io-buttons";
import { exportCsv, parseCsv } from "@/lib/csv";
import type { ImportResult } from "@/components/ui/io-buttons";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { cn } from "@/lib/cn";

// ─── Create-WO modal ─────────────────────────────────────────────────────────
function CreateWoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    type: 'new' as WorkOrderType, merchantName: 'Salla Store', slaHours: '48',
    customerName: '', customerPhone: '', customerEmail: '',
    addressLabel: 'Home', addressLine: '', city: 'Riyadh',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const dto: CreateWorkOrderDto = {
        type: form.type, merchantName: form.merchantName, slaHours: Number(form.slaHours),
        customer: {
          fullName: form.customerName, phone: form.customerPhone, email: form.customerEmail || undefined,
          address: { label: form.addressLabel, addressLine: form.addressLine, city: form.city },
        },
      };
      await api.createWorkOrder(dto);
      onCreated(); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>New work order</DialogTitle>
      <DialogContent>
        <Stack component="form" id="create-wo-form" onSubmit={submit} spacing={2.5} sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField select label="Type" value={form.type} onChange={f('type')} size="small">
              <MenuItem value="new">New delivery</MenuItem>
              <MenuItem value="return">Return</MenuItem>
            </TextField>
            <TextField label="SLA hours" type="number" value={form.slaHours} onChange={f('slaHours')} size="small" />
          </Box>
          <TextField label="Merchant / store name" value={form.merchantName} onChange={f('merchantName')} size="small" required />
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', mt: 1 }}>Customer</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Full name" value={form.customerName} onChange={f('customerName')} size="small" required />
            <TextField label="Phone" type="tel" value={form.customerPhone} onChange={f('customerPhone')} size="small" required />
          </Box>
          <TextField label="Email (optional)" type="email" value={form.customerEmail} onChange={f('customerEmail')} size="small" />
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}>Delivery address</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Label" value={form.addressLabel} onChange={f('addressLabel')} size="small" />
            <TextField label="City" value={form.city} onChange={f('city')} size="small" />
          </Box>
          <TextField label="Address line" value={form.addressLine} onChange={f('addressLine')} size="small" required />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="create-wo-form" disabled={loading}>
          {loading ? 'Creating…' : 'Create work order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Resolve Problem modal ────────────────────────────────────────────────────
function ResolveProblemModal({ problem, onClose, onResolved }: { problem: ProblemRecord; onClose: () => void; onResolved: () => void }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await api.resolveProblem(problem.id, notes); onResolved(); onClose(); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Resolve problem</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {problem.category} — {problem.description}
        </Typography>
        <TextField
          label="Resolution notes"
          multiline rows={3}
          value={notes} onChange={(e) => setNotes(e.target.value)}
          required fullWidth size="small"
          placeholder="Describe how this was resolved…"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="button" disabled={loading} onClick={submit as unknown as React.MouseEventHandler<HTMLButtonElement>}>
          {loading ? 'Saving…' : 'Mark resolved'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WO_CSV_HEADERS = ['type', 'merchantName', 'slaHours', 'customerName', 'customerPhone', 'customerEmail', 'addressLabel', 'addressLine', 'city'];

const STATUS_COLORS: Record<string, string> = {
  escalated: '#d8453a', in_review: '#e0a721', open: '#6b5d80', resolved: '#2f9e64',
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resolvingProblem, setResolvingProblem] = useState<ProblemRecord | null>(null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<{ total: number; done: number | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, p, z] = await Promise.all([
        api.getWorkOrders(filterStatus ? { status: filterStatus as WorkOrder['status'] } : undefined),
        api.getProblems(), api.getZones(),
      ]);
      setOrders(o); setProblems(p); setZones(z);
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  async function handleAdvance(id: string) {
    setAdvancingId(id);
    try { await api.advanceStage(id); await load(); } finally { setAdvancingId(null); }
  }

  function handleExport() {
    const rows = orders.map((o) => [
      o.type, o.merchantName, o.slaHours,
      o.endCustomer?.fullName ?? '', o.endCustomer?.phone ?? '', o.endCustomer?.email ?? '',
      o.deliveryAddress?.label ?? '', o.deliveryAddress?.addressLine ?? '', o.deliveryAddress?.city ?? '',
    ]);
    exportCsv(`work-orders-${new Date().toISOString().slice(0, 10)}.csv`, WO_CSV_HEADERS, rows);
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) return;
    setImportProgress({ total: rows.length, done: null });
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        await api.createWorkOrder({
          type: (r.type as WorkOrderType) || 'new', merchantName: r.merchantName || 'Unknown',
          slaHours: r.slaHours ? Number(r.slaHours) : undefined,
          customer: {
            fullName: r.customerName || 'Unknown', phone: r.customerPhone || '',
            email: r.customerEmail || undefined,
            address: { label: r.addressLabel || 'Home', addressLine: r.addressLine || '', city: r.city || 'Riyadh' },
          },
        });
      } catch (e) { errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : 'Failed'}`); }
      setImportProgress({ total: rows.length, done: i + 1 });
    }
    setImportResult({ total: rows.length, ok: rows.length - errors.length, errors });
    await load();
  }

  const active = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const breached = orders.filter((o) => o.slaBreached);
  const openProblems = problems.filter((p) => p.status !== 'resolved');
  const deliveredToday = orders.filter((o) => {
    if (o.status !== 'delivered') return false;
    const d = new Date(o.updatedAt), now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      {showCreate && <CreateWoModal onClose={() => setShowCreate(false)} onCreated={load} />}
      {resolvingProblem && <ResolveProblemModal problem={resolvingProblem} onClose={() => setResolvingProblem(null)} onResolved={load} />}
      {importProgress && <ImportProgressModal total={importProgress.total} done={importProgress.done} onClose={() => setImportProgress(null)} />}
      {importResult && <ImportResultToast result={importResult} onDismiss={() => setImportResult(null)} />}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.title')}</h1>
          <p className="mt-1 text-sm text-foreground/60">{t('admin.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton onExport={handleExport} disabled={orders.length === 0} />
          <ImportButton onFile={handleImportFile} />
          <TemplateButton label="CSV template" filename="work-orders-template.csv" headers={WO_CSV_HEADERS} />
          <Button variant="primary" onClick={() => setShowCreate(true)}>+ {t('admin.createWo')}</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('admin.kpi.active'), value: active.length, warn: false },
          { label: t('admin.kpi.breaches'), value: breached.length, warn: breached.length > 0 },
          { label: t('admin.kpi.problems'), value: openProblems.length, warn: openProblems.length > 0 },
          { label: t('admin.kpi.today'), value: deliveredToday.length, warn: false },
        ].map((s) => (
          <Card key={s.label} className={s.warn ? 'border-status-breached/30' : ''}>
            <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.warn ? 'text-status-breached' : 'text-brand-purple'}`}>
              {loading ? '…' : s.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Work orders table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.woTable')}</CardTitle>
              <TextField
                select size="small"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="">{t('label.all')}</MenuItem>
                <MenuItem value="pending">{t('label.pending')}</MenuItem>
                <MenuItem value="in_progress">{t('label.inProgress')}</MenuItem>
                <MenuItem value="delivered">{t('label.delivered')}</MenuItem>
                <MenuItem value="problem">{t('label.problem')}</MenuItem>
              </TextField>
            </CardHeader>
            {loading ? (
              <p className="py-8 text-center text-sm text-foreground/40">{t('label.loading')}</p>
            ) : orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground/40">{t('label.noData')}</p>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {[t('label.reference'), t('label.customer'), t('label.stage'), t('label.sla'), t('label.action')].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '2px solid #ddd6e8' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((o) => {
                      const state = slaState(o);
                      return (
                        <TableRow key={o.id} sx={{ '&:hover': { bgcolor: '#f7f5fb' }, bgcolor: state === 'breached' ? 'rgba(216,69,58,0.03)' : undefined }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span className="font-semibold text-brand-purple text-xs">{o.reference}</span>
                              <WorkOrderBadge type={o.type} />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{o.endCustomer?.fullName ?? '—'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {o.currentStage ? STAGE_LABELS[o.currentStage] ?? o.currentStage : '—'}
                          </TableCell>
                          <TableCell><SlaBadge state={state} remainingLabel={slaRemaining(o)} /></TableCell>
                          <TableCell>
                            {o.status !== 'delivered' && (
                              <Button variant="outline" className="text-xs px-2 py-1" disabled={advancingId === o.id} onClick={() => handleAdvance(o.id)}>
                                {advancingId === o.id ? '…' : t('admin.advance')}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t('admin.zones')}</CardTitle></CardHeader>
            {loading ? <p className="text-sm text-foreground/40">…</p> : (
              <ul className="space-y-2">
                {zones.map((z) => {
                  const zo = orders.filter((o) => z.dfps.find((d) => d.id === o.assignedDfpId));
                  const zb = zo.filter((o) => o.slaBreached);
                  return (
                    <li key={z.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">{z.name}</p>
                        <p className="text-xs text-foreground/50">{z.dfps.map((d) => d.name).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{zo.length} WOs</p>
                        {zb.length > 0 && <p className="text-xs font-medium text-status-breached">{zb.length} breached</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className={openProblems.length > 0 ? 'border-status-at-risk/30' : ''}>
            <CardHeader>
              <CardTitle>{t('admin.problems')}</CardTitle>
              <span className="text-xs text-foreground/50">{openProblems.length} open</span>
            </CardHeader>
            {loading ? <p className="text-sm text-foreground/40">…</p> : problems.length === 0 ? (
              <p className="text-sm text-foreground/40 py-2">No open problems</p>
            ) : (
              <ul className="space-y-2">
                {problems.slice(0, 5).map((p) => (
                  <li key={p.id} className="rounded-xl border border-border px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-brand-purple">{p.workOrderId.slice(0, 8)}…</p>
                        <p className="mt-0.5 text-sm font-medium">{p.category}</p>
                        <p className="text-xs text-foreground/50 line-clamp-1">{p.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Chip label={p.status.replace('_', ' ')} size="small" sx={{ fontWeight: 600, fontSize: '0.65rem', color: STATUS_COLORS[p.status] ?? '#6b5d80', bgcolor: `${STATUS_COLORS[p.status] ?? '#6b5d80'}18` }} />
                        {p.status !== 'resolved' && (
                          <Button variant="ghost" className="text-xs px-2 py-0.5" onClick={() => setResolvingProblem(p)}>Resolve</Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
