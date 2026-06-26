import { Pressable, View } from "react-native";
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
import { MOCK_PERFORMANCE, MOCK_QUEUE } from "@/mocks/queue";

/**
 * DFP "Zone Dashboard" — the central operational surface (PDR §8): a single
 * view of the zone's WO queue with New/Return badges, color-coded SLA
 * countdowns, current e-flow stage, and a performance summary strip.
 *
 * This is intentionally the most fleshed-out placeholder in the scaffold,
 * since the PDR singles it out as a defining DFP surface.
 */
export default function DfpDashboardScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  const breachedCount = MOCK_QUEUE.filter((wo) => wo.slaState === "BREACHED").length;
  const atRiskCount = MOCK_QUEUE.filter((wo) => wo.slaState === "AT_RISK").length;

  return (
    <ScreenLayout
      header={{
        title: t("dfp.dashboard"),
        subtitle: t("dfp.dashboardSubtitle"),
        trailing: (
          <View
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radii.pill,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.xs,
            }}
          >
            <Text variant="bodyStrong" color={theme.colors.textOnAccent}>
              North Riyadh
            </Text>
          </View>
        ),
      }}
    >
      {/* Performance summary strip */}
      <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
        <Card style={{ flex: 1, gap: 2 }}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            On-time rate
          </Text>
          <Text variant="h1" color={theme.colors.primary}>
            {Math.round(MOCK_PERFORMANCE.onTimeRate * 100)}%
          </Text>
        </Card>
        <Card style={{ flex: 1, gap: 2 }}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Volume today
          </Text>
          <Text variant="h1" color={theme.colors.primary}>
            {MOCK_PERFORMANCE.volumeToday}
          </Text>
        </Card>
        <Card style={{ flex: 1, gap: 2 }}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Satisfaction
          </Text>
          <Text variant="h1" color={theme.colors.success}>
            {MOCK_PERFORMANCE.satisfactionTrend}
          </Text>
        </Card>
      </View>

      {/* At-a-glance urgency banner */}
      {(breachedCount > 0 || atRiskCount > 0) && (
        <Card
          style={{
            backgroundColor: theme.colors.dangerTint,
            borderColor: theme.colors.danger,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <Text variant="bodyStrong" color={theme.colors.danger}>
            {breachedCount} breached · {atRiskCount} at risk
          </Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            — prioritize these before assigning new pickups
          </Text>
        </Card>
      )}

      {/* WO queue */}
      <Text variant="h2">Work order queue</Text>
      <View style={{ gap: theme.spacing.md }}>
        {MOCK_QUEUE.map((wo) => (
          <Pressable key={wo.id} onPress={() => router.push(`/sign-off/${wo.id}`)}>
            <Card style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                  <WorkOrderTypeChip type={wo.type} />
                  <SlaCountdownChip state={wo.slaState} countdownLabel={wo.countdownLabel} />
                </View>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  {wo.reference}
                </Text>
              </View>
              <Text variant="bodyStrong">{wo.recipientName}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="caption" color={theme.colors.textSecondary}>
                  {wo.district}
                </Text>
                <Text variant="caption" color={theme.colors.primary}>
                  {wo.stage}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenLayout>
  );
}
