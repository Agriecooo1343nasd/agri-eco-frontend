import type { MultiLangText } from "@/lib/api/education";

export type CertificateTemplateData = {
  title: MultiLangText;
  subtitle: MultiLangText;
  description: MultiLangText;
  signatoryTitle: MultiLangText;
  signatoryName: MultiLangText;
  badgeColor?: string;
};

export const DEFAULT_CERTIFICATE_TEMPLATE: CertificateTemplateData = {
  title: { en: "Certificate of Completion", rw: "Impamyabumenyi yo Gusoza" },
  subtitle: { en: "Agri-Eco Training Program", rw: "Amahugurwa ya Agri-Eco" },
  description: {
    en: "has successfully completed all requirements of this program.",
    rw: "yasoje ibisaba byose by'iyi gahunda.",
  },
  signatoryTitle: { en: "Authorized Representative", rw: "Umukozi wemewe" },
  signatoryName: { en: "Agri-Eco Academy", rw: "Agri-Eco Academy" },
  badgeColor: "#15803d",
};

export function mergeTemplateWithDefaults(
  partial: Partial<CertificateTemplateData> | null | undefined,
): CertificateTemplateData {
  if (!partial) return { ...DEFAULT_CERTIFICATE_TEMPLATE };
  return {
    title: partial.title ?? DEFAULT_CERTIFICATE_TEMPLATE.title,
    subtitle: partial.subtitle ?? DEFAULT_CERTIFICATE_TEMPLATE.subtitle,
    description: partial.description ?? DEFAULT_CERTIFICATE_TEMPLATE.description,
    signatoryTitle:
      partial.signatoryTitle ?? DEFAULT_CERTIFICATE_TEMPLATE.signatoryTitle,
    signatoryName:
      partial.signatoryName ?? DEFAULT_CERTIFICATE_TEMPLATE.signatoryName,
    badgeColor:
      partial.badgeColor ?? DEFAULT_CERTIFICATE_TEMPLATE.badgeColor,
  };
}

export function parseCertificateTemplateJson(
  raw: string | null | undefined,
): CertificateTemplateData | null {
  if (!raw || !String(raw).trim()) return null;
  try {
    const o = JSON.parse(String(raw)) as Partial<CertificateTemplateData>;
    if (!o || typeof o !== "object") return null;
    return mergeTemplateWithDefaults(o);
  } catch {
    return null;
  }
}

/** Resolve template from API string field; fall back to default layout. */
export function templateFromProgramField(
  certificateTemplate: string | undefined | null,
): CertificateTemplateData {
  return parseCertificateTemplateJson(certificateTemplate) ?? {
    ...DEFAULT_CERTIFICATE_TEMPLATE,
  };
}

export function safeCertificateBadgeColor(color?: string): string {
  const fallback = DEFAULT_CERTIFICATE_TEMPLATE.badgeColor ?? "#15803d";
  if (!color || typeof color !== "string") return fallback;
  const c = color.trim();
  if (c.startsWith("oklch")) return fallback;
  return c;
}

/** Export certificate DOM as PNG (html-to-image). */
export async function exportCertificateToPng(
  node: HTMLElement,
  options?: { pixelRatio?: number },
): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(node, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio:
      options?.pixelRatio ??
      (typeof window !== "undefined" && window.devicePixelRatio >= 2
        ? 2
        : 1.5),
  });
}
