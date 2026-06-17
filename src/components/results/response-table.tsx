import { useTranslations } from "next-intl";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Link } from "@/lib/i18n/navigation";
import { AppLocale } from "@/lib/i18n/routing";
import { cn, getWeekdayAccentClass } from "@/lib/utils";
import { EventDateResult, ResponseStatus, ResponseWithItems } from "@/types/response";

const responseSymbol: Record<ResponseStatus, string> = {
  available: "○",
  maybe: "△",
  unavailable: "×",
};

export function ResponseTable({
  slug,
  locale,
  responses,
  results,
  bestCandidateId,
}: {
  slug: string;
  locale: AppLocale;
  responses: ResponseWithItems[];
  results: EventDateResult[];
  bestCandidateId?: string;
}) {
  const t = useTranslations("results");

  return (
    <div className="rounded-[28px] border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-extrabold">{t("responseTable")}</h2>
        <p className="text-sm text-foreground/60">{t("responseTableHint")}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-3 py-3 text-left font-semibold">
                {t("date")}
              </th>
              <th className="bg-white px-3 py-3 text-center font-semibold">{t("available")}</th>
              <th className="bg-white px-3 py-3 text-center font-semibold">{t("maybe")}</th>
              <th className="bg-white px-3 py-3 text-center font-semibold">
                {t("unavailable")}
              </th>
              {responses.map((response) => (
                <th key={response.id} className="bg-white px-3 py-3 text-center font-semibold">
                  <Link
                    href={`/e/${slug}?responseId=${response.id}`}
                    className="inline-block rounded-full px-2 py-1 text-primary underline-offset-4 hover:underline"
                  >
                    {response.name}
                  </Link>
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
                      "sticky left-0 px-3 py-3 font-semibold",
                      isBest ? "bg-[#ECFDF3]" : "bg-white",
                      getWeekdayAccentClass(result.candidateDate),
                    )}
                  >
                    <CandidateDateText value={result.candidateDate} locale={locale} />
                  </td>
                  <td className={cn("px-3 py-3 text-center", isBest ? "bg-[#ECFDF3]" : "")}>
                    {result.availableCount}
                    {t("peopleSuffix")}
                  </td>
                  <td className={cn("px-3 py-3 text-center", isBest ? "bg-[#ECFDF3]" : "")}>
                    {result.maybeCount}
                    {t("peopleSuffix")}
                  </td>
                  <td className={cn("px-3 py-3 text-center", isBest ? "bg-[#ECFDF3]" : "")}>
                    {result.unavailableCount}
                    {t("peopleSuffix")}
                  </td>
                  {responses.map((response) => {
                    const item = response.items.find(
                      (entry) => entry.eventDateId === result.eventDateId,
                    );

                    return (
                      <td
                        key={`${result.eventDateId}-${response.id}`}
                        className={cn(
                          "px-3 py-3 text-center text-base font-bold",
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
