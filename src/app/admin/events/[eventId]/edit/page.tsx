import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminEventEditor } from "@/components/admin/admin-event-editor";
import { requireAdminAuth } from "@/lib/admin/auth";
import { getAdminEventById } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "イベント編集 | 集丸くん",
};

export default async function AdminEventEditPage({
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

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5">
          <Link
            href={`/admin/events/${payload.event.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ChevronLeft className="size-4" />
            詳細へ戻る
          </Link>
        </div>

        <AdminEventEditor
          event={payload.event}
          responses={payload.results.responses}
        />
      </div>
    </main>
  );
}
