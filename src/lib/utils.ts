import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { AppLocale } from "@/lib/i18n/routing";

const weekdayLabels: Record<AppLocale, string[]> = {
  ja: ["（日）", "（月）", "（火）", "（水）", "（木）", "（金）", "（土）"],
  zh: ["（日）", "（一）", "（二）", "（三）", "（四）", "（五）", "（六）"],
  en: ["(Sun)", "(Mon)", "(Tue)", "(Wed)", "(Thu)", "(Fri)", "(Sat)"],
  ko: ["(일)", "(월)", "(화)", "(수)", "(목)", "(금)", "(토)"],
};

export type WeekdayTone = "weekday" | "saturday" | "sunday";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildEventUrl(locale: AppLocale, slug: string) {
  return `/${locale}/e/${slug}`;
}

export function buildAbsoluteUrl(path: string) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

  return `${appUrl}${path}`;
}

export function formatCandidateDate(value: string, locale: AppLocale) {
  const parts = getCandidateDateParts(value, locale);
  return `${parts.dateText}${parts.weekdayText}${parts.timeText}`;
}

export function getCandidateDateParts(value: string, locale: AppLocale) {
  const date = new Date(value);
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  const hours = `${date.getUTCHours()}`.padStart(2, "0");
  const minutes = `${date.getUTCMinutes()}`.padStart(2, "0");
  const weekdayIndex = date.getUTCDay();

  return {
    dateText: `${month}/${day}`,
    weekdayText: weekdayLabels[locale][weekdayIndex],
    timeText: `${hours}:${minutes}`,
    weekdayIndex,
  };
}

export function getWeekdayTone(value: string): WeekdayTone {
  const weekdayIndex = new Date(value).getUTCDay();

  if (weekdayIndex === 6) {
    return "saturday";
  }

  if (weekdayIndex === 0) {
    return "sunday";
  }

  return "weekday";
}

export function getWeekdayColorClass(value: string) {
  const tone = getWeekdayTone(value);

  if (tone === "saturday") {
    return "text-[#0EA5E9]";
  }

  if (tone === "sunday") {
    return "text-[#EF4444]";
  }

  return "text-foreground/72";
}

export function getWeekdayAccentClass(value: string) {
  const tone = getWeekdayTone(value);

  if (tone === "saturday") {
    return "border-l-4 border-l-[#0EA5E9] bg-[#f0f9ff]";
  }

  if (tone === "sunday") {
    return "border-l-4 border-l-[#EF4444] bg-[#fef2f2]";
  }

  return "";
}

export function toDateTimeLocalInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  const hours = `${date.getUTCHours()}`.padStart(2, "0");
  const minutes = `${date.getUTCMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toCandidateDateIso(value: string) {
  return new Date(`${value}:00.000Z`).toISOString();
}
