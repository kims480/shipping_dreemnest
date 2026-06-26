import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export interface BadgeProps {
  label: string;
  /** Foreground (text) color — paired with `backgroundColor` for AA contrast. */
  foregroundColor: string;
  backgroundColor: string;
}

/** Generic pill-shaped label. Prefer `StatusChip` for SLA/WO-type semantics — this is the raw primitive. */
export function Badge({ label, foregroundColor, backgroundColor }: BadgeProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.radii.pill,
        backgroundColor,
      }}
    >
      <Text variant="micro" color={foregroundColor} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}
