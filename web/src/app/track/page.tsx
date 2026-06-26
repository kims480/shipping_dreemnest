'use client';

import { useState } from "react";
import { api } from "@/lib/api";
import { STAGE_LABELS, slaState, slaRemaining } from "@/lib/types";
import type { WorkOrder, EFlowStageName, SubmitRatingDto, RaiseProblemDto } from "@/lib/types";
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MuiTextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

const NEW_FLOW: EFlowStageName[] = ['wo_created', 'pickup_from_store', 'warehouse_inbound', 'warehouse_outbound', 'out_for_delivery', 'delivered'];
const RETURN_FLOW: EFlowStageName[] = ['wo_created', 'pickup_from_customer', 'warehouse_inbound', 'warehouse_outbound', 'out_for_delivery_to_store', 'delivered'];

// ─── Rating Modal ─────────────────────────────────────────────────────────────

function RateModal({ wo, onClose, onRated }: { wo: WorkOrder; onClose: () => void; onRated: () => void }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      const dto: SubmitRatingDto = { workOrderId: wo.id, score, comment: comment || undefined };
      await api.submitRating(dto); onRated(); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Rate your delivery</DialogTitle>
      <DialogContent>
        <Stack component="form" id="rate-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>Your score</Typography>
            <ToggleButtonGroup value={score} exclusive onChange={(_, v) => { if (v !== null) setScore(v); }} fullWidth size="small"
              sx={{ '& .MuiToggleButton-root': { fontWeight: 700, border: '1px solid #ddd6e8 !important', '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main !important' } } }}
            >
              {[1, 2, 3, 4, 5].map((s) => <ToggleButton key={s} value={s}>{s}★</ToggleButton>)}
            </ToggleButtonGroup>
          </Box>
          <TextField label="Comment (optional)" multiline rows={3} value={comment} onChange={(e) => setComment(e.target.value)} size="small" placeholder="How was your delivery experience?" />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="accent" type="submit" form="rate-form" disabled={loading}>{loading ? 'Sending…' : 'Submit rating'}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Complaint Modal ──────────────────────────────────────────────────────────

