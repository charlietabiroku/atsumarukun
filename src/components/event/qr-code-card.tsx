"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

export function QrCodeCard({ value }: { value: string }) {
  const t = useTranslations("share");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: 220,
      margin: 1,
      color: {
        dark: "#111111",
        light: "#FFFFFF",
      },
    }).then(setDataUrl);
  }, [value]);

  return (
    <Card className="flex flex-col items-center gap-3 p-5">
      <p className="text-sm font-semibold text-foreground/60">{t("qrCode")}</p>
      {dataUrl ? (
        <Image
          src={dataUrl}
          alt={t("qrCode")}
          width={176}
          height={176}
          unoptimized
          className="h-44 w-44 rounded-2xl"
        />
      ) : (
        <div className="h-44 w-44 animate-pulse rounded-2xl bg-muted" />
      )}
    </Card>
  );
}
