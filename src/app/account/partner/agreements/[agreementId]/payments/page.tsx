"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Banknote, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/context/PricingContext";
import type { Partner } from "@/data/community";
import { getPartnerApplications, getPartners } from "@/lib/partner-store";

const PAGE_SIZE = 5;

const payoutBadge: Record<string, string> = {
  paid: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
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
      {
        id: "mock-agr-2",
        title: "Regional Campaign Addendum",
        status: "expired",
        version: "v1.1",
        effectiveDate: "2025-08-01",
        endDate: "2025-12-20",
        termsSummary:
          "Campaign-based commission incentives for seasonal group and school tours.",
        updatedAt: "2025-12-20",
      },
      {
        id: "mock-agr-3",
        title: "Corporate Group Contract",
        status: "terminated",
        version: "v1.0",
        effectiveDate: "2025-04-10",
        endDate: "2025-06-30",
        termsSummary:
          "Corporate package contract terminated after delivery scope change by client.",
        updatedAt: "2025-06-30",
      },
    ],
    packages: [],
    payouts: [
      {
        id: "mock-pay-1",
        amount: 310000,
        date: "2026-03-05",
        period: "March 2026",
        agreementId: "mock-agr-1",
        agreementTitle: "Partnership Service Agreement",
        status: "paid",
        notes: "Monthly payout via MTN Mobile Money.",
      },
      {
        id: "mock-pay-2",
        amount: 295000,
        date: "2026-02-28",
        period: "February 2026",
        agreementId: "mock-agr-1",
        agreementTitle: "Partnership Service Agreement",
        status: "paid",
      },
      {
        id: "mock-pay-3",
        amount: 280000,
        date: "2026-01-31",
        period: "January 2026",
        agreementId: "mock-agr-1",
        agreementTitle: "Partnership Service Agreement",
        status: "paid",
      },
      {
        id: "mock-pay-4",
        amount: 220000,
        date: "2025-12-20",
        period: "December 2025",
        agreementId: "mock-agr-2",
        agreementTitle: "Regional Campaign Addendum",
        status: "paid",
      },
      {
        id: "mock-pay-5",
        amount: 240000,
        date: "2025-11-30",
        period: "November 2025",
        agreementId: "mock-agr-2",
        agreementTitle: "Regional Campaign Addendum",
        status: "paid",
      },
      {
        id: "mock-pay-6",
        amount: 350000,
        date: "2025-06-30",
        period: "Q2 2025",
        agreementId: "mock-agr-3",
        agreementTitle: "Corporate Group Contract",
        status: "paid",
      },
    ],
  };
}

export default function AgreementPaymentsPage() {
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

  const payouts = useMemo(() => {
    if (!displayPartner || !agreement) return [];
    return (displayPartner.payouts ?? [])
      .filter((entry) => entry.agreementId === agreement.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [displayPartner, agreement]);

  const totalPages = Math.max(1, Math.ceil(payouts.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [params.agreementId]);

  const paginatedPayouts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return payouts.slice(start, start + PAGE_SIZE);
  }, [payouts, page]);

  const totalPaid = payouts
    .filter((entry) => entry.status === "paid")
    .reduce((sum, entry) => sum + entry.amount, 0);

  if (!displayPartner) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/account/partner">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partner Page
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
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partner Page
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
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Agreements
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-heading mt-3">
            Payment History
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
              Total Paid
            </p>
            <p className="text-lg font-bold">{formatPrice(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Records
            </p>
            <p className="text-lg font-bold">{payouts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Payout Cycle
            </p>
            <p className="text-sm font-bold capitalize flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {displayPartner.payoutCycle}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Banknote className="h-4 w-4" /> Agreement Payments
          </h2>

          {paginatedPayouts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No payments recorded yet for this agreement.
            </p>
          ) : (
            <div className="space-y-2">
              {paginatedPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold">{payout.period}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {payout.date}
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
                      {payout.status}
                    </Badge>
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
