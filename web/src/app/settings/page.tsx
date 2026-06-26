'use client';

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Zone, Dfp, User, NotificationTemplate, UserRole } from "@/lib/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/locale";
import { ExportButton, ImportButton, ImportResultToast, ImportProgressModal, TemplateButton } from "@/components/ui/io-buttons";
import { exportCsv, exportJson, parseCsv } from "@/lib/csv";
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
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Spinner() { return <p className="py-8 text-center text-sm text-foreground/40">Loading…</p>; }

// ─── Zones & SLA tab ──────────────────────────────────────────────────────────

function ZonesTab({ zones, onRefresh }: { zones: Zone[]; onRefresh: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [slaVal, setSlaVal] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveZoneSla(zoneId: string) {
    setSaving(true);
    try { await api.updateZone(zoneId, { defaultSlaHours: Number(slaVal) }); setEditing(null); onRefresh(); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      {zones.map((z) => (
        <Card key={z.id}>
          <CardHeader>
            <CardTitle>{z.name}</CardTitle>
            <Chip label={z.region.replace('_', ' ')} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
          </CardHeader>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, mb: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block', mb: 0.5 }}>Default SLA</Typography>
              {editing === z.id ? (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <TextField type="number" value={slaVal} onChange={(e) => setSlaVal(e.target.value)} size="small" sx={{ width: 80 }} slotProps={{ htmlInput: { min: 1 } }} />
                  <Typography variant="body2" color="text.secondary">hours</Typography>
                  <Button variant="primary" className="text-xs px-3 py-1" disabled={saving} onClick={() => saveZoneSla(z.id)}>{saving ? '…' : 'Save'}</Button>
                  <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => setEditing(null)}>Cancel</Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{z.defaultSlaHours}h</Typography>
                  <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => { setEditing(z.id); setSlaVal(String(z.defaultSlaHours)); }}>Edit</Button>
                </Stack>
              )}
            </Box>
          </Box>
          {z.dfps.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block', mb: 1 }}>DFPs in zone</Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {z.dfps.map((d) => (
                  <Chip key={d.id} label={`${d.name}${!d.active ? ' (inactive)' : ''}`} size="small"
                    color={d.active ? 'success' : 'default'} variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── DFPs tab ─────────────────────────────────────────────────────────────────

function AddDfpModal({ zones, onClose, onCreated }: { zones: Zone[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', kind: 'in_house', zoneId: zones[0]?.id ?? '', pingInterval: '5' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try { await api.createDfp({ ...form, locationPingIntervalMinutes: Number(form.pingInterval) }); onCreated(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Add DFP</DialogTitle>
      <DialogContent>
        <Stack component="form" id="add-dfp-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <TextField label="Full name" value={form.name} onChange={f('name')} required size="small" />
          <TextField label="Phone" type="tel" value={form.phone} onChange={f('phone')} required size="small" />
          <TextField label="Location ping (min)" type="number" value={form.pingInterval} onChange={f('pingInterval')} size="small" />
          <TextField select label="Zone" value={form.zoneId} onChange={f('zoneId')} size="small">
            {zones.map((z) => <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>)}
          </TextField>
          <TextField select label="Kind" value={form.kind} onChange={f('kind')} size="small">
            <MenuItem value="in_house">In-house</MenuItem>
            <MenuItem value="subcontractor">Subcontractor</MenuItem>
          </TextField>
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="add-dfp-form" disabled={loading}>{loading ? 'Saving…' : 'Add DFP'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditDfpModal({ dfp, onClose, onSaved }: { dfp: Dfp; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: dfp.name, phone: dfp.phone, pingInterval: String(dfp.locationPingIntervalMinutes) });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try { await api.updateDfp(dfp.id, { name: form.name, phone: form.phone, locationPingIntervalMinutes: Number(form.pingInterval) }); onSaved(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit DFP — {dfp.name}</DialogTitle>
      <DialogContent>
        <Stack component="form" id="edit-dfp-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <TextField label="Full name" value={form.name} onChange={f('name')} size="small" />
          <TextField label="Phone" type="tel" value={form.phone} onChange={f('phone')} size="small" />
          <TextField label="Location ping interval (min)" type="number" value={form.pingInterval} onChange={f('pingInterval')} size="small" />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="edit-dfp-form" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}

const DFP_CSV_HEADERS = ['name', 'phone', 'kind', 'zoneId', 'locationPingIntervalMinutes'];

function DfpsTab({ dfps, zones, onRefresh }: { dfps: Dfp[]; zones: Zone[]; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Dfp | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<{ total: number; done: number | null } | null>(null);

  const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name]));
  const zoneByName = Object.fromEntries(zones.map((z) => [z.name.toLowerCase(), z.id]));

  async function toggleActive(dfp: Dfp) {
    setToggling(dfp.id);
    try { await api.updateDfp(dfp.id, { active: !dfp.active }); onRefresh(); }
    finally { setToggling(null); }
  }

  function handleExport() {
    exportCsv(`dfps-${new Date().toISOString().slice(0, 10)}.csv`, DFP_CSV_HEADERS,
      dfps.map((d) => [d.name, d.phone, d.kind, d.zoneId, d.locationPingIntervalMinutes]));
  }

  async function handleImportFile(file: File) {
    const rows = parseCsv(await file.text());
    if (!rows.length) return;
    setImportProgress({ total: rows.length, done: null });
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const zoneId = r.zoneId || zoneByName[r.zoneName?.toLowerCase()] || zones[0]?.id || '';
      try { await api.createDfp({ name: r.name, phone: r.phone, kind: (r.kind as 'in_house' | 'subcontractor') || 'in_house', zoneId, locationPingIntervalMinutes: r.locationPingIntervalMinutes ? Number(r.locationPingIntervalMinutes) : 5 }); }
      catch (e) { errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : 'Failed'}`); }
      setImportProgress({ total: rows.length, done: i + 1 });
    }
    setImportResult({ total: rows.length, ok: rows.length - errors.length, errors });
    onRefresh();
  }

  return (
    <div>
      {showAdd && <AddDfpModal zones={zones} onClose={() => setShowAdd(false)} onCreated={onRefresh} />}
      {editing && <EditDfpModal dfp={editing} onClose={() => setEditing(null)} onSaved={onRefresh} />}
      {importProgress && <ImportProgressModal total={importProgress.total} done={importProgress.done} onClose={() => setImportProgress(null)} />}
      {importResult && <ImportResultToast result={importResult} onDismiss={() => setImportResult(null)} />}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack direction="row" spacing={1}>
          <ExportButton onExport={handleExport} disabled={dfps.length === 0} />
          <ImportButton onFile={handleImportFile} />
          <TemplateButton label="CSV template" filename="dfps-template.csv" headers={DFP_CSV_HEADERS} />
        </Stack>
        <Button variant="primary" onClick={() => setShowAdd(true)}>+ Add DFP</Button>
      </Box>
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Name', 'Phone', 'Zone', 'Kind', 'Ping (min)', 'Last seen', 'Status', 'Edit'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '2px solid #ddd6e8' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dfps.map((d) => (
                <TableRow key={d.id} sx={{ '&:hover': { bgcolor: '#f7f5fb' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{d.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{d.phone}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{zoneMap[d.zoneId] ?? d.zoneId}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', textTransform: 'capitalize' }}>{d.kind.replace('_', '-')}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{d.locationPingIntervalMinutes}m</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {d.lastLocationAt ? new Date(d.lastLocationAt).toLocaleString('en-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={toggling === d.id ? '…' : d.active ? 'Active' : 'Inactive'}
                      size="small" clickable onClick={() => toggleActive(d)}
                      color={d.active ? 'success' : 'error'} variant="outlined"
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => setEditing(d)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </div>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function AddUserModal({ zones, onClose, onCreated }: { zones: Zone[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'merchant' as UserRole, zoneId: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const ROLES: UserRole[] = ['admin', 'dispatch', 'dfp', 'merchant', 'warehouse', 'driver'];

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try { await api.createUser({ ...form, zoneId: form.zoneId || undefined }); onCreated(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Create user</DialogTitle>
      <DialogContent>
        <Stack component="form" id="add-user-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <TextField label="Full name" value={form.fullName} onChange={f('fullName')} required size="small" />
          <TextField label="Email" type="email" value={form.email} onChange={f('email')} required size="small" />
          <TextField label="Password" type="password" value={form.password} onChange={f('password')} required size="small" />
          <TextField select label="Role" value={form.role} onChange={f('role')} size="small">
            {ROLES.map((r) => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}
          </TextField>
          {(form.role === 'dfp' || form.role === 'dispatch') && (
            <TextField select label="Zone (optional)" value={form.zoneId} onChange={f('zoneId')} size="small">
              <MenuItem value="">— No zone —</MenuItem>
              {zones.map((z) => <MenuItem key={z.id} value={z.id}>{z.name}</MenuItem>)}
            </TextField>
          )}
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="add-user-form" disabled={loading}>{loading ? 'Creating…' : 'Create user'}</Button>
      </DialogActions>
    </Dialog>
  );
}

const USER_CSV_HEADERS = ['fullName', 'email', 'role', 'zoneId'];

function UsersTab({ zones, onRefresh }: { zones: Zone[]; onRefresh: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<{ total: number; done: number | null } | null>(null);

  const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name]));

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await api.getUsers()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(user: User) {
    setToggling(user.id);
    try { await api.updateUser(user.id, { active: !user.active }); load(); }
    finally { setToggling(null); }
  }

  function handleExport() {
    exportCsv(`users-${new Date().toISOString().slice(0, 10)}.csv`, USER_CSV_HEADERS,
      users.map((u) => [u.fullName, u.email, u.role, u.zoneId ?? '']));
  }

  async function handleImportFile(file: File) {
    const rows = parseCsv(await file.text());
    if (!rows.length) return;
    setImportProgress({ total: rows.length, done: null });
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try { await api.createUser({ fullName: r.fullName, email: r.email, password: r.password || 'ChangeMe123!', role: (r.role as UserRole) || 'merchant', zoneId: r.zoneId || undefined }); }
      catch (e) { errors.push(`Row ${i + 2}: ${e instanceof Error ? e.message : 'Failed'}`); }
      setImportProgress({ total: rows.length, done: i + 1 });
    }
    setImportResult({ total: rows.length, ok: rows.length - errors.length, errors });
    load();
  }

  const ROLE_COLOR: Record<string, 'primary' | 'success' | 'default'> = { admin: 'primary', dispatch: 'primary', dfp: 'success' };

  return (
    <div>
      {showAdd && <AddUserModal zones={zones} onClose={() => setShowAdd(false)} onCreated={load} />}
      {importProgress && <ImportProgressModal total={importProgress.total} done={importProgress.done} onClose={() => setImportProgress(null)} />}
      {importResult && <ImportResultToast result={importResult} onDismiss={() => setImportResult(null)} />}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack direction="row" spacing={1}>
          <ExportButton onExport={handleExport} disabled={users.length === 0} />
          <ImportButton onFile={handleImportFile} />
          <TemplateButton label="CSV template" filename="users-template.csv" headers={[...USER_CSV_HEADERS, 'password']} />
        </Stack>
        <Button variant="primary" onClick={() => setShowAdd(true)}>+ Create user</Button>
      </Box>
      <Card>
        {loading ? <Spinner /> : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Name', 'Email', 'Role', 'Zone', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '2px solid #ddd6e8' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} sx={{ '&:hover': { bgcolor: '#f7f5fb' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{u.fullName}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{u.email}</TableCell>
                    <TableCell><Chip label={u.role} size="small" color={ROLE_COLOR[u.role] ?? 'default'} variant="outlined" sx={{ fontWeight: 600, textTransform: 'capitalize' }} /></TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{u.zoneId ? zoneMap[u.zoneId] ?? u.zoneId : '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={toggling === u.id ? '…' : u.active ? 'Active' : 'Inactive'}
                        size="small" clickable onClick={() => toggleActive(u)}
                        color={u.active ? 'success' : 'error'} variant="outlined"
                        sx={{ fontWeight: 600, cursor: 'pointer' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </div>
  );
}

// ─── Notification Templates tab ───────────────────────────────────────────────

const EVENT_LABELS: Record<string, string> = {
  wo_received: 'WO Received', wo_stage_changed: 'Stage Changed', daily_reminder: 'Daily Reminder',
  delivery_confirmation: 'Delivery Confirmation', dfp_assignment: 'DFP Assignment', sla_breach_warning: 'SLA Breach Warning',
};

function EditTemplateModal({ template, onClose, onSaved }: { template: NotificationTemplate; onClose: () => void; onSaved: () => void }) {
  const [subject, setSubject] = useState(template.subject ?? '');
  const [body, setBody] = useState(template.body);
  const [active, setActive] = useState(template.active);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try { await api.updateTemplate(template.id, { subject: subject || undefined, body, active }); onSaved(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {EVENT_LABELS[template.event] ?? template.event}
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textTransform: 'capitalize' }}>{template.channel} · {template.locale.toUpperCase()}</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack component="form" id="edit-tpl-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Variables: <code>{'{{reference}}'}</code>, <code>{'{{customerName}}'}</code>, <code>{'{{stage}}'}</code>, <code>{'{{slaHours}}'}</code>
          </Typography>
          {(template.channel === 'email' || template.subject) && (
            <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} size="small" placeholder="Email subject…" />
          )}
          <TextField label="Body" multiline rows={6} required value={body} onChange={(e) => setBody(e.target.value)} size="small" slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: '0.85rem' } } }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input type="checkbox" id="active-tpl" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: '#4b2e6f' }} />
            <label htmlFor="active-tpl" style={{ fontSize: '0.875rem', color: '#6b5d80' }}>Active (used for dispatch)</label>
          </Box>
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="edit-tpl-form" disabled={loading}>{loading ? 'Saving…' : 'Save template'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function NewTemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ event: 'wo_received', channel: 'sms', locale: 'en', subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErr(null);
    try { await api.createTemplate({ ...form, subject: form.subject || undefined }); onCreated(); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>New Notification Template</DialogTitle>
      <DialogContent>
        <Stack component="form" id="new-tpl-form" onSubmit={submit} spacing={2} sx={{ pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField select label="Event" value={form.event} onChange={f('event')} size="small">
              {Object.entries(EVENT_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
            <TextField select label="Channel" value={form.channel} onChange={f('channel')} size="small">
              {['sms', 'whatsapp', 'email', 'system'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField select label="Locale" value={form.locale} onChange={f('locale')} size="small">
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="ar">AR</MenuItem>
            </TextField>
          </Box>
          {form.channel === 'email' && (
            <TextField label="Subject" value={form.subject} onChange={f('subject')} size="small" placeholder="Email subject…" />
          )}
          <TextField label="Body" multiline rows={5} required value={form.body} onChange={f('body')} size="small"
            slotProps={{ input: { style: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}
            placeholder="Hello {{customerName}}, your order {{reference}}…"
          />
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit" form="new-tpl-form" disabled={loading}>{loading ? 'Creating…' : 'Create Template'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function TemplatesTab({ onRefresh }: { onRefresh: () => void }) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<{ total: number; done: number | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTemplates(await api.getTemplates()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  function handleExport() {
    exportJson(`notification-templates-${new Date().toISOString().slice(0, 10)}.json`,
      templates.map(({ event, channel, locale, subject, body, active }) => ({ event, channel, locale, subject, body, active })));
  }

  async function handleImportFile(file: File) {
    let rows: { event: string; channel: string; locale?: string; subject?: string; body: string }[];
    try { rows = JSON.parse(await file.text()); if (!Array.isArray(rows)) throw new Error('Expected array'); }
    catch (e) { setImportResult({ total: 0, ok: 0, errors: ['Invalid JSON: ' + (e instanceof Error ? e.message : 'error')] }); return; }
    setImportProgress({ total: rows.length, done: null });
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try { await api.createTemplate({ event: r.event, channel: r.channel, locale: r.locale, subject: r.subject, body: r.body }); }
      catch (e) { errors.push(`Item ${i + 1}: ${e instanceof Error ? e.message : 'Failed'}`); }
      setImportProgress({ total: rows.length, done: i + 1 });
    }
    setImportResult({ total: rows.length, ok: rows.length - errors.length, errors });
    load();
  }

  const byEvent = templates.reduce<Record<string, NotificationTemplate[]>>((acc, t) => { (acc[t.event] ??= []).push(t); return acc; }, {});
  const CH_COLOR: Record<string, 'success' | 'primary' | 'default'> = { sms: 'success', whatsapp: 'success', email: 'primary', system: 'default' };

  return (
    <div className="space-y-4">
      {editing && <EditTemplateModal template={editing} onClose={() => setEditing(null)} onSaved={() => { load(); onRefresh(); }} />}
      {showNew && <NewTemplateModal onClose={() => setShowNew(false)} onCreated={() => { load(); onRefresh(); }} />}
      {importProgress && <ImportProgressModal total={importProgress.total} done={importProgress.done} onClose={() => setImportProgress(null)} />}
      {importResult && <ImportResultToast result={importResult} onDismiss={() => setImportResult(null)} />}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack direction="row" spacing={1}>
          <ExportButton label="Export JSON" onExport={handleExport} disabled={templates.length === 0} />
          <ImportButton label="Import JSON" accept=".json" onFile={handleImportFile} />
        </Stack>
        <Button variant="primary" onClick={() => setShowNew(true)}>+ New Template</Button>
      </Box>
      {loading ? <Spinner /> : Object.entries(byEvent).map(([event, tpls]) => (
        <Card key={event}>
          <CardHeader><CardTitle>{EVENT_LABELS[event] ?? event}</CardTitle></CardHeader>
          <Stack spacing={1}>
            {tpls.map((t) => (
              <Box key={t.id} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, borderRadius: 3, border: '1px solid #ddd6e8', px: 2, py: 1.5 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                    <Chip label={t.channel.toUpperCase()} size="small" color={CH_COLOR[t.channel] ?? 'default'} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{t.locale.toUpperCase()}</Typography>
                    {!t.active && <Chip label="Inactive" size="small" color="error" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />}
                  </Stack>
                  {t.subject && <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Subject: {t.subject}</Typography>}
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.body}</Typography>
                </Box>
                <Button variant="outline" className="text-xs px-3 py-1.5 shrink-0" onClick={() => setEditing(t)}>Edit</Button>
              </Box>
            ))}
          </Stack>
        </Card>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TAB_KEYS = ['zones', 'dfps', 'users', 'templates'] as const;

export default function SettingsPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState(0);
  const [zones, setZones] = useState<Zone[]>([]);
  const [dfps, setDfps] = useState<Dfp[]>([]);
  const [loading, setLoading] = useState(true);

  const loadZones = useCallback(async () => {
    setLoading(true);
    try { const [z, d] = await Promise.all([api.getZones(), api.getAllDfps()]); setZones(z); setDfps(d); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadZones(); }, [loadZones]);

  const tabLabels = [t('settings.zones'), t('settings.dfps'), t('settings.users'), t('settings.templates')];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-foreground/60">{t('settings.subtitle')}</p>
      </div>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid #ddd6e8', '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: '3px 3px 0 0' } }}
      >
        {tabLabels.map((label) => (
          <Tab key={label} label={label} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }} />
        ))}
      </Tabs>

      {loading && activeTab <= 1 ? <Spinner /> : (
        <>
          {activeTab === 0 && <ZonesTab zones={zones} onRefresh={loadZones} />}
          {activeTab === 1 && <DfpsTab dfps={dfps} zones={zones} onRefresh={loadZones} />}
          {activeTab === 2 && <UsersTab zones={zones} onRefresh={loadZones} />}
          {activeTab === 3 && <TemplatesTab onRefresh={loadZones} />}
        </>
      )}
    </div>
  );
}
