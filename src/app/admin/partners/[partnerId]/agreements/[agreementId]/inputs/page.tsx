"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Boxes, HandCoins } from "lucide-react";
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
import type { Partner, PartnerInputRecord } from "@/data/community";
import { createPartnerInputRecord, getPartners, savePartners } from "@/lib/partner-store";

const PAGE_SIZE = 8;

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

export default function AdminAgreementInputsPage() {
  const params = useParams<{ partnerId: string; agreementId: string }>();
  const { formatPrice } = usePricing();
  const [partners, setPartners] = useState<Partner[]>(() => getPartners());
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    kind: "financial" as PartnerInputRecord["kind"],
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    storageCategory: "capital" as PartnerInputRecord["storageCategory"],
    description: "",
    notes: "",
  });

  const partner = useMemo(
    () => partners.find((entry) => entry.id === params.partnerId),
    [partners, params.partnerId],
  );

  const agreement = partner?.agreements.find((entry) => entry.id === params.agreementId) || null;

  const inputs = useMemo(() => {
    if (!partner || !agreement) return [];
    return (partner.inputs ?? [])
      .filter((entry) => entry.agreementId === agreement.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [partner, agreement]);

  const totalPages = Math.max(1, Math.ceil(inputs.length / PAGE_SIZE));

  const paginatedInputs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return inputs.slice(start, start + PAGE_SIZE);
  }, [inputs, page]);

  const totalFinancial = inputs
    .filter((entry) => entry.kind === "financial" && typeof entry.amount === "number")
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);

  const commitPartners = (next: Partner[]) => {
    setPartners(next);
    savePartners(next);
  };

  const updatePartnerInList = (updated: Partner) => {
    commitPartners(partners.map((entry) => (entry.id === updated.id ? updated : entry)));
  };

  const handleRecordInput = () => {
    if (!partner || !agreement) return;

    if (!form.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    const amount =
      form.kind === "financial" && form.amount ? Math.max(0, Number(form.amount)) : undefined;

    const record = createPartnerInputRecord(
      form.kind,
      form.description.trim(),
      form.storageCategory,
      amount,
      agreement.id,
      agreement.title,
      form.notes || undefined,
    );
    record.date = form.date;

    const existingInputs = partner.inputs ?? [];
    const updated: Partner = {
      ...partner,
      inputs: [record, ...existingInputs],
    };

    updatePartnerInList(updated);
    setFormOpen(false);
    setForm({
      kind: "financial",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      storageCategory: "capital",
      description: "",
      notes: "",
    });

    toast.success("Input Recorded", {
      description: "Partner input has been recorded for this agreement.",
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
            {agreement.title} · {partner.businessName}
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
              {inputs.filter((entry) => entry.kind === "financial").length} · In-kind:{" "}
              {inputs.filter((entry) => entry.kind === "in-kind").length}
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
                    <p className="text-[11px] text-muted-foreground">{input.date}</p>
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
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
              Capture financial or in-kind support linked to this agreement and how it is stored
              in the business.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Input Type</Label>
              <Select
                value={form.kind}
                onValueChange={(value: PartnerInputRecord["kind"]) =>
                  setForm((prev) => ({ ...prev, kind: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Support</SelectItem>
                  <SelectItem value="in-kind">In-kind Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Amount (RWF)</Label>
              <Input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder={
                  form.kind === "financial"
                    ? "Enter amount provided"
                    : "Optional for in-kind support"
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Stored As</Label>
              <Select
                value={form.storageCategory}
                onValueChange={(value: PartnerInputRecord["storageCategory"]) =>
                  setForm((prev) => ({ ...prev, storageCategory: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="capital">Capital Investment</SelectItem>
                  <SelectItem value="operations">Operations Support</SelectItem>
                  <SelectItem value="marketing">Marketing / Promotion</SelectItem>
                  <SelectItem value="community">Community / CSR</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Short Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Describe the support and context..."
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="How this input is booked or tracked internally."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordInput}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

