"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, HandCoins } from "lucide-react";
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
  createAdminAgreementInput,
  fetchAdminAgreementInputs,
  fetchAdminPartnerAgreements,
  fetchAdminPartnerById,
  type AdminAgreementInputCategory,
  type AdminAgreementInputType,
} from "@/lib/api/partners";

const PAGE_SIZE = 10;

const kindBadge: Record<AdminAgreementInputType, string> = {
  financial: "bg-primary/10 text-primary border-primary/20",
  in_kind: "bg-muted text-muted-foreground border-border",
};

const categoryBadge: Record<AdminAgreementInputCategory, string> = {
  capital: "bg-emerald-100 text-emerald-700 border-emerald-200",
  operations: "bg-sky-100 text-sky-700 border-sky-200",
  marketing: "bg-amber-100 text-amber-700 border-amber-200",
  logistics: "bg-violet-100 text-violet-700 border-violet-200",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminAgreementInputsPage() {
  const params = useParams<{ partnerId: string; agreementId: string }>();
  const queryClient = useQueryClient();

  const partnerId = params.partnerId;
  const agreementId = params.agreementId;

  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    type: "financial" as AdminAgreementInputType,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "capital" as AdminAgreementInputCategory,
    description: "",
    notes: "",
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

  const inputsQuery = useQuery({
    queryKey: ["admin-agreement-inputs", partnerId, agreementId, page],
    queryFn: () =>
      fetchAdminAgreementInputs(partnerId, agreementId, {
        page,
        limit: PAGE_SIZE,
        sort: "date",
        order: "desc",
      }),
    enabled: Boolean(partnerId && agreementId),
  });

  const recordInputMutation = useMutation({
    mutationFn: () => {
      const amount = Number(form.amount);

      if (!form.description.trim() || !form.date || Number.isNaN(amount)) {
        throw new Error("Description, amount, and date are required.");
      }

      if (amount < 0) {
        throw new Error("Amount must be zero or greater.");
      }

      return createAdminAgreementInput(partnerId, agreementId, {
        description: form.description.trim(),
        date: form.date,
        type: form.type,
        category: form.category,
        amount,
        notes: form.notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Input recorded");
      setFormOpen(false);
      setForm({
        type: "financial",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
        category: "capital",
        description: "",
        notes: "",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-agreement-inputs", partnerId, agreementId],
      });
    },
    onError: (error: Error) => {
      toast.error("Unable to record input", {
        description: error.message || "Please review values and try again.",
      });
    },
  });

  const partner = partnerQuery.data;
  const agreement = useMemo(
    () => agreementsQuery.data?.find((entry) => entry.id === agreementId) ?? null,
    [agreementsQuery.data, agreementId],
  );

  const result = inputsQuery.data;
  const inputs = result?.data ?? [];
  const pagination = result?.pagination;
  const summary = result?.summary ?? {
    financialSupport: 0,
    totalInputs: 0,
    inputMix: {},
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
            Loading agreement inputs...
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
            Agreement inputs could not be loaded for this partner.
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
          <h1 className="text-2xl font-bold font-heading mt-3">Partner Inputs</h1>
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
              Financial Support
            </p>
            <p className="text-lg font-bold">{formatCurrency(summary.financialSupport)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Inputs
            </p>
            <p className="text-lg font-bold">{summary.totalInputs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Input Mix
            </p>
            <p className="text-xs text-muted-foreground">
              Financial: {summary.inputMix.financial ?? 0} - In-kind: {summary.inputMix.in_kind ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <HandCoins className="h-4 w-4" /> Agreement Inputs
            </h2>
            <Button size="sm" className="h-8 text-xs" onClick={() => setFormOpen(true)}>
              Record Input
            </Button>
          </div>

          {inputsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading inputs...</p>
          ) : inputs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No inputs recorded yet for this agreement.
            </p>
          ) : (
            <div className="space-y-2">
              {inputs.map((input) => (
                <div
                  key={input.id}
                  className="border border-border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold">{input.description}</p>
                    <p className="text-[11px] text-muted-foreground">{input.date}</p>
                    {input.notes && (
                      <p className="text-[11px] text-muted-foreground italic">{input.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] capitalize border ${kindBadge[input.type]}`}
                      >
                        {input.type === "financial" ? "Financial" : "In-kind"}
                      </Badge>
                      <Badge
                        className={`text-[10px] capitalize border ${categoryBadge[input.category]}`}
                      >
                        {input.category}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(input.amount)}
                    </p>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Record Partner Input</DialogTitle>
            <DialogDescription>
              Capture financial or in-kind support provided by the partner for this agreement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Input Type *</Label>
              <Select
                value={form.type}
                onValueChange={(value: AdminAgreementInputType) =>
                  setForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Support</SelectItem>
                  <SelectItem value="in_kind">In-kind Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Amount (RWF) *</Label>
              <Input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(value: AdminAgreementInputCategory) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="capital">Capital Investment</SelectItem>
                  <SelectItem value="operations">Operations Support</SelectItem>
                  <SelectItem value="marketing">Marketing / Promotion</SelectItem>
                  <SelectItem value="logistics">Logistics Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Describe the support and context..."
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Optional internal notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => recordInputMutation.mutate()}
              disabled={recordInputMutation.isPending}
            >
              {recordInputMutation.isPending ? "Recording..." : "Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
