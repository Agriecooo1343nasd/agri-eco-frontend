"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Boxes, HandCoins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/context/PricingContext";
import type { Partner, PartnerInputRecord } from "@/data/community";
import { getPartnerApplications, getPartners } from "@/lib/partner-store";

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

function buildMockPartner(
  name?: string | null,
  email?: string | null,
): Partner {
  return {
    id: "mock-partner",
    businessName: "Demo Eco Tours",
    contactPerson: name || "Partner User",
    email: email || "partner@example.com",
    phone: "+250 788 000 000",
    type: "tourism-operator",
    aboutBusiness:
      "A showcase partner profile used when your account is not linked to a live partner yet.",
    status: "active",
    networkStatus: "verified",
    commissionRate: 12,
    partnerSharePercent: 88,
    platformSharePercent: 12,
    grossRevenue: 2400000,
    partnerEarnings: 2112000,
    platformEarnings: 288000,
    payoutCycle: "monthly",
    payoutStatus: "paid",
    lastPayoutDate: "2026-03-05",
    totalBookings: 28,
    totalRevenue: 2400000,
    joinedDate: "2025-11-14",
    contractStartDate: "2025-11-14",
    contractEndDate: "2027-11-13",
    agreements: [
      {
        id: "mock-agr-1",
        title: "Partnership Service Agreement",
        status: "active",
        version: "v2.0",
        effectiveDate: "2025-11-14",
        endDate: "2027-11-13",
        termsSummary:
          "Defines booking distribution, revenue sharing, quality standards, and guest support expectations.",
        updatedAt: "2026-02-10",
      },
    ],
    packages: [],
    payouts: [],
    inputs: [
      {
        id: "mock-inp-1",
        kind: "financial",
        amount: 300000,
        date: "2025-11-10",
        agreementId: "mock-agr-1",
        agreementTitle: "Partnership Service Agreement",
        storageCategory: "capital",
        description: "Initial capital contribution to support launch activities.",
      },
      {
        id: "mock-inp-2",
        kind: "in-kind",
        date: "2026-01-15",
        agreementId: "mock-agr-1",
        agreementTitle: "Partnership Service Agreement",
        storageCategory: "operations",
        description: "Provision of transport for school groups during pilot period.",
        notes: "Tracked off-balance-sheet as in-kind support.",
      },
    ],
  };
}

export default function AgreementInputsPage() {
  const params = useParams<{ agreementId: string }>();
  const { user } = useAuth();
  const { formatPrice } = usePricing();
  const [page, setPage] = useState(1);

  const partners = getPartners();
  const applications = getPartnerApplications();
  const userEmail = user?.email?.toLowerCase();

  const partner = userEmail
    ? partners.find((entry) => entry.email.toLowerCase() === userEmail) || null
    : null;

  const userApplication = userEmail
    ? applications.find((entry) => entry.email.toLowerCase() === userEmail) ||
      null
    : null;

  const demoPartner = buildMockPartner(user?.name, user?.email);
  const displayPartner = partner || (!userApplication ? demoPartner : null);

  const agreement =
    displayPartner?.agreements.find(
      (entry) => entry.id === params.agreementId,
    ) || null;

  const inputs = useMemo(() => {
    if (!displayPartner || !agreement) return [];
    return (displayPartner.inputs ?? [])
      .filter((entry) => entry.agreementId === agreement.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [displayPartner, agreement]);

  const totalPages = Math.max(1, Math.ceil(inputs.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [params.agreementId]);

  const paginatedInputs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return inputs.slice(start, start + PAGE_SIZE);
  }, [inputs, page]);

  const totalFinancial = inputs
    .filter((entry) => entry.kind === "financial" && typeof entry.amount === "number")
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);

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
            {agreement.title} · {displayPartner.businessName}
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
            <p className="text-lg font-bold">{formatPrice(totalFinancial)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Inputs
            </p>
            <p className="text-lg font-bold">{inputs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Input Mix
            </p>
            <p className="text-xs text-muted-foreground">
              Financial:{" "}
              {inputs.filter((entry) => entry.kind === "financial").length} ·
              In-kind:{" "}
              {inputs.filter((entry) => entry.kind === "in-kind").length}
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
              {paginatedInputs.map((input) => (
                <div
                  key={input.id}
                  className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold">{input.description}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {input.date}
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
                        className={`text-[10px] capitalize border ${kindBadge[input.kind]}`}
                      >
                        {input.kind === "financial" ? "Financial" : "In-kind"}
                      </Badge>
                      <Badge
                        className={`text-[10px] capitalize border ${storageBadge[input.storageCategory]}`}
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

