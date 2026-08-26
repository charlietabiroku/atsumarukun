"use client";

import { ChevronDown, Languages, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { routing } from "@/lib/i18n/routing";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="default"
          className="h-10 rounded-full px-4 text-xs"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => setIsOpen((current) => !current)}
        >
          <Languages className="mr-2 size-4 text-primary" />
          {t("language")}: {t(`localeNames.${locale}`)}
          <ChevronDown className="ml-2 size-4" />
        </Button>
        {isOpen ? (
          <div
            role="listbox"
            aria-label={t("language")}
            className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-border bg-white p-1 shadow-[0_16px_40px_rgba(17,17,17,0.14)]"
          >
            {routing.locales.map((nextLocale) => (
              <button
                key={nextLocale}
                type="button"
                role="option"
                aria-selected={locale === nextLocale}
                className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                  locale === nextLocale
                    ? "bg-[#f5fff8] text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  setIsOpen(false);
                  router.replace(pathname, { locale: nextLocale });
                }}
              >
                {t(`localeNames.${nextLocale}`)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
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
