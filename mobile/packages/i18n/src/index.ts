import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import type { SupportedLocale } from "@dreem-nest/shared-types";
import en from "./locales/en";
import ar from "./locales/ar";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "ar"];
export const RTL_LOCALES: SupportedLocale[] = ["ar"];

export function isRtlLocale(locale: string): boolean {
  return (RTL_LOCALES as string[]).includes(locale);
}

/** Resolve the device's preferred locale to one of our supported locales (default: English). */
export function resolveDeviceLocale(): SupportedLocale {
  const deviceTags = Localization.getLocales().map((l) => l.languageCode);
  const match = deviceTags.find((tag): tag is SupportedLocale =>
    (SUPPORTED_LOCALES as string[]).includes(tag ?? "")
  );
  return match ?? "en";
}

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: resolveDeviceLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
export { en, ar };
export * from "./useRtl";
