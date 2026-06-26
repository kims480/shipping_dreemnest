import React, { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional trailing element (e.g., an avatar, action button, or status pill). */
  trailing?: React.ReactNode;
}

/**
 * Bold "Hero UI" header — confident type hierarchy, generous spacing,
 * deep-purple chrome (PDR §2). Used at the top of every primary screen.
 */
export function ScreenHeader({ title, subtitle, trailing }: ScreenHeaderProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.lg },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text variant="display" color={theme.colors.textOnPrimary}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" color={theme.colors.purple100} style={{ marginTop: 4 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}

export interface ScreenLayoutProps extends PropsWithChildren {
  header?: ScreenHeaderProps;
  scrollable?: boolean;
}

/** Standard screen scaffold: safe-area + branded header + scrollable content area. */
export function ScreenLayout({ header, scrollable = true, children }: ScreenLayoutProps): React.JSX.Element {
  const theme = useTheme();
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["bottom"]}>
      {header ? <ScreenHeader {...header} /> : null}
      <Container
        style={{ flex: 1 }}
        contentContainerStyle={
          scrollable ? { padding: theme.spacing.lg, gap: theme.spacing.md } : undefined
        }
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 64,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
});
