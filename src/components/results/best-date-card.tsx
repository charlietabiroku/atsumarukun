"use client";

import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Button } from "@/components/ui/button";
import { AppLocale } from "@/lib/i18n/routing";
import { formatCandidateDate } from "@/lib/utils";
import { EventDateResult } from "@/types/response";

type BestDateCardProps = {
  bestCandidate: EventDateResult | null;
  locale: AppLocale;
  totalResponses: number;
  responseRate: {
    answered: number;
    total: number;
    percentage: number;
  };
};

export function BestDateCard({
  bestCandidate,
  locale,
  totalResponses,
  responseRate,
}: BestDateCardProps) {
  const t = useTranslations("results");
  const [copied, setCopied] = useState(false);

  if (!bestCandidate) {
    return null;
  }

  const selectedBestCandidate = bestCandidate;

  async function copyResults() {
    const text = [
      t("copyTitle"),
      "",
      formatCandidateDate(selectedBestCandidate.candidateDate, locale),
      "",
      `${t("available")} ${selectedBestCandidate.availableCount}${t("peopleSuffix")}`,
      `${t("maybe")} ${selectedBestCandidate.maybeCount}${t("peopleSuffix")}`,
      `${t("unavailable")} ${selectedBestCandidate.unavailableCount}${t("peopleSuffix")}`,
      "",
      t("bestCandidateCopy"),
    ].join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="sticky top-3 z-50">
      <div className="rounded-[16px] border border-[#34C759] bg-[#ECFDF3] p-4 shadow-[0_14px_30px_rgba(52,199,89,0.14)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Trophy className="size-4" />
              <span>{t("bestCandidate")}</span>
            </div>
            <p className="text-xl font-extrabold text-foreground sm:text-2xl">
              <CandidateDateText value={selectedBestCandidate.candidateDate} locale={locale} />
            </p>
            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-white px-3 py-1 text-primary">
                {t("available")} {selectedBestCandidate.availableCount}
                {t("peopleSuffix")}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[#c48800]">
                {t("maybe")} {selectedBestCandidate.maybeCount}
                {t("peopleSuffix")}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-danger">
                {t("unavailable")} {selectedBestCandidate.unavailableCount}
                {t("peopleSuffix")}
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:min-w-52">
            <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm">
              <p className="font-semibold text-foreground/65">{t("responseRate")}</p>
              <p className="mt-1 text-lg font-extrabold text-foreground">
                {responseRate.answered} / {responseRate.total}
                {t("peopleSuffix")}
              </p>
              <p className="text-sm font-semibold text-primary">
                {responseRate.percentage}%
              </p>
              <p className="mt-1 text-xs text-foreground/55">
                {t("responsesSummary", {
                  available: selectedBestCandidate.availableCount,
                  total: totalResponses,
                })}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-[#34C759] bg-white text-primary hover:bg-white/90"
              onClick={copyResults}
            >
              {copied ? t("copiedResults") : t("copyResults")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
