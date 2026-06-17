"use client";

import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";
import { toCandidateDateIso, toDateTimeLocalInput } from "@/lib/utils";
import { EventDetail } from "@/types/event";

type CandidateRow = {
  id: string;
  value: string;
};

function emptyCandidate() {
  return {
    id: crypto.randomUUID(),
    value: "",
  };
}

function createInitialCandidates(event?: EventDetail) {
  if (!event) {
    return [emptyCandidate(), emptyCandidate()];
  }

  const rows = event.candidateDates.map((candidate) => ({
    id: candidate.id,
    value: toDateTimeLocalInput(candidate.candidateDate),
  }));

  return rows.length > 0 ? rows : [emptyCandidate()];
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addCandidate() {
    setCandidates((current) => [...current, emptyCandidate()]);
  }

  function removeCandidate(id: string) {
    setCandidates((current) => {
      if (current.length === 1) {
        return [{ ...current[0], value: "" }];
      }

      return current.filter((item) => item.id !== id);
    });
  }

  async function onSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError("");

    const candidateDates = candidates
      .map((item) => item.value)
      .filter(Boolean)
      .map((value) => toCandidateDateIso(value));

    if (!title.trim() || candidateDates.length === 0) {
      setError(t("errors.required"));
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
        {candidates.map((candidate, index) => (
          <div key={candidate.id} className="flex items-center gap-3">
            <Input
              type="datetime-local"
              value={candidate.value}
              onChange={(event) =>
                setCandidates((current) =>
                  current.map((item) =>
                    item.id === candidate.id
                      ? { ...item, value: event.target.value }
                      : item,
                  ),
                )
              }
            />
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
