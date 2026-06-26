'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { WorkOrder, EFlowStageName } from "@/lib/types";
import { STAGE_LABELS, slaState, slaRemaining } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlaBadge } from "@/components/ui/badge";
import { useLocale } from "@/lib/locale";
import { ExportButton } from "@/components/ui/io-buttons";
import { exportCsv } from "@/lib/csv";
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';

// ─── WO Row ───────────────────────────────────────────────────────────────────

function WoRow({ wo, actionLabel, onAction, actioning }: {
  wo: WorkOrder; actionLabel: string; onAction: (id: string) => void; actioning: string | null;
}) {
  const state = slaState(wo);
  const remaining = slaRemaining(wo);
  const typeColor = wo.type === 'new' ? 'primary' : 'warning';

  return (
    <TableRow sx={{ '&:hover': { bgcolor: '#f7f5fb' } }}>
      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700 }}>{wo.reference}</TableCell>
      <TableCell>
        <Chip label={wo.type} size="small" color={typeColor} variant="outlined" sx={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.7rem' }} />
      </TableCell>
      <TableCell sx={{ fontSize: '0.85rem' }}>{wo.endCustomer?.fullName ?? '—'}</TableCell>
      <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{wo.merchantName}</TableCell>
      <TableCell><SlaBadge state={state} remainingLabel={remaining} /></TableCell>
      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
        {STAGE_LABELS[wo.currentStage as EFlowStageName] ?? wo.currentStage ?? '—'}
      </TableCell>
      <TableCell>
        <Button variant="primary" className="text-xs px-3 py-1.5" disabled={actioning === wo.id} onClick={() => onAction(wo.id)}>
          {actioning === wo.id ? '…' : actionLabel}
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ─── Queue Panel ──────────────────────────────────────────────────────────────

function QueuePanel({ title, description, stages, actionLabel, emptyText }: {
  title: string; description: string; stages: EFlowStageName[]; actionLabel: string; emptyText: string;
}) {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const all = await api.getWorkOrders({ status: 'in_progress' });
      setOrders(all.filter((o) => stages.includes(o.currentStage as EFlowStageName)));
    } catch { setError('Failed to load orders'); }
    finally { setLoading(false); }
  }, [stages]);

  useEffect(() => { load(); }, [load]);

  async function handleAction(id: string) {
    setActioning(id);
    try { await api.advanceStage(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setActioning(null); }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{description}</Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        {loading ? (
          <Typography variant="body2" sx={{ py: 6, textAlign: 'center', color: 'text.disabled' }}>Loading…</Typography>
        ) : orders.length === 0 ? (
          <Typography variant="body2" sx={{ py: 6, textAlign: 'center', color: 'text.disabled' }}>{emptyText}</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Reference', 'Type', 'Customer', 'Merchant', 'SLA', 'Stage', 'Action'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '2px solid #ddd6e8' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((wo) => (
                  <WoRow key={wo.id} wo={wo} actionLabel={actionLabel} onAction={handleAction} actioning={actioning} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <ExportButton
          label="Export queue"
          disabled={orders.length === 0}
          onExport={() => {
            exportCsv(
              `warehouse-${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`,
              ['reference', 'type', 'merchantName', 'customerName', 'currentStage', 'slaDeadline', 'slaBreached'],
              orders.map((o) => [o.reference, o.type, o.merchantName, o.endCustomer?.fullName ?? '', o.currentStage ?? '', o.slaDeadline, o.slaBreached ? 'yes' : 'no']),
            );
          }}
        />
        <Typography component="button" onClick={load} variant="caption" sx={{ color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'text.secondary' }, background: 'none', border: 'none', p: 0 }}>
          Refresh
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'inbound', label: 'Inbound', title: 'Awaiting Warehouse Inbound', description: 'Orders picked up and en route to warehouse. Scan in to confirm receipt.', stages: ['pickup_from_store', 'pickup_from_customer'] as EFlowStageName[], actionLabel: 'Scan In', emptyText: 'No orders awaiting inbound scan.' },
  { id: 'processing', label: 'Processing', title: 'Warehouse Processing', description: 'Orders received at warehouse. Condition-check and prepare for outbound dispatch.', stages: ['warehouse_inbound'] as EFlowStageName[], actionLabel: 'Dispatch Outbound', emptyText: 'No orders currently in processing.' },
  { id: 'outbound', label: 'Outbound', title: 'Outbound Queue', description: 'Orders processed and ready to hand off to the delivery DFP.', stages: ['warehouse_outbound'] as EFlowStageName[], actionLabel: 'Hand to DFP', emptyText: 'Outbound queue is clear.' },
] as const;

export default function WarehousePage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('warehouse.title')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{t('warehouse.subtitle')}</Typography>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid #ddd6e8', '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: '3px 3px 0 0' } }}
      >
        {TABS.map((tb) => (
          <Tab key={tb.id} label={t((`warehouse.${tb.id}`) as Parameters<typeof t>[0])}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }}
          />
        ))}
      </Tabs>

      <QueuePanel
        key={tab.id}
        title={t((`warehouse.${tab.id}`) as Parameters<typeof t>[0])}
        description={tab.description}
        stages={tab.stages}
        actionLabel={t(tab.id === 'inbound' ? 'warehouse.scanIn' : tab.id === 'processing' ? 'warehouse.dispatch' : 'warehouse.handOff')}
        emptyText={t(tab.id === 'inbound' ? 'warehouse.emptyIn' : tab.id === 'processing' ? 'warehouse.emptyProc' : 'warehouse.emptyOut')}
      />
    </div>
  );
}
