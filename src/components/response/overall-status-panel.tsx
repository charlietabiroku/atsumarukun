"use client";

import { useTranslations } from "next-intl";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { ResultsList } from "@/components/results/results-list";
import { Card } from "@/components/ui/card";
import { AppLocale } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils";
import { EventResultsPayload } from "@/types/response";

const responseSymbol = {
  available: "○",
  maybe: "△",
  unavailable: "×",
} as const;

const responseSymbolClass = {
  available: "text-[#16A34A]",
  maybe: "text-[#c48800]",
  unavailable: "text-danger",
} as const;

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

      {payload.responses.length > 0 ? (
        <Card className="rounded-[24px] border border-border bg-white p-4">
          <div className="mb-3 space-y-1">
            <h3 className="text-base font-extrabold">{resultsT("responseTable")}</h3>
            <p className="text-sm text-foreground/60">{resultsT("responseTableHint")}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-fit table-fixed border-separate border-spacing-0 text-xs sm:text-sm">
              <colgroup>
                <col className="w-[136px] sm:w-[156px]" />
                {payload.responses.map((response) => (
                  <col key={response.id} className="w-[54px] sm:w-[62px]" />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left font-semibold sm:px-2.5">
                    {resultsT("date")}
                  </th>
                  {payload.responses.map((response) => (
                    <th
                      key={response.id}
                      className="bg-white px-1 py-2 text-center font-semibold sm:px-1.5"
                    >
                      <span className="inline-block max-w-[52px] truncate align-middle text-primary sm:max-w-[60px]">
                        {response.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payload.results.map((result) => {
                  const isBest = bestCandidate?.eventDateId === result.eventDateId;

                  return (
                    <tr key={result.eventDateId}>
                      <td
                        className={cn(
                          "sticky left-0 whitespace-nowrap px-2 py-2 font-semibold sm:px-2.5",
                          isBest ? "bg-[#ECFDF3]" : "bg-white",
                        )}
                      >
                        <CandidateDateText value={result.candidateDate} locale={locale} />
                      </td>
                      {payload.responses.map((response) => {
                        const item = response.items.find(
                          (entry) => entry.eventDateId === result.eventDateId,
                        );

                        return (
                          <td
                            key={`${result.eventDateId}-${response.id}`}
                            className={cn(
                              "px-1 py-2 text-center text-sm font-bold sm:px-1.5 sm:text-base",
                              isBest ? "bg-[#ECFDF3]" : "",
                              item ? responseSymbolClass[item.status] : "text-foreground/30",
                            )}
                          >
                            {item ? responseSymbol[item.status] : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
