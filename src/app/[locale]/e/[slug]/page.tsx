import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/branding/language-switcher";
import { ResponseForm } from "@/components/response/response-form";
import { Card } from "@/components/ui/card";
import { getEventBySlug } from "@/lib/db/queries";

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("response");
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher />
        </div>

        <Card className="mx-auto w-full max-w-2xl p-5 sm:p-7">
          <div className="mb-6 space-y-2">
            <p className="text-sm font-semibold text-primary">{t("headline")}</p>
            <h1 className="text-3xl font-extrabold">{event.title}</h1>
            {event.description ? (
              <p className="text-sm leading-6 text-foreground/65">{event.description}</p>
            ) : null}
          </div>
          <ResponseForm event={event} />
        </Card>
      </div>
    </main>
  );
}