function ComplaintModal({ wo, onClose, onSubmitted }: { wo: WorkOrder; onClose: () => void; onSubmitted: () => void }) {
  const [category, setCategory] = useState('Delivery Delay');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try {
      const dto: RaiseProblemDto = { workOrderId: wo.id, source: 'end_customer_complaint', category, description };
      await api.raiseProblem(dto); onSubmitted(); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Raise a complaint</DialogTitle>
      <DialogContent>
        <Stack component="form" id="complaint-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} size="small">
            {['Delivery Delay', 'Wrong Item', 'Damaged Package', 'Driver Behavior', 'Other'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField label="Details" multiline rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} size="small" placeholder="Describe what happened…" />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="complaint-form" disabled={loading}>{loading ? 'Submitting…' : 'Submit complaint'}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Stage dot ────────────────────────────────────────────────────────────────

function StageDot({ status }: { status: 'done' | 'active' | 'pending' }) {
  const bg = status === 'active' ? '#4b2e6f' : status === 'done' ? '#2f9e64' : '#ddd6e8';
  return (
    <Box sx={{ position: 'absolute', left: -11, top: 4, width: 20, height: 20, borderRadius: '50%', bgcolor: bg, ring: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '2px solid white' }}>
      {status === 'done' && (
        <svg style={{ width: 12, height: 12, color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'active' && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#b5d335' }} />}
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrackPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [wo, setWo] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setErr(null); setWo(null); setSuccessMsg(null);
    try {
      const results = await api.getWorkOrders({ reference: query.trim() });
      if (results.length === 0) setErr(`No work order found for "${query.trim()}"`);
      else setWo(results[0]);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Search failed'); }
    finally { setLoading(false); }
  }

  const flow = wo?.type === 'return' ? RETURN_FLOW : NEW_FLOW;

  function stageStatus(stageName: EFlowStageName): 'done' | 'active' | 'pending' {
    if (!wo) return 'pending';
    if (wo.currentStage === stageName) return 'active';
    const currentIdx = flow.indexOf(wo.currentStage as EFlowStageName);
    const stageIdx = flow.indexOf(stageName);
    return stageIdx < currentIdx ? 'done' : 'pending';
  }

  function stageTimestamp(stageName: EFlowStageName): string | null {
    if (!wo) return null;
    const stage = wo.stages?.find((s) => s.name === stageName);
    if (!stage) return null;
    const ts = stage.completedAt ?? stage.enteredAt;
    if (!ts) return null;
    return new Date(ts).toLocaleString('en-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      {wo && rateOpen && <RateModal wo={wo} onClose={() => setRateOpen(false)} onRated={() => setSuccessMsg('Thank you for your rating!')} />}
      {wo && complaintOpen && <ComplaintModal wo={wo} onClose={() => setComplaintOpen(false)} onSubmitted={() => setSuccessMsg('Complaint received — our team will follow up within 2 hours.')} />}

      {/* Search */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{t('track.title')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{t('track.subtitle')}</Typography>
        <Box component="form" onSubmit={search} sx={{ display: 'flex', gap: 1.5 }}>
          <MuiTextField
            fullWidth value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('track.placeholder')} size="small"
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton type="submit" disabled={loading} size="small"><SearchIcon /></IconButton></InputAdornment> } }}
          />
          <Button variant="primary" type="submit" disabled={loading} className="px-5 whitespace-nowrap">
            {loading ? '…' : t('track.search')}
          </Button>
        </Box>
        {err && <Alert severity="error" sx={{ mt: 1.5 }}>{err}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mt: 1.5 }}>{successMsg}</Alert>}
      </Box>

      {wo && (
        <>
          {/* Order header */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Order details</CardTitle></CardHeader>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>{wo.reference}</Typography>
              <WorkOrderBadge type={wo.type} />
              {wo.status !== 'delivered' && <SlaBadge state={slaState(wo)} remainingLabel={slaRemaining(wo)} />}
              {wo.status === 'delivered' && (
                <Box sx={{ borderRadius: 99, bgcolor: 'rgba(47,158,100,0.15)', px: 1.5, py: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>Delivered</Typography>
                </Box>
              )}
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {[
                { label: 'Recipient', value: wo.endCustomer?.fullName ?? '—' },
                { label: 'Phone', value: wo.endCustomer?.phone ?? '—' },
                { label: 'Merchant', value: wo.merchantName },
              ].map(({ label, value }) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block', mb: 0.25 }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                </Box>
              ))}
              {wo.deliveryAddress && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block', mb: 0.25 }}>Delivery address</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{wo.deliveryAddress.addressLine}, {wo.deliveryAddress.city}</Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* E-flow timeline */}
          <Card className="mb-6">
            <CardHeader><CardTitle>Delivery progress</CardTitle></CardHeader>
            <Box component="ol" sx={{ position: 'relative', ml: 1.5, borderLeft: '2px solid #ddd6e8', listStyle: 'none', p: 0, m: 0, mt: 1 }}>
              {flow.map((stageName) => {
                const status = stageStatus(stageName);
                const ts = stageTimestamp(stageName);
                return (
                  <Box component="li" key={stageName} sx={{ position: 'relative', pb: 3, pl: 3.5, '&:last-child': { pb: 0 } }}>
                    <StageDot status={status} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: status === 'pending' ? 400 : 600, color: status === 'active' ? 'primary.main' : status === 'done' ? 'text.primary' : 'text.disabled' }}>
                          {STAGE_LABELS[stageName]}
                        </Typography>
                        {status === 'active' && (
                          <Box sx={{ borderRadius: 99, bgcolor: 'rgba(181,211,53,0.2)', px: 1, py: 0.25 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.65rem' }}>Now</Typography>
                          </Box>
                        )}
                      </Stack>
                      {ts && <Typography variant="caption" sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}>{ts}</Typography>}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>

          {/* Action cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Card>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Rate your experience</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>Tell us how your delivery went.</Typography>
              <Button variant="accent" className="w-full" onClick={() => setRateOpen(true)}>Rate delivery</Button>
            </Card>
            <Card>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Need help?</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>Our team follows up within 2 hours.</Typography>
              <Button variant="outline" className="w-full" onClick={() => setComplaintOpen(true)}>Raise complaint</Button>
            </Card>
          </Box>
        </>
      )}
    </div>
  );
}
