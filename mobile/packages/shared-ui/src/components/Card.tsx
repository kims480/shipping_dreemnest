import React, { type PropsWithChildren } from "react";
import { View, type ViewProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export interface CardProps extends PropsWithChildren<ViewProps> {
  /** Removes default internal padding when composing custom layouts. */
  noPadding?: boolean;
}

/** Elevated surface used across operational dashboards and lists ("card- and section-based" — PDR §2). */
export function Card({ children, style, noPadding, ...rest }: CardProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: noPadding ? 0 : theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        theme.shadows.card,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
