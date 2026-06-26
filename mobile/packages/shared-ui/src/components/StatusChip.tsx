import React from "react";
import type { SlaState, WorkOrderType } from "@dreem-nest/shared-types";
import { useTheme } from "../theme/ThemeProvider";
import { Badge } from "./Badge";

export interface SlaCountdownChipProps {
  state: SlaState;
  /** Pre-formatted remaining time, e.g. "1h 24m left" or "Overdue by 12m". */
  countdownLabel: string;
}

/** Color-coded SLA countdown chip — on-track / at-risk / breached (PDR §8). */
export function SlaCountdownChip({ state, countdownLabel }: SlaCountdownChipProps): React.JSX.Element {
  const theme = useTheme();
  const { fg, bg } = theme.slaColors[state];
  return <Badge label={countdownLabel} foregroundColor={fg} backgroundColor={bg} />;
}

export interface WorkOrderTypeChipProps {
  type: WorkOrderType;
}

/** New vs. Return WO type badge (PDR §5.3). */
export function WorkOrderTypeChip({ type }: WorkOrderTypeChipProps): React.JSX.Element {
  const theme = useTheme();
  const { fg, bg, label } = theme.woTypeColors[type];
  return <Badge label={label} foregroundColor={fg} backgroundColor={bg} />;
}
