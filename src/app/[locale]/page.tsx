import { ArrowRight, Globe2, ShieldCheck, Smartphone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/branding/language-switcher";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";

export default async function TopPage({
  params,
}: {
  params: Promise<{ locale: "ja" | "zh" | "en" | "ko" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("top");
  const common = await getTranslations("common");

  const points = [
    { icon: Globe2, title: t("points.languagesTitle"), body: t("points.languagesBody") },
    { icon: Smartphone, title: t("points.mobileTitle"), body: t("points.mobileBody") },
    { icon: ShieldCheck, title: t("points.noLoginTitle"), body: t("points.noLoginBody") },
  ];

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-8 flex justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6">
          <Card className="overflow-hidden rounded-[36px] p-6 sm:p-8">
            <div className="space-y-6">
              <div className="rounded-[28px] bg-[#f5fff8] p-5">
                <Logo />
              </div>

              <div className="space-y-3">
                <p className="inline-flex items-center rounded-full bg-[#f5fff8] px-3 py-2 text-sm font-semibold text-primary">
                  {common("catchcopy")}
                </p>
                <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {t("headline")}
                </h1>
                <p className="text-balance text-base leading-7 text-foreground/68">
                  {t("subcopy")}
                </p>
              </div>

              <Link href="/create" className="block">
                <Button size="lg" className="w-full text-base">
                  {t("cta")}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </Card>

          <div className="grid gap-3">
            {points.map((point) => {
              const Icon = point.icon;
              return (
                <Card key={point.title} className="flex items-start gap-4 p-5">
                  <div className="rounded-2xl bg-[#f5fff8] p-3">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{point.title}</p>
                    <p className="mt-1 text-sm leading-6 text-foreground/65">{point.body}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
