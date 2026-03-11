"use client";

import { type FormEvent, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Handshake,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/context/PricingContext";
import type { Partner, PartnerApplication } from "@/data/community";
import {
  appendPartnerApplication,
  getPartnerApplications,
  getPartners,
} from "@/lib/partner-store";
import Link from "next/link";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
  terminated: "bg-destructive/10 text-destructive border-destructive/20",
};

const applicationBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function buildAgreementEarnings(partner: Partner) {
  const earnings: Record<string, number> = {};
  (partner.payouts ?? []).forEach((entry) => {
    if (!entry.agreementId || entry.status !== "paid") return;
    earnings[entry.agreementId] =
      (earnings[entry.agreementId] ?? 0) + entry.amount;
  });
  return earnings;
}

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
    packages: [
      {
        id: "mock-pkg-1",
        name: "Farm & Culture Weekend",
        description: "2-day package with farm immersion and artisan workshop.",
        tourIds: ["tour-1", "tour-4"],
        price: 185000,
        active: true,
      },
      {
        id: "mock-pkg-2",
        name: "School Eco-Learning Day",
        description:
          "Educational day trip package for schools and institutions.",
        tourIds: ["tour-2"],
        price: 120000,
        active: true,
      },
    ],
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
        notes: "Final payment, contract expired.",
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
        notes: "Final settlement, contract terminated.",
      },
    ],
  };
}

