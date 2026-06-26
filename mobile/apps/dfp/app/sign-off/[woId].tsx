import { useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Card, ScreenLayout, Text, TextField, useTheme } from "@dreem-nest/shared-ui";
import { MOCK_QUEUE } from "@/mocks/queue";

type Satisfaction = "SATISFIED" | "NOT_SATISFIED";

/**
 * Delivery sign-off placeholder (PDR §8): captures the recipient's
 * confirmation, a short satisfaction questionnaire, and optional remarks.
 * Submitting this is what closes the WO and triggers the recipient's
 * delivery-confirmation + rating-prompt notifications.
 */
export default function SignOffScreen(): React.JSX.Element {
  const { woId } = useLocalSearchParams<{ woId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();

  const wo = MOCK_QUEUE.find((item) => item.id === woId) ?? MOCK_QUEUE[0];
  const [signedByName, setSignedByName] = useState(wo.recipientName);
  const [satisfaction, setSatisfaction] = useState<Satisfaction>("SATISFIED");
  const [remarks, setRemarks] = useState("");

  function handleSubmit(): void {
    // TODO: call dfpOpsApi.submitSignOff(wo.id, { signedByName, satisfaction, remarks }, auth)
    // — closing the WO server-side triggers the recipient's confirmation + rating prompt.
  }

  const options: { value: Satisfaction; label: string }[] = [
    { value: "SATISFIED", label: t("dfp.satisfied") },
    { value: "NOT_SATISFIED", label: t("dfp.notSatisfied") },
  ];

  return (
    <ScreenLayout header={{ title: t("dfp.signOff"), subtitle: `${wo.reference} · ${wo.recipientName}` }}>
      <Card style={{ gap: theme.spacing.md }}>
        <TextField label={t("dfp.customerName")} value={signedByName} onChangeText={setSignedByName} />

        <Text variant="caption" color={theme.colors.textSecondary}>
          Satisfaction questionnaire
        </Text>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          {options.map((opt) => {
            const selected = satisfaction === opt.value;
            return (
              <Pressable key={opt.value} onPress={() => setSatisfaction(opt.value)} style={{ flex: 1 }}>
                <View
                  style={{
                    borderRadius: theme.radii.sm,
                    borderWidth: 1.5,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
                    paddingVertical: theme.spacing.md,
                    alignItems: "center",
                  }}
                >
                  <Text variant="bodyStrong" color={selected ? theme.colors.primary : theme.colors.textSecondary}>
                    {opt.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label={t("dfp.remarks")}
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: "top", paddingTop: theme.spacing.sm }}
        />
      </Card>

      <Card style={{ gap: theme.spacing.xs, alignItems: "center" }}>
        <Text variant="caption" color={theme.colors.textSecondary}>
          Recipient signature capture
        </Text>
        <View
          style={{
            width: "100%",
            height: 120,
            borderRadius: theme.radii.sm,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="caption" color={theme.colors.textSecondary}>
            Stubbed — signature pad to be added (e.g., react-native-signature-canvas)
          </Text>
        </View>
      </Card>

      <Button label={t("dfp.closeWorkOrder")} onPress={handleSubmit} />
    </ScreenLayout>
  );
}
