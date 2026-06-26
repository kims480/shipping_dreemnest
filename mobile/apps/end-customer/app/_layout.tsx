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
        <Stack.Screen name="index" options={{ title: "Dreem Nest" }} />
        <Stack.Screen name="deliveries" options={{ title: "My Deliveries" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
      </Stack>
    </ThemeProvider>
  );
}
