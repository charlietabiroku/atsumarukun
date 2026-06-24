"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Link } from "@/lib/i18n/navigation";
import { AppLocale } from "@/lib/i18n/routing";
import { buildResponseStorageKey, parseStoredResponseMeta } from "@/lib/utils/response-storage";
import { cn, getWeekdayAccentClass } from "@/lib/utils";
import { EventDateResult, ResponseStatus, ResponseWithItems } from "@/types/response";

const responseSymbol: Record<ResponseStatus, string> = {
  available: "○",
  maybe: "△",
  unavailable: "×",
};

const responseSymbolClass: Record<ResponseStatus, string> = {
  available: "text-[#16A34A]",
  maybe: "text-[#c48800]",
  unavailable: "text-danger",
};

export function ResponseTable({
  eventId,
  slug,
  locale,
  responses,
  results,
  bestCandidateId,
  isAdminViewer,
}: {
  eventId: string;
  slug: string;
  locale: AppLocale;
  responses: ResponseWithItems[];
  results: EventDateResult[];
  bestCandidateId?: string;
  isAdminViewer?: boolean;
}) {
  const t = useTranslations("results");
  const [storedResponseId, setStoredResponseId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = parseStoredResponseMeta(
      window.localStorage.getItem(buildResponseStorageKey(eventId)),
    );

    setStoredResponseId(stored?.responseId ?? null);
  }, [eventId]);

  const canViewTable = useMemo(() => {
    if (isAdminViewer) {
      return true;
    }

    return responses.some((response) => response.id === storedResponseId);
  }, [isAdminViewer, responses, storedResponseId]);

  const hintKey = isAdminViewer ? "responseTableHint" : "responseTableOwnerHint";

  if (!canViewTable) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-extrabold">{t("responseTable")}</h2>
        <p className="text-sm text-foreground/60">{t(hintKey)}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-fit table-fixed border-separate border-spacing-0 text-xs sm:text-sm">
          <colgroup>
            <col className="w-[154px] sm:w-[168px]" />
            {responses.map((response) => (
              <col key={response.id} className="w-[54px] sm:w-[62px]" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-2 py-2.5 text-left font-semibold sm:px-2.5">
                {t("date")}
              </th>
              {responses.map((response) => (
                <th
                  key={response.id}
                  className="bg-white px-1 py-2.5 text-center font-semibold sm:px-1.5"
                >
                  {isAdminViewer || response.id === storedResponseId ? (
                    <Link
                      href={`/e/${slug}?responseId=${response.id}`}
                      className="inline-block rounded-full px-1 py-0.5 text-primary underline-offset-4 hover:underline"
                    >
                      {response.name}
                    </Link>
                  ) : (
                    <span className="inline-block rounded-full px-1 py-0.5 text-foreground/70">
                      {response.name}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const isBest = bestCandidateId === result.eventDateId;

              return (
                <tr
                  key={result.eventDateId}
                  className={cn(
                    "align-middle",
                    isBest ? "bg-[#ECFDF3]" : "",
                  )}
                >
                  <td
                    className={cn(
                      "sticky left-0 whitespace-nowrap px-2 py-2.5 font-semibold sm:px-2.5",
                      isBest ? "bg-[#ECFDF3]" : "bg-white",
                      getWeekdayAccentClass(result.candidateDate),
                    )}
                  >
                    <CandidateDateText value={result.candidateDate} locale={locale} />
                  </td>
                  {responses.map((response) => {
                    const item = response.items.find(
                      (entry) => entry.eventDateId === result.eventDateId,
                    );

                    return (
                      <td
                        key={`${result.eventDateId}-${response.id}`}
                        className={cn(
                          "px-1 py-2 text-center text-sm font-bold sm:px-1.5 sm:text-base",
                          item ? responseSymbolClass[item.status] : "text-foreground/40",
                          isBest ? "bg-[#ECFDF3]" : "",
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
    </div>
  );
}
