"use client";

import { Languages, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { routing } from "@/lib/i18n/routing";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-semibold">
        <Languages className="size-4 text-primary" />
        <span>{t("language")}</span>
      </div>
      {routing.locales.map((nextLocale) => (
        <Button
          key={nextLocale}
          variant={locale === nextLocale ? "default" : "outline"}
          size="default"
          className="h-10 rounded-full px-4 text-xs"
          onClick={() => router.replace(pathname, { locale: nextLocale })}
        >
          {t(`localeNames.${nextLocale}`)}
        </Button>
      ))}
      {pathname !== "/create" ? (
        <Link
          href="/create"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold transition-colors hover:bg-muted"
        >
          <Plus className="size-4 text-primary" />
          {t("createEvent")}
        </Link>
      ) : null}
    </div>
  );
}
