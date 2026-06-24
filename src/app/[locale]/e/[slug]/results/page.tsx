import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/branding/language-switcher";
import { CandidateDateText } from "@/components/date/candidate-date-text";
import { AddToCalendarButtons } from "@/components/results/add-to-calendar-buttons";
import { BestDateCard } from "@/components/results/best-date-card";
import { ResponseTable } from "@/components/results/response-table";
import { Card } from "@/components/ui/card";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { getEventResultsBySlug } from "@/lib/db/queries";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("results");
  const payload = await getEventResultsBySlug(slug);
  const adminViewer = await isAdminAuthenticated();

  if (!payload) {
    notFound();
  }

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-4">
          <Card className="p-5 sm:p-7">
            <p className="text-sm font-semibold text-primary">{t("headline")}</p>
            <h1 className="mt-2 text-3xl font-extrabold">{payload.event.title}</h1>
            {payload.event.description ? (
              <p className="mt-2 text-sm leading-6 text-foreground/65">
                {payload.event.description}
              </p>
            ) : null}
          </Card>

          <BestDateCard
            bestCandidates={payload.bestCandidates}
            locale={locale}
            totalResponses={payload.totalResponses}
            responseRate={payload.responseRate}
          />

          {payload.bestCandidates.length > 0 ? (
            <Card className="p-5">
              <p className="mb-4 text-sm font-semibold text-foreground/60">
                {t("addToCalendar")}
              </p>
              <div className="space-y-5">
                {payload.bestCandidates.map((candidate) => (
                  <div key={candidate.eventDateId} className="space-y-4">
                    <p className="text-base font-semibold">
                      <CandidateDateText value={candidate.candidateDate} locale={locale} />
                    </p>
                    <AddToCalendarButtons
                      title={payload.event.title}
                      description={payload.event.description}
                      start={candidate.candidateDate}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <ResponseTable
            eventId={payload.event.id}
            slug={payload.event.slug}
            locale={locale}
            responses={payload.responses}
            results={payload.results}
            bestCandidateId={payload.bestCandidate?.eventDateId}
            isAdminViewer={adminViewer}
          />
        </div>
      </div>
    </main>
  );
}
