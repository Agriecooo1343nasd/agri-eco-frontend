"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Handshake,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchAdminPartnerApplications,
  fetchAdminPartners,
  fetchAdminPartnerStats,
  reviewAdminPartnerApplication,
  terminateAdminPartner,
  type AdminPartner,
  type AdminPartnerApplication,
  type AdminPartnerType,
  type ReviewAdminPartnerApplicationPayload,
  updateAdminPartner,
} from "@/lib/api/partners";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeLabel: Record<string, string> = {
  tourism_operator: "Tourism",
  school: "School",
  hospitality: "Hospitality",
  business: "Business",
  ngo: "NGO",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString();
}

function defaultPagination() {
  return {
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  };
}

type EditPartnerFormState = {
  name: string;
  type: AdminPartnerType;
  contactName: string;
  email: string;
  phone: string;
  status: "pending" | "active" | "inactive";
  revenueShareRate: string;
  notes: string;
};

export default function AdminPartnersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("partners");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [partnersPage, setPartnersPage] = useState(1);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<AdminPartnerApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<AdminPartner | null>(null);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [partnerToTerminate, setPartnerToTerminate] =
    useState<AdminPartner | null>(null);
  const [terminateNotes, setTerminateNotes] = useState("");
  const [editFormState, setEditFormState] = useState<EditPartnerFormState>({
    name: "",
    type: "tourism_operator",
    contactName: "",
    email: "",
    phone: "",
    status: "pending",
    revenueShareRate: "0",
    notes: "",
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      if (activeTab === "partners") {
        setPartnersPage(1);
      }

      if (activeTab === "applications") {
        setApplicationsPage(1);
      }
    }, 300);

    return () => window.clearTimeout(id);
  }, [activeTab, search]);

  const statsQuery = useQuery({
    queryKey: ["admin-partner-stats"],
    queryFn: fetchAdminPartnerStats,
  });

  const partnersQuery = useQuery({
    queryKey: ["admin-partners", partnersPage, debouncedSearch],
    queryFn: () =>
      fetchAdminPartners({
        page: partnersPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        sort: "createdAt",
        order: "desc",
      }),
    enabled: activeTab === "partners",
  });

  const applicationsQuery = useQuery({
    queryKey: ["admin-partner-applications", applicationsPage, debouncedSearch],
    queryFn: () =>
      fetchAdminPartnerApplications({
        page: applicationsPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        sort: "createdAt",
        order: "desc",
      }),
    enabled: activeTab === "applications",
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewAdminPartnerApplicationPayload;
    }) => reviewAdminPartnerApplication(id, payload),
    onSuccess: (_, variables) => {
      toast.success(
        variables.payload.status === "approved"
          ? "Application approved"
          : "Application rejected",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-partner-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-partner-applications"],
      });
      setReviewOpen(false);
      setSelectedApplication(null);
      setReviewNotes("");
    },
    onError: (error: Error) => {
      toast.error("Unable to review application", {
        description:
          error.message || "Please retry or verify your admin authorization.",
      });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateAdminPartner>[1];
    }) => updateAdminPartner(id, payload),
    onSuccess: (partner) => {
      toast.success("Partner updated", {
        description: `${partner.name} was updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-stats"] });
      setEditOpen(false);
      setPartnerToEdit(null);
    },
    onError: (error: Error) => {
      toast.error("Unable to update partner", {
        description: error.message || "Please review the values and try again.",
      });
    },
  });

  const terminatePartnerMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      terminateAdminPartner(id, notes),
    onSuccess: (partner) => {
      toast.success("Partner terminated", {
        description: `${partner.name} has been moved to inactive status.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-stats"] });
      setTerminateOpen(false);
      setPartnerToTerminate(null);
      setTerminateNotes("");
    },
    onError: (error: Error) => {
      toast.error("Unable to terminate partner", {
        description:
          error.message || "Please retry or verify your admin authorization.",
      });
    },
  });

  const stats =
    statsQuery.data ??
    ({
      total: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      totalRevenue: 0,
      pendingPayouts: 0,
      totalBookings: 0,
      agreements: {
        active: 0,
        expired: 0,
        terminated: 0,
      },
    } as const);

  const partners = partnersQuery.data?.data ?? [];
  const partnersPagination =
    partnersQuery.data?.pagination ?? defaultPagination();

  const applications = applicationsQuery.data?.data ?? [];
  const applicationsPagination =
    applicationsQuery.data?.pagination ?? defaultPagination();

  const submitReview = (status: "approved" | "rejected") => {
    if (!selectedApplication) {
      return;
    }

    if (status === "rejected" && !reviewNotes.trim()) {
      toast.error("Review notes required", {
        description: "Please provide a reason before rejecting an application.",
      });
      return;
    }

    reviewMutation.mutate({
      id: selectedApplication.id,
      payload: {
        status,
        reviewNote: reviewNotes.trim() || undefined,
      },
    });
  };

  const openEditDialog = (partner: AdminPartner) => {
    setPartnerToEdit(partner);
    setEditFormState({
      name: partner.name,
      type: partner.type,
      contactName: partner.contactName,
      email: partner.email,
      phone: partner.phone ?? "",
      status: partner.status,
      revenueShareRate: String(partner.revenueShareRate ?? 0),
      notes: partner.notes ?? "",
    });
    setEditOpen(true);
  };

  const submitPartnerUpdate = () => {
    if (!partnerToEdit) {
      return;
    }

    if (
      !editFormState.name.trim() ||
      !editFormState.contactName.trim() ||
      !editFormState.email.trim()
    ) {
      toast.error("Missing required fields", {
        description: "Name, contact name, and email are required.",
      });
      return;
    }

    const revenueShareRate = Number(editFormState.revenueShareRate);

    if (
      Number.isNaN(revenueShareRate) ||
      revenueShareRate < 0 ||
      revenueShareRate > 100
    ) {
      toast.error("Invalid revenue share rate", {
        description: "Revenue share rate must be a number between 0 and 100.",
      });
      return;
    }

    updatePartnerMutation.mutate({
      id: partnerToEdit.id,
      payload: {
        name: editFormState.name.trim(),
        type: editFormState.type,
        contactName: editFormState.contactName.trim(),
        email: editFormState.email.trim(),
        phone: editFormState.phone.trim() || undefined,
        status: editFormState.status,
        revenueShareRate,
        notes: editFormState.notes.trim() || undefined,
      },
    });
  };

  const requestPartnerTerminate = (partner: AdminPartner) => {
    setPartnerToTerminate(partner);
    setTerminateNotes("");
    setTerminateOpen(true);
  };

  const submitPartnerTerminate = () => {
    if (!partnerToTerminate) {
      return;
    }

    terminatePartnerMutation.mutate({
      id: partnerToTerminate.id,
      notes: terminateNotes,
    });
  };

  const listError =
    activeTab === "partners" ? partnersQuery.error : applicationsQuery.error;

  const partnersApiCaveats = useMemo(
    () => [
      "Partner profile financial breakdown and agreements are not part of /partners list payload",
      "Packages KPI is approximated from agreement counts returned by /partners/stats.",
    ],
    [],
  );

  return (
    <div className="space-y-6 text-xs font-medium">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Partners & Community Network
          </h1>
          <p className="text-sm text-muted-foreground font-semibold tracking-tight">
            {stats.total} total partners | {stats.pending} pending applications
          </p>
        </div>
        <Button className="gap-2 text-xs font-bold h-10 px-6 shadow-sm" asChild>
          <Link href="/admin/partners/new">
            <Plus className="h-4 w-4" /> Register New Partner
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Partners",
            value: String(stats.active),
            icon: Handshake,
          },
          {
            label: "Pending Applications",
            value: String(stats.pending),
            icon: FileText,
          },
          {
            label: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
          },
          {
            label: "Pending Payouts",
            value: formatCurrency(stats.pendingPayouts),
            icon: Wallet,
          },
          {
            label: "Total Bookings",
            value: String(stats.totalBookings ?? 0),
            icon: Eye,
          },
          {
            label: "Partner Packages",
            value: String(
              (stats.agreements?.active ?? 0) +
                (stats.agreements?.expired ?? 0) +
                (stats.agreements?.terminated ?? 0),
            ),
            icon: AlertTriangle,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-muted/30 rounded-lg flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all">
                <s.icon className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
              </div>
              
            </div>
            <p className="text-2xl font-bold font-heading text-foreground mb-0.5">
              {s.value}
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              {s.label}
            </p>
          </div>
        ))}
      </div>



      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none font-medium"
            placeholder={
              activeTab === "partners"
                ? "Search by business/contact/email..."
                : "Search applications by business/contact/email..."
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button variant="outline" className="text-xs" asChild>
          <Link href="/admin/partners/application">Open Applications Page</Link>
        </Button>
      </div>

      {listError ? (
        <div className="border border-destructive/40 bg-destructive/10 rounded-xl p-3 text-xs text-destructive">
          {(listError as Error).message || "Unable to load partner data."}
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full sm:w-80">
          <TabsTrigger value="partners" className="text-xs font-semibold">
            Partners
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-xs font-semibold">
            Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4 pt-2">
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Business Identity
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Classification
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Primary Contact
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Revenue Share (%)
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Joined
                    </TableHead>
                    <TableHead className="w-12 text-center" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnersQuery.isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading partners...
                      </TableCell>
                    </TableRow>
                  ) : partners.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No partners found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    partners.map((partner: AdminPartner) => (
                      <TableRow
                        key={partner.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <p className="font-bold text-foreground text-[11px] mb-0.5">
                            {partner.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter italic">
                            ID: {partner.id}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                            {typeLabel[partner.type] || partner.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-[11px] font-bold text-foreground mb-0.5">
                            {partner.contactName}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium underline underline-offset-2">
                            {partner.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-sm text-foreground">
                            {partner.revenueShareRate ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusBadge[partner.status] || "bg-muted"} border text-[10px] font-bold py-0 px-2 shadow-none capitalize`}
                          >
                            {partner.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] font-semibold">
                          {formatDate(partner.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="text-xs"
                            >
                              <DropdownMenuItem
                                className="gap-2 text-xs py-2 cursor-pointer"
                                onClick={() =>
                                  router.push(`/admin/partners/${partner.id}`)
                                }
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Open Full Page
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-xs py-2 cursor-pointer"
                                onClick={() => openEditDialog(partner)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit Partner
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                disabled={partner.status === "inactive"}
                                onClick={() => requestPartnerTerminate(partner)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {partner.status === "inactive"
                                  ? "Already Inactive"
                                  : "Terminate Partner"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <p className="text-muted-foreground">
              Page {partnersPagination.page} of {partnersPagination.pages} |
              Total {partnersPagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPartnersPage((prev) => Math.max(1, prev - 1))}
                disabled={
                  !partnersPagination.hasPrev || partnersQuery.isFetching
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPartnersPage((prev) => prev + 1)}
                disabled={
                  !partnersPagination.hasNext || partnersQuery.isFetching
                }
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4 pt-2">
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Business
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Contact
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Type
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Applied
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="w-12 text-center" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsQuery.isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading applications...
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No partner applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application: AdminPartnerApplication) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <p className="font-bold text-[11px]">
                            {application.businessName}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {application.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-[11px] font-semibold">
                            {application.contactName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {application.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                            {typeLabel[application.businessType] ||
                              application.businessType}
                          </span>
                        </TableCell>
                        <TableCell className="text-[11px] font-semibold">
                          {formatDate(application.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusBadge[application.status] || "bg-muted"} border text-[10px] font-bold py-0 px-2 shadow-none capitalize`}
                          >
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="text-xs"
                            >
                              <DropdownMenuItem
                                className="gap-2 text-xs py-2 cursor-pointer"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setReviewNotes(application.reviewNote || "");
                                  setReviewOpen(true);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View / Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-xs py-2 cursor-pointer"
                                onClick={() =>
                                  router.push(
                                    `/admin/partners/application/${application.id}`,
                                  )
                                }
                              >
                                <FileText className="h-3.5 w-3.5" />
                                Open Detail Page
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <p className="text-muted-foreground">
              Page {applicationsPagination.page} of{" "}
              {applicationsPagination.pages} | Total{" "}
              {applicationsPagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setApplicationsPage((prev) => Math.max(1, prev - 1))
                }
                disabled={
                  !applicationsPagination.hasPrev ||
                  applicationsQuery.isFetching
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApplicationsPage((prev) => prev + 1)}
                disabled={
                  !applicationsPagination.hasNext ||
                  applicationsQuery.isFetching
                }
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl">
          {selectedApplication ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Partner Application Review
                </DialogTitle>
                <DialogDescription>
                  Review application details and approve or reject.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-xs">
                <div className="grid md:grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3 space-y-1">
                      <p className="font-semibold">
                        {selectedApplication.businessName}
                      </p>
                      <p>{selectedApplication.contactName}</p>
                      <p>{selectedApplication.email}</p>
                      <p>{selectedApplication.phone || "-"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 space-y-1">
                      <p>
                        Type:{" "}
                        {typeLabel[selectedApplication.businessType] ||
                          selectedApplication.businessType}
                      </p>
                      <p>
                        Applied: {formatDate(selectedApplication.createdAt)}
                      </p>
                      <Badge className="capitalize">
                        {selectedApplication.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Business Description</Label>
                  <Textarea
                    rows={3}
                    readOnly
                    value={selectedApplication.description || ""}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Review Notes</Label>
                  <Textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    className="text-xs"
                    placeholder="Add review comments"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  className="gap-1"
                  disabled={
                    reviewMutation.isPending ||
                    selectedApplication.status !== "pending"
                  }
                  onClick={() => submitReview("rejected")}
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
                <Button
                  className="gap-1"
                  disabled={
                    reviewMutation.isPending ||
                    selectedApplication.status !== "pending"
                  }
                  onClick={() => submitReview("approved")}
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setPartnerToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner details using the backend partner update endpoint.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Business Name *</Label>
              <Input
                className="h-9 text-xs"
                value={editFormState.name}
                onChange={(event) =>
                  setEditFormState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Contact Name *</Label>
              <Input
                className="h-9 text-xs"
                value={editFormState.contactName}
                onChange={(event) =>
                  setEditFormState((prev) => ({
                    ...prev,
                    contactName: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Email *</Label>
              <Input
                className="h-9 text-xs"
                type="email"
                value={editFormState.email}
                onChange={(event) =>
                  setEditFormState((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Phone</Label>
              <Input
                className="h-9 text-xs"
                value={editFormState.phone}
                onChange={(event) =>
                  setEditFormState((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Business Type</Label>
              <Select
                value={editFormState.type}
                onValueChange={(value: EditPartnerFormState["type"]) =>
                  setEditFormState((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourism_operator">
                    Tourism Operator
                  </SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Status</Label>
              <Select
                value={editFormState.status}
                onValueChange={(value: EditPartnerFormState["status"]) =>
                  setEditFormState((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[11px]">Revenue Share Rate (%)</Label>
              <Input
                className="h-9 text-xs"
                type="number"
                min="0"
                max="100"
                value={editFormState.revenueShareRate}
                onChange={(event) =>
                  setEditFormState((prev) => ({
                    ...prev,
                    revenueShareRate: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[11px]">Notes</Label>
              <Textarea
                rows={3}
                className="text-xs"
                value={editFormState.notes}
                onChange={(event) =>
                  setEditFormState((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitPartnerUpdate}
              disabled={updatePartnerMutation.isPending}
            >
              {updatePartnerMutation.isPending ? "Saving..." : "Save Updates"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={terminateOpen}
        onOpenChange={(open) => {
          setTerminateOpen(open);
          if (!open) {
            setPartnerToTerminate(null);
            setTerminateNotes("");
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Terminate Partner
            </DialogTitle>
            <DialogDescription>
              This will set partner status to inactive and cancel pending
              commissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <p className="font-semibold text-foreground">
              {partnerToTerminate?.name || "Selected partner"}
            </p>
            <div className="space-y-1">
              <Label className="text-[11px]">
                Termination Notes (Optional)
              </Label>
              <Textarea
                rows={3}
                className="text-xs"
                placeholder="Add context for the termination decision"
                value={terminateNotes}
                onChange={(event) => setTerminateNotes(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitPartnerTerminate}
              disabled={terminatePartnerMutation.isPending}
            >
              {terminatePartnerMutation.isPending
                ? "Terminating..."
                : "Terminate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
