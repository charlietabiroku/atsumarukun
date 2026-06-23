import { ChevronLeft, Pencil } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CandidateDateText } from "@/components/date/candidate-date-text";
import { Card } from "@/components/ui/card";
import { requireAdminAuth } from "@/lib/admin/auth";
import { getAdminEventById } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "イベント詳細 | 集丸くん",
};

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdminAuth();
  const { eventId } = await params;
  const payload = await getAdminEventById(eventId);

  if (!payload) {
    notFound();
  }

  const { event, results } = payload;

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ChevronLeft className="size-4" />
            一覧へ戻る
          </Link>
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="inline-flex h-11 items-center justify-center rounded-[22px] bg-primary px-5 text-sm font-semibold text-white"
          >
            <Pencil className="mr-2 size-4" />
            編集
          </Link>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4 p-5 sm:p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">イベント詳細</p>
              <h1 className="text-3xl font-extrabold">{event.title}</h1>
              {event.description ? (
                <p className="text-sm leading-6 text-foreground/70">{event.description}</p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[22px] bg-muted/60 p-4">
                <p className="text-xs font-semibold text-foreground/55">受付状態</p>
                <p className="mt-2 text-lg font-extrabold">{event.receptionStatus}</p>
              </div>
              <div className="rounded-[22px] bg-muted/60 p-4">
                <p className="text-xs font-semibold text-foreground/55">共有URL</p>
                <p className="mt-2 text-lg font-extrabold">
                  {event.shareEnabled ? "有効" : "無効"}
                </p>
              </div>
              <div className="rounded-[22px] bg-muted/60 p-4">
                <p className="text-xs font-semibold text-foreground/55">回答締切</p>
                <p className="mt-2 text-base font-extrabold">
                  {event.responseDeadline
                    ? new Date(event.responseDeadline).toLocaleString("ja-JP")
                    : "未設定"}
                </p>
              </div>
              <div className="rounded-[22px] bg-muted/60 p-4">
                <p className="text-xs font-semibold text-foreground/55">回答人数</p>
                <p className="mt-2 text-lg font-extrabold">{results.responses.length}人</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 p-5 sm:p-6">
            <h2 className="text-xl font-extrabold">候補日</h2>
            <div className="space-y-2">
              {event.candidateDates.map((candidate) => (
                <div key={candidate.id} className="rounded-[18px] bg-muted/40 px-4 py-3 text-sm font-semibold">
                  <CandidateDateText value={candidate.candidateDate} locale={event.language} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 p-5 sm:p-6">
            <h2 className="text-xl font-extrabold">回答者一覧</h2>
            <div className="space-y-3">
              {results.responses.map((response) => (
                <div key={response.id} className="rounded-[22px] border border-border/80 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{response.name}</p>
                      <p className="text-sm text-foreground/60">
                        {response.comment || "コメントなし"}
                      </p>
                    </div>
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="inline-flex h-10 items-center justify-center rounded-[18px] border bg-white px-4 text-sm font-semibold"
                    >
                      編集画面で修正
                    </Link>
                  </div>
                </div>
              ))}

              {results.responses.length === 0 ? (
                <p className="text-sm text-foreground/60">まだ回答者はいません。</p>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
