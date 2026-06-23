"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { OverallStatusPanel } from "@/components/response/overall-status-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { buildResponseStorageKey, parseStoredResponseMeta } from "@/lib/utils/response-storage";
import { getWeekdayAccentClass } from "@/lib/utils";
import { EventDetail } from "@/types/event";
import { EventResultsPayload, ResponseStatus, ResponseWithItems } from "@/types/response";

const statusTheme: Record<
  ResponseStatus,
  { labelKey: "available" | "maybe" | "unavailable"; className: string; symbol: string }
> = {
  available: {
    labelKey: "available",
    className: "border-primary bg-[#f1fff5] text-primary",
    symbol: "◯",
  },
  maybe: {
    labelKey: "maybe",
    className: "border-warning bg-[#fff9ea] text-[#c48800]",
    symbol: "△",
  },
  unavailable: {
    labelKey: "unavailable",
    className: "border-[#ffd7d4] bg-[#fff5f4] text-danger",
    symbol: "×",
  },
};

function createInitialStatuses(
  event: EventDetail,
  initialResponse?: ResponseWithItems | null,
) {
  const fallback = Object.fromEntries(
    event.candidateDates.map((candidate) => [candidate.id, "maybe"]),
  ) as Record<string, ResponseStatus>;

  if (!initialResponse) {
    return fallback;
  }

  return {
    ...fallback,
    ...Object.fromEntries(
      initialResponse.items.map((item) => [item.eventDateId, item.status]),
    ),
  };
}

