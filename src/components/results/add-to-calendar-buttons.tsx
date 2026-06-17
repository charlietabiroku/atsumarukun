"use client";

import { Calendar, Download } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildOutlookCalendarUrl,
} from "@/lib/utils/calendar";

export function AddToCalendarButtons({
  title,
  description,
  start,
}: {
  title: string;
  description?: string | null;
  start: string;
}) {
  const t = useTranslations("results");

  function downloadIcs() {
    const content = buildIcsContent({ title, description, start });
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "atsumarukun.ics";
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          window.open(
            buildGoogleCalendarUrl({ title, description, start }),
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        <Calendar className="mr-2 size-4" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          window.open(
            buildOutlookCalendarUrl({ title, description, start }),
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        <Calendar className="mr-2 size-4" />
        Outlook
      </Button>
      <Button type="button" variant="outline" onClick={downloadIcs}>
        <Download className="mr-2 size-4" />
        {t("appleCalendar")}
      </Button>
    </div>
  );
}
