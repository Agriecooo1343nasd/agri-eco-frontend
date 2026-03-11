"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, ShieldAlert, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";
import type { Partner } from "@/data/community";
import {
  createPartnerAgreement,
  getPartners,
  savePartners,
} from "@/lib/partner-store";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
  terminated: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PartnerProfilePage() {
  const params = useParams<{ partnerId: string }>();
  const router = useRouter();
  const { formatPrice } = usePricing();

  const [partners, setPartners] = useState<Partner[]>(() => getPartners());
  const [agreementTitle, setAgreementTitle] = useState("");

  const partner = useMemo(
    () => partners.find((entry) => entry.id === params.partnerId),
    [partners, params.partnerId],
  );

  const commitPartners = (next: Partner[]) => {
    setPartners(next);
    savePartners(next);
  };

  const setStatus = (
    status: Partner["status"],
    networkStatus: Partner["networkStatus"],
  ) => {
    if (!partner) return;
    const next = partners.map((entry) =>
      entry.id === partner.id ? { ...entry, status, networkStatus } : entry,
    );
    commitPartners(next);
    toast.success("Partner Updated", {
      description: `${partner.businessName} status changed to ${status}.`,
    });
  };

  const addAgreement = () => {
    if (!partner || !agreementTitle.trim()) {
      toast.error("Agreement title is required.");
      return;
    }
    const nextAgreement = createPartnerAgreement(
      agreementTitle.trim(),
      "Agreement created from profile page.",
    );
    const next = partners.map((entry) =>
      entry.id === partner.id
        ? { ...entry, agreements: [nextAgreement, ...entry.agreements] }
        : entry,
    );
    commitPartners(next);
    setAgreementTitle("");
    toast.success("Agreement Added", {
      description: "Agreement has been added to this partner profile.",
    });
  };

  if (!partner) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/admin/partners">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partners
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Partner not found. It may have been removed from local data.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/partners">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partners
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-heading mt-3">
            {partner.businessName}
          </h1>
          <p className="text-xs text-muted-foreground">Partner Profile</p>
        </div>
        <Badge className={`${statusBadge[partner.status]} text-xs capitalize`}>
          {partner.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contact
            </h2>
            <p className="text-sm font-semibold">{partner.contactPerson}</p>
            <p className="text-xs">{partner.email}</p>
            <p className="text-xs">{partner.phone}</p>
            <p className="text-xs text-muted-foreground">
              {partner.aboutBusiness}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Finance
            </h2>
            <p className="text-xs">
              Gross Revenue: {formatPrice(partner.grossRevenue)}
            </p>
            <p className="text-xs">
              Partner ({partner.partnerSharePercent}%):{" "}
              {formatPrice(partner.partnerEarnings)}
            </p>
            <p className="text-xs">
              Platform ({partner.platformSharePercent}%):{" "}
              {formatPrice(partner.platformEarnings)}
            </p>
            <p className="text-xs">Commission: {partner.commissionRate}%</p>
            <p className="text-xs capitalize">Payout: {partner.payoutCycle}</p>
            <Badge className="text-[10px] capitalize">
              {partner.payoutStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Operations
            </h2>
            <p className="text-xs">Network Status: {partner.networkStatus}</p>
            <p className="text-xs">Bookings: {partner.totalBookings}</p>
            <p className="text-xs">Joined: {partner.joinedDate}</p>
            <p className="text-xs">
              Contract Start: {partner.contractStartDate || "-"}
            </p>
            <p className="text-xs">
              Contract End: {partner.contractEndDate || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="text-sm font-semibold">Agreements</h2>
          <div className="space-y-2">
            {partner.agreements.map((agreement) => (
              <div
                key={agreement.id}
                className="border border-border rounded-lg p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold">{agreement.title}</p>
                  <Badge className="text-[10px] capitalize">
                    {agreement.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {agreement.termsSummary}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {agreement.version} · Effective {agreement.effectiveDate}
                </p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-2 pt-1">
            <div className="space-y-1">
              <Label className="text-[11px]">Add Agreement Title</Label>
              <Input
                value={agreementTitle}
                onChange={(event) => setAgreementTitle(event.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex items-end">
              <Button className="h-9 text-xs" onClick={addAgreement}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3">Admin Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="text-xs"
              onClick={() => setStatus("active", "verified")}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setStatus("inactive", "at-risk")}
            >
              <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Mark At Risk
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs"
              onClick={() => setStatus("terminated", "suspended")}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Terminate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => router.push("/admin/partners")}
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
