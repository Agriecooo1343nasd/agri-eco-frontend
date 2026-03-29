"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

/** Renders a QR code encoding the given value (e.g. certificate number). */
export function CertificateQr({
  value,
  size = 64,
}: {
  value: string;
  size?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!value.trim()) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(value.trim(), {
          width: Math.max(96, size * 2),
          margin: 1,
          errorCorrectionLevel: "M",
          color: { dark: "#0f172a", light: "#ffffff" },
        });
        if (!cancelled) setSrc(url);
      } catch {
        if (!cancelled) setSrc(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!value.trim()) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-border bg-accent/30"
        style={{ width: size, height: size }}
      >
        <QrCode
          className="text-muted-foreground"
          style={{ width: size * 0.55, height: size * 0.55 }}
        />
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className="animate-pulse rounded-lg border-2 border-border bg-muted"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="rounded-md border border-border bg-white object-contain"
    />
  );
}
