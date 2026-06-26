import Chip from '@mui/material/Chip';
import { HTMLAttributes } from "react";

export type WorkOrderTypeBadge = "new" | "return";

interface WorkOrderBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type: WorkOrderTypeBadge;
}

export function WorkOrderBadge({ type }: WorkOrderBadgeProps) {
  return (
    <Chip
      label={type === 'new' ? 'New' : 'Return'}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: '0.06em',
        height: 20,
        bgcolor: type === 'new' ? 'rgba(181,211,53,0.18)' : 'rgba(75,46,111,0.10)',
        color: type === 'new' ? '#341f4d' : '#4b2e6f',
        border: type === 'new' ? '1px solid rgba(147,171,33,0.4)' : '1px solid rgba(75,46,111,0.3)',
      }}
    />
  );
}

export type SlaState = "on_track" | "at_risk" | "breached";

const SLA_STYLES: Record<SlaState, { bg: string; color: string; border: string }> = {
  on_track: { bg: 'rgba(47,158,100,0.12)', color: '#2f9e64', border: '1px solid rgba(47,158,100,0.3)' },
  at_risk:  { bg: 'rgba(224,167,33,0.12)', color: '#c47d05', border: '1px solid rgba(224,167,33,0.3)' },
  breached: { bg: 'rgba(216,69,58,0.12)',  color: '#d8453a', border: '1px solid rgba(216,69,58,0.3)' },
};

interface SlaBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  state: SlaState;
  remainingLabel?: string;
}

const SLA_LABELS: Record<SlaState, string> = {
  on_track: 'On track',
  at_risk: 'At risk',
  breached: 'Breached',
};

export function SlaBadge({ state, remainingLabel }: SlaBadgeProps) {
  const s = SLA_STYLES[state];
  return (
    <Chip
      label={remainingLabel ?? SLA_LABELS[state]}
      size="small"
      icon={<span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.color, marginLeft: 8 }} />}
      sx={{
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 22,
        bgcolor: s.bg,
        color: s.color,
        border: s.border,
        '& .MuiChip-icon': { marginLeft: '6px', marginRight: '-4px' },
      }}
    />
  );
}
