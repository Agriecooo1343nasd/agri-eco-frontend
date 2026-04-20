"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Banknote, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePricing } from "@/context/PricingContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchPartnerMe,
  fetchPartnerAgreementById,
  fetchPartnerAgreementPayments
} from "@/lib/api/partners";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const PAGE_SIZE = 5;

const payoutBadge: Record<string, string> = {
  paid: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AgreementPaymentsPage() {
  const params = useParams<{ agreementId: string }>();
  const { t } = useLanguage();
  const { formatPrice } = usePricing();
  const [page, setPage] = useState(1);

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

  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["partner-payments", params.agreementId, page],
    queryFn: () => fetchPartnerAgreementPayments(params.agreementId, { page, limit: PAGE_SIZE }),
    enabled: !!agreement,
    retry: false
  });

  if (isLoadingPartner || isLoadingAgreement || isLoadingPayments) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[40px] w-32" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const displayPartner = partnerData;
  const paginatedPayouts = paymentsData?.data || [];
  const totalPages = paymentsData?.pagination?.pages || 1;
  const summary = {
    totalPaid: paymentsData?.summary?.totalPaid || 0,
    records: paymentsData?.summary?.records || 0,
    payoutCycle: paymentsData?.summary?.payoutCycle || "monthly",
  };

  if (!displayPartner) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/account/partner">
            <ArrowLeft className="h-4 w-4 mr-1" /> {t(translations.common.back)}
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No partner profile was found for this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/account/partner">
            <ArrowLeft className="h-4 w-4 mr-1" /> {t(translations.common.back)}
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Agreement not found for your partner profile.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/partner">
              <ArrowLeft className="h-4 w-4 mr-1" /> {t(translations.partnerPage.agreements)}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-heading mt-3">
            {t(translations.partnerPage.paymentHistory)}
          </h1>
          <p className="text-xs text-muted-foreground">
            {agreement.title} · {displayPartner.name}
          </p>
        </div>
        <Badge className="text-[10px] capitalize">{t((translations.statuses as any)[agreement.status.toLowerCase()] || agreement.status)}</Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {t({ en: "Total Paid", rw: "Amafaranga yishyuwe yose", fr: "Total payé", sw: "Jumla iliyolipwa" })}
            </p>
            <p className="text-lg font-bold">{formatPrice(summary.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {t({ en: "Records", rw: "Inyandiko", fr: "Dossiers", sw: "Rekodi" })}
            </p>
            <p className="text-lg font-bold">{summary.records}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {t(translations.partnerPage.payoutCycle)}
            </p>
            <p className="text-sm font-bold capitalize flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {summary.payoutCycle || displayPartner.payoutCycle || "monthly"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Banknote className="h-4 w-4" /> {t({ en: "Agreement Payments", rw: "Inyishyu z'amasezerano", fr: "Paiements de l'accord", sw: "Malipo ya Mkataba" })}
          </h2>

          {paginatedPayouts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No payments recorded yet for this agreement.
            </p>
          ) : (
            <div className="space-y-2">
              {paginatedPayouts.map((payout: any) => (
                <div
                  key={payout.id}
                  className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold">{payout.period}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(payout.date).toLocaleDateString()}
                    </p>
                    {payout.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        {payout.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-foreground">
                      {formatPrice(payout.amount)}
                    </p>
                    <Badge
                      className={`text-[10px] capitalize border ${payoutBadge[payout.status]}`}
                    >
                      {t((translations.statuses as any)[payout.status.toLowerCase()] || payout.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              {t(translations.common.page)} {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                {t(translations.common.previous)}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                {t(translations.common.next)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
