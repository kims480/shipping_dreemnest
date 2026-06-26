import { FlatList, Pressable, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Card,
  ScreenLayout,
  SlaCountdownChip,
  Text,
  WorkOrderTypeChip,
  useTheme,
} from "@dreem-nest/shared-ui";
import { MOCK_JOBS } from "@/mocks/jobs";

const SLA_LABELS: Record<string, string> = {
  ON_TRACK: "2h 10m left",
  AT_RISK: "32m left",
  BREACHED: "Overdue 18m",
};

/** "My Jobs" placeholder list — pickup/delivery legs assigned to the signed-in driver. */
export default function MyJobsScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScreenLayout
      header={{ title: t("driver.myJobs"), subtitle: t("driver.myJobsSubtitle") }}
      scrollable={false}
    >
      <FlatList
        data={MOCK_JOBS}
        keyExtractor={(job) => job.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}
        ListEmptyComponent={
          <Text variant="body" color={theme.colors.textSecondary}>
            {t("driver.noJobs")}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/jobs/${item.id}`)}>
            <Card style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <WorkOrderTypeChip type={item.type} />
                <SlaCountdownChip state={item.slaState} countdownLabel={SLA_LABELS[item.slaState]} />
              </View>
              <Text variant="h2">{item.reference}</Text>
              <Text variant="body" color={theme.colors.textSecondary}>
                {item.merchantName}
              </Text>
              <Text variant="caption" color={theme.colors.primary}>
                {item.currentStage.replaceAll("_", " ")}
              </Text>
            </Card>
          </Pressable>
        )}
      />
    </ScreenLayout>
  );
}
