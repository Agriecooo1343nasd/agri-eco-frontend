"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, Clock } from "lucide-react";
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
import {
  createAdminAgreementPayout,
  fetchAdminAgreementPayments,
  fetchAdminPartnerAgreements,
  fetchAdminPartnerById,
  type AdminAgreementPayoutStatus,
} from "@/lib/api/partners";

const PAGE_SIZE = 10;

const payoutBadge: Record<AdminAgreementPayoutStatus, string> = {
  paid: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminAgreementPaymentsPage() {
  const params = useParams<{ partnerId: string; agreementId: string }>();
  const queryClient = useQueryClient();

  const partnerId = params.partnerId;
  const agreementId = params.agreementId;

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | AdminAgreementPayoutStatus>("all");
  const [payoutFormOpen, setPayoutFormOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    period: "",
    notes: "",
    status: "paid" as AdminAgreementPayoutStatus,
  });

  const partnerQuery = useQuery({
    queryKey: ["admin-partner", partnerId],
    queryFn: () => fetchAdminPartnerById(partnerId),
    enabled: Boolean(partnerId),
  });

  const agreementsQuery = useQuery({
    queryKey: ["admin-partner-agreements", partnerId],
    queryFn: () => fetchAdminPartnerAgreements(partnerId),
    enabled: Boolean(partnerId),
  });

  const paymentsQuery = useQuery({
    queryKey: [
      "admin-agreement-payments",
      partnerId,
      agreementId,
      page,
      statusFilter,
    ],
    queryFn: () =>
      fetchAdminAgreementPayments(partnerId, agreementId, {
        page,
        limit: PAGE_SIZE,
        sort: "date",
        order: "desc",
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    enabled: Boolean(partnerId && agreementId),
  });

  const recordPayoutMutation = useMutation({
    mutationFn: () => {
      const amount = Number(payoutForm.amount);

      if (!payoutForm.period.trim() || !payoutForm.date || Number.isNaN(amount)) {
        throw new Error("Amount, date, and period are required.");
      }

      if (amount < 0) {
        throw new Error("Amount must be zero or greater.");
      }

      return createAdminAgreementPayout(partnerId, agreementId, {
        amount,
        period: payoutForm.period.trim(),
        date: payoutForm.date,
        status: payoutForm.status,
        notes: payoutForm.notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Payout recorded");
      setPayoutFormOpen(false);
      setPayoutForm({
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        period: "",
        notes: "",
        status: "paid",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-agreement-payments", partnerId, agreementId],
      });
    },
    onError: (error: Error) => {
      toast.error("Unable to record payout", {
        description: error.message || "Please review values and try again.",
      });
    },
  });

  const partner = partnerQuery.data;
  const agreement = useMemo(
    () => agreementsQuery.data?.find((entry) => entry.id === agreementId) ?? null,
    [agreementsQuery.data, agreementId],
  );

  const result = paymentsQuery.data;
  const payouts = result?.data ?? [];
  const pagination = result?.pagination;
  const summary = result?.summary ?? {
    totalPaid: 0,
    records: 0,
    payoutCycle: agreement?.payoutCycle,
  };

  if (partnerQuery.isLoading || agreementsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href={`/admin/partners/${partnerId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partner
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading agreement payouts...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!partner || !agreement) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href={`/admin/partners/${partnerId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partner
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Agreement payouts could not be loaded for this partner.
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
            <Link href={`/admin/partners/${partner.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partner
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-heading mt-3">Agreement Payouts</h1>
          <p className="text-xs text-muted-foreground">
            {agreement.title} - {partner.name}
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
            <p className="text-lg font-bold">{formatCurrency(summary.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Records
            </p>
            <p className="text-lg font-bold">{summary.records}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Payout Cycle
            </p>
            <p className="text-sm font-bold capitalize flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {summary.payoutCycle ?? agreement.payoutCycle}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Agreement Payments
            </h2>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | AdminAgreementPayoutStatus) => {
                  setPage(1);
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => setPayoutFormOpen(true)}
              >
                Record Payout
              </Button>
            </div>
          </div>

          {paymentsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading payments...</p>
          ) : payouts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No payments recorded yet for this agreement.
            </p>
          ) : (
            <div className="space-y-2">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold">{payout.period}</p>
                    <p className="text-[11px] text-muted-foreground">{payout.date}</p>
                    {payout.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        {payout.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(payout.amount)}
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
              Page {pagination?.page ?? page} of {pagination?.pages ?? 1}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={!pagination?.hasPrev}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={!pagination?.hasNext}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={payoutFormOpen} onOpenChange={setPayoutFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Record Payout</DialogTitle>
            <DialogDescription>
              Add a payout entry specific to this agreement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Amount (RWF) *</Label>
              <Input
                type="number"
                min="0"
                value={payoutForm.amount}
                onChange={(e) =>
                  setPayoutForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Period *</Label>
              <Input
                value={payoutForm.period}
                onChange={(e) =>
                  setPayoutForm((p) => ({ ...p, period: e.target.value }))
                }
                placeholder="March 2026"
              />
            </div>
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                type="date"
                value={payoutForm.date}
                onChange={(e) =>
                  setPayoutForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={payoutForm.status}
                onValueChange={(value: AdminAgreementPayoutStatus) =>
                  setPayoutForm((p) => ({ ...p, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={payoutForm.notes}
                onChange={(e) =>
                  setPayoutForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => recordPayoutMutation.mutate()}
              disabled={recordPayoutMutation.isPending}
            >
              {recordPayoutMutation.isPending ? "Recording..." : "Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
