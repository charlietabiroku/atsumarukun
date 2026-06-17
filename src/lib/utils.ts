import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
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
  }).format(new Date(value));
}

export function toDateTimeLocalInput(value?: string) {
  if (!value) return "";

  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}
