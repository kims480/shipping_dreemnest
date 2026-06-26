import "@dreem-nest/i18n";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, theme } from "@dreem-nest/shared-ui";
import { useSyncRtlWithLocale } from "@dreem-nest/i18n";

export default function RootLayout(): React.JSX.Element {
  useSyncRtlWithLocale();

  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.textOnPrimary,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Dreem Nest DFP" }} />
        <Stack.Screen name="dashboard" options={{ title: "Zone Dashboard" }} />
        <Stack.Screen name="sign-off/[woId]" options={{ title: "Sign-off" }} />
      </Stack>
    </ThemeProvider>
  );
}
