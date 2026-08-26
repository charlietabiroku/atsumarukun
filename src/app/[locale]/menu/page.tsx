import { ArrowRight, ChevronLeft, CircleHelp, Plus, Settings2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NextLink from "next/link";

import { LanguageSwitcher } from "@/components/branding/language-switcher";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("menu");

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
            <ChevronLeft className="size-4" />
            {t("back")}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
          <Card className="overflow-hidden rounded-[36px] p-5 sm:p-8">
            <div className="mb-8 rounded-[28px] bg-[#f5fff8] p-5">
              <Logo compact />
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
              <h1 className="text-3xl font-extrabold tracking-tight">{t("headline")}</h1>
              <p className="text-sm leading-6 text-foreground/65">{t("subcopy")}</p>
            </div>

            <div className="space-y-3">
              <Link href="/create" className="block">
                <div className="group flex min-h-24 items-center gap-4 rounded-[26px] bg-primary px-5 py-4 text-primary-foreground transition-transform hover:-translate-y-0.5">
                  <div className="rounded-2xl bg-white/18 p-3">
                    <Plus className="size-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">{t("createEvent")}</p>
                    <p className="mt-1 text-sm text-white/80">{t("createEventDescription")}</p>
                  </div>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <NextLink href="/admin/login" className="block">
                <div className="group flex items-center gap-4 rounded-[26px] border border-border bg-white px-5 py-4 transition-colors hover:bg-muted/70">
                  <div className="rounded-2xl bg-muted p-3 text-foreground/70">
                    <Settings2 className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{t("admin")}</p>
                    <p className="mt-1 text-sm text-foreground/60">{t("adminDescription")}</p>
                  </div>
                  <ArrowRight className="size-5 text-foreground/45 transition-transform group-hover:translate-x-1" />
                </div>
              </NextLink>

              <div className="flex items-center gap-3 px-2 pt-2 text-sm leading-6 text-foreground/55">
                <CircleHelp className="size-4 shrink-0 text-primary" />
                <p>{t("help")}</p>
              </div>
            </div>
          </Card>

          <Link href="/create" className="mx-auto mt-5 sm:hidden">
            <Button size="lg" className="px-8">
              {t("createEvent")}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
