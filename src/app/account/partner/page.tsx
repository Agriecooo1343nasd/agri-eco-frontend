"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Handshake,
  Wallet,
} from "lucide-react";
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
import { toast } from "sonner";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPartnerAgreements,
  fetchPartnerMe,
  fetchPartnerMyApplication,
  submitPartnerApplication,
} from "@/lib/api/partners";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

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

export default function AccountPartnerPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = usePricing();
  const queryClient = useQueryClient();

  const { data: partnerData, isLoading: isLoadingPartner, isError: isErrorPartner, error: partnerError } = useQuery({
    queryKey: ["partner-me"],
    queryFn: fetchPartnerMe,
    retry: false
  });

  const { data: partnerAgreements = [], isLoading: isLoadingAgreements } = useQuery({
    queryKey: ["partner-me-agreements"],
    queryFn: fetchPartnerAgreements,
    enabled: !!partnerData,
    retry: false
  });
  const { data: myApplication, isLoading: isLoadingApplication } = useQuery({
    queryKey: ["partner-me-application"],
    queryFn: fetchPartnerMyApplication,
    retry: false,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    contactPerson: user?.name || "",
    email: user?.email || "",
    phone: "",
    type: "tourism-operator",
    aboutBusiness: "",
  });

  const userApplication = myApplication;

  const activeAgreements = partnerAgreements.filter((a: any) => a.status === "active");
  const endedAgreements = partnerAgreements.filter((a: any) => a.status !== "active");
  const totalEarnings = partnerAgreements.reduce((sum: number, agg: any) => sum + (agg.paidToDate || 0), 0);
  const fallbackStatus = activeAgreements.length > 0 ? "active" : partnerAgreements.length > 0 ? "inactive" : "pending";
  
  const displayPartner = partnerData; // Using the real partner from the backend API
  const revenueSummary = displayPartner?.revenueSummary || { gross: 0, earnings: totalEarnings, pending: 0, bookings: 0 };


  const submitApplicationMutation = useMutation({
    mutationFn: submitPartnerApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-me-application"] });
      setDialogOpen(false);
      toast.success(t(translations.common.success), {
        description: t(translations.partnerPage.underReview),
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to submit application", {
        description: error.message || "Please try again.",
      });
    },
  });

  const submitApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.businessName ||
      !form.contactPerson ||
      !form.email ||
      !form.phone
    ) {
      toast.error(t(translations.common.errorLoading), {
        description:
          t(translations.auth.required),
      });
      return;
    }

    submitApplicationMutation.mutate({
      businessName: form.businessName.trim(),
      businessType: form.type.replace("-", "_"),
      contactName: form.contactPerson.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      description: form.aboutBusiness.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-3xl text-primary-foreground p-6 md:p-8 relative overflow-hidden">
        <h1 className="text-2xl font-bold font-heading">{t(translations.partnerPage.partnerNetwork)}</h1>
        <p className="text-primary-foreground/80 text-sm mt-2 max-w-2xl">
          {t(translations.partnerPage.trackSub)}
        </p>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      {displayPartner ? (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t(translations.partnerPage.status)}
                </p>
                <Badge
                  className={`${statusBadge[displayPartner.status || fallbackStatus] || "bg-muted text-muted-foreground"} text-[10px] capitalize`}
                >
                  {t((translations.statuses as any)[(displayPartner.status || fallbackStatus).toLowerCase()] || (displayPartner.status || fallbackStatus))}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Type: <span className="capitalize">{displayPartner.type?.replace("_", " ")}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t(translations.partnerPage.grossRevenue)}
                </p>
                <p className="text-lg font-bold">
                  {formatPrice(revenueSummary.gross)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(translations.bookingsPage.participants)}: {revenueSummary.bookings || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t(translations.partnerPage.yourEarnings)}
                </p>
                <p className="text-lg font-bold">
                  {formatPrice(revenueSummary.earnings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t((translations.statuses as any).pending)}: {formatPrice(revenueSummary.pending || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t(translations.partnerPage.payoutCycle)}
                </p>
                <p className="text-sm font-bold capitalize">
                  {displayPartner.payoutCycle || "Not configured"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {t(translations.partnerPage.since)} {displayPartner.createdAt ? new Date(displayPartner.createdAt).toLocaleDateString() : ""}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Handshake className="h-4 w-4" /> {t(translations.partnerPage.overview)}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">{t(translations.partnerPage.business)}:</span>{" "}
                    {displayPartner.name || "N/A"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t(translations.partnerPage.contact)}:</span>{" "}
                    {displayPartner.contactName || "N/A"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {displayPartner.email || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">{t(translations.partnerPage.commissionRate)}:</span>{" "}
                    {displayPartner.revenueShareRate || displayPartner.commissionRate || activeAgreements[0]?.commissionRate || 0}%
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t(translations.checkoutPage.phone)}:</span>{" "}
                    {displayPartner.phone || "N/A"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {displayPartner.notes || "Manage your active partner resources, view payouts, and monitor inputs."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> {t(translations.partnerPage.agreements)}
              </h2>

              {isLoadingAgreements ? (
                <div className="space-y-3">
                  <Skeleton className="h-[80px] w-full rounded-xl" />
                  <Skeleton className="h-[120px] w-full rounded-xl" />
                </div>
              ) : partnerAgreements.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {t(translations.partnerPage.noAgreements)}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        {t(translations.partnerPage.activeContracts)}
                      </p>
                      <p className="text-xl font-bold mt-1">
                        {activeAgreements.length}
                      </p>
                    </div>
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        {t(translations.partnerPage.endedTerminated)}
                      </p>
                      <p className="text-xl font-bold mt-1">
                        {endedAgreements.length}
                      </p>
                    </div>
                    <div className="border border-border rounded-lg p-3 bg-muted/20">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                        {t(translations.partnerPage.totalEarnings)}
                      </p>
                      <p className="text-sm font-bold mt-2">
                        {formatPrice(revenueSummary.earnings)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      {t(translations.partnerPage.activeContracts)}
                    </p>
                    {activeAgreements.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {t(translations.partnerPage.noAgreements)}
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
                              {t((translations.statuses as any)[agreement.status.toLowerCase()] || agreement.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {agreement.termsSummary}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {agreement.version} · {agreement.effectiveDate} -{" "}
                            {agreement.endDate || "Open"}
                          </p>
                          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                            <p className="text-xs font-medium text-primary">
                              {t(translations.partnerPage.earningsMade)}:{" "}
                              {formatPrice(agreement.paidToDate || 0)}
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
                                  {t(translations.partnerPage.viewAgreement)}
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
                                  {t(translations.partnerPage.paymentHistory)}
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
                      {t(translations.partnerPage.contractHistory)}
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
                              {t((translations.statuses as any)[agreement.status.toLowerCase()] || agreement.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {agreement.termsSummary}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {agreement.version} · {agreement.effectiveDate} -{" "}
                            {agreement.endDate || "Open"}
                          </p>
                          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                            <p className="text-xs font-medium text-foreground">
                              {t(translations.partnerPage.earningsMade)}:{" "}
                              {formatPrice(agreement.paidToDate || 0)}
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
                                  {t(translations.partnerPage.viewAgreement)}
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
                                  {t(translations.partnerPage.paymentHistory)}
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
      ) : isLoadingApplication ? (
        <Skeleton className="h-[160px] w-full rounded-2xl" />
      ) : userApplication?.status === "pending" ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" /> {t(translations.partnerPage.pendingApplication)}
            </p>
            <Badge
              className={`${applicationBadge[userApplication.status]} text-[10px] capitalize`}
            >
              {t((translations.statuses as any)[userApplication.status.toLowerCase()] || userApplication.status)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {t(translations.partnerPage.underReview)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(translations.partnerPage.appliedOn)} {userApplication.createdAt ? new Date(userApplication.createdAt).toLocaleDateString() : "recently"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" /> {t(translations.partnerPage.notPartner)}
            </p>
            {userApplication?.status === "rejected" && (
              <div className="border border-destructive/20 rounded-lg p-3 bg-destructive/5">
                <p className="text-xs font-medium text-destructive">
                  Previous application was rejected.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userApplication.reviewNote ||
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
              <Wallet className="h-3.5 w-3.5 mr-1" /> {t(translations.partnerPage.applyToJoin)}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {t(translations.partnerPage.applyTitle)}
            </DialogTitle>
            <DialogDescription>
              {t(translations.partnerPage.applyDescription)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitApplication} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[11px]">{t(translations.partnerPage.businessName)} *</Label>
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
                <Label className="text-[11px]">{t(translations.partnerPage.contactPerson)} *</Label>
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
                <Label className="text-[11px]">{t(translations.common.email)} *</Label>
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
                <Label className="text-[11px]">{t(translations.checkoutPage.phone)} *</Label>
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
                <Label className="text-[11px]">{t(translations.partnerPage.businessType)} *</Label>
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
                <Label className="text-[11px]">{t(translations.partnerPage.aboutBusiness)}</Label>
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
                {t(translations.common.cancel)}
              </Button>
              <Button type="submit">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> {t(translations.partnerPage.submitApplication)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
