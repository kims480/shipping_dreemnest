'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Payment, PaymentStatus, PaymentMethod } from "@/lib/types";
import { Card } from "@/components/ui/card";
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
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { cn } from "@/lib/cn";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PaymentStatus, { color: string; bg: string }> = {
  pending:    { color: '#e0a721', bg: 'rgba(224,167,33,0.12)' },
  collected:  { color: '#4b2e6f', bg: 'rgba(75,46,111,0.10)' },
  reconciled: { color: '#2f9e64', bg: 'rgba(47,158,100,0.12)' },
  refunded:   { color: '#d8453a', bg: 'rgba(216,69,58,0.12)' },
};

const METHOD_STYLES: Record<PaymentMethod, { color: string; bg: string }> = {
  cod:    { color: '#e0a721', bg: 'rgba(224,167,33,0.12)' },
  online: { color: '#4b2e6f', bg: 'rgba(75,46,111,0.10)' },
};

function fmt(amount: string, currency = 'SAR') {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ workOrderId: '', method: 'cod' as PaymentMethod, amount: '', currency: 'SAR' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try { await api.recordPayment(form); onCreated(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Record Payment</DialogTitle>
      <DialogContent>
        <Stack component="form" id="record-payment-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Work Order ID" value={form.workOrderId} onChange={f('workOrderId')}
            required fullWidth size="small" slotProps={{ input: { style: { fontFamily: 'monospace' } } }}
            placeholder="UUID of the work order"
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField select label="Method" value={form.method} onChange={f('method')} size="small">
              <MenuItem value="cod">COD</MenuItem>
              <MenuItem value="online">Online</MenuItem>
            </TextField>
            <TextField select label="Currency" value={form.currency} onChange={f('currency')} size="small">
              <MenuItem value="SAR">SAR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
            </TextField>
          </Box>
          <TextField label="Amount" type="number" slotProps={{ htmlInput: { step: 0.01, min: 0 } }} value={form.amount} onChange={f('amount')} required size="small" />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="record-payment-form" disabled={loading}>
          {loading ? 'Recording…' : 'Record Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const PAYMENT_CSV_HEADERS = ['workOrderId', 'method', 'amount', 'currency'];

const STATUS_FILTERS: { label: string; value: PaymentStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Collected', value: 'collected' },
  { label: 'Reconciled', value: 'reconciled' },
  { label: 'Refunded', value: 'refunded' },
];

export default function PaymentsPage() {
  const { t } = useLocale();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [showRecord, setShowRecord] = useState(false);
  const [reconciling, setReconciling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<{ total: number; done: number | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: { status?: PaymentStatus; method?: PaymentMethod } = {};
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      setPayments(await api.getPayments(params));
    } catch { setError('Failed to load payments'); }
    finally { setLoading(false); }
  }, [statusFilter, methodFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleReconcile(id: string) {
    setReconciling(id);
    try { await api.reconcilePayment(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setReconciling(null); }
  }

  function handleExport() {
    const rows = payments.map((p) => [p.workOrderId, p.method, p.amount, p.currency]);
    exportCsv(`payments-${new Date().toISOString().slice(0, 10)}.csv`, PAYMENT_CSV_HEADERS, rows);
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
        await api.recordPayment({ workOrderId: r.workOrderId, method: (r.method as PaymentMethod) || 'cod', amount: r.amount, currency: r.currency || 'SAR' });
      } catch (e) { errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : 'Failed'}`); }
      setImportProgress({ total: rows.length, done: i + 1 });
    }
    setImportResult({ total: rows.length, ok: rows.length - errors.length, errors });
    await load();
  }

  const totalCod = payments.filter((p) => p.method === 'cod');
  const pendingAmount = totalCod.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const collectedAmount = totalCod.filter((p) => p.status === 'collected').reduce((s, p) => s + Number(p.amount), 0);
  const reconciledAmount = payments.filter((p) => p.status === 'reconciled').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      {showRecord && <RecordPaymentModal onClose={() => setShowRecord(false)} onCreated={load} />}
      {importProgress && <ImportProgressModal total={importProgress.total} done={importProgress.done} onClose={() => setImportProgress(null)} />}
      {importResult && <ImportResultToast result={importResult} onDismiss={() => setImportResult(null)} />}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('payments.title')}</h1>
          <p className="mt-1 text-sm text-foreground/60">{t('payments.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton onExport={handleExport} disabled={payments.length === 0} />
          <ImportButton onFile={handleImportFile} />
          <TemplateButton label="CSV template" filename="payments-template.csv" headers={PAYMENT_CSV_HEADERS} />
          <Button variant="primary" onClick={() => setShowRecord(true)}>+ {t('payments.record')}</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: t('payments.kpi.pending'), value: `SAR ${pendingAmount.toFixed(2)}`, color: 'text-status-at-risk' },
          { label: t('payments.kpi.collected'), value: `SAR ${collectedAmount.toFixed(2)}`, color: 'text-brand-purple' },
          { label: t('payments.kpi.reconciled'), value: `SAR ${reconciledAmount.toFixed(2)}`, color: 'text-status-on-track' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className={cn('text-xl font-bold', color)}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => { if (v !== null) setStatusFilter(v); }}
          size="small"
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 2, borderRadius: '20px !important', border: '1px solid #ddd6e8 !important', mx: 0.25 } }}
        >
          {STATUS_FILTERS.map(({ label, value }) => (
            <ToggleButton key={value} value={value}
              sx={{ '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } } }}
            >
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField select size="small" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | '')} sx={{ minWidth: 130, ml: 'auto' }}>
          <MenuItem value="">{t('payments.allMethods')}</MenuItem>
          <MenuItem value="cod">{t('payments.codOnly')}</MenuItem>
          <MenuItem value="online">{t('payments.onlineOnly')}</MenuItem>
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        {loading ? (
          <p className="py-10 text-center text-sm text-foreground/40">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="py-10 text-center text-sm text-foreground/40">No payment records found.</p>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Work Order', 'Method', 'Amount', 'Status', 'Reconciled at', 'Created', 'Action'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '2px solid #ddd6e8' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((p) => {
                  const ms = METHOD_STYLES[p.method];
                  const ss = STATUS_STYLES[p.status];
                  return (
                    <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#f7f5fb' } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.workOrderId.slice(0, 8)}…</TableCell>
                      <TableCell>
                        <Chip label={p.method.toUpperCase()} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', color: ms.color, bgcolor: ms.bg, border: `1px solid ${ms.color}30` }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{fmt(p.amount, p.currency)}</TableCell>
                      <TableCell>
                        <Chip label={p.status} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', color: ss.color, bgcolor: ss.bg, border: `1px solid ${ss.color}30`, textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {p.reconciledAt ? new Date(p.reconciledAt).toLocaleString('en-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {new Date(p.createdAt).toLocaleString('en-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        {p.status === 'collected' ? (
                          <Button variant="outline" className="text-xs px-3 py-1.5" disabled={reconciling === p.id} onClick={() => handleReconcile(p.id)}>
                            {reconciling === p.id ? '…' : t('payments.reconcile')}
                          </Button>
                        ) : <span className="text-xs text-foreground/30">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <div className="mt-3 text-right">
        <button onClick={load} className="text-xs text-foreground/40 hover:text-foreground transition-colors">Refresh</button>
      </div>
    </div>
  );
}
