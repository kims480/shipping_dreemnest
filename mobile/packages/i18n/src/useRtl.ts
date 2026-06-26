import { useEffect } from "react";
import { I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import { isRtlLocale } from "./index";

/**
 * Applies RTL layout direction (`I18nManager.forceRTL`) to match the active
 * locale, per TECH_ARCHITECTURE §8 ("full Arabic-RTL mirroring").
 *
 * IMPORTANT: `I18nManager.forceRTL` only takes full effect after a reload —
 * on a real device/simulator, call this once at startup and prompt/trigger
 * an app reload (e.g., via `Updates.reloadAsync()` in production, or simply
 * restarting the dev client) when the RTL flag actually changes.
 */
export function useSyncRtlWithLocale(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    const shouldBeRtl = isRtlLocale(i18n.language);
    if (I18nManager.isRTL !== shouldBeRtl) {
      I18nManager.allowRTL(shouldBeRtl);
      I18nManager.forceRTL(shouldBeRtl);
      // NOTE: a reload is required for `forceRTL` to take visual effect.
      // e.g.: import * as Updates from "expo-updates"; void Updates.reloadAsync();
    }
  }, [i18n.language]);
}
