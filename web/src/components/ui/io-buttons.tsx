'use client';

import { useRef, useState } from "react";
import MuiButton from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import SvgIcon from '@mui/material/SvgIcon';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

// ─── Import result ─────────────────────────────────────────────────────────────

export interface ImportResult {
  total: number;
  ok: number;
  errors: string[];
}

export function ImportResultToast({ result, onDismiss }: { result: ImportResult; onDismiss: () => void }) {
  const success = result.errors.length === 0;
  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      onClose={onDismiss}
      autoHideDuration={success ? 4000 : null}
    >
      <Alert
        severity={success ? 'success' : 'warning'}
        onClose={onDismiss}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Import complete: {result.ok}/{result.total} succeeded
        </Typography>
        {result.errors.slice(0, 3).map((e, i) => (
          <Typography key={i} variant="caption" sx={{ display: 'block', color: 'error.main' }}>{e}</Typography>
        ))}
        {result.errors.length > 3 && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>+{result.errors.length - 3} more errors</Typography>
        )}
      </Alert>
    </Snackbar>
  );
}

// ─── Export button ─────────────────────────────────────────────────────────────

interface ExportButtonProps {
  label?: string;
  onExport: () => void;
  disabled?: boolean;
}

export function ExportButton({ label = 'Export CSV', onExport, disabled }: ExportButtonProps) {
  return (
    <MuiButton
      variant="outlined"
      size="small"
      startIcon={<FileDownloadIcon />}
      onClick={onExport}
      disabled={disabled}
      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
    >
      {label}
    </MuiButton>
  );
}

// ─── Import button ─────────────────────────────────────────────────────────────

interface ImportButtonProps {
  label?: string;
  accept?: string;
  onFile: (file: File) => void | Promise<void>;
  loading?: boolean;
}

export function ImportButton({ label = 'Import CSV', accept = '.csv', onFile, loading }: ImportButtonProps) {
  const ref = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await onFile(file);
    if (ref.current) ref.current.value = '';
  }

  return (
    <>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={handleChange} />
      <MuiButton
        variant="outlined"
        size="small"
        startIcon={<FileUploadIcon />}
        onClick={() => ref.current?.click()}
        disabled={loading}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
      >
        {loading ? 'Importing…' : label}
      </MuiButton>
    </>
  );
}

// ─── Template download button ──────────────────────────────────────────────────

export function TemplateButton({ label, filename, headers }: { label: string; filename: string; headers: string[] }) {
  function download() {
    const csv = headers.join(',') + '\r\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MuiButton
      variant="text"
      size="small"
      onClick={download}
      sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', color: 'primary.main' }}
    >
      {label}
    </MuiButton>
  );
}

// ─── Import progress dialog ────────────────────────────────────────────────────

export function ImportProgressModal({
  total,
  done,
  onClose,
}: {
  total: number;
  done: number | null;
  onClose: () => void;
}) {
  const pct = total > 0 && done !== null ? Math.round((done / total) * 100) : 0;
  const complete = done !== null && done === total;

  return (
    <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Importing…</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {done !== null ? `${done} / ${total} rows processed` : `Preparing ${total} rows…`}
        </Typography>
        <LinearProgress
          variant={done !== null ? 'determinate' : 'indeterminate'}
          value={pct}
          sx={{ borderRadius: 4, height: 8, bgcolor: '#ece7f4', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
        />
      </DialogContent>
      {complete && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton variant="contained" onClick={onClose} fullWidth sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}>
            Done
          </MuiButton>
        </DialogActions>
      )}
    </Dialog>
  );
}
