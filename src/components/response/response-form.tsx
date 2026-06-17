"use client";

import { Check, CircleSlash, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EventDetail } from "@/types/event";
import { ResponseStatus } from "@/types/response";
import { formatCandidateDate } from "@/lib/utils";
import { useRouter } from "@/lib/i18n/navigation";

const statusTheme: Record<
  ResponseStatus,
  { labelKey: "available" | "maybe" | "unavailable"; className: string; icon: React.ReactNode }
> = {
  available: {
    labelKey: "available",
    className: "border-primary bg-[#f1fff5] text-primary",
    icon: <Check className="size-4" />,
  },
  maybe: {
    labelKey: "maybe",
    className: "border-warning bg-[#fff9ea] text-[#c48800]",
    icon: <TriangleAlert className="size-4" />,
  },
  unavailable: {
    labelKey: "unavailable",
    className: "border-[#ffd7d4] bg-[#fff5f4] text-danger",
    icon: <CircleSlash className="size-4" />,
  },
};

export function ResponseForm({ event }: { event: EventDetail }) {
  const t = useTranslations("response");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [statuses, setStatuses] = useState<Record<string, ResponseStatus>>(
    () =>
      Object.fromEntries(
        event.candidateDates.map((candidate) => [candidate.id, "maybe"]),
      ),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && event.candidateDates.length > 0;
  }, [event.candidateDates.length, name]);

  function applyAll(status: ResponseStatus) {
    setStatuses(
      Object.fromEntries(event.candidateDates.map((candidate) => [candidate.id, status])),
    );
  }

  async function onSubmit(eventData: React.FormEvent<HTMLFormElement>) {
    eventData.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/events/${event.id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          items: event.candidateDates.map((candidate) => ({
            eventDateId: candidate.id,
            status: statuses[candidate.id],
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("errors.failed"));
      }

      router.push(`/e/${event.slug}/results`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("errors.failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground/60">{common("yourName")}</p>
        <Input
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(eventData) => setName(eventData.target.value)}
        />
      </div>

      <Card className="space-y-3 p-4">
        <Button type="button" size="lg" className="w-full" onClick={() => applyAll("available")}>
          {t("allAvailable")}
        </Button>
        <Button type="button" size="lg" variant="outline" className="w-full">
          {t("chooseIndividually")}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="danger"
          className="w-full"
          onClick={() => applyAll("unavailable")}
        >
          {t("allUnavailable")}
        </Button>
      </Card>

      <div className="space-y-3">
        {event.candidateDates.map((candidate) => (
          <Card key={candidate.id} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  {formatCandidateDate(candidate.candidateDate, locale as typeof event.language)}
                </p>
              </div>
              <div className="flex gap-2">
                {(["available", "maybe", "unavailable"] as const).map((status) => {
                  const active = statuses[candidate.id] === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${
                        active
                          ? statusTheme[status].className
                          : "border-border bg-white text-foreground/60"
                      }`}
                      onClick={() =>
                        setStatuses((current) => ({
                          ...current,
                          [candidate.id]: status,
                        }))
                      }
                    >
                      {statusTheme[status].icon}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || loading}>
        {loading ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
