import { View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Card,
  ScreenLayout,
  SlaCountdownChip,
  Text,
  WorkOrderTypeChip,
  useTheme,
} from "@dreem-nest/shared-ui";
import { MOCK_DELIVERIES } from "@/mocks/deliveries";

const SLA_LABELS: Record<string, string> = {
  ON_TRACK: "On schedule",
  AT_RISK: "Running late",
  BREACHED: "Delayed",
};

/** "My Deliveries" tracking list placeholder — stage-by-stage view (PDR §7). */
export default function MyDeliveriesScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScreenLayout
      header={{ title: t("customer.myDeliveries"), subtitle: t("customer.myDeliveriesSubtitle") }}
    >
      {MOCK_DELIVERIES.map((delivery) => (
        <Card key={delivery.id} style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <WorkOrderTypeChip type={delivery.type} />
            <SlaCountdownChip state={delivery.slaState} countdownLabel={SLA_LABELS[delivery.slaState]} />
          </View>
          <Text variant="h2">{delivery.merchantName}</Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            {delivery.reference}
          </Text>
          <Text variant="bodyStrong" color={theme.colors.primary}>
            {delivery.stage}
          </Text>
        </Card>
      ))}
    </ScreenLayout>
  );
}
