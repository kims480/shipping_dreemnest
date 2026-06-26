'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { slaState, slaRemaining, STAGE_LABELS } from "@/lib/types";
import type { WorkOrder, ConfirmDeliveryDto } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderBadge, SlaBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/locale";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

// ─── Confirm Delivery Modal ───────────────────────────────────────────────────

function ConfirmModal({ wo, onClose, onConfirmed }: { wo: WorkOrder; onClose: () => void; onConfirmed: () => void }) {
  const [signedByName, setSignedByName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [condition, setCondition] = useState('good');
  const [arrivedOnTime, setArrivedOnTime] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      const dto: ConfirmDeliveryDto = {
        workOrderId: wo.id, signedByName, remarks: remarks || undefined,
        satisfactionAnswers: { arrived_on_time: arrivedOnTime, package_condition: condition, delivery_rating: 5 },
      };
      await api.confirmDelivery(dto);
      if (wo.status !== 'delivered') await api.advanceStage(wo.id);
      onConfirmed(); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Confirm delivery — {wo.reference}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="confirm-delivery-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <TextField label="Signed by (recipient name)" required value={signedByName} onChange={(e) => setSignedByName(e.target.value)} size="small" placeholder={wo.endCustomer?.fullName ?? 'Recipient name'} />
          <TextField select label="Package condition" value={condition} onChange={(e) => setCondition(e.target.value)} size="small">
            <MenuItem value="excellent">Excellent</MenuItem>
            <MenuItem value="good">Good</MenuItem>
            <MenuItem value="damaged">Damaged</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={arrivedOnTime} onChange={(e) => setArrivedOnTime(e.target.checked)} sx={{ color: 'primary.main' }} />}
            label={<Typography variant="body2">Arrived on time?</Typography>}
          />
          <TextField label="Remarks (optional)" multiline rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} size="small" placeholder="Any notes about the delivery…" />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="confirm-delivery-form" disabled={loading}>{loading ? 'Saving…' : 'Confirm delivery'}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DfpPage() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [confirmWo, setConfirmWo] = useState<WorkOrder | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await api.getWorkOrders({ status: 'in_progress' })); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdvance(id: string) {
    setAdvancingId(id);
    try { await api.advanceStage(id); await load(); } finally { setAdvancingId(null); }
  }

  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const breached  = orders.filter((o) => o.slaBreached).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      {confirmWo && <ConfirmModal wo={confirmWo} onClose={() => setConfirmWo(null)} onConfirmed={load} />}

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('dfp.title')}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{t('dfp.subtitle')}</Typography>
        </Box>
        <Button variant="accent" onClick={load} disabled={loading}>{loading ? '…' : t('action.refresh')}</Button>
      </Box>

      {/* KPI strip */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <Card>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block' }}>{t('dfp.kpi.queue')}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>{loading ? '…' : orders.length}</Typography>
        </Card>
        <Card>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block' }}>{t('label.delivered')}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>{loading ? '…' : delivered}</Typography>
        </Card>
        <Card>
          <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block' }}>{t('dfp.kpi.breached')}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: breached > 0 ? 'error.main' : 'text.disabled', mt: 0.5 }}>{loading ? '…' : breached}</Typography>
        </Card>
      </Box>

      <Card>
        <CardHeader>
          <CardTitle>{t('dfp.title')}</CardTitle>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{orders.length} orders</Typography>
        </CardHeader>

        {loading ? (
          <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>{t('label.loading')}</Typography>
        ) : orders.length === 0 ? (
          <Typography variant="body2" sx={{ py: 4, textAlign: 'center', color: 'text.disabled' }}>{t('dfp.noOrders')}</Typography>
        ) : (
          <Stack spacing={1.5}>
            {orders.map((wo) => {
              const state = slaState(wo);
              const remaining = slaRemaining(wo);
              const addr = wo.deliveryAddress;
              return (
                <Box
                  key={wo.id}
                  sx={{
                    borderRadius: 3, border: '1px solid', px: 2.5, py: 2,
                    borderColor: state === 'breached' ? 'rgba(216,69,58,0.3)' : 'divider',
                    bgcolor: state === 'breached' ? 'rgba(216,69,58,0.04)' : 'background.paper',
                    '&:hover': { bgcolor: state === 'breached' ? 'rgba(216,69,58,0.06)' : '#f7f5fb' },
                    transition: 'background-color 0.15s',
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{wo.reference}</Typography>
                        <WorkOrderBadge type={wo.type} />
                        <SlaBadge state={state} remainingLabel={remaining} />
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{wo.endCustomer?.fullName ?? '—'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {wo.endCustomer?.phone ?? ''}{addr ? ` · ${addr.addressLine}, ${addr.city}` : ''}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Stage: {wo.currentStage ? STAGE_LABELS[wo.currentStage] ?? wo.currentStage : '—'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                      {addr?.lat && addr?.lng && (
                        <a href={`https://maps.google.com/?q=${addr.lat},${addr.lng}`} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="text-xs px-3 py-1.5">{t('dfp.navigate')}</Button>
                        </a>
                      )}
                      <Button variant="outline" className="text-xs px-3 py-1.5" disabled={advancingId === wo.id} onClick={() => handleAdvance(wo.id)}>
                        {advancingId === wo.id ? '…' : t('action.advance')}
                      </Button>
                      <Button variant="primary" className="text-xs px-3 py-1.5" onClick={() => setConfirmWo(wo)}>
                        {t('dfp.confirmBtn')}
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>
    </div>
  );
}