export function ResponseForm({
  event,
  initialResponse,
  overallStatus,
  requestedResponseId,
  justUpdated = false,
  isSubmissionOpen = true,
  submissionNotice = "",
}: {
  event: EventDetail;
  initialResponse?: ResponseWithItems | null;
  overallStatus: EventResultsPayload;
  requestedResponseId?: string;
  justUpdated?: boolean;
  isSubmissionOpen?: boolean;
  submissionNotice?: string;
}) {
  const t = useTranslations("response");
  const common = useTranslations("common");
  const resultsT = useTranslations("results");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement | null>(null);
  const storageKey = buildResponseStorageKey(event.id);
  const [name, setName] = useState(initialResponse?.name ?? "");
  const [statuses, setStatuses] = useState<Record<string, ResponseStatus>>(() =>
    createInitialStatuses(event, initialResponse),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialResponse?.name ?? "");
    setStatuses(createInitialStatuses(event, initialResponse));
  }, [event, initialResponse]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (initialResponse) {
      return;
    }

    const stored = parseStoredResponseMeta(window.localStorage.getItem(storageKey));

    if (!stored) {
      return;
    }

    if (requestedResponseId && requestedResponseId === stored.responseId) {
      return;
    }

    if (requestedResponseId && requestedResponseId !== stored.responseId) {
      window.localStorage.removeItem(storageKey);
      router.replace(pathname);
      return;
    }

    router.replace(`${pathname}?responseId=${stored.responseId}`);
  }, [initialResponse, pathname, requestedResponseId, router, storageKey]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && event.candidateDates.length > 0;
  }, [event.candidateDates.length, name]);

  const myResponseSummary = useMemo(() => {
    const values = Object.values(statuses);

    return {
      available: values.filter((status) => status === "available").length,
      maybe: values.filter((status) => status === "maybe").length,
      unavailable: values.filter((status) => status === "unavailable").length,
    };
  }, [statuses]);

  function applyAll(status: ResponseStatus) {
    setStatuses(
      Object.fromEntries(event.candidateDates.map((candidate) => [candidate.id, status])),
    );
  }

  function restorePreviousResponse() {
    if (!initialResponse) {
      return;
    }

    setName(initialResponse.name);
    setStatuses(createInitialStatuses(event, initialResponse));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit(eventData: React.FormEvent<HTMLFormElement>) {
    eventData.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isEditing = Boolean(initialResponse?.id);
      const endpoint = isEditing
        ? `/api/events/${event.id}/response/${initialResponse?.id}`
        : `/api/events/${event.id}/response`;
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
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

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            eventId: event.id,
            responseId: data.responseId,
            name: name.trim(),
            answeredAt: new Date().toISOString(),
          }),
        );
      }

      const suffix = isEditing ? "&updated=1" : "";
      router.push(`/e/${event.slug}?responseId=${data.responseId}${suffix}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("errors.failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {initialResponse ? (
        <Card className="rounded-[24px] border border-[#34C759] bg-[#ECFDF3] p-4">
          <div className="space-y-3">
            <div>
              <p className="text-base font-extrabold text-foreground">
                {t("previousResponseFound")}
              </p>
              <p className="mt-2 text-sm text-foreground/65">
                {common("yourName")} : {initialResponse.name}
              </p>
            </div>

            {justUpdated ? (
              <p className="text-sm font-semibold text-primary">{t("responseUpdated")}</p>
            ) : null}

            <Button type="button" variant="outline" onClick={restorePreviousResponse}>
              {t("editResponse")}
            </Button>
          </div>
        </Card>
      ) : null}

      {initialResponse ? (
        <Card className="rounded-[24px] border border-border p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold">{t("myResponse")}</h2>
            <p className="text-sm text-foreground/60">{common("yourName")} : {name || "-"}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-[#f1fff5] px-3 py-1 text-primary">
              {resultsT("available")} {myResponseSummary.available}
              {resultsT("peopleSuffix")}
            </span>
            <span className="rounded-full bg-[#fff9ea] px-3 py-1 text-[#c48800]">
              {resultsT("maybe")} {myResponseSummary.maybe}
              {resultsT("peopleSuffix")}
            </span>
            <span className="rounded-full bg-[#fff5f4] px-3 py-1 text-danger">
              {resultsT("unavailable")} {myResponseSummary.unavailable}
              {resultsT("peopleSuffix")}
            </span>
          </div>
        </Card>
      ) : null}

      <form ref={formRef} className="space-y-6" onSubmit={onSubmit}>
        {!isSubmissionOpen && submissionNotice ? (
          <Card className="rounded-[24px] border border-[#ffd7d4] bg-[#fff5f4] p-4">
            <p className="text-sm font-semibold text-danger">{submissionNotice}</p>
          </Card>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground/60">{common("yourName")}</p>
          <Input
            placeholder={t("namePlaceholder")}
            value={name}
            onChange={(eventData) => setName(eventData.target.value)}
            disabled={!isSubmissionOpen}
          />
        </div>

        <Card className="space-y-3 p-4">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => applyAll("available")}
            disabled={!isSubmissionOpen}
          >
            {t("allAvailable")}
          </Button>
          <Button type="button" size="lg" variant="outline" className="w-full" disabled>
            {t("chooseIndividually")}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="danger"
            className="w-full"
            onClick={() => applyAll("unavailable")}
            disabled={!isSubmissionOpen}
          >
            {t("allUnavailable")}
          </Button>
        </Card>

        <div className="space-y-3">
          {event.candidateDates.map((candidate) => (
            <Card
              key={candidate.id}
              className={`p-4 ${getWeekdayAccentClass(candidate.candidateDate)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    <CandidateDateText
                      value={candidate.candidateDate}
                      locale={locale as typeof event.language}
                    />
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["available", "maybe", "unavailable"] as const).map((status) => {
                    const active = statuses[candidate.id] === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        aria-label={t(statusTheme[status].labelKey)}
                        className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${
                          active
                            ? statusTheme[status].className
                            : "border-border bg-white text-foreground/60"
                        }`}
                        disabled={!isSubmissionOpen}
                        onClick={() =>
                          setStatuses((current) => ({
                            ...current,
                            [candidate.id]: status,
                          }))
                        }
                      >
                        <span className="text-base leading-none">
                          {statusTheme[status].symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!isSubmissionOpen || !canSubmit || loading}
        >
          {loading ? t("submitting") : t("submit")}
        </Button>
      </form>

      <OverallStatusPanel
        locale={locale as typeof event.language}
        payload={overallStatus}
      />
    </div>
  );
}
