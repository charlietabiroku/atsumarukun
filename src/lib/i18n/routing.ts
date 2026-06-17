import { defineRouting } from "next-intl/routing";

export const locales = ["ja", "zh", "en", "ko"] as const;

export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ja",
  localeDetection: true,
});
