import { ChevronLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/branding/language-switcher";
import { CreateForm } from "@/components/event/create-form";
import { Card } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";

export default async function CreatePage({
  params,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("create");

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
            <ChevronLeft className="size-4" />
            {t("back")}
          </Link>
          <LanguageSwitcher />
        </div>

        <Card className="mx-auto w-full max-w-2xl p-5 sm:p-7">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold">{t("headline")}</h1>
            <p className="mt-2 text-sm leading-6 text-foreground/65">{t("subcopy")}</p>
          </div>
          <CreateForm />
        </Card>
      </div>
    </main>
  );
}
