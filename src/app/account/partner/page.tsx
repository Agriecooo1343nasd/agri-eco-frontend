"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  FileText,
  Handshake,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/context/PricingContext";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPartnerAgreements,
  fetchPartnerMe,
  fetchPartnerMyApplication,
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

  const { data: partnerData, isLoading: isLoadingPartner } = useQuery({
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

  const activeAgreements = partnerAgreements.filter((a: any) => a.status === "active");
  const endedAgreements = partnerAgreements.filter((a: any) => a.status !== "active");
  const totalEarnings = partnerAgreements.reduce((sum: number, agg: any) => sum + (agg.paidToDate || 0), 0);
  const fallbackStatus = activeAgreements.length > 0 ? "active" : partnerAgreements.length > 0 ? "inactive" : "pending";
  
  const displayPartner = partnerData;
  const revenueSummary = displayPartner?.revenueSummary || { gross: 0, earnings: totalEarnings, pending: 0, bookings: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-primary rounded-3xl text-primary-foreground p-6 md:p-10 relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-black font-heading tracking-tight">{t(translations.partnerPage.partnerNetwork)}</h1>
          <p className="text-primary-foreground/80 text-sm mt-3 max-w-2xl font-medium">
            {t(translations.partnerPage.trackSub)}
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-black/10 blur-2xl" />
      </div>

      {isLoadingPartner || isLoadingApplication ? (
        <div className="grid gap-4">
          <Skeleton className="h-[120px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      ) : displayPartner ? (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t(translations.partnerPage.status)}
                </p>
                <Badge
                  variant="outline"
                  className={`${statusBadge[displayPartner.status || fallbackStatus] || "bg-muted text-muted-foreground"} text-[10px] uppercase font-bold py-1`}
                >
                  {t((translations.statuses as any)[(displayPartner.status || fallbackStatus).toLowerCase()] || (displayPartner.status || fallbackStatus))}
                </Badge>
                <p className="text-xs text-muted-foreground font-medium pt-1">
                  Type: <span className="capitalize text-foreground font-bold">{displayPartner.type?.replace("_", " ")}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t(translations.partnerPage.grossRevenue)}
                </p>
                <p className="text-2xl font-black text-foreground">
                  {formatPrice(revenueSummary.gross)}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t(translations.bookingsPage.participants)}: <span className="text-foreground">{revenueSummary.bookings || 0}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t(translations.partnerPage.yourEarnings)}
                </p>
                <p className="text-2xl font-black text-primary">
                  {formatPrice(revenueSummary.earnings)}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t((translations.statuses as any).pending)}: <span className="text-foreground">{formatPrice(revenueSummary.pending || 0)}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t(translations.partnerPage.payoutCycle)}
                </p>
                <p className="text-lg font-black capitalize text-foreground">
                  {displayPartner.payoutCycle || "Not configured"}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t(translations.partnerPage.since)} {displayPartner.createdAt ? new Date(displayPartner.createdAt).toLocaleDateString() : ""}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-none shadow-soft overflow-hidden">
            <div className="h-1 bg-primary/20 w-full" />
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-black flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" /> {t(translations.partnerPage.overview)}
              </h2>
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground font-medium">{t(translations.partnerPage.business)}:</span>
                    <span className="font-bold">{displayPartner.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground font-medium">{t(translations.partnerPage.contact)}:</span>
                    <span className="font-bold">{displayPartner.contactName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground font-medium">Email:</span>
                    <span className="font-bold">{displayPartner.email || "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground font-medium">{t(translations.partnerPage.commissionRate)}:</span>
                    <span className="font-bold text-primary">{displayPartner.revenueShareRate || displayPartner.commissionRate || activeAgreements[0]?.commissionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground font-medium">{t(translations.checkoutPage.phone)}:</span>
                    <span className="font-bold">{displayPartner.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-soft overflow-hidden">
            <div className="h-1 bg-primary/20 w-full" />
            <CardContent className="p-6 space-y-6">
              <h2 className="text-base font-black flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> {t(translations.partnerPage.agreements)}
              </h2>

              {isLoadingAgreements ? (
                <div className="space-y-4">
                  <Skeleton className="h-[80px] w-full rounded-2xl" />
                  <Skeleton className="h-[120px] w-full rounded-2xl" />
                </div>
              ) : partnerAgreements.length === 0 ? (
                <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed">
                  <Handshake className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {t(translations.partnerPage.noAgreements)}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                        {t(translations.partnerPage.activeContracts)}
                      </p>
                      <p className="text-3xl font-black mt-1">
                        {activeAgreements.length}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-5 border border-border">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {t(translations.partnerPage.endedTerminated)}
                      </p>
                      <p className="text-3xl font-black mt-1">
                        {endedAgreements.length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {t(translations.partnerPage.activeContracts)}
                    </h3>
                    {activeAgreements.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic pl-4">
                        {t(translations.partnerPage.noAgreements)}
                      </p>
                    ) : (
                      <div className="grid gap-4">
                        {activeAgreements.map((agreement: any) => (
                          <div
                            key={agreement.id}
                            className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors shadow-sm group"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-black group-hover:text-primary transition-colors">
                                  {agreement.title}
                                </p>
                                <p className="text-xs text-muted-foreground font-medium">
                                  {agreement.version} · {new Date(agreement.effectiveDate).toLocaleDateString()} -{" "}
                                  {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString() : "Open"}
                                </p>
                              </div>
                              <Badge className="text-[10px] uppercase font-bold px-2 py-0.5">
                                {t((translations.statuses as any)[agreement.status.toLowerCase()] || agreement.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                              {agreement.termsSummary}
                            </p>
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50 gap-4 flex-wrap">
                              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                                {t(translations.partnerPage.earningsMade)}:{" "}
                                <span className="text-lg ml-1 font-black">{formatPrice(agreement.paidToDate || 0)}</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl h-9 font-bold text-xs"
                                  asChild
                                >
                                  <Link href={`/account/partner/agreement/${agreement.id}`}>
                                    {t(translations.partnerPage.viewAgreement)}
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  className="rounded-xl h-9 font-bold text-xs"
                                  asChild
                                >
                                  <Link href={`/account/partner/agreements/${agreement.id}/payments`}>
                                    {t(translations.partnerPage.paymentHistory)}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {endedAgreements.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        {t(translations.partnerPage.contractHistory)}
                      </h3>
                      <div className="grid gap-3">
                        {endedAgreements.map((agreement: any) => (
                          <div
                            key={agreement.id}
                            className="bg-muted/20 border border-border rounded-xl p-4 opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-xs font-bold">
                                {agreement.title}
                              </p>
                              <Badge variant="outline" className="text-[9px] uppercase font-bold opacity-70">
                                {t((translations.statuses as any)[agreement.status.toLowerCase()] || agreement.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              <p>{t(translations.partnerPage.earningsMade)}: {formatPrice(agreement.paidToDate || 0)}</p>
                              <Link href={`/account/partner/agreement/${agreement.id}`} className="text-primary hover:underline">
                                View Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : myApplication?.status === "pending" ? (
        <Card className="rounded-3xl border-amber-200 bg-amber-50/50 backdrop-blur overflow-hidden shadow-xl shadow-amber-500/10">
          <div className="h-1 bg-amber-400 w-full" />
          <CardContent className="p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-heading text-amber-900">{t(translations.partnerPage.pendingApplication)}</h2>
              <p className="text-sm text-amber-800/70 font-medium max-w-md mx-auto">
                {t(translations.partnerPage.underReview)}
              </p>
            </div>
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-100 rounded-full text-xs font-black text-amber-700 uppercase tracking-widest border border-amber-200">
              {t((translations.statuses as any)[myApplication.status.toLowerCase()] || myApplication.status)}
            </div>
            <div className="pt-4 border-t border-amber-200/50">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest opacity-60">
                {t(translations.partnerPage.appliedOn)} {myApplication.createdAt ? new Date(myApplication.createdAt).toLocaleDateString() : "recently"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-3xl border-none shadow-2xl shadow-foreground/5 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/50 to-primary w-full" />
          <CardContent className="p-10 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-32 h-32 bg-primary/5 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                <Handshake className="h-16 w-16 text-primary" />
              </div>
              <div className="text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black font-heading text-foreground">
                    {t(translations.partnerPage.notPartner)}
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
                    Join the Agri-Eco partner network to manage agreements, coordinate operations, and participate in our sustainable ecosystem. Partners benefit from shared growth and streamlined logistics.
                  </p>
                </div>

                {myApplication?.status === "rejected" && (
                  <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-5 text-left">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Previous Application rejected</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium italic">
                      "{myApplication.reviewNote || "Please update your business details and try applying again."}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-border/50">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm font-black uppercase tracking-widest text-foreground">Ready to collaborate?</p>
                <p className="text-xs text-muted-foreground font-medium">Takes less than 5 minutes to submit your details.</p>
              </div>
              <Button
                size="lg"
                className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-3 group"
                asChild
              >
                <Link href="/account/partner/apply">
                  <Wallet className="h-4 w-4" /> {t(translations.partnerPage.applyToJoin)}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
