import { useTranslations } from "next-intl";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Card } from "@/components/ui/card";
import { AppLocale } from "@/lib/i18n/routing";
import { getWeekdayAccentClass } from "@/lib/utils";
import { EventDateResult } from "@/types/response";

export function ResultsList({
  results,
  locale,
  bestCandidateId,
}: {
  results: EventDateResult[];
  locale: AppLocale;
  bestCandidateId?: string;
}) {
  const t = useTranslations("results");

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card
          key={result.eventDateId}
          className={`p-4 ${
            result.eventDateId === bestCandidateId ? "bg-[#ECFDF3]" : ""
          } ${getWeekdayAccentClass(result.candidateDate)}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                <CandidateDateText value={result.candidateDate} locale={locale} />
              </p>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                {t("score", { score: result.score })}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-2xl bg-[#f1fff5] px-3 py-3 text-primary">
                <div className="font-bold">{result.availableCount}</div>
                <div>{t("available")}</div>
              </div>
              <div className="rounded-2xl bg-[#fff9ea] px-3 py-3 text-[#c48800]">
                <div className="font-bold">{result.maybeCount}</div>
                <div>{t("maybe")}</div>
              </div>
              <div className="rounded-2xl bg-[#fff5f4] px-3 py-3 text-danger">
                <div className="font-bold">{result.unavailableCount}</div>
                <div>{t("unavailable")}</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
