'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { SystemConfig } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/locale";
import { ExportButton, ImportButton, ImportResultToast } from "@/components/ui/io-buttons";
import { exportJson } from "@/lib/csv";
import type { ImportResult } from "@/components/ui/io-buttons";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import MuiButton from '@mui/material/Button';

// ─── Integration group definitions ───────────────────────────────────────────

interface ConfigField {
  key: string;
  label: string;
  placeholder?: string;
  sensitive?: boolean;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface IntegrationGroup {
  group: string;
  title: string;
  description: string;
  icon: string;
  fields: ConfigField[];
}

const INTEGRATION_GROUPS: IntegrationGroup[] = [
  {
    group: 'payment',
    title: 'Payment Gateway',
    description: 'Moyasar / HyperPay — collect online payments and reconcile COD.',
    icon: '💳',
    fields: [
      { key: 'payment.apiKey',        label: 'API Key',        sensitive: true, placeholder: 'sk_test_...' },
      { key: 'payment.webhookSecret', label: 'Webhook Secret', sensitive: true, placeholder: 'whsec_...' },
      { key: 'payment.mode', label: 'Mode', type: 'select', options: [{ value: 'test', label: 'Test' }, { value: 'live', label: 'Live' }] },
    ],
  },
  {
    group: 'twilio',
    title: 'Twilio (SMS & Voice)',
    description: 'Send OTPs, delivery alerts, and SLA breach warnings via Twilio.',
    icon: '📱',
    fields: [
      { key: 'twilio.accountSid', label: 'Account SID', sensitive: true, placeholder: 'ACxxxxxxxx' },
      { key: 'twilio.authToken',  label: 'Auth Token',  sensitive: true, placeholder: 'xxxxxxxx' },
      { key: 'twilio.fromNumber', label: 'From Number', placeholder: '+966XXXXXXXXX' },
    ],
  },
  {
    group: 'whatsapp',
    title: 'WhatsApp Business API',
    description: 'Send order status and delivery notifications via WhatsApp.',
    icon: '💬',
    fields: [
      { key: 'whatsapp.apiKey',        label: 'API Key',         sensitive: true, placeholder: 'EAAxxxxxxx' },
      { key: 'whatsapp.phoneNumberId', label: 'Phone Number ID', placeholder: '123456789' },
      { key: 'whatsapp.webhookSecret', label: 'Webhook Secret',  sensitive: true, placeholder: 'whsec_...' },
    ],
  },
  {
    group: 'sms',
    title: 'SMS Gateway',
    description: 'Fallback SMS provider for markets outside Twilio coverage.',
    icon: '✉️',
    fields: [
      { key: 'sms.provider', label: 'Provider', placeholder: 'e.g. Unifonic, Taqnyat' },
      { key: 'sms.apiKey',   label: 'API Key',  sensitive: true, placeholder: 'API key' },
      { key: 'sms.senderId', label: 'Sender ID', placeholder: 'DreemNest' },
    ],
  },
  {
    group: 'salla',
    title: 'Salla.com Connector',
    description: 'Receive work orders automatically from Salla merchant stores.',
    icon: '🛒',
    fields: [
      { key: 'salla.appId',         label: 'App ID',         placeholder: 'Salla app ID' },
      { key: 'salla.appSecret',     label: 'App Secret',     sensitive: true, placeholder: 'Salla app secret' },
      { key: 'salla.webhookSecret', label: 'Webhook Secret', sensitive: true, placeholder: 'whsec_...' },
    ],
  },
  {
    group: 'merchant',
    title: 'Merchant Onboarding',
    description: 'Default settings applied when a new merchant account is created.',
    icon: '🏪',
    fields: [
      { key: 'merchant.defaultSlaHours', label: 'Default SLA (hours)', placeholder: '48' },
      { key: 'merchant.maxWosPerDay',    label: 'Max WOs/day (0 = unlimited)', placeholder: '0' },
      { key: 'merchant.autoApprove', label: 'Auto-approve new merchants', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
    ],
  },
];

// ─── Per-field save state ─────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// ─── Config field row ─────────────────────────────────────────────────────────

function ConfigRow({ field, existing, onSaved }: { field: ConfigField; existing: SystemConfig | undefined; onSaved: (cfg: SystemConfig) => void; }) {
  const isMasked = existing?.sensitive && existing.value != null;
  const [value, setValue] = useState<string>(isMasked ? '' : (existing?.value ?? ''));
  const [revealed, setRevealed] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    if (!isMasked) setValue(existing?.value ?? '');
  }, [existing, isMasked]);

