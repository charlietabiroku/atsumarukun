"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ShareCard({
  shareUrl,
  resultsUrl,
}: {
  shareUrl: string;
  resultsUrl: string;
}) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground/60">{t("eventUrl")}</p>
        <p className="break-all rounded-2xl bg-muted px-4 py-3 text-sm">{shareUrl}</p>
      </div>
      <div className="flex gap-3">
        <Button className="flex-1" onClick={copyUrl}>
          {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
          {copied ? t("copied") : t("copy")}
        </Button>
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => window.open(resultsUrl, "_blank", "noopener,noreferrer")}
        >
          {t("viewResults")}
        </Button>
      </div>
    </Card>
  );
}
