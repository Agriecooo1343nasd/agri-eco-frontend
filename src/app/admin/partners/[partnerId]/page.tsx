"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe,
  Users,
  Calendar,
  MapPin,
  Building,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import {
  createAdminPartnerAgreement,
  deleteAdminPartnerAgreement,
  fetchAdminPartnerAgreements,
  fetchAdminPartnerById,
  fetchAdminPartnerCommissions,
  terminateAdminPartner,
  updateAdminPartner,
  updateAdminPartnerAgreement,
  type AdminPartner,
  type AdminPartnerAgreement,
  type UpsertAdminPartnerAgreementPayload,
} from "@/lib/api/partners";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
  expired: "bg-muted text-muted-foreground border-border",
  terminated: "bg-destructive/10 text-destructive border-destructive/20",
};

const agreementStatuses = ["active", "expired", "terminated"] as const;

type AgreementFormState = {
  title: string;
  description: string;
  termsSummary: string;
  status: "active" | "expired" | "terminated";
  version: string;
  effectiveDate: string;
  endDate: string;
  payoutCycle: "monthly" | "quarterly" | "biannual" | "annual";
  commissionRate: string;
  platformShareRate: string;
};

const emptyAgreementForm: AgreementFormState = {
  title: "",
  description: "",
  termsSummary: "",
  status: "active",
  version: "v1.0",
  effectiveDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  payoutCycle: "monthly",
  commissionRate: "",
  platformShareRate: "",
};

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PartnerProfilePage() {
  const params = useParams<{ partnerId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const partnerId = params.partnerId;

  const [agreementFormOpen, setAgreementFormOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] =
    useState<AdminPartnerAgreement | null>(null);
  const [deletingAgreement, setDeletingAgreement] =
    useState<AdminPartnerAgreement | null>(null);
  const [agreementForm, setAgreementForm] =
    useState<AgreementFormState>(emptyAgreementForm);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateNotes, setTerminateNotes] = useState("");
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

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

  const commissionsQuery = useQuery({
    queryKey: ["admin-partner-commissions-summary", partnerId],
    queryFn: () =>
      fetchAdminPartnerCommissions(partnerId, {
        page: 1,
        limit: 1,
        sort: "createdAt",
        order: "desc",
      }),
    enabled: Boolean(partnerId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: "active" | "pending" | "inactive";
      notes?: string;
    }) => updateAdminPartner(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partner", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-stats"] });
    },
  });

  const terminateMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      terminateAdminPartner(id, notes),
    onSuccess: (partner) => {
      toast.success("Partner terminated", {
        description: `${partner.name} has been moved to inactive status.`,
      });
      setTerminateOpen(false);
      setTerminateNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-partner", partnerId] });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-stats"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-partner-commissions-summary", partnerId],
      });
    },
    onError: (error: Error) => {
      toast.error("Unable to terminate partner", {
        description: error.message || "Please try again.",
      });
    },
  });

  const saveAgreementMutation = useMutation({
    mutationFn: ({
      partnerId: targetPartnerId,
      agreementId,
      payload,
    }: {
      partnerId: string;
      agreementId?: string;
      payload: UpsertAdminPartnerAgreementPayload;
    }) => {
      if (agreementId) {
        return updateAdminPartnerAgreement(
          targetPartnerId,
          agreementId,
          payload,
        );
      }

      return createAdminPartnerAgreement(targetPartnerId, payload);
    },
    onSuccess: () => {
      toast.success(editingAgreement ? "Agreement updated" : "Agreement added");
      setAgreementFormOpen(false);
      setEditingAgreement(null);
      setAgreementForm(emptyAgreementForm);
      queryClient.invalidateQueries({
        queryKey: ["admin-partner-agreements", partnerId],
      });
    },
    onError: (error: Error) => {
      toast.error("Unable to save agreement", {
        description: error.message || "Please review values and try again.",
      });
    },
  });

  const deleteAgreementMutation = useMutation({
    mutationFn: ({
      partnerId: targetPartnerId,
      agreementId,
    }: {
      partnerId: string;
      agreementId: string;
    }) => deleteAdminPartnerAgreement(targetPartnerId, agreementId),
    onSuccess: () => {
      toast.success("Agreement deleted");
      setDeletingAgreement(null);
      queryClient.invalidateQueries({
        queryKey: ["admin-partner-agreements", partnerId],
      });
    },
    onError: (error: Error) => {
      toast.error("Unable to delete agreement", {
        description: error.message || "Please try again.",
      });
    },
  });

  const partner = partnerQuery.data;
  const agreements = agreementsQuery.data ?? [];
  const commissionSummary = commissionsQuery.data?.summary ?? {
    total: 0,
    pending: 0,
    paid: 0,
  };

  const primaryAgreement = useMemo(
    () =>
      agreements.find((entry) => entry.status === "active") ?? agreements[0],
    [agreements],
  );

  const handleSetStatus = (status: "active" | "pending") => {
    if (!partner) {
      return;
    }

    updateStatusMutation.mutate(
      { id: partner.id, status },
      {
        onSuccess: () => {
          toast.success("Partner updated", {
            description: `${partner.name} status changed to ${status}.`,
          });
        },
        onError: (error: Error) => {
          toast.error("Unable to update partner status", {
            description: error.message || "Please try again.",
          });
        },
      },
    );
  };

  const openAddAgreement = () => {
    setEditingAgreement(null);
    setAgreementForm({
      ...emptyAgreementForm,
      effectiveDate: new Date().toISOString().slice(0, 10),
    });
    setAgreementFormOpen(true);
  };

  const openEditAgreement = (agreement: AdminPartnerAgreement) => {
    setEditingAgreement(agreement);
    setAgreementForm({
      title: agreement.title,
      description: agreement.description || "",
      termsSummary: agreement.termsSummary || "",
      status: agreement.status,
      version: agreement.version,
      effectiveDate: agreement.effectiveDate,
      endDate: agreement.endDate,
      payoutCycle: agreement.payoutCycle,
      commissionRate: String(agreement.commissionRate),
      platformShareRate: String(agreement.platformShareRate),
    });
    setAgreementFormOpen(true);
  };

  const handleSaveAgreement = () => {
    if (!partner) {
      return;
    }

    if (
      !agreementForm.title.trim() ||
      !agreementForm.version.trim() ||
      !agreementForm.effectiveDate ||
      !agreementForm.endDate
    ) {
      toast.error("Missing required fields", {
        description:
          "Title, version, effective date, and end date are required.",
      });
      return;
    }

    const commissionRate = Number(agreementForm.commissionRate);
    const platformShareRate = Number(agreementForm.platformShareRate);

    if (
      Number.isNaN(commissionRate) ||
      Number.isNaN(platformShareRate) ||
      commissionRate < 0 ||
      commissionRate > 100 ||
      platformShareRate < 0 ||
      platformShareRate > 100
    ) {
      toast.error("Invalid rates", {
        description:
          "Commission and platform share rates must be between 0 and 100.",
      });
      return;
    }

    saveAgreementMutation.mutate({
      partnerId: partner.id,
      agreementId: editingAgreement?.id,
      payload: {
        title: agreementForm.title.trim(),
        description: agreementForm.description.trim() || undefined,
        termsSummary: agreementForm.termsSummary.trim() || undefined,
        status: agreementForm.status,
        version: agreementForm.version.trim(),
        effectiveDate: agreementForm.effectiveDate,
        endDate: agreementForm.endDate,
        payoutCycle: agreementForm.payoutCycle,
        commissionRate,
        platformShareRate,
      },
    });
  };

  if (partnerQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="outline" asChild>
          <Link href="/admin/partners">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Partners
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading partner profile...
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {partnerQuery.error instanceof Error
              ? partnerQuery.error.message
              : "Partner not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const partnerShareRate =
    primaryAgreement?.platformShareRate != null
      ? Math.max(0, 100 - primaryAgreement.platformShareRate)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/partners">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Partners
            </Link>
          </Button>
          <h1 className="mt-3 text-2xl font-heading font-bold">
            {partner.name}
          </h1>
          <p className="text-xs capitalize text-muted-foreground">
            Partner Profile - {partner.type.replace("_", " ")}
          </p>
        </div>
        <Badge
          className={`${statusBadge[partner.status]} border text-xs capitalize`}
        >
          {partner.status}
        </Badge>
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-border">
          {partner.isPublic ? (
            <Eye className="h-3.5 w-3.5 text-primary" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-xs font-bold mr-2">
            {partner.isPublic ? "Public Profile" : "Private Profile"}
          </span>
          <Switch
            checked={partner.isPublic}
            onCheckedChange={() => setVisibilityDialogOpen(true)}
            disabled={isUpdatingVisibility}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Business Profile (New Fields) */}
        <Card className="md:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/30 p-4 border-b flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" /> Business Profile
              </h2>
              <Badge variant="outline" className="text-[10px]">
                Public Details
              </Badge>
            </div>
            <div className="p-5 grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                  {partner.logo ? (
                    <img src={partner.logo} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground/20" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm">{partner.name}</h3>
                  <p className="text-xs text-muted-foreground italic">
                    "{partner.tagline || "No tagline provided"}"
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {partner.foundedYear && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        Est. {partner.foundedYear}
                      </Badge>
                    )}
                    {partner.teamSize && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        <Users className="h-3 w-3 mr-1" /> {partner.teamSize}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold">Location:</span>
                  <span className="text-muted-foreground">
                    {partner.city}, {partner.country}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-primary mt-0.5" />
                  <span className="font-semibold">Address:</span>
                  <span className="text-muted-foreground">
                    {partner.address || partner.location || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold">Website:</span>
                  {partner.socialLinks?.website || partner.email ? (
                    <a 
                      href={partner.socialLinks?.website || "#"} 
                      target="_blank" 
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {partner.socialLinks?.website || partner.email} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2 pt-2 border-t">
                <p className="text-xs font-bold text-muted-foreground">Public Description</p>
                <div className="text-xs text-foreground leading-relaxed bg-muted/10 p-3 rounded-lg border italic">
                  {partner.description || "No public description available."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Finance Card (Now Column 3) */}
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contact Details
            </h2>
            <p className="text-sm font-semibold">{partner.contactName}</p>
            <p className="text-xs">{partner.email}</p>
            <p className="text-xs">{partner.phone || "-"}</p>
            <div className="pt-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Internal Notes</p>
              <p className="text-xs text-muted-foreground bg-amber-50 p-2 rounded border border-amber-100">
                {partner.notes || "No internal notes"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Finance
            </h2>
            <p className="text-xs">
              Paid Commissions:{" "}
              <strong>{formatCurrency(commissionSummary.paid)}</strong>
            </p>
            <p className="text-xs">
              Pending Commissions:{" "}
              <strong>{formatCurrency(commissionSummary.pending)}</strong>
            </p>
            <p className="text-xs">
              Total Commissions:{" "}
              <strong>{formatCurrency(commissionSummary.total)}</strong>
            </p>
            <p className="text-xs">
              Partner Revenue Share: {partner.revenueShareRate ?? 0}%
            </p>
            <p className="text-xs">
              Agreement Commission: {primaryAgreement?.commissionRate ?? "-"}%
            </p>
            <p className="text-xs">
              Platform Share (Agreement):{" "}
              {primaryAgreement?.platformShareRate ?? "-"}%
            </p>
            <p className="text-xs">
              Partner Share (Agreement):{" "}
              {partnerShareRate != null ? `${partnerShareRate}%` : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Operations
            </h2>
            <p className="text-xs">
              Agreements: <strong>{agreements.length}</strong>
            </p>
            <p className="text-xs">Created: {formatDate(partner.createdAt)}</p>
            <p className="text-xs">
              Last Updated: {formatDate(partner.updatedAt)}
            </p>
            <p className="text-xs capitalize">Status: {partner.status}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" /> Agreements
              <Badge variant="outline" className="text-[10px]">
                {agreements.length}
              </Badge>
            </h2>
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={openAddAgreement}
            >
              <Plus className="h-3.5 w-3.5" /> Add Agreement
            </Button>
          </div>

          {agreementsQuery.isLoading ? (
            <p className="text-xs text-muted-foreground">
              Loading agreements...
            </p>
          ) : agreements.length === 0 ? (
            <p className="text-xs text-muted-foreground">No agreements yet.</p>
          ) : (
            <div className="space-y-3">
              {agreements.map((agreement) => (
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
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs"
                        onClick={() => openEditAgreement(agreement)}
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs text-destructive"
                        onClick={() => setDeletingAgreement(agreement)}
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {agreement.termsSummary || "No summary"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    <span>{agreement.version}</span>
                    <span>
                      Effective: {formatDate(agreement.effectiveDate)}
                    </span>
                    <span>Ends: {formatDate(agreement.endDate)}</span>
                    <span>Updated: {formatDate(agreement.updatedAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                    <span>Payout: {agreement.payoutCycle}</span>
                    <span>Commission: {agreement.commissionRate}%</span>
                    <span>Platform Share: {agreement.platformShareRate}%</span>
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
            <Button
              size="sm"
              onClick={() => handleSetStatus("active")}
              className="gap-1.5 text-xs"
              disabled={
                updateStatusMutation.isPending || partner.status === "active"
              }
            >
              <CheckCircle className="h-3.5 w-3.5" /> Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={() => handleSetStatus("pending")}
              disabled={
                updateStatusMutation.isPending || partner.status === "pending"
              }
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Mark Pending
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5 text-xs"
              disabled={
                terminateMutation.isPending || partner.status === "inactive"
              }
              onClick={() => setTerminateOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Terminate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => router.push("/admin/partners")}
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={agreementFormOpen}
        onOpenChange={(open) => {
          setAgreementFormOpen(open);
          if (!open) {
            setEditingAgreement(null);
            setAgreementForm(emptyAgreementForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAgreement ? "Edit Agreement" : "Add Agreement"}
            </DialogTitle>
            <DialogDescription>
              Update agreement terms and financial settings for this partner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                value={agreementForm.title}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Version *</Label>
              <Input
                value={agreementForm.version}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    version: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={agreementForm.status}
                onValueChange={(value: AgreementFormState["status"]) =>
                  setAgreementForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agreementStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Payout Cycle *</Label>
              <Select
                value={agreementForm.payoutCycle}
                onValueChange={(value: AgreementFormState["payoutCycle"]) =>
                  setAgreementForm((prev) => ({ ...prev, payoutCycle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">monthly</SelectItem>
                  <SelectItem value="quarterly">quarterly</SelectItem>
                  <SelectItem value="biannual">biannual</SelectItem>
                  <SelectItem value="annual">annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Effective Date *</Label>
              <Input
                type="date"
                value={agreementForm.effectiveDate}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    effectiveDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={agreementForm.endDate}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    endDate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Commission Rate % *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={agreementForm.commissionRate}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    commissionRate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Platform Share % *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={agreementForm.platformShareRate}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    platformShareRate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={agreementForm.description}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={2}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Terms Summary</Label>
              <Textarea
                value={agreementForm.termsSummary}
                onChange={(event) =>
                  setAgreementForm((prev) => ({
                    ...prev,
                    termsSummary: event.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAgreementFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAgreement}
              disabled={saveAgreementMutation.isPending}
            >
              {saveAgreementMutation.isPending
                ? "Saving..."
                : editingAgreement
                  ? "Save"
                  : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingAgreement)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingAgreement(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Delete Agreement</DialogTitle>
            <DialogDescription>
              This removes the agreement permanently. Agreements with related
              payouts or inputs cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs">
            Agreement: <strong>{deletingAgreement?.title}</strong>
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingAgreement(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteAgreementMutation.isPending || !deletingAgreement}
              onClick={() => {
                if (!partner || !deletingAgreement) {
                  return;
                }

                deleteAgreementMutation.mutate({
                  partnerId: partner.id,
                  agreementId: deletingAgreement.id,
                });
              }}
            >
              {deleteAgreementMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={terminateOpen}
        onOpenChange={(open) => {
          setTerminateOpen(open);
          if (!open) {
            setTerminateNotes("");
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Terminate Partner</DialogTitle>
            <DialogDescription>
              This will mark the partner as inactive and cancel pending
              commissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-xs">
            <p>
              Partner: <strong>{partner.name}</strong>
            </p>
            <Label>Notes (Optional)</Label>
            <Textarea
              rows={3}
              value={terminateNotes}
              onChange={(event) => setTerminateNotes(event.target.value)}
              placeholder="Provide context for termination"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                terminateMutation.mutate({
                  id: partner.id,
                  notes: terminateNotes,
                })
              }
              disabled={terminateMutation.isPending}
            >
              {terminateMutation.isPending ? "Terminating..." : "Terminate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visibility Confirmation Dialog */}
      <Dialog open={visibilityDialogOpen} onOpenChange={setVisibilityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Public Visibility?</DialogTitle>
            <DialogDescription>
              {partner.isPublic 
                ? "This will hide the partner from the public directory. Users will no longer be able to see their profile or products in the marketplace." 
                : "This will make the partner profile public. Their business details, tagline, and offerings will be visible to all users on the platform."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVisibilityDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                setVisibilityDialogOpen(false);
                setIsUpdatingVisibility(true);
                try {
                  await updateStatusMutation.mutateAsync({
                    id: partner.id,
                    status: partner.status as any,
                    // @ts-ignore
                    isPublic: !partner.isPublic
                  });
                  toast.success(partner.isPublic ? "Partner is now Private" : "Partner is now Public");
                } catch (error) {
                  toast.error("Failed to update visibility");
                } finally {
                  setIsUpdatingVisibility(false);
                }
              }}
            >
              Confirm Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
