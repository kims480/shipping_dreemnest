'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { slaState, slaRemaining, STAGE_LABELS } from "@/lib/types";
import type { WorkOrder, CreateWorkOrderDto, WorkOrderType } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderBadge, SlaBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";
import { ExportButton } from "@/components/ui/io-buttons";
import { exportCsv } from "@/lib/csv";
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
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

const EFLOW_STEPS = [
  'WO Created', 'Pickup from Store', 'WH Inbound', 'WH Outbound', 'Out for Delivery',
];

// ─── Create-WO Modal ──────────────────────────────────────────────────────────

function CreateWoModal({ defaultMerchant, onClose, onCreated }: {
  defaultMerchant: string; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState({
    type: 'new' as WorkOrderType, merchantName: defaultMerchant, slaHours: '48',
    customerName: '', customerPhone: '', customerEmail: '',
    addressLabel: 'Home', addressLine: '', city: 'Riyadh',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      const dto: CreateWorkOrderDto = {
        type: form.type, merchantName: form.merchantName, slaHours: Number(form.slaHours),
        customer: { fullName: form.customerName, phone: form.customerPhone, email: form.customerEmail || undefined, address: { label: form.addressLabel, addressLine: form.addressLine, city: form.city } },
      };
      await api.createWorkOrder(dto);
      onCreated(); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Create shipment</DialogTitle>
      <DialogContent>
        <Stack component="form" id="create-wo-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField select label="Type" value={form.type} onChange={f('type')} size="small">
              <MenuItem value="new">New delivery</MenuItem>
              <MenuItem value="return">Return</MenuItem>
            </TextField>
            <TextField label="SLA hours" type="number" value={form.slaHours} onChange={f('slaHours')} size="small" />
          </Box>
          <TextField label="Store / merchant name" value={form.merchantName} onChange={f('merchantName')} size="small" placeholder="Salla Store" />
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', pt: 0.5 }}>Customer</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Full name" value={form.customerName} onChange={f('customerName')} required size="small" placeholder="Mohammed Al-Harbi" />
            <TextField label="Phone" type="tel" value={form.customerPhone} onChange={f('customerPhone')} required size="small" placeholder="+966 5X XXX XXXX" />
          </Box>
          <TextField label="Email (optional)" type="email" value={form.customerEmail} onChange={f('customerEmail')} size="small" />
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', pt: 0.5 }}>Delivery address</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField label="Label" value={form.addressLabel} onChange={f('addressLabel')} size="small" placeholder="Home" />
            <TextField label="City" value={form.city} onChange={f('city')} size="small" placeholder="Riyadh" />
          </Box>
          <TextField label="Address line" value={form.addressLine} onChange={f('addressLine')} size="small" placeholder="King Abdullah Rd, Al-Malaz" />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="create-wo-form" disabled={loading}>{loading ? 'Creating…' : 'Create shipment'}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MerchantPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('');

  const merchantName = user?.fullName ?? 'Salla Store';

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await api.getWorkOrders(filterType ? { type: filterType as WorkOrderType } : undefined)); }
    finally { setLoading(false); }
  }, [filterType]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    const headers = ['reference', 'type', 'merchantName', 'status', 'currentStage', 'customerName', 'customerPhone', 'city', 'slaHours', 'slaBreached', 'createdAt'];
    exportCsv(`my-orders-${new Date().toISOString().slice(0, 10)}.csv`, headers,
      orders.map((o) => [o.reference, o.type, o.merchantName, o.status, o.currentStage ?? '', o.endCustomer?.fullName ?? '', o.endCustomer?.phone ?? '', o.deliveryAddress?.city ?? '', o.slaHours, o.slaBreached ? 'yes' : 'no', new Date(o.createdAt).toISOString()]));
  }

  const active  = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const today   = orders.filter((o) => o.status === 'delivered' && new Date(o.updatedAt).toDateString() === new Date().toDateString()).length;
  const pending = orders.filter((o) => o.status === 'pending').length;
  const returns = orders.filter((o) => o.type === 'return' && o.status !== 'delivered').length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      {showCreate && <CreateWoModal defaultMerchant={merchantName} onClose={() => setShowCreate(false)} onCreated={load} />}

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('merchant.title')}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{t('merchant.subtitle')}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ExportButton onExport={handleExport} disabled={orders.length === 0} />
          <Button variant="primary" onClick={() => setShowCreate(true)}>+ {t('merchant.createShip')}</Button>
        </Stack>
      </Box>

      {/* KPI strip */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {[
          { label: t('merchant.kpi.active'), value: active },
          { label: t('merchant.kpi.today'), value: today },
          { label: t('merchant.kpi.pending'), value: pending },
          { label: t('merchant.kpi.returns'), value: returns },
        ].map((s) => (
          <Card key={s.label}>
            <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block' }}>{s.label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>{loading ? '…' : s.value}</Typography>
          </Card>
        ))}
      </Box>

      {/* E-flow legend */}
      <Card className="mb-6">
        <CardHeader><CardTitle>{t('merchant.eflow')}</CardTitle></CardHeader>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
          {EFLOW_STEPS.map((step, i) => (
            <Stack key={step} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip label={step} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
              {i < EFLOW_STEPS.length - 1 && <Typography variant="caption" sx={{ color: 'text.disabled' }}>→</Typography>}
            </Stack>
          ))}
        </Stack>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('merchant.orders')}</CardTitle>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField select size="small" value={filterType} onChange={(e) => setFilterType(e.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="">{t('merchant.filterAll')}</MenuItem>
              <MenuItem value="new">{t('label.new')}</MenuItem>
              <MenuItem value="return">{t('label.return')}</MenuItem>
            </TextField>
            <Button variant="ghost" className="text-xs px-2 py-1" onClick={load} disabled={loading}>{t('action.refresh')}</Button>
          </Stack>
        </CardHeader>
        {loading ? (
          <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>{t('label.loading')}</Typography>
        ) : orders.length === 0 ? (
          <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>{t('merchant.noOrders')}</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Reference', 'Customer', 'Created', 'Stage', 'SLA'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '2px solid #ddd6e8' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((o) => {
                  const state = slaState(o);
                  const remaining = slaRemaining(o);
                  return (
                    <TableRow key={o.id} sx={{ '&:hover': { bgcolor: '#f7f5fb' }, ...(state === 'breached' && { bgcolor: 'rgba(216,69,58,0.04)' }) }}>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{o.reference}</Typography>
                          <WorkOrderBadge type={o.type} />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{o.endCustomer?.fullName ?? '—'}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {new Date(o.createdAt).toLocaleString('en-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        {o.currentStage ? STAGE_LABELS[o.currentStage] ?? o.currentStage : '—'}
                      </TableCell>
                      <TableCell><SlaBadge state={state} remainingLabel={remaining} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </div>
  );
}