  async function save() {
    setSaveState('saving');
    try {
      const cfg = await api.upsertSystemConfig(field.key, { value: value || null, group: field.key.split('.')[0], label: field.label, sensitive: field.sensitive ?? false });
      onSaved(cfg);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  const saveColor = saveState === 'saved' ? 'success' : saveState === 'error' ? 'error' : 'primary';
  const saveLabel = saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? 'Error' : 'Save';

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
      <Box sx={{ width: { sm: 180 }, flexShrink: 0 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>{field.label}</Typography>
          {field.sensitive && (
            <Chip label="secret" size="small" sx={{ fontSize: '0.6rem', fontWeight: 700, height: 16, textTransform: 'uppercase', bgcolor: '#f0ebfa', color: 'text.disabled' }} />
          )}
        </Stack>
      </Box>
      <Stack direction="row" spacing={1} sx={{ flex: 1, alignItems: 'center' }}>
        {field.type === 'select' ? (
          <TextField select fullWidth size="small" value={value} onChange={(e) => setValue(e.target.value)}>
            <MenuItem value="">— select —</MenuItem>
            {field.options?.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
        ) : (
          <TextField
            fullWidth size="small" type={field.sensitive && !revealed ? 'password' : 'text'}
            value={isMasked && !revealed ? '••••••••' : value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            disabled={isMasked && !revealed}
            slotProps={isMasked ? {
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <MuiButton size="small" onClick={() => { setRevealed(true); setValue(''); }} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: 'primary.main', minWidth: 'auto', p: 0.5 }}>
                      Edit
                    </MuiButton>
                  </InputAdornment>
                ),
              },
            } : {}}
          />
        )}
        <MuiButton
          variant="contained"
          size="small"
          onClick={save}
          disabled={saveState === 'saving'}
          color={saveColor}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 2, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {saveLabel}
        </MuiButton>
      </Stack>
    </Stack>
  );
}

// ─── Integration group card ───────────────────────────────────────────────────

function IntegrationCard({ group, configs, onSaved }: { group: IntegrationGroup; configs: SystemConfig[]; onSaved: (cfg: SystemConfig) => void; }) {
  const byKey = Object.fromEntries(configs.map((c) => [c.key, c]));
  return (
    <Card>
      <CardHeader>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Typography variant="h5" component="span" sx={{ lineHeight: 1, mt: 0.25 }}>{group.icon}</Typography>
          <Box>
            <CardTitle>{group.title}</CardTitle>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{group.description}</Typography>
          </Box>
        </Box>
      </CardHeader>
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {group.fields.map((field) => (
          <ConfigRow key={field.key} field={field} existing={byKey[field.key]} onSaved={onSaved} />
        ))}
      </Stack>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { t } = useLocale();
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setConfigs(await api.getSystemConfig()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    const safe = configs.map(({ key, value, group, label, sensitive }) => ({ key, group, label, sensitive, value: sensitive && value ? null : value }));
    exportJson(`integrations-config-${new Date().toISOString().slice(0, 10)}.json`, safe);
  }

  async function handleImportFile(file: File) {
    let rows: { key: string; value: string | null; group?: string; label?: string; sensitive?: boolean }[];
    try {
      rows = JSON.parse(await file.text());
      if (!Array.isArray(rows)) throw new Error('Expected JSON array');
    } catch (e) {
      setImportResult({ total: 0, ok: 0, errors: ['Invalid JSON: ' + (e instanceof Error ? e.message : 'error')] });
      return;
    }
    const errors: string[] = [];
    for (const r of rows) {
      if (!r.key) continue;
      try {
        const cfg = await api.upsertSystemConfig(r.key, { value: r.value ?? null, group: r.group, label: r.label, sensitive: r.sensitive });
        handleSaved(cfg);
      } catch (e) { errors.push(`${r.key}: ${e instanceof Error ? e.message : 'Failed'}`); }
    }
    setImportResult({ total: rows.length, ok: rows.length - errors.length, errors });
  }

  function handleSaved(cfg: SystemConfig) {
    setConfigs((prev) => {
      const idx = prev.findIndex((c) => c.key === cfg.key);
      if (idx >= 0) { const next = [...prev]; next[idx] = cfg; return next; }
      return [...prev, cfg];
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
      {importResult && <ImportResultToast result={importResult} onDismiss={() => setImportResult(null)} />}

      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('integrations.title')}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{t('integrations.subtitle')}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <ExportButton label="Export JSON" onExport={handleExport} disabled={configs.length === 0} />
          <ImportButton label="Import JSON" accept=".json" onFile={handleImportFile} />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <MuiButton color="inherit" size="small" onClick={load} sx={{ textTransform: 'none', fontWeight: 600 }}>Retry</MuiButton>
        }>{error}</Alert>
      )}

      {loading ? (
        <Typography variant="body2" sx={{ py: 8, textAlign: 'center', color: 'text.disabled' }}>Loading…</Typography>
      ) : (
        <Stack spacing={3}>
          {INTEGRATION_GROUPS.map((group) => (
            <IntegrationCard key={group.group} group={group} configs={configs.filter((c) => c.group === group.group)} onSaved={handleSaved} />
          ))}
        </Stack>
      )}
    </div>
  );
}
