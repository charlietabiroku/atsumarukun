import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/branding/language-switcher";
import { ResponseForm } from "@/components/response/response-form";
import { Card } from "@/components/ui/card";
import {
  getEventBySlug,
  getEventResultsBySlug,
  getResponseByIdForEvent,
} from "@/lib/db/queries";

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko"; slug: string }>;
  searchParams: Promise<{
    responseId?: string;
    updated?: string;
    saved?: string;
    view?: string;
  }>;
}) {
  const { locale, slug } = await params;
  const { responseId, updated, saved, view } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("response");
  const event = await getEventBySlug(slug);
  const overallStatus = await getEventResultsBySlug(slug);

  if (!event || !overallStatus) {
    notFound();
  }

  const deadlinePassed = event.responseDeadline
    ? new Date(event.responseDeadline).getTime() < Date.now()
    : false;
  const isSubmissionOpen =
    event.shareEnabled && event.receptionStatus === "open" && !deadlinePassed;
  const submissionNotice = !event.shareEnabled
    ? t("shareDisabledNotice")
    : event.receptionStatus === "paused"
      ? t("pausedNotice")
      : event.receptionStatus === "closed"
        ? t("closedNotice")
        : deadlinePassed
          ? t("deadlinePassedNotice")
          : "";

  const initialResponse = responseId
    ? await getResponseByIdForEvent(event.id, responseId)
    : null;

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher />
        </div>

        <Card className="mx-auto w-full min-w-0 max-w-2xl p-4 sm:p-7">
          <div className="mb-5 space-y-2">
            <p className="text-sm font-semibold text-primary">
              {t("headline")}
            </p>
            <h1 className="break-words text-2xl font-extrabold sm:text-3xl">
              {event.title}
            </h1>
            {event.description ? (
              <p className="text-sm leading-6 text-foreground/65">
                {event.description}
              </p>
            ) : null}
          </div>
          <ResponseForm
            event={event}
            initialResponse={initialResponse}
            overallStatus={overallStatus}
            requestedResponseId={responseId}
            justUpdated={updated === "1"}
            justSaved={saved === "1" || updated === "1"}
            initialView={
              view === "overview" || !isSubmissionOpen ? "overview" : "response"
            }
            isSubmissionOpen={isSubmissionOpen}
            submissionNotice={submissionNotice}
          />
        </Card>
      </div>
    </main>
  );
}