export default function AccountPartnerPage() {
  const { user } = useAuth();
  const { formatPrice } = usePricing();

  const [partners] = useState<Partner[]>(() => getPartners());
  const [applications, setApplications] = useState<PartnerApplication[]>(() =>
    getPartnerApplications(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: user?.name || "",
    email: user?.email || "",
    phone: "",
    type: "tourism-operator",
    aboutBusiness: "",
  });

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
  const isMockData = !partner && !!displayPartner;

  const agreementEarnings = displayPartner
    ? buildAgreementEarnings(displayPartner)
    : {};

  const activeAgreements = displayPartner
    ? displayPartner.agreements.filter(
        (agreement) => agreement.status === "active",
      )
    : [];

  const endedAgreements = displayPartner
    ? displayPartner.agreements.filter(
        (agreement) => agreement.status !== "active",
      )
    : [];

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.businessName ||
      !form.contactPerson ||
      !form.email ||
      !form.phone
    ) {
      toast.error("Missing Required Fields", {
        description:
          "Please provide business name, contact person, email and phone.",
      });
      return;
    }

    const created = appendPartnerApplication({
      businessName: form.businessName,
      contactPerson: form.contactPerson,
      email: form.email,
      phone: form.phone,
      type: form.type as PartnerApplication["type"],
      aboutBusiness: form.aboutBusiness || "No business summary provided.",
    });

    setApplications((prev) => [created, ...prev]);
    setDialogOpen(false);
    toast.success("Application Submitted", {
      description: "Your partner application is now pending admin review.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-3xl text-primary-foreground p-6 md:p-8 relative overflow-hidden">
        <h1 className="text-2xl font-bold font-heading">Partner Network</h1>
        <p className="text-primary-foreground/80 text-sm mt-2 max-w-2xl">
          Track your partnership status, agreements, revenue share and payouts
          in one place.
        </p>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {displayPartner ? (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Partnership Status
                </p>
                <Badge
                  className={`${statusBadge[displayPartner.status]} text-[10px] capitalize`}
                >
                  {displayPartner.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Network: {displayPartner.networkStatus}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Gross Revenue
                </p>
                <p className="text-lg font-bold">
                  {formatPrice(displayPartner.grossRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Bookings: {displayPartner.totalBookings}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Your Earnings
                </p>
                <p className="text-lg font-bold">
                  {formatPrice(displayPartner.partnerEarnings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Share: {displayPartner.partnerSharePercent}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Payout
                </p>
                <p className="text-sm font-bold capitalize">
                  {displayPartner.payoutCycle}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {displayPartner.payoutStatus}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Handshake className="h-4 w-4" /> Partner Overview
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">Business:</span>{" "}
                    {displayPartner.businessName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Contact:</span>{" "}
                    {displayPartner.contactPerson}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {displayPartner.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">Commission:</span>{" "}
                    {displayPartner.commissionRate}%
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Platform Share:
                    </span>{" "}
                    {displayPartner.platformSharePercent}%
                  </p>
                  <p>
                    <span className="text-muted-foreground">Last Payout:</span>{" "}
                    {displayPartner.lastPayoutDate || "Not yet paid"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {displayPartner.aboutBusiness}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Agreements
              </h2>
              {displayPartner.agreements.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No agreements found.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Active Contracts
                      </p>
                      <p className="text-xl font-bold mt-1">
                        {activeAgreements.length}
                      </p>
                    </div>
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Ended / Terminated
                      </p>
                      <p className="text-xl font-bold mt-1">
                        {endedAgreements.length}
                      </p>
                    </div>
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        Total Contract Earnings
                      </p>
                      <p className="text-sm font-bold mt-2">
                        {formatPrice(displayPartner.partnerEarnings)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Active Agreements
                    </p>
                    {activeAgreements.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No active agreements at the moment.
                      </p>
                    ) : (
                      activeAgreements.map((agreement) => (
                        <div
                          key={agreement.id}
                          className="border border-border rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold">
                              {agreement.title}
                            </p>
                            <Badge className="text-[10px] capitalize">
                              {agreement.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {agreement.termsSummary}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {agreement.version} - {agreement.effectiveDate} -{" "}
                            {agreement.endDate || "Open"}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs font-medium text-primary">
                              Earnings:{" "}
                              {formatPrice(
                                agreementEarnings[agreement.id] || 0,
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                asChild
                              >
                                <Link
                                  href={`/account/partner/agreement/${agreement.id}`}
                                >
                                  View Agreement
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                asChild
                              >
                                <Link
                                  href={`/account/partner/agreements/${agreement.id}/payments`}
                                >
                                  Payment History
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Contract History (Ended / Terminated)
                    </p>
                    {endedAgreements.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No ended or terminated agreements yet.
                      </p>
                    ) : (
                      endedAgreements.map((agreement) => (
                        <div
                          key={agreement.id}
                          className="border border-border rounded-lg p-3 bg-muted/10"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold">
                              {agreement.title}
                            </p>
                            <Badge className="text-[10px] capitalize">
                              {agreement.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {agreement.termsSummary}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {agreement.version} - {agreement.effectiveDate} -{" "}
                            {agreement.endDate || "Open"}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs font-medium text-foreground">
                              Earnings made:{" "}
                              {formatPrice(
                                agreementEarnings[agreement.id] || 0,
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                asChild
                              >
                                <Link
                                  href={`/account/partner/agreement/${agreement.id}`}
                                >
                                  View Agreement
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                asChild
                              >
                                <Link
                                  href={`/account/partner/agreements/${agreement.id}/payments`}
                                >
                                  Payment History
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : userApplication?.status === "pending" ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" /> Partner Application
              Pending
            </p>
            <Badge
              className={`${applicationBadge[userApplication.status]} text-[10px] capitalize`}
            >
              {userApplication.status}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Your application for{" "}
              <strong>{userApplication.businessName}</strong> is under review.
              We will notify you after admin verification.
            </p>
            <p className="text-xs text-muted-foreground">
              Applied on {userApplication.appliedDate}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" /> Not a
              Partner Yet
            </p>
            {userApplication?.status === "rejected" && (
              <div className="border border-destructive/20 rounded-lg p-3 bg-destructive/5">
                <p className="text-xs font-medium text-destructive">
                  Previous application was rejected.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userApplication.reviewNotes ||
                    "You can update your details and apply again."}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              You currently do not have an active partner profile. You can apply
              to join the Agri-Eco partner network to manage agreements, revenue
              sharing and payouts.
            </p>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => setDialogOpen(true)}
            >
              <Wallet className="h-3.5 w-3.5 mr-1" /> Apply to Join Partner
              Network
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Apply to Partner with Agri-Eco
            </DialogTitle>
            <DialogDescription>
              Share your business details and we will review your application.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitApplication} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[11px]">Business Name *</Label>
                <Input
                  placeholder="Example: Green Valley Tours Ltd"
                  className="h-9 text-xs"
                  value={form.businessName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      businessName: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Contact Person *</Label>
                <Input
                  placeholder="Example: Jane Uwimana"
                  className="h-9 text-xs"
                  value={form.contactPerson}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      contactPerson: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Business Email *</Label>
                <Input
                  type="email"
                  placeholder="Example: partner@business.rw"
                  className="h-9 text-xs"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Phone Number *</Label>
                <Input
                  placeholder="Example: +250 7XX XXX XXX"
                  className="h-9 text-xs"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Business Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism-operator">
                      Tourism Operator
                    </SelectItem>
                    <SelectItem value="hotel">Hotel / Lodge</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="school">School / Institution</SelectItem>
                    <SelectItem value="ngo">NGO / Non-profit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-[11px]">About Your Business</Label>
                <Textarea
                  rows={4}
                  placeholder="Tell us your services, current audience and how you want to partner with Agri-Eco."
                  className="text-xs"
                  value={form.aboutBusiness}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      aboutBusiness: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
