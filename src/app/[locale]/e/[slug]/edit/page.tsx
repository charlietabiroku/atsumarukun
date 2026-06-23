import { redirect } from "next/navigation";
import { getEventBySlug } from "@/lib/db/queries";
import { requireAdminAuth } from "@/lib/admin/auth";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko"; slug: string }>;
}) {
  await requireAdminAuth();
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    redirect("/admin/events");
  }

  redirect(`/admin/events/${event.id}/edit`);
}
