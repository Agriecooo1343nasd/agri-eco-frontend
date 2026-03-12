"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/context/PricingContext";
import type { Partner } from "@/data/community";
import { getPartnerApplications, getPartners } from "@/lib/partner-store";

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
    ],
  };
}

export default function AgreementDetailsPage() {
  const params = useParams<{ agreementId: string }>();
  const { user } = useAuth();
  const { formatPrice } = usePricing();

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

  const displayPartner =
    partner ||
    (!userApplication ? buildMockPartner(user?.name, user?.email) : null);

  const agreement = useMemo(
    () =>
      displayPartner?.agreements.find(
        (entry) => entry.id === params.agreementId,
      ) || null,
    [displayPartner, params.agreementId],
  );

  const paidTotal = useMemo(() => {
    if (!displayPartner || !agreement) return 0;
    return (displayPartner.payouts ?? [])
      .filter(
        (entry) =>
          entry.agreementId === agreement.id && entry.status === "paid",
      )
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [displayPartner, agreement]);

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
            Agreement not found for your partner profile.
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
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Agreements
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-heading mt-3">
          Agreement Details
        </h1>
        <p className="text-xs text-muted-foreground">
          {displayPartner.businessName}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> {agreement.title}
            </h2>
            <Badge className="text-[10px] capitalize">{agreement.status}</Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="border border-border rounded-lg p-3 space-y-1">
              <p>
                <span className="text-muted-foreground">Version:</span>{" "}
                {agreement.version}
              </p>
              <p>
                <span className="text-muted-foreground">Effective:</span>{" "}
                {agreement.effectiveDate}
              </p>
              <p>
                <span className="text-muted-foreground">End Date:</span>{" "}
                {agreement.endDate || "Open"}
              </p>
              <p>
                <span className="text-muted-foreground">Last Updated:</span>{" "}
                {agreement.updatedAt}
              </p>
            </div>
            <div className="border border-border rounded-lg p-3 space-y-1">
              <p>
                <span className="text-muted-foreground">Paid to Date:</span>{" "}
                <strong>{formatPrice(paidTotal)}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Partner:</span>{" "}
                {displayPartner.contactPerson}
              </p>
              <p>
                <span className="text-muted-foreground">Business Email:</span>{" "}
                {displayPartner.email}
              </p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-3 text-xs">
            <p className="text-muted-foreground mb-1">Terms Summary</p>
            <p>{agreement.termsSummary}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="text-xs" asChild>
              <Link
                href={`/account/partner/agreements/${agreement.id}/payments`}
              >
                View Payment History
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="text-xs" asChild>
              <Link
                href={`/account/partner/agreements/${agreement.id}/inputs`}
              >
                View Inputs
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="text-xs" asChild>
              <Link href="/account/partner">Back to All Agreements</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
