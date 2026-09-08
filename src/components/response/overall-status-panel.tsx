"use client";

import { useTranslations } from "next-intl";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Link } from "@/lib/i18n/navigation";
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
  onEditResponse,
}: {
  locale: AppLocale;
  payload: EventResultsPayload;
  onEditResponse?: () => void;
}) {
  const t = useTranslations("response");
  const resultsT = useTranslations("results");
  const bestCandidate =
    payload.responses.length > 0 ? (payload.bestCandidates[0] ?? null) : null;

  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-extrabold">{t("overallStatus")}</h2>
        <p className="text-sm text-foreground/60">
          {resultsT("responseRate")} {payload.responseRate.answered} /{" "}
          {payload.responseRate.total}
          {resultsT("peopleSuffix")} ({payload.responseRate.percentage}%)
        </p>
      </div>

      {bestCandidate ? (
        <div className="rounded-[24px] border border-[#34C759] bg-[#ECFDF3] p-4">
          <p className="text-sm font-semibold text-primary">
            {resultsT("bestCandidate")}
          </p>
          <p className="mt-2 text-lg font-extrabold text-foreground">
            <CandidateDateText
              value={bestCandidate.candidateDate}
              locale={locale}
            />
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
        </div>
      ) : null}

      {payload.responses.length === 0 ? (
        <p className="rounded-2xl bg-muted p-4 text-sm leading-6 text-foreground/65">
          {t("noResponses")}
        </p>
      ) : (
        <div className="rounded-[24px] border border-border bg-white p-4">
          <div className="mb-3 space-y-1">
            <h3 className="text-base font-extrabold">
              {resultsT("responseTable")}
            </h3>
            <p className="text-sm text-foreground/60">
              {resultsT("responseTableHint")}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-fit table-fixed border-separate border-spacing-0 text-xs sm:text-sm">
              <colgroup>
                <col className="w-[104px] sm:w-[124px]" />
                {payload.results.map((result) => (
                  <col
                    key={result.eventDateId}
                    className="w-[108px] sm:w-[132px]"
                  />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left font-semibold sm:px-2.5">
                    {resultsT("participants")}
                  </th>
                  {payload.results.map((result) => {
                    const isBest =
                      bestCandidate?.eventDateId === result.eventDateId;

                    return (
                      <th
                        key={result.eventDateId}
                        className={cn(
                          "px-1 py-2 text-center font-semibold sm:px-1.5",
                          isBest ? "bg-[#ECFDF3]" : "bg-white",
                        )}
                      >
                        <span className="inline-block whitespace-nowrap text-[11px] sm:text-xs">
                          <CandidateDateText
                            value={result.candidateDate}
                            locale={locale}
                          />
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {payload.responses.map((response) => (
                  <tr key={response.id}>
                    <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left font-semibold sm:px-2.5">
                      <Link
                        href={`/e/${payload.event.slug}?responseId=${response.id}`}
                        onNavigate={onEditResponse}
                        className="inline-block max-w-[92px] truncate rounded-full px-1 py-0.5 align-middle text-primary underline-offset-4 hover:underline sm:max-w-[112px]"
                      >
                        {response.name}
                      </Link>
                    </th>
                    {payload.results.map((result) => {
                      const isBest =
                        bestCandidate?.eventDateId === result.eventDateId;
                      const item = response.items.find(
                        (entry) => entry.eventDateId === result.eventDateId,
                      );

                      return (
                        <td
                          key={`${response.id}-${result.eventDateId}`}
                          className={cn(
                            "px-1 py-2 text-center text-sm font-bold sm:px-1.5 sm:text-base",
                            isBest ? "bg-[#ECFDF3]" : "",
                            item
                              ? responseSymbolClass[item.status]
                              : "text-foreground/30",
                          )}
                        >
                          {item ? responseSymbol[item.status] : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
