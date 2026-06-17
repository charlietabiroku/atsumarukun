import { format } from "date-fns";

export function buildGoogleCalendarUrl(params: {
  title: string;
  description?: string | null;
  start: string;
}) {
  const startDate = new Date(params.start);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const dates = `${format(startDate, "yyyyMMdd'T'HHmmss'Z'")}/${format(
    endDate,
    "yyyyMMdd'T'HHmmss'Z'",
  )}`;

  const search = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    details: params.description || "",
    dates,
  });

  return `https://calendar.google.com/calendar/render?${search.toString()}`;
}

export function buildOutlookCalendarUrl(params: {
  title: string;
  description?: string | null;
  start: string;
}) {
  const startDate = new Date(params.start);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const search = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: params.title,
    body: params.description || "",
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${search.toString()}`;
}

export function buildIcsContent(params: {
  title: string;
  description?: string | null;
  start: string;
}) {
  const startDate = new Date(params.start);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss'Z'")}`,
    `DTEND:${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
}
