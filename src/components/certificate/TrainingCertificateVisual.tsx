"use client";

import { forwardRef } from "react";
import { Award } from "lucide-react";
import type { CertificateTemplateData } from "@/lib/certificate-template";
import { safeCertificateBadgeColor } from "@/lib/certificate-template";
import { CertificateQr } from "./CertificateQr";

/** Matches `useLanguage().t` (multi-line objects + strings). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CertificateTranslateFn = (value: any) => string;

export interface TrainingCertificateVisualProps {
  template: CertificateTemplateData;
  recipientName: string;
  issueDate: string;
  /** Encoded in the QR code (e.g. official certificate number). */
  certificateId: string;
  t: CertificateTranslateFn;
}

export const TrainingCertificateVisual = forwardRef<
  HTMLDivElement,
  TrainingCertificateVisualProps
>(function TrainingCertificateVisual(
  { template, recipientName, issueDate, certificateId, t },
  ref,
) {
  const safeBadgeColor = safeCertificateBadgeColor(template.badgeColor);

  return (
    <div
      ref={ref}
      className="border-4 border-double rounded-xl p-6 sm:p-8 text-center space-y-4 bg-card"
      style={{ borderColor: safeBadgeColor }}
    >
      {/* Logo */}
      <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
        <img
          src="/assets/logo/logo.png"
          alt=""
          className="h-10 sm:h-12 w-auto object-contain"
        />
      </div>

      {/* Award icon */}
      <div className="flex justify-center">
        <Award className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: safeBadgeColor }} />
      </div>

      {/* Title & subtitle */}
      <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
        {t(template.title)}
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">
        {t(template.subtitle)}
      </p>

      {/* Recipient */}
      <div className="py-3 sm:py-4">
        <p className="text-base sm:text-lg text-foreground font-medium">
          {t({ en: "This certifies that", rw: "Ibi biremeza ko" })}
        </p>
        <p className="text-xl sm:text-2xl font-bold text-primary my-2 font-heading break-words">
          {recipientName}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          {t(template.description)}
        </p>
      </div>

      {/* Date of Completion & Signatory — above the QR divider */}
      <div className="pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:items-end sm:px-4">
          {/* Date */}
          <div className="text-center sm:text-left sm:min-w-0 sm:flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {t({ en: "Date of Completion", rw: "Itariki yuzuyeho" })}
            </p>
            <p className="text-sm font-medium text-foreground border-t border-foreground pt-1 px-3 inline-block">
              {issueDate}
            </p>
          </div>

          {/* Signatory */}
          <div className="text-center sm:text-right sm:min-w-0 sm:flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {t(template.signatoryTitle)}
            </p>
            <p className="text-sm font-medium text-foreground border-t border-foreground pt-1 px-3 inline-block italic">
              {t(template.signatoryName)}
            </p>
          </div>
        </div>
      </div>

      {/* QR code — bottom, full-width divider above it */}
      <div className="pt-4 border-t border-border flex flex-col items-center gap-1">
        <CertificateQr value={certificateId} size={72} />
        <span className="text-[10px] text-muted-foreground tracking-wide uppercase">
          {t({ en: "Scan to verify", rw: "Scan kugirango urebere" })}
        </span>
      </div>
    </div>
  );
});