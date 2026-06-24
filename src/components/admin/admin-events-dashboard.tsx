"use client";

import { Copy, ExternalLink, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminEventSummary } from "@/lib/db/queries";

type FilterStatus = "all" | "open" | "closed";

function isClosedEvent(event: AdminEventSummary) {
  if (event.receptionStatus !== "open") {
    return true;
  }

  if (!event.responseDeadline) {
    return false;
  }

  return new Date(event.responseDeadline).getTime() < Date.now();
}

function getReceptionLabel(status: AdminEventSummary["receptionStatus"]) {
  if (status === "open") return "受付中";
  if (status === "paused") return "停止";
  return "終了";
}

export function AdminEventsDashboard({
  initialEvents,
}: {
  initialEvents: AdminEventSummary[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [error, setError] = useState("");

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return events.filter((event) => {
      const matchesQuery =
        normalized.length === 0 ||
        event.title.toLowerCase().includes(normalized) ||
        (event.description || "").toLowerCase().includes(normalized);

      if (!matchesQuery) {
        return false;
      }

      if (filter === "all") {
        return true;
      }

      const closed = isClosedEvent(event);
      return filter === "open" ? !closed : closed;
    });
  }, [events, filter, query]);

  const deletingEvent = events.find((event) => event.id === deletingId) ?? null;

  async function copyUrl(eventId: string, shareUrl: string) {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedId(eventId);
    window.setTimeout(() => {
      setCopiedId((current) => (current === eventId ? null : current));
    }, 1800);
  }

  async function confirmDelete() {
    if (!deletingEvent) {
      return;
    }

    setSubmittingDelete(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/events/${deletingEvent.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "削除に失敗しました。");
      }

      setEvents((current) => current.filter((event) => event.id !== deletingEvent.id));
      setDeletingId(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "削除に失敗しました。");
    } finally {
      setSubmittingDelete(false);
    }
  }

  return (
    <>
      <Card className="mb-5 p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground/45" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="イベント名・説明で検索"
              className="pl-11"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all" as const, label: "全件" },
              { value: "open" as const, label: "受付中" },
              { value: "closed" as const, label: "締切済み" },
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={filter === option.value ? "default" : "outline"}
                className="h-10 px-4"
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredEvents.map((event) => {
          const closed = isClosedEvent(event);

          return (
            <Card key={event.id} className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold">{event.title}</h2>
                  <p className="text-sm text-foreground/60">
                    作成日 {new Date(event.createdAt).toLocaleString("ja-JP")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-muted px-3 py-1">
                    言語 {event.language}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">
                    {closed ? "締切済み" : getReceptionLabel(event.receptionStatus)}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">
                    共有URL {event.shareEnabled ? "有効" : "無効"}
                  </span>
                </div>
              </div>

              {event.description ? (
                <p className="text-sm leading-6 text-foreground/70">{event.description}</p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[22px] bg-muted/50 p-4">
                  <p className="text-xs font-semibold text-foreground/55">回答人数</p>
                  <p className="mt-2 text-lg font-extrabold">回答：{event.responseCount}名</p>
                </div>
                <div className="rounded-[22px] bg-muted/50 p-4">
                  <p className="text-xs font-semibold text-foreground/55">候補日数</p>
                  <p className="mt-2 text-lg font-extrabold">候補日：{event.candidateCount}件</p>
                </div>
                <div className="rounded-[22px] bg-muted/50 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold text-foreground/55">最有力候補</p>
                  {event.bestCandidate ? (
                    <>
                      <p className="mt-2 text-base font-extrabold">
                        <CandidateDateText value={event.bestCandidate.candidateDate} locale="ja" />
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        参加可能 {event.bestCandidate.availableCount}名
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-foreground/60">まだ回答がありません。</p>
                  )}
                </div>
              </div>

              <div className="rounded-[22px] border border-border/80 bg-white p-4">
                <p className="text-xs font-semibold text-foreground/55">共有URL</p>
                <a
                  href={event.shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {event.shareUrl}
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-4"
                    onClick={() => copyUrl(event.id, event.shareUrl)}
                  >
                    <Copy className="mr-2 size-4" />
                    {copiedId === event.id ? "コピーしました" : "URLコピー"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 px-4"
                    onClick={() => window.open(event.shareUrl, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="mr-2 size-4" />
                    共有画面を開く
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="inline-flex h-12 items-center justify-center rounded-[22px] border bg-white px-5 text-sm font-semibold"
                >
                  詳細を見る
                </Link>
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="inline-flex h-12 items-center justify-center rounded-[22px] bg-primary px-5 text-sm font-semibold text-white"
                >
                  <Pencil className="mr-2 size-4" />
                  編集
                </Link>
                <Button
                  type="button"
                  variant="danger"
                  className="h-12 px-5"
                  onClick={() => setDeletingId(event.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  削除
                </Button>
              </div>
            </Card>
          );
        })}

        {filteredEvents.length === 0 ? (
          <Card className="p-6 text-sm text-foreground/60">
            条件に合うイベントはありません。
          </Card>
        ) : null}
      </div>

      {deletingEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-extrabold">このイベントを削除しますか？</h2>
            <div className="mt-4 space-y-2 rounded-[22px] bg-muted/50 p-4">
              <p className="text-sm text-foreground/60">イベント名</p>
              <p className="text-base font-extrabold">{deletingEvent.title}</p>
            </div>
            <p className="mt-4 text-sm text-danger">※回答データも削除されます</p>
            {error ? <p className="mt-3 text-sm font-semibold text-danger">{error}</p> : null}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (!submittingDelete) {
                    setDeletingId(null);
                    setError("");
                  }
                }}
                disabled={submittingDelete}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={confirmDelete}
                disabled={submittingDelete}
              >
                {submittingDelete ? "削除中..." : "削除する"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
