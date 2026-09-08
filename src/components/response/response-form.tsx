"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { OverallStatusPanel } from "@/components/response/overall-status-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import {
  buildResponseStorageKey,
  parseStoredResponseMeta,
} from "@/lib/utils/response-storage";
import { cn, formatCandidateDate, getWeekdayAccentClass } from "@/lib/utils";
import { EventDetail } from "@/types/event";
import {
  EventResultsPayload,
  ResponseStatus,
  ResponseWithItems,
} from "@/types/response";

const statusTheme: Record<
  ResponseStatus,
  {
    labelKey: "available" | "maybe" | "unavailable";
    className: string;
    symbol: string;
  }
> = {
  available: {
    labelKey: "available",
    className:
      "border-[#16A34A] bg-[#DCFCE7] text-[#15803D] ring-1 ring-[#16A34A]",
    symbol: "◯",
  },
  maybe: {
    labelKey: "maybe",
    className:
      "border-[#b77900] bg-[#FEF3C7] text-[#925f00] ring-1 ring-[#b77900]",
    symbol: "△",
  },
  unavailable: {
    labelKey: "unavailable",
    className:
      "border-[#dc2626] bg-[#FEE2E2] text-[#dc2626] ring-1 ring-[#dc2626]",
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
  justSaved = false,
  initialView = "response",
  isSubmissionOpen = true,
  submissionNotice = "",
}: {
  event: EventDetail;
  initialResponse?: ResponseWithItems | null;
  overallStatus: EventResultsPayload;
  requestedResponseId?: string;
  justUpdated?: boolean;
  justSaved?: boolean;
  initialView?: "response" | "overview";
  isSubmissionOpen?: boolean;
  submissionNotice?: string;
}) {
  const t = useTranslations("response");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabsId = useId();
  const [activeView, setActiveView] = useState(initialView);
  const storageKey = buildResponseStorageKey(event.id);
  const [name, setName] = useState(initialResponse?.name ?? "");
  const [statuses, setStatuses] = useState<Record<string, ResponseStatus>>(() =>
    createInitialStatuses(event, initialResponse),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(justSaved);

  useEffect(() => {
    setName(initialResponse?.name ?? "");
    setStatuses(createInitialStatuses(event, initialResponse));
  }, [event, initialResponse]);

  useEffect(() => {
    setActiveView(initialView);
    setSaved(justSaved);
  }, [initialView, initialResponse?.id, justSaved]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (initialResponse) {
      return;
    }

    let stored;
    try {
      stored = parseStoredResponseMeta(window.localStorage.getItem(storageKey));
    } catch {
      return;
    }

    if (!stored) {
      return;
    }

    if (requestedResponseId) {
      return;
    }

    router.replace(
      `${pathname}?responseId=${stored.responseId}&view=overview`,
      { scroll: false },
    );
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
      Object.fromEntries(
        event.candidateDates.map((candidate) => [candidate.id, status]),
      ),
    );
  }

  function openEditor() {
    setActiveView("response");
    document.getElementById(`${tabsId}-response-tab`)?.focus();
  }

  async function onSubmit(eventData: React.FormEvent<HTMLFormElement>) {
    eventData.preventDefault();
    if (loading || !isSubmissionOpen || !canSubmit) {
      return;
    }
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

      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            eventId: event.id,
            responseId: data.responseId,
            name: name.trim(),
            answeredAt: new Date().toISOString(),
          }),
        );
      } catch {
        // A browser storage restriction must not turn a saved reply into a failure.
      }

      const suffix = isEditing ? "&updated=1" : "";
      setSaved(true);
      setActiveView("overview");
      tabListRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
      router.push(
        `/e/${event.slug}?responseId=${data.responseId}&view=overview&saved=1${suffix}`,
        { scroll: false },
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error && !(submitError instanceof TypeError)
          ? submitError.message
          : t("errors.failed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={t("eventViews")}
        className="grid scroll-mt-4 grid-cols-2 gap-1 rounded-2xl bg-[#f1f5f2] p-1"
        onKeyDown={(keyEvent) => {
          if (
            !["ArrowLeft", "ArrowRight", "Home", "End"].includes(keyEvent.key)
          )
            return;
          keyEvent.preventDefault();
          const nextView =
            keyEvent.key === "Home"
              ? "response"
              : keyEvent.key === "End"
                ? "overview"
                : activeView === "response"
                  ? "overview"
                  : "response";
          setActiveView(nextView);
          document.getElementById(`${tabsId}-${nextView}-tab`)?.focus();
        }}
      >
        {(["response", "overview"] as const).map((view) => (
          <button
            key={view}
            id={`${tabsId}-${view}-tab`}
            type="button"
            role="tab"
            aria-selected={activeView === view}
            aria-controls={`${tabsId}-${view}-panel`}
            tabIndex={activeView === view ? 0 : -1}
            className={cn(
              "min-h-11 rounded-xl px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
              activeView === view
                ? "bg-white text-[#15803D] shadow-sm"
                : "text-foreground/65 hover:text-foreground",
            )}
            onClick={() => setActiveView(view)}
          >
            {view === "response"
              ? t(initialResponse ? "editResponse" : "answerTab")
              : t("everyoneTab")}
            {view === "overview" ? (
              <span className="ml-1.5 inline-block rounded-full bg-[#e4eee7] px-1.5 text-xs tabular-nums">
                {overallStatus.totalResponses}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {!isSubmissionOpen && submissionNotice ? (
        <div className="rounded-2xl border border-[#ffd7d4] bg-[#fff5f4] p-3">
          <p className="text-sm font-semibold text-danger">
            {submissionNotice}
          </p>
        </div>
      ) : null}

      <section
        id={`${tabsId}-response-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-response-tab`}
        hidden={activeView !== "response"}
        tabIndex={0}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
          isSubmissionOpen && "pb-36",
        )}
      >
        <form className="space-y-5" onSubmit={onSubmit}>
          <fieldset
            disabled={!isSubmissionOpen || loading}
            className="min-w-0 space-y-5"
          >
            <div className="space-y-2">
              <label
                htmlFor={`${tabsId}-name`}
                className="text-sm font-semibold text-foreground/70"
              >
                {common("yourName")}
              </label>
              <Input
                id={`${tabsId}-name`}
                name="name"
                autoComplete="name"
                maxLength={60}
                required
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(eventData) => setName(eventData.target.value)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <h2 className="text-sm font-semibold">
                  {t("candidateCount", { count: event.candidateDates.length })}
                </h2>
                <p className="text-xs text-foreground/60">
                  {t("selectionHint")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto min-h-11 whitespace-normal rounded-xl px-2 py-2 text-xs text-[#15803D]"
                  onClick={() => applyAll("available")}
                >
                  <span aria-hidden="true" className="mr-1.5 text-lg">
                    ○
                  </span>
                  {t("allAvailable")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto min-h-11 whitespace-normal rounded-xl px-2 py-2 text-xs text-[#dc2626]"
                  onClick={() => applyAll("unavailable")}
                >
                  <span aria-hidden="true" className="mr-1.5 text-lg">
                    ×
                  </span>
                  {t("allUnavailable")}
                </Button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border">
                {event.candidateDates.map((candidate) => (
                  <fieldset
                    key={candidate.id}
                    className={cn(
                      "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-l-4 border-l-transparent p-2.5 last:border-b-0 sm:p-3",
                      getWeekdayAccentClass(candidate.candidateDate),
                    )}
                  >
                    <legend className="sr-only">
                      {formatCandidateDate(
                        candidate.candidateDate,
                        locale as typeof event.language,
                      )}
                    </legend>
                    <CandidateDateText
                      value={candidate.candidateDate}
                      locale={locale as typeof event.language}
                      className="inline-flex flex-wrap gap-x-1 text-[13px] font-semibold tabular-nums sm:text-sm"
                    />
                    <div className="flex gap-1">
                      {(["available", "maybe", "unavailable"] as const).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            aria-label={t(statusTheme[status].labelKey)}
                            aria-pressed={statuses[candidate.id] === status}
                            className={cn(
                              "flex size-11 shrink-0 items-center justify-center rounded-xl border text-xl font-semibold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
                              statuses[candidate.id] === status
                                ? statusTheme[status].className
                                : "border-border bg-white text-foreground/50 hover:bg-muted",
                            )}
                            onClick={() =>
                              setStatuses((current) => ({
                                ...current,
                                [candidate.id]: status,
                              }))
                            }
                          >
                            <span aria-hidden="true">
                              {statusTheme[status].symbol}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>
          </fieldset>

          {isSubmissionOpen ? (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(17,17,17,0.05)] backdrop-blur-sm">
              <div className="mx-auto max-w-2xl space-y-2">
                {error ? (
                  <p role="alert" className="text-sm text-[#dc2626]">
                    {error}
                  </p>
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p
                      className="flex flex-wrap gap-x-3 text-sm font-semibold tabular-nums"
                      aria-label={t("myResponse")}
                    >
                      {(["available", "maybe", "unavailable"] as const).map(
                        (status) => (
                          <span
                            key={status}
                            aria-label={`${t(status)} ${myResponseSummary[status]}`}
                          >
                            {statusTheme[status].symbol}{" "}
                            {myResponseSummary[status]}
                          </span>
                        ),
                      )}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {name.trim() ? t("saveHint") : t("nameRequired")}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="h-auto min-h-12 max-w-[55%] shrink-0 whitespace-normal rounded-2xl px-5 py-3"
                    disabled={!canSubmit || loading}
                  >
                    {loading
                      ? t("submitting")
                      : t(initialResponse ? "saveChanges" : "sendResponse")}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </form>
      </section>

      <section
        id={`${tabsId}-overview-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-overview-tab`}
        hidden={activeView !== "overview"}
        tabIndex={0}
        className="min-w-0 space-y-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
      >
        {saved ? (
          <p
            role="status"
            className="rounded-xl bg-[#ECFDF3] px-3 py-2 text-sm font-semibold text-[#15803D]"
          >
            {t(justUpdated ? "responseUpdated" : "responseSaved")}
          </p>
        ) : null}
        {initialResponse ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border px-3 py-2">
            <p className="min-w-0 break-words text-sm">
              <span className="text-foreground/60">
                {t("previousResponseFound")}
              </span>
              <br />
              <span className="font-semibold">{initialResponse.name}</span>
            </p>
            {isSubmissionOpen ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-xl px-3 text-[#15803D]"
                onClick={openEditor}
              >
                {t("editResponse")}
              </Button>
            ) : null}
          </div>
        ) : null}
        <OverallStatusPanel
          locale={locale as typeof event.language}
          payload={overallStatus}
          onEditResponse={openEditor}
        />
      </section>
    </div>
  );
}
