"use client";

import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/lib/i18n/navigation";

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

export function CreateForm() {
  const t = useTranslations("create");
  const locale = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidates, setCandidates] = useState<CandidateRow[]>([
    emptyCandidate(),
    emptyCandidate(),
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const candidateDates = candidates
      .map((item) => item.value)
      .filter(Boolean)
      .map((value) => new Date(value).toISOString());

    if (!title.trim() || candidateDates.length === 0) {
      setError(t("errors.required"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
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
                onClick={() =>
                  setCandidates((current) =>
                    current.filter((item) => item.id !== candidate.id),
                  )
                }
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
          onClick={() =>
            setCandidates((current) => [...current, emptyCandidate()])
          }
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
