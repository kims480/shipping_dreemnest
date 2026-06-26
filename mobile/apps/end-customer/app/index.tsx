import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Card, ScreenLayout, Text, TextField, useTheme } from "@dreem-nest/shared-ui";

/** Login / guest entry placeholder — recipients can register or continue as a guest (PDR §7). */
export default function CustomerEntryScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(): void {
    // TODO: call authApi.login(...) — registered recipients get saved addresses,
    // preferences, and full delivery history (PDR §7).
    router.replace("/deliveries");
  }

  function handleGuest(): void {
    // TODO: guest flow — one-off tracking via a tokenized confirmation link (PDR §7).
    router.replace("/deliveries");
  }

  return (
    <ScreenLayout header={{ title: t("customer.loginTitle"), subtitle: t("customer.loginSubtitle") }}>
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
        <Button label={t("common.continueAsGuest")} variant="outline" onPress={handleGuest} />
      </Card>
      <View style={{ alignItems: "center", marginTop: theme.spacing.md }}>
        <Text variant="caption" color={theme.colors.textSecondary}>
          {t("common.appName")}
        </Text>
      </View>
    </ScreenLayout>
  );
}
