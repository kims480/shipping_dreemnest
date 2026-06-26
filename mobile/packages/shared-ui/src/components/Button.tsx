import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

/**
 * Branded CTA button. `primary` (deep purple) is the default chrome/CTA
 * treatment; `accent` (lime) is reserved for secondary highlight actions
 * per the PDR §2 accessibility note (dark text on lime for AA contrast).
 */
export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled,
  onPress,
  ...rest
}: ButtonProps): React.JSX.Element {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles: Record<ButtonVariant, { bg: string; fg: string; borderColor?: string }> = {
    primary: { bg: theme.colors.primary, fg: theme.colors.textOnPrimary },
    accent: { bg: theme.colors.accent, fg: theme.colors.textOnAccent },
    outline: { bg: "transparent", fg: theme.colors.primary, borderColor: theme.colors.primary },
    ghost: { bg: "transparent", fg: theme.colors.primary },
  };
  const v = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.borderColor ?? "transparent",
          borderWidth: v.borderColor ? 1.5 : 0,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text variant="bodyStrong" color={v.fg}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
