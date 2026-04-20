"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricing } from "@/context/PricingContext";
import { fetchPartnerMe, fetchPartnerAgreementById } from "@/lib/api/partners";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function AgreementDetailsPage() {
  const params = useParams<{ agreementId: string }>();
  const { t } = useLanguage();
  const { formatPrice } = usePricing();

  const { data: partnerData, isLoading: isLoadingPartner } = useQuery({
    queryKey: ["partner-me"],
    queryFn: fetchPartnerMe,
    retry: false
  });

  const { data: agreement, isLoading: isLoadingAgreement } = useQuery({
    queryKey: ["partner-agreement", params.agreementId],
    queryFn: () => fetchPartnerAgreementById(params.agreementId),
    retry: false
  });

  if (isLoadingPartner || isLoadingAgreement) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[40px] w-32" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const displayPartner = partnerData;

  const paidTotal = agreement?.paidToDate || 0;

  if (!displayPartner || !agreement) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/account/partner">
            <ArrowLeft className="h-4 w-4 mr-1" /> {t(translations.common.back)}
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {t(translations.partnerPage.noAgreements)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/account/partner">
            <ArrowLeft className="h-4 w-4 mr-1" /> {t(translations.partnerPage.agreements)}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-heading mt-3">
          {t(translations.partnerPage.agreementDetails)}
        </h1>
        <p className="text-xs text-muted-foreground">
          {displayPartner.name}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> {agreement.title}
            </h2>
            <Badge className="text-[10px] capitalize">{t((translations.statuses as any)[agreement.status.toLowerCase()] || agreement.status)}</Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="border border-border rounded-lg p-3 space-y-1">
              <p>
                <span className="text-muted-foreground">{t({ en: "Version", rw: "Imiterere", fr: "Version", sw: "Toleo" })}:</span>{" "}
                {agreement.version}
              </p>
              <p>
                <span className="text-muted-foreground">{t({ en: "Effective", rw: "Byatangiye", fr: "Effectif", sw: "Inaanza" })}:</span>{" "}
                {new Date(agreement.effectiveDate).toLocaleDateString()}
              </p>
              <p>
                <span className="text-muted-foreground">{t({ en: "End Date", rw: "Igihe kizarangirira", fr: "Date de fin", sw: "Tarehe ya Mwisho" })}:</span>{" "}
                {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString() : t({ en: "Open", rw: "Bifunguye", fr: "Ouvert", sw: "Wazi" })}
              </p>
              <p>
                <span className="text-muted-foreground">{t({ en: "Last Updated", rw: "Byavuguruwe", fr: "Dernière mise à jour", sw: "Ilisasishwa Mwisho" })}:</span>{" "}
                {agreement.updatedAt ? new Date(agreement.updatedAt).toLocaleDateString() : "-"}
              </p>
            </div>
            <div className="border border-border rounded-lg p-3 space-y-1">
              <p>
                <span className="text-muted-foreground">{t({ en: "Paid to Date", rw: "Ayishyuwe kugeza ubu", fr: "Payé à ce jour", sw: "Zilizolipwa kufikia Sasa" })}:</span>{" "}
                <strong>{formatPrice(paidTotal)}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">{t({ en: "Partner", rw: "Umufatanyabikorwa", fr: "Partenaire", sw: "Mshirika" })}:</span>{" "}
                {displayPartner.contactName}
              </p>
              <p>
                <span className="text-muted-foreground">{t({ en: "Business Email", rw: "Imeri", fr: "Email professionnel", sw: "Barua pepe ya Biashara" })}:</span>{" "}
                {displayPartner.email}
              </p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-3 text-xs">
            <p className="text-muted-foreground mb-1">{t({ en: "Terms Summary", rw: "Inshamake y'amasezerano", fr: "Résumé des conditions", sw: "Muhtasari wa Masharti" })}</p>
            <p>{agreement.termsSummary}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="text-xs" asChild>
              <Link
                href={`/account/partner/agreements/${agreement.id}/payments`}
              >
                {t(translations.partnerPage.paymentHistory)}
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="text-xs" asChild>
              <Link
                href={`/account/partner/agreements/${agreement.id}/inputs`}
              >
                {t({ en: "View Inputs", rw: "Reba ibikoreshwa", fr: "Voir les intrants", sw: "Angalia Vipengele" })}
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="text-xs" asChild>
              <Link href="/account/partner">{t({ en: "Back to All Agreements", rw: "Subira ku masezerano yose", fr: "Retour à tous les accords", sw: "Rudi kwenye Mikataba Yote" })}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
