import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  ScreenLayout,
  SlaCountdownChip,
  Text,
  WorkOrderTypeChip,
  useTheme,
} from "@dreem-nest/shared-ui";
import { MOCK_JOBS } from "@/mocks/jobs";

/** Job detail placeholder — full context for a single pickup/delivery leg. */
export default function JobDetailScreen(): React.JSX.Element {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();

  const job = MOCK_JOBS.find((j) => j.id === jobId) ?? MOCK_JOBS[0];

  return (
    <ScreenLayout header={{ title: job.reference, subtitle: t("driver.jobDetail") }}>
      <Card style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <WorkOrderTypeChip type={job.type} />
          <SlaCountdownChip state={job.slaState} countdownLabel="32m left" />
        </View>
        <Text variant="h2">{job.merchantName}</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Stage: {job.currentStage.replaceAll("_", " ")}
        </Text>
      </Card>

      <Card style={{ gap: theme.spacing.xs }}>
        <Text variant="bodyStrong">Recipient & address</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Stubbed — once wired to `driverOpsApi.jobDetail()`, this card will show the
          recipient name, phone, delivery address, and preferred time window.
        </Text>
      </Card>

      <View style={{ gap: theme.spacing.sm }}>
        <Button label="Capture proof of action" variant="primary" onPress={() => {}} />
        <Button label="Mark stage complete" variant="outline" onPress={() => {}} />
      </View>
    </ScreenLayout>
  );
}
