import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { AppLocale } from "@/lib/i18n/routing";
import { formatCandidateDate } from "@/lib/utils";
import { EventDateResult } from "@/types/response";

export function BestDateCard({
  bestCandidate,
  locale,
  totalResponses,
}: {
  bestCandidate: EventDateResult | null;
  locale: AppLocale;
  totalResponses: number;
}) {
  const t = useTranslations("results");

  if (!bestCandidate) {
    return null;
  }

  return (
    <Card className="bg-primary p-5 text-primary-foreground">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Trophy className="size-4" />
        <span>{t("bestCandidate")}</span>
      </div>
      <p className="text-2xl font-extrabold">
        {formatCandidateDate(bestCandidate.candidateDate, locale)}
      </p>
      <p className="mt-2 text-sm text-white/88">
        {t("responsesSummary", {
          available: bestCandidate.availableCount,
          total: totalResponses,
        })}
      </p>
    </Card>
  );
}
