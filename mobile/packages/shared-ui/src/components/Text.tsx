import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { typography } from "../theme/tokens";

export type TextVariant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
}

/** Branded text primitive applying the Hero UI typographic scale (PDR §2). */
export function Text({ variant = "body", color, style, ...rest }: TextProps): React.JSX.Element {
  const theme = useTheme();
  const variantStyle = theme.typography[variant];
  return (
    <RNText
      style={[{ color: color ?? theme.colors.textPrimary }, variantStyle, style]}
      {...rest}
    />
  );
}
