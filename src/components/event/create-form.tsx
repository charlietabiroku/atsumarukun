"use client";

import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";
import {
  getWeekdayAccentClass,
  toCandidateDateIsoFromParts,
  toDateInput,
  toTimeInput,
} from "@/lib/utils";
import { EventDetail } from "@/types/event";

type CandidateRow = {
  id: string;
  date: string;
  time: string;
};

function emptyCandidate() {
  return {
    id: crypto.randomUUID(),
    date: "",
    time: "",
  };
}

function createInitialCandidates(event?: EventDetail) {
  if (!event) {
    return [emptyCandidate(), emptyCandidate()];
  }

  const rows = event.candidateDates.map((candidate) => ({
    id: candidate.id,
    date: toDateInput(candidate.candidateDate),
    time: toTimeInput(candidate.candidateDate),
  }));

  return rows.length > 0 ? rows : [emptyCandidate()];
}

function createInitialCommonTime(event?: EventDetail) {
  if (!event || event.candidateDates.length === 0) {
    return "";
  }

  const uniqueTimes = [...new Set(event.candidateDates.map((candidate) => toTimeInput(candidate.candidateDate)))];
  return uniqueTimes.length === 1 ? uniqueTimes[0] : "";
}

type CreateFormProps = {
  event?: EventDetail;
  mode?: "create" | "edit";
};

export function CreateForm({
  event: initialEvent,
  mode = "create",
}: CreateFormProps) {
  const t = useTranslations(mode);
  const locale = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [description, setDescription] = useState(initialEvent?.description ?? "");
  const [candidates, setCandidates] = useState<CandidateRow[]>(
    createInitialCandidates(initialEvent),
  );
  const [commonTime, setCommonTime] = useState(createInitialCommonTime(initialEvent));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addCandidate() {
    setCandidates((current) => [...current, emptyCandidate()]);
  }

  function removeCandidate(id: string) {
    setCandidates((current) => {
      if (current.length === 1) {
        return [{ ...current[0], date: "", time: "" }];
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function applyCommonTimeToAllCandidates() {
    if (!commonTime) {
      return;
    }

    setCandidates((current) =>
      current.map((item) => ({
        ...item,
        time: commonTime,
      })),
    );
  }

  const candidatePreviews = useMemo(() => {
    return candidates.map((candidate) => {
      const effectiveTime = candidate.time || commonTime;

      if (!candidate.date || !effectiveTime) {
        return null;
      }

      return toCandidateDateIsoFromParts(candidate.date, effectiveTime);
    });
  }, [candidates, commonTime]);

  async function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError("");

    const candidateDates = candidates
      .filter((item) => item.date)
      .map((item) => {
        const effectiveTime = item.time || commonTime;

        return effectiveTime
          ? toCandidateDateIsoFromParts(item.date, effectiveTime)
          : null;
      })
      .filter((value): value is string => Boolean(value));

    const hasDateWithoutTime = candidates.some((item) => item.date && !(item.time || commonTime));

    if (!title.trim() || candidateDates.length === 0) {
      setError(t("errors.required"));
      return;
    }

    if (hasDateWithoutTime) {
      setError(t("errors.timeRequired"));
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "edit" && initialEvent?.id
        ? `/api/events/${initialEvent.id}`
        : "/api/events";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          language: locale,
          candidateDates,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("errors.failed"));
      }

      if (mode === "edit") {
        router.push(`/e/${data.slug}/share`);
        router.refresh();
        return;
      }

      router.push(`/e/${data.slug}/share`);
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
      <div>
        <Label>{t("title")}</Label>
        <Input
          placeholder={t("titlePlaceholder")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div>
        <Label>{t("description")}</Label>
        <Textarea
          placeholder={t("descriptionPlaceholder")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="space-y-3">
        <Label>{t("candidateDates")}</Label>
        <div className="rounded-3xl border border-border/70 bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label>{t("commonTime")}</Label>
              <Input
                type="time"
                value={commonTime}
                onChange={(event) => setCommonTime(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={applyCommonTimeToAllCandidates}
            >
              {t("applyCommonTime")}
            </Button>
          </div>
        </div>
        {candidates.map((candidate, index) => (
          <div key={candidate.id} className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("date")}</Label>
                  <Input
                    type="date"
                    value={candidate.date}
                    onChange={(event) =>
                      setCandidates((current) =>
                        current.map((item) =>
                          item.id === candidate.id
                            ? { ...item, date: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("time")}</Label>
                  <Input
                    type="time"
                    value={candidate.time}
                    onChange={(event) =>
                      setCandidates((current) =>
                        current.map((item) =>
                          item.id === candidate.id
                            ? { ...item, time: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
              </div>
              {candidatePreviews[index] ? (
                <div
                  className={`rounded-2xl border border-border/70 px-3 py-2 text-sm font-semibold text-foreground ${getWeekdayAccentClass(
                    candidatePreviews[index],
                  )}`}
                >
                  <CandidateDateText
                    value={candidatePreviews[index]}
                    locale={locale as "ja" | "zh" | "en" | "ko"}
                  />
                </div>
              ) : null}
            </div>
            {candidates.length > 1 ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label={`${t("removeCandidate")} ${index + 1}`}
                onClick={() => removeCandidate(candidate.id)}
              >
                <Minus className="size-4" />
              </Button>
            ) : null}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center"
          onClick={addCandidate}
        >
          <Plus className="mr-2 size-4" />
          {t("addCandidate")}
        </Button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? t("creating") : t("submit")}
      </Button>
    </form>
  );
}
