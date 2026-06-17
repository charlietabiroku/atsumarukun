import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/branding/language-switcher";
import { QrCodeCard } from "@/components/event/qr-code-card";
import { ShareCard } from "@/components/event/share-card";
import { Card } from "@/components/ui/card";
import { getEventBySlug } from "@/lib/db/queries";
import { buildAbsoluteUrl, buildEventUrl } from "@/lib/utils";

export default async function SharePage({
  params,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("share");
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const shareUrl = buildAbsoluteUrl(buildEventUrl(locale, slug));
  const resultsUrl = buildAbsoluteUrl(`/${locale}/e/${slug}/results`);

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-4">
          <Card className="p-5 sm:p-7">
            <p className="text-sm font-semibold text-primary">{t("headline")}</p>
            <h1 className="mt-2 text-3xl font-extrabold">{event.title}</h1>
            <p className="mt-2 text-sm leading-6 text-foreground/65">{t("subcopy")}</p>
          </Card>
          <ShareCard shareUrl={shareUrl} resultsUrl={resultsUrl} />
          <QrCodeCard value={shareUrl} />
        </div>
      </div>
    </main>
  );
}
