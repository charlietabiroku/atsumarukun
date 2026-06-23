"use client";

import { useTranslations } from "next-intl";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { ResultsList } from "@/components/results/results-list";
import { Card } from "@/components/ui/card";
import { AppLocale } from "@/lib/i18n/routing";
import { EventResultsPayload } from "@/types/response";

export function OverallStatusPanel({
  locale,
  payload,
}: {
  locale: AppLocale;
  payload: EventResultsPayload;
}) {
  const t = useTranslations("response");
  const resultsT = useTranslations("results");
  const bestCandidate = payload.bestCandidates[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-extrabold">{t("overallStatus")}</h2>
        <p className="text-sm text-foreground/60">
          {resultsT("responseRate")} {payload.responseRate.answered} / {payload.responseRate.total}
          {resultsT("peopleSuffix")} ({payload.responseRate.percentage}%)
        </p>
      </div>

      {bestCandidate ? (
        <Card className="rounded-[24px] border border-[#34C759] bg-[#ECFDF3] p-4">
          <p className="text-sm font-semibold text-primary">{resultsT("bestCandidate")}</p>
          <p className="mt-2 text-lg font-extrabold text-foreground">
            <CandidateDateText value={bestCandidate.candidateDate} locale={locale} />
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-white px-3 py-1 text-primary">
              {resultsT("available")} {bestCandidate.availableCount}
              {resultsT("peopleSuffix")}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[#c48800]">
              {resultsT("maybe")} {bestCandidate.maybeCount}
              {resultsT("peopleSuffix")}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-danger">
              {resultsT("unavailable")} {bestCandidate.unavailableCount}
              {resultsT("peopleSuffix")}
            </span>
          </div>
        </Card>
      ) : null}

      <ResultsList
        results={payload.results}
        locale={locale}
        bestCandidateId={bestCandidate?.eventDateId}
      />
    </div>
  );
}
