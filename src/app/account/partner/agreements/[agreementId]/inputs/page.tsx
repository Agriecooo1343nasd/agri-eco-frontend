"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Boxes, HandCoins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePricing } from "@/context/PricingContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchPartnerMe,
  fetchPartnerAgreementById,
  fetchPartnerAgreementInputs
} from "@/lib/api/partners";
import type { PartnerInputRecord } from "@/data/community";

const PAGE_SIZE = 5;

const kindBadge: Record<PartnerInputRecord["kind"], string> = {
  financial: "bg-primary/10 text-primary border-primary/20",
  "in-kind": "bg-muted text-muted-foreground border-border",
};

const storageBadge: Record<PartnerInputRecord["storageCategory"], string> = {
  capital: "bg-emerald-100 text-emerald-700 border-emerald-200",
  operations: "bg-sky-100 text-sky-700 border-sky-200",
  marketing: "bg-purple-100 text-purple-700 border-purple-200",
  community: "bg-amber-100 text-amber-700 border-amber-200",
  other: "bg-muted text-muted-foreground border-border",
};

export default function AgreementInputsPage() {
  const params = useParams<{ agreementId: string }>();
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

  const { data: inputsData, isLoading: isLoadingInputs } = useQuery({
    queryKey: ["partner-inputs", params.agreementId, page],
    queryFn: () => fetchPartnerAgreementInputs(params.agreementId, { page, limit: PAGE_SIZE }),
    enabled: !!agreement,
    retry: false
  });

  if (isLoadingPartner || isLoadingAgreement || isLoadingInputs) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[40px] w-32" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const displayPartner = partnerData;
  const paginatedInputs = inputsData?.data || [];
  const totalPages = inputsData?.pagination?.pages || 1;
  const summary = {
    totalFinancial: inputsData?.summary?.financialSupport || 0,
    records: inputsData?.summary?.totalInputs || 0,
    financialCount: inputsData?.summary?.inputMix?.financial || 0,
    inKindCount: inputsData?.summary?.inputMix?.inKind || 0,
  };

  if (!displayPartner || !agreement) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/account/partner">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partner
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No inputs were found for this agreement.
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
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Agreements
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-heading mt-3">
            Partner Inputs
          </h1>
          <p className="text-xs text-muted-foreground">
            {agreement.title} · {displayPartner.name}
          </p>
        </div>
        <Badge className="text-[10px] capitalize">{agreement.status}</Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Financial Support
            </p>
            <p className="text-lg font-bold">{formatPrice(summary.totalFinancial)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Inputs
            </p>
            <p className="text-lg font-bold">{summary.records}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Input Mix
            </p>
            <p className="text-xs text-muted-foreground">
              Financial:{" "}
              {summary.financialCount || 0} ·
              In-kind:{" "}
              {summary.inKindCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <HandCoins className="h-4 w-4" /> Inputs Linked to this Agreement
          </h2>

          {paginatedInputs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No inputs recorded yet for this agreement.
            </p>
          ) : (
            <div className="space-y-2">
              {paginatedInputs.map((input: any) => (
                <div
                  key={input.id}
                  className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold">{input.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(input.date).toLocaleDateString()}
                    </p>
                    {input.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        {input.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] capitalize border ${kindBadge[input.kind as PartnerInputRecord["kind"]] || "bg-muted"}`}
                      >
                        {input.kind === "financial" ? "Financial" : "In-kind"}
                      </Badge>
                      <Badge
                        className={`text-[10px] capitalize border ${storageBadge[input.storageCategory as PartnerInputRecord["storageCategory"]] || "bg-muted"}`}
                      >
                        {input.storageCategory}
                      </Badge>
                    </div>
                    {typeof input.amount === "number" && (
                      <p className="text-sm font-bold text-foreground">
                        {formatPrice(input.amount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
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
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

