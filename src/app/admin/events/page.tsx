import { Metadata } from "next";

import { AdminEventsDashboard } from "@/components/admin/admin-events-dashboard";
import { requireAdminAuth } from "@/lib/admin/auth";
import { getAdminEventSummaries } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "イベント一覧 | 集丸くん",
};

export default async function AdminEventsPage() {
  await requireAdminAuth();
  const events = await getAdminEventSummaries();

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
        <AdminEventsDashboard initialEvents={events} />
      </div>
    </main>
  );
}
