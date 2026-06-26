import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge, Card, ScreenLayout, Text, useTheme } from "@dreem-nest/shared-ui";
import { MOCK_ADDRESSES } from "@/mocks/deliveries";

/** Profile / address-book placeholder — registered recipients manage saved addresses & prefs (PDR §7). */
export default function ProfileScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScreenLayout header={{ title: t("customer.profile"), subtitle: t("customer.profileSubtitle") }}>
      <Text variant="h2">Address book</Text>
      {MOCK_ADDRESSES.map((address) => (
        <Card key={address.id} style={{ gap: theme.spacing.xs }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text variant="bodyStrong">{address.label}</Text>
            {address.isDefault ? (
              <Badge
                label={t("customer.defaultAddress")}
                foregroundColor={theme.colors.textOnAccent}
                backgroundColor={theme.colors.accent}
              />
            ) : null}
          </View>
          <Text variant="body" color={theme.colors.textSecondary}>
            {address.street}, {address.district}
          </Text>
          <Text variant="caption" color={theme.colors.textSecondary}>
            {address.city} · {address.zone.replaceAll("_", " ")}
          </Text>
        </Card>
      ))}

      <Card style={{ gap: theme.spacing.xs }}>
        <Text variant="bodyStrong">Preferred delivery time window</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Stubbed — once wired up, recipients set & persist a preferred window here,
          which the assignment engine factors into final-mile scheduling (PDR §7).
        </Text>
      </Card>
    </ScreenLayout>
  );
}
