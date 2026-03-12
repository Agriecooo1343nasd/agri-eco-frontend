"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { usePricing } from "@/context/PricingContext";
import type {
  Partner,
  PartnerAgreement,
  PartnerPayoutRecord,
} from "@/data/community";
import {
  createPartnerAgreement,
  createPayoutRecord,
  getPartners,
  savePartners,
} from "@/lib/partner-store";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
  terminated: "bg-destructive/10 text-destructive border-destructive/20",
  expired: "bg-muted text-muted-foreground border-border",
};

const payoutStatusBadge: Record<string, string> = {
  paid: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const emptyAgreementForm = {
  title: "",
  termsSummary: "",
  status: "active" as PartnerAgreement["status"],
  version: "v1.0",
  effectiveDate: "",
  endDate: "",
  commissionRate: "",
  partnerSharePercent: "",
  platformSharePercent: "",
};

export default function PartnerProfilePage() {
  const params = useParams<{ partnerId: string }>();
  const router = useRouter();
  const { formatPrice } = usePricing();

  const [partners, setPartners] = useState<Partner[]>(() => getPartners());
  const [agreementFormOpen, setAgreementFormOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<PartnerAgreement | null>(null);
  const [agreementForm, setAgreementForm] = useState({ ...emptyAgreementForm });
  const partner = useMemo(
    () => partners.find((entry) => entry.id === params.partnerId),
    [partners, params.partnerId],
  );

  const commitPartners = (next: Partner[]) => {
    setPartners(next);
    savePartners(next);
  };

  const updatePartnerInList = (updated: Partner) => {
    commitPartners(partners.map((entry) => (entry.id === updated.id ? updated : entry)));
  };

  const setStatus = (status: Partner["status"], networkStatus: Partner["networkStatus"]) => {
    if (!partner) return;
    updatePartnerInList({ ...partner, status, networkStatus });
    toast.success("Partner Updated", {
      description: `${partner.businessName} status changed to ${status}.`,
    });
  };

  const openAddAgreement = () => {
    setEditingAgreement(null);
    setAgreementForm({ ...emptyAgreementForm });
    setAgreementFormOpen(true);
  };

  const openEditAgreement = (agreement: PartnerAgreement) => {
    setEditingAgreement(agreement);
    setAgreementForm({
      title: agreement.title,
      termsSummary: agreement.termsSummary,
      status: agreement.status,
      version: agreement.version,
      effectiveDate: agreement.effectiveDate,
      endDate: agreement.endDate || "",
      commissionRate: agreement.commissionRate != null ? String(agreement.commissionRate) : "",
      partnerSharePercent:
        agreement.partnerSharePercent != null ? String(agreement.partnerSharePercent) : "",
      platformSharePercent:
        agreement.platformSharePercent != null ? String(agreement.platformSharePercent) : "",
    });
    setAgreementFormOpen(true);
  };

  const handleSaveAgreement = () => {
    if (!partner || !agreementForm.title.trim() || !agreementForm.termsSummary.trim()) {
      toast.error("Title and summary are required.");
      return;
    }

    const partnerShare = agreementForm.partnerSharePercent
      ? Number(agreementForm.partnerSharePercent)
      : undefined;
    const platformShare = agreementForm.platformSharePercent
      ? Number(agreementForm.platformSharePercent)
      : undefined;

    if (partnerShare != null && platformShare != null && partnerShare + platformShare !== 100) {
      toast.error("Partner share + platform share must equal 100%.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const effectiveDate = agreementForm.effectiveDate || today;
    const commissionRate = agreementForm.commissionRate
      ? Number(agreementForm.commissionRate)
      : undefined;

    let updatedAgreements: PartnerAgreement[];
    if (editingAgreement) {
      updatedAgreements = partner.agreements.map((agreement) =>
        agreement.id === editingAgreement.id
          ? {
              ...agreement,
              title: agreementForm.title.trim(),
              termsSummary: agreementForm.termsSummary.trim(),
              status: agreementForm.status,
              version: agreementForm.version,
              effectiveDate,
              endDate: agreementForm.endDate || undefined,
              commissionRate,
              partnerSharePercent: partnerShare,
              platformSharePercent: platformShare,
              updatedAt: today,
            }
          : agreement,
      );
      toast.success("Agreement Updated");
    } else {
      const newAgreement: PartnerAgreement = {
        ...createPartnerAgreement(agreementForm.title.trim(), agreementForm.termsSummary.trim()),
        status: agreementForm.status,
        version: agreementForm.version,
        effectiveDate,
        endDate: agreementForm.endDate || undefined,
        commissionRate,
        partnerSharePercent: partnerShare,
        platformSharePercent: platformShare,
      };
      updatedAgreements = [newAgreement, ...partner.agreements];
      toast.success("Agreement Added");
    }

    updatePartnerInList({ ...partner, agreements: updatedAgreements });
    setAgreementFormOpen(false);
    setEditingAgreement(null);
  };


  if (!partner) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/admin/partners">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Partners
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

  const payouts = partner.payouts ?? [];
  const totalPaid = payouts
    .filter((entry) => entry.status === "paid")
    .reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/partners">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Partners
            </Link>
          </Button>
          <h1 className="mt-3 text-2xl font-heading font-bold">{partner.businessName}</h1>
          <p className="text-xs capitalize text-muted-foreground">Partner Profile - {partner.type}</p>
        </div>
        <Badge className={`${statusBadge[partner.status]} border text-xs capitalize`}>
          {partner.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</h2>
            <p className="text-sm font-semibold">{partner.contactPerson}</p>
            <p className="text-xs">{partner.email}</p>
            <p className="text-xs">{partner.phone}</p>
            <p className="text-xs text-muted-foreground">{partner.aboutBusiness}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finance</h2>
            <p className="text-xs">Gross Revenue: <strong>{formatPrice(partner.grossRevenue)}</strong></p>
            <p className="text-xs">Partner ({partner.partnerSharePercent}%): <strong>{formatPrice(partner.partnerEarnings)}</strong></p>
            <p className="text-xs">Platform ({partner.platformSharePercent}%): <strong>{formatPrice(partner.platformEarnings)}</strong></p>
            <p className="text-xs">Commission: {partner.commissionRate}%</p>
            <p className="text-xs capitalize">Payout cycle: {partner.payoutCycle}</p>
            <Badge className={`${payoutStatusBadge[partner.payoutStatus] ?? "bg-muted"} border text-[10px] capitalize`}>
              {partner.payoutStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operations</h2>
            <p className="text-xs">Network: <strong>{partner.networkStatus}</strong></p>
            <p className="text-xs">Bookings: <strong>{partner.totalBookings}</strong></p>
            <p className="text-xs">Joined: {partner.joinedDate}</p>
            <p className="text-xs">Contract Start: {partner.contractStartDate || "-"}</p>
            <p className="text-xs">Contract End: {partner.contractEndDate || "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" /> Agreements
              <Badge variant="outline" className="text-[10px]">{partner.agreements.length}</Badge>
            </h2>
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAddAgreement}>
              <Plus className="h-3.5 w-3.5" /> Add Agreement
            </Button>
          </div>

          {partner.agreements.length === 0 ? (
            <p className="text-xs text-muted-foreground">No agreements yet.</p>
          ) : (
            <div className="space-y-3">
              {partner.agreements.map((agreement) => (
                <div
                  key={agreement.id}
                  className="space-y-2 rounded-xl border border-border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{agreement.title}</p>
                      <Badge
                        className={`${statusBadge[agreement.status]} border text-[10px] capitalize`}
                      >
                        {agreement.status}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
                      onClick={() => openEditAgreement(agreement)}
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">{agreement.termsSummary}</p>
                  <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    <span>{agreement.version}</span>
                    <span>Effective: {agreement.effectiveDate}</span>
                    {agreement.endDate && <span>Ends: {agreement.endDate}</span>}
                    <span>Updated: {agreement.updatedAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      asChild
                    >
                      <Link
                        href={`/admin/partners/${partner.id}/agreements/${agreement.id}/payments`}
                      >
                        View Payouts
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      asChild
                    >
                      <Link
                        href={`/admin/partners/${partner.id}/agreements/${agreement.id}/inputs`}
                      >
                        View Inputs
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">Admin Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setStatus("active", "verified")} className="gap-1.5 text-xs">
              <CheckCircle className="h-3.5 w-3.5" /> Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => setStatus("active", "at-risk")}
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Mark At Risk
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5 text-xs"
              onClick={() => setStatus("terminated", "suspended")}
            >
              <Trash2 className="h-3.5 w-3.5" /> Terminate
            </Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => router.push("/admin/partners")}>Done</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={agreementFormOpen} onOpenChange={setAgreementFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAgreement ? "Edit Agreement" : "Add Agreement"}</DialogTitle>
            <DialogDescription>
              Update agreement terms and optional financial conditions for this partner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={agreementForm.title} onChange={(e) => setAgreementForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Version</Label>
              <Input value={agreementForm.version} onChange={(e) => setAgreementForm((p) => ({ ...p, version: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={agreementForm.status}
                onValueChange={(value: PartnerAgreement["status"]) => setAgreementForm((p) => ({ ...p, status: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Effective Date</Label>
              <Input type="date" value={agreementForm.effectiveDate} onChange={(e) => setAgreementForm((p) => ({ ...p, effectiveDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input type="date" value={agreementForm.endDate} onChange={(e) => setAgreementForm((p) => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Commission %</Label>
              <Input type="number" min="0" max="100" value={agreementForm.commissionRate} onChange={(e) => setAgreementForm((p) => ({ ...p, commissionRate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Partner Share %</Label>
              <Input type="number" min="0" max="100" value={agreementForm.partnerSharePercent} onChange={(e) => setAgreementForm((p) => ({ ...p, partnerSharePercent: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Platform Share %</Label>
              <Input type="number" min="0" max="100" value={agreementForm.platformSharePercent} onChange={(e) => setAgreementForm((p) => ({ ...p, platformSharePercent: e.target.value }))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Terms Summary</Label>
              <Textarea value={agreementForm.termsSummary} onChange={(e) => setAgreementForm((p) => ({ ...p, termsSummary: e.target.value }))} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgreementFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAgreement}>{editingAgreement ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
</div>
  );
}
