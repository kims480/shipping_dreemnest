import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Card, ScreenLayout, Text, TextField, useTheme } from "@dreem-nest/shared-ui";

/** DFP login placeholder — navigates to the zone dashboard on submit. */
export default function DfpLoginScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(): void {
    // TODO: call authApi.login(...) and persist AuthSession; also kick off the
    // location-ping background task once the offline-queue infra lands (TECH_ARCHITECTURE §8).
    router.replace("/dashboard");
  }

  return (
    <ScreenLayout header={{ title: t("dfp.loginTitle"), subtitle: t("dfp.loginSubtitle") }}>
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
          {t("common.appName")} · DFP
        </Text>
      </View>
    </ScreenLayout>
  );
}
