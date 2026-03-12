"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { usePricing } from "@/context/PricingContext";
import type { Partner, PartnerPayoutRecord } from "@/data/community";
import { createPayoutRecord, getPartners, savePartners } from "@/lib/partner-store";

const PAGE_SIZE = 8;

const payoutBadge: Record<string, string> = {
  paid: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminAgreementPaymentsPage() {
  const params = useParams<{ partnerId: string; agreementId: string }>();
  const { formatPrice } = usePricing();

  const [partners, setPartners] = useState<Partner[]>(() => getPartners());
  const [page, setPage] = useState(1);
  const [payoutFormOpen, setPayoutFormOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    period: "",
    notes: "",
    status: "paid" as PartnerPayoutRecord["status"],
  });

  const partner = useMemo(
    () => partners.find((entry) => entry.id === params.partnerId),
    [partners, params.partnerId],
  );

  const agreement = partner?.agreements.find(
    (entry) => entry.id === params.agreementId,
  ) || null;

  const payouts = useMemo(() => {
    if (!partner || !agreement) return [];
    return (partner.payouts ?? [])
      .filter((entry) => entry.agreementId === agreement.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [partner, agreement]);

  const totalPages = Math.max(1, Math.ceil(payouts.length / PAGE_SIZE));

  const paginatedPayouts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return payouts.slice(start, start + PAGE_SIZE);
  }, [payouts, page]);

  const totalPaid = payouts
    .filter((entry) => entry.status === "paid")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const commitPartners = (next: Partner[]) => {
    setPartners(next);
    savePartners(next);
  };

  const updatePartnerInList = (updated: Partner) => {
    commitPartners(
      partners.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
  };

  const handleRecordPayout = () => {
    if (!partner || !agreement) return;

    if (!payoutForm.amount || !payoutForm.period) {
      toast.error("Amount and period are required.");
      return;
    }

    const record = createPayoutRecord(
      Number(payoutForm.amount),
      payoutForm.period,
      agreement.id,
      agreement.title,
      payoutForm.notes || undefined,
    );
    record.status = payoutForm.status;
    record.date = payoutForm.date;

    const updated: Partner = {
      ...partner,
      payouts: [record, ...(partner.payouts ?? [])],
      lastPayoutDate:
        payoutForm.status === "paid" ? payoutForm.date : partner.lastPayoutDate,
    };

    updatePartnerInList(updated);
    setPayoutFormOpen(false);
    setPayoutForm({
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      period: "",
      notes: "",
      status: "paid",
    });

    toast.success("Payout Recorded", {
      description: `${formatPrice(
        Number(payoutForm.amount),
      )} for ${payoutForm.period} recorded.`,
    });
  };

  if (!partner || !agreement) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href={`/admin/partners/${params.partnerId}`}>
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
          <h1 className="text-2xl font-bold font-heading mt-3">
            Agreement Payouts
          </h1>
          <p className="text-xs text-muted-foreground">
            {agreement.title} · {partner.businessName}
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
              <Clock className="h-3.5 w-3.5" /> {partner.payoutCycle}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Agreement Payments
            </h2>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => setPayoutFormOpen(true)}
            >
              Record Payout
            </Button>
          </div>

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
              <Label>Amount (RWF)</Label>
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
              <Label>Period</Label>
              <Input
                value={payoutForm.period}
                onChange={(e) =>
                  setPayoutForm((p) => ({ ...p, period: e.target.value }))
                }
                placeholder="March 2026"
              />
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
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
                onValueChange={(value: PartnerPayoutRecord["status"]) =>
                  setPayoutForm((p) => ({ ...p, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
            <Button onClick={handleRecordPayout}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

