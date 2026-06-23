import { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireAdminAuth } from "@/lib/admin/auth";
import { getAllEventsForAdmin } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "イベント一覧 | 集丸くん",
};

export default async function AdminEventsPage() {
  await requireAdminAuth();
  const events = await getAllEventsForAdmin();

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">管理画面</p>
            <h1 className="mt-2 text-3xl font-extrabold">イベント一覧</h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="inline-flex h-11 items-center justify-center rounded-[22px] border bg-white px-5 text-sm font-semibold">
              ログアウト
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="space-y-3 p-5 sm:p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold">{event.title}</h2>
                <p className="text-sm text-foreground/60">
                  作成日 {new Date(event.created_at).toLocaleString("ja-JP")}
                </p>
              </div>

              {event.description ? (
                <p className="text-sm leading-6 text-foreground/70">{event.description}</p>
              ) : null}

              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-muted px-3 py-1">
                  言語 {event.language}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  受付 {event.reception_status}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  共有URL {event.share_enabled ? "有効" : "無効"}
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="inline-flex h-12 items-center justify-center rounded-[22px] bg-primary px-5 text-sm font-semibold text-white"
                >
                  詳細を見る
                </Link>
                <Link
                  href={`/ja/e/${event.slug}/results`}
                  className="inline-flex h-12 items-center justify-center rounded-[22px] border bg-white px-5 text-sm font-semibold"
                >
                  公開結果を確認
                </Link>
              </div>
            </Card>
          ))}

          {events.length === 0 ? (
            <Card className="p-6 text-sm text-foreground/60">
              イベントはまだありません。
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}
