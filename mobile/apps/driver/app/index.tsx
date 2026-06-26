import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Card, ScreenLayout, Text, TextField, useTheme } from "@dreem-nest/shared-ui";

/** Driver login placeholder — identifier + password, navigates to the jobs list on submit. */
export default function DriverLoginScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(): void {
    // TODO: call authApi.login({ identifier, password }) from @dreem-nest/api-client
    // and persist the resulting AuthSession via the (not-yet-built) session layer.
    router.replace("/jobs");
  }

  return (
    <ScreenLayout
      header={{ title: t("driver.loginTitle"), subtitle: t("driver.loginSubtitle") }}
    >
      <Card style={{ gap: theme.spacing.md }}>
        <TextField
          label={t("common.identifier")}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          placeholder="05xxxxxxxx"
        />
        <TextField
          label={t("common.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button label={t("common.login")} onPress={handleLogin} />
      </Card>
      <View style={{ alignItems: "center", marginTop: theme.spacing.md }}>
        <Text variant="caption" color={theme.colors.textSecondary}>
          {t("common.appName")} · Driver
        </Text>
      </View>
    </ScreenLayout>
  );
}
