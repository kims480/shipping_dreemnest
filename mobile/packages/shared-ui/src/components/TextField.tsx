import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/** Branded form input with label + inline error — used by login and sign-off forms. */
export function TextField({ label, error, style, ...rest }: TextFieldProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="caption" color={theme.colors.textSecondary}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={theme.colors.neutral400}
        style={[
          {
            minHeight: 50,
            borderRadius: theme.radii.sm,
            borderWidth: 1.5,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.body.fontSize,
            textAlign: "auto",
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color={theme.colors.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
