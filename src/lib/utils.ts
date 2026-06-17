import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { AppLocale } from "@/lib/i18n/routing";

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
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
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
