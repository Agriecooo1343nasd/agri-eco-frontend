"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Partner, PartnerApplication } from "@/data/community";
import {
  Handshake,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  DollarSign,
  Calendar,
  Package,
  FileText,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";
import {
  createPartnerAgreement,
  createPartnerFromApplication,
  createPartnerFromInput,
  getPartnerApplications,
  getPartners,
  savePartnerApplications,
  savePartners,
} from "@/lib/partner-store";

const statusBadge: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-muted text-muted-foreground border-border",
  terminated: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeBadge: Record<string, string> = {
  "tourism-operator": " Tourism",
  hotel: " Hotel",
  restaurant: " Restaurant",
  school: " School",
  ngo: " NGO",
};

export default function AdminPartnersPage() {
  const router = useRouter();
  const { formatPrice } = usePricing();
  const [activeTab, setActiveTab] = useState("partners");
  const [search, setSearch] = useState("");
  const [partners, setPartners] = useState<Partner[]>(() => getPartners());
  const [applications, setApplications] = useState<PartnerApplication[]>(() =>
    getPartnerApplications(),
  );

  const [formOpen, setFormOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [profilePartner, setProfilePartner] = useState<Partner | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<PartnerApplication | null>(null);

  const [agreementTitle, setAgreementTitle] = useState("");
  const [agreementSummary, setAgreementSummary] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const [formState, setFormState] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    type: "tourism-operator" as Partner["type"],
    aboutBusiness: "",
    status: "active" as Partner["status"],
    networkStatus: "onboarding" as Partner["networkStatus"],
    commissionRate: "10",
    partnerSharePercent: "90",
    platformSharePercent: "10",
    grossRevenue: "0",
    totalBookings: "0",
    payoutCycle: "monthly" as Partner["payoutCycle"],
    payoutStatus: "pending" as Partner["payoutStatus"],
    notes: "",
  });

  const filteredPartners = partners.filter(
    (p) =>
      !search ||
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalRevenue = partners.reduce((s, p) => s + p.totalRevenue, 0);
  const totalBookings = partners.reduce((s, p) => s + p.totalBookings, 0);

  const filteredApplications = applications.filter(
    (application) =>
      !search ||
      application.businessName.toLowerCase().includes(search.toLowerCase()) ||
      application.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      application.email.toLowerCase().includes(search.toLowerCase()),
  );



  const resetForm = () => {
    setFormState({
      businessName: "",
      contactPerson: "",
      email: "",
      phone: "",
      type: "tourism-operator",
      aboutBusiness: "",
      status: "active",
      networkStatus: "onboarding",
      commissionRate: "10",
      partnerSharePercent: "90",
      platformSharePercent: "10",
      grossRevenue: "0",
      totalBookings: "0",
      payoutCycle: "monthly",
      payoutStatus: "pending",
      notes: "",
    });
    setEditingPartner(null);
  };

  const openEditPartnerDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormState({
      businessName: partner.businessName,
      contactPerson: partner.contactPerson,
      email: partner.email,
      phone: partner.phone,
      type: partner.type,
      aboutBusiness: partner.aboutBusiness,
      status: partner.status,
      networkStatus: partner.networkStatus,
      commissionRate: String(partner.commissionRate),
      partnerSharePercent: String(partner.partnerSharePercent),
      platformSharePercent: String(partner.platformSharePercent),
      grossRevenue: String(partner.grossRevenue),
      totalBookings: String(partner.totalBookings),
      payoutCycle: partner.payoutCycle,
      payoutStatus: partner.payoutStatus,
      notes: partner.notes ?? "",
    });
    setFormOpen(true);
  };

  const syncPartners = (next: Partner[]) => {
    setPartners(next);
    savePartners(next);
  };

  const syncApplications = (next: PartnerApplication[]) => {
    setApplications(next);
    savePartnerApplications(next);
  };

  const handleSavePartner = () => {
    if (
      !formState.businessName ||
      !formState.contactPerson ||
      !formState.email ||
      !formState.phone
    ) {
      toast.error("Missing Required Fields", {
        description:
          "Business name, contact person, email and phone are required.",
      });
      return;
    }

    const partnerShare = Number(formState.partnerSharePercent);
    const platformShare = Number(formState.platformSharePercent);
    if (partnerShare + platformShare !== 100) {
      toast.error("Invalid Revenue Share", {
        description:
          "Partner share and platform share must add up to exactly 100%.",
      });
      return;
    }

    if (editingPartner) {
      const grossRevenue = Math.max(0, Number(formState.grossRevenue));
      const next = partners.map((partner) => {
        if (partner.id !== editingPartner.id) return partner;
        return {
          ...partner,
          businessName: formState.businessName,
          contactPerson: formState.contactPerson,
          email: formState.email,
          phone: formState.phone,
          type: formState.type,
          aboutBusiness: formState.aboutBusiness,
          status: formState.status,
          networkStatus: formState.networkStatus,
          commissionRate: Number(formState.commissionRate),
          partnerSharePercent: partnerShare,
          platformSharePercent: platformShare,
          grossRevenue,
          partnerEarnings: Math.round((grossRevenue * partnerShare) / 100),
          platformEarnings: Math.round((grossRevenue * platformShare) / 100),
          payoutCycle: formState.payoutCycle,
          payoutStatus: formState.payoutStatus,
          totalBookings: Number(formState.totalBookings),
          totalRevenue: grossRevenue,
          notes: formState.notes,
        };
      });

      syncPartners(next);
      toast.success("Partner Updated", {
        description: `${formState.businessName} was updated successfully.`,
      });
    } else {
      const created = createPartnerFromInput({
        businessName: formState.businessName,
        contactPerson: formState.contactPerson,
        email: formState.email,
        phone: formState.phone,
        type: formState.type,
        aboutBusiness: formState.aboutBusiness,
        status: formState.status,
        networkStatus: formState.networkStatus,
        commissionRate: Number(formState.commissionRate),
        partnerSharePercent: partnerShare,
        platformSharePercent: platformShare,
        grossRevenue: Number(formState.grossRevenue),
        totalBookings: Number(formState.totalBookings),
        payoutCycle: formState.payoutCycle,
        payoutStatus: formState.payoutStatus,
        notes: formState.notes,
      });
      syncPartners([created, ...partners]);
      toast.success("Partner Registered", {
        description: `${created.businessName} has been added to the network.`,
      });
    }

    setFormOpen(false);
    resetForm();
  };

  const handleApproveApplication = (application: PartnerApplication) => {
    const approvedApp: PartnerApplication = {
      ...application,
      status: "approved",
      reviewedDate: new Date().toISOString().slice(0, 10),
      reviewNotes: reviewNotes || "Application approved by admin.",
    };

    const nextApplications = applications.map((current) =>
      current.id === application.id ? approvedApp : current,
    );
    syncApplications(nextApplications);

    const createdPartner = createPartnerFromApplication(approvedApp);
    syncPartners([createdPartner, ...partners]);

    toast.success("Application Approved", {
      description: `${application.businessName} was approved and added as a partner.`,
    });
    setReviewNotes("");
    setReviewOpen(false);
    setSelectedApplication(null);
  };

  const handleRejectApplication = (application: PartnerApplication) => {
    if (!reviewNotes.trim()) {
      toast.error("Review Notes Required", {
        description:
          "Please include a short reason to help the applicant improve and re-apply.",
      });
      return;
    }

    const nextApplications: PartnerApplication[] = applications.map((current) =>
      current.id === application.id
        ? {
            ...current,
            status: "rejected" as const,
            reviewedDate: new Date().toISOString().slice(0, 10),
            reviewNotes,
          }
        : current,
    );

    syncApplications(nextApplications);
    toast.error("Application Rejected", {
      description: `${application.businessName} was marked as rejected.`,
    });
    setReviewNotes("");
    setReviewOpen(false);
    setSelectedApplication(null);
  };

  const handleActivatePartner = (partner: Partner) => {
    const next: Partner[] = partners.map((entry) =>
      entry.id === partner.id
        ? {
            ...entry,
            status: "active" as const,
            networkStatus: "verified" as const,
          }
        : entry,
    );
    syncPartners(next);
    toast.success("Partner Activated", {
      description: `${partner.businessName} is now active in the network.`,
    });
  };

  const handleTerminatePartner = (partner: Partner) => {
    const next: Partner[] = partners.map((entry) =>
      entry.id === partner.id
        ? {
            ...entry,
            status: "terminated" as const,
            networkStatus: "suspended" as const,
            payoutStatus: "on-hold" as const,
          }
        : entry,
    );
    syncPartners(next);
    toast.error("Partner Terminated", {
      description: `Termination process for ${partner.businessName} initiated.`,
    });
  };

  const handleAddAgreement = () => {
    if (!profilePartner || !agreementTitle.trim() || !agreementSummary.trim()) {
      toast.error("Missing Agreement Data", {
        description: "Agreement title and summary are required.",
      });
      return;
    }

    const newAgreement = createPartnerAgreement(
      agreementTitle.trim(),
      agreementSummary.trim(),
    );
    const next = partners.map((partner) =>
      partner.id === profilePartner.id
        ? { ...partner, agreements: [newAgreement, ...partner.agreements] }
        : partner,
    );
    syncPartners(next);

    const updatedProfile = next.find((partner) => partner.id === profilePartner.id);
    if (updatedProfile) setProfilePartner(updatedProfile);

    setAgreementTitle("");
    setAgreementSummary("");
    toast.success("Agreement Added", {
      description: "A new agreement has been added to this partner.",
    });
  };

  return (
    <div className="space-y-6 text-xs font-medium">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Partners & Community Network
          </h1>
          <p className="text-sm text-muted-foreground font-semibold tracking-tight">
            {partners.length} registered partners · {applications.length} total
            applications
          </p>
        </div>
        <Button className="gap-2 text-xs font-bold h-10 px-6 shadow-sm" asChild>
          <Link href="/admin/partners/new">
            <Plus className="h-4 w-4" /> Register New Partner
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Partners",
            value: partners.filter((p) => p.status === "active").length,
            icon: Handshake,
          },
          {
            label: "Total Bookings",
            value: totalBookings,
            icon: Calendar,
          },
          {
            label: "Total Revenue",
            value: `${(totalRevenue / 1000000).toFixed(1)}M RWF`,
            icon: DollarSign,
          },
          {
            label: "Partner Packages",
            value: partners.reduce((s, p) => s + p.packages.length, 0),
            icon: Package,
          },
          {
            label: "Pending Applications",
            value: applications.filter((app) => app.status === "pending").length,
            icon: FileText,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 bg-muted/30 rounded-lg flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-white transition-all`}
              >
                <s.icon
                  className={`h-5 w-5 text-muted-foreground group-hover:text-white transition-colors`}
                />
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

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none font-medium"
            placeholder="Search by business or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="text-xs" asChild>
          <Link href="/admin/partners/application">Open Applications Page</Link>
        </Button>
      </div>

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
                      Commission (%)
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">
                      Bookings
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Revenue
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                      Network Status
                    </TableHead>
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.filter((p) => p.status === "active").map((partner) => (
                    <TableRow
                      key={partner.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <p className="font-bold text-foreground text-[11px] mb-0.5">
                          {partner.businessName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter italic">
                          Joined {partner.joinedDate}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                          {typeBadge[partner.type] || partner.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-[11px] font-bold text-foreground mb-0.5">
                          {partner.contactPerson}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium underline underline-offset-2">
                          {partner.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-sm text-foreground">
                          {partner.commissionRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-[11px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-md">
                          {partner.totalBookings}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-sm">
                        {formatPrice(partner.totalRevenue)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusBadge[partner.status]} border text-[10px] font-bold py-0 px-2 shadow-none capitalize`}
                        >
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => {
                                setProfilePartner(partner);
                                setProfileOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Partner Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => openEditPartnerDialog(partner)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Update Partner
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => router.push(`/admin/partners/${partner.id}`)}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Open Full Page
                            </DropdownMenuItem>
                            {partner.status !== "active" && (
                              <DropdownMenuItem
                                className="gap-2 text-xs py-2 cursor-pointer"
                                onClick={() => handleActivatePartner(partner)}
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                Activate Partner
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleTerminatePartner(partner)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Terminate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                    <TableHead className="w-12 text-center"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <p className="font-bold text-[11px]">{application.businessName}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {application.aboutBusiness}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[11px] font-semibold">{application.contactPerson}</p>
                        <p className="text-[10px] text-muted-foreground">{application.email}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20">
                          {typeBadge[application.type] || application.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-[11px] font-semibold">
                        {application.appliedDate}
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
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => {
                                setSelectedApplication(application);
                                setReviewNotes(application.reviewNotes || "");
                                setReviewOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Application
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() =>
                                router.push(`/admin/partners/application/${application.id}`)
                              }
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Open Detail Page
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

      </Tabs>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingPartner ? "Update Partner" : "Register a New Partner"}
            </DialogTitle>
            <DialogDescription>
              Capture the key business, network, agreement and financial setup.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px]">Business Name *</Label>
              <Input
                value={formState.businessName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, businessName: event.target.value }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Partner Type</Label>
              <Select
                value={formState.type}
                onValueChange={(value: Partner["type"]) =>
                  setFormState((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourism-operator">Tourism Operator</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Partner Status</Label>
              <Select
                value={formState.status}
                onValueChange={(value: Partner["status"]) =>
                  setFormState((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Network Status</Label>
              <Select
                value={formState.networkStatus}
                onValueChange={(value: Partner["networkStatus"]) =>
                  setFormState((prev) => ({ ...prev, networkStatus: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Gross Revenue (RWF)</Label>
              <Input
                type="number"
                min="0"
                value={formState.grossRevenue}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, grossRevenue: event.target.value }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Commission %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formState.commissionRate}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, commissionRate: event.target.value }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Partner Share %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formState.partnerSharePercent}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, partnerSharePercent: event.target.value }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Platform Share %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formState.platformSharePercent}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, platformSharePercent: event.target.value }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Payout Cycle</Label>
              <Select
                value={formState.payoutCycle}
                onValueChange={(value: Partner["payoutCycle"]) =>
                  setFormState((prev) => ({ ...prev, payoutCycle: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Payout Status</Label>
              <Select
                value={formState.payoutStatus}
                onValueChange={(value: Partner["payoutStatus"]) =>
                  setFormState((prev) => ({ ...prev, payoutStatus: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-[11px]">About Business</Label>
              <Textarea
                rows={3}
                value={formState.aboutBusiness}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, aboutBusiness: event.target.value }))
                }
                className="text-xs"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-[11px]">Notes</Label>
              <Textarea
                rows={2}
                value={formState.notes}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePartner}>
              {editingPartner ? "Save Updates" : "Register Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {profilePartner && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {profilePartner.businessName}
                </DialogTitle>
                <DialogDescription>
                  Partner profile, finance and agreement overview.
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                      Contact
                    </h3>
                    <p className="text-sm font-bold">{profilePartner.contactPerson}</p>
                    <p className="text-xs">{profilePartner.email}</p>
                    <p className="text-xs">{profilePartner.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {profilePartner.aboutBusiness}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                      Revenue Share
                    </h3>
                    <p className="text-xs">Gross: {formatPrice(profilePartner.grossRevenue)}</p>
                    <p className="text-xs">
                      Partner ({profilePartner.partnerSharePercent}%): {formatPrice(profilePartner.partnerEarnings)}
                    </p>
                    <p className="text-xs">
                      Platform ({profilePartner.platformSharePercent}%): {formatPrice(profilePartner.platformEarnings)}
                    </p>
                    <p className="text-xs">Payout: {profilePartner.payoutCycle}</p>
                    <Badge className="text-[10px] capitalize">{profilePartner.payoutStatus}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                      Operations
                    </h3>
                    <p className="text-xs">Bookings: {profilePartner.totalBookings}</p>
                    <p className="text-xs">Joined: {profilePartner.joinedDate}</p>
                    <Badge className={`${statusBadge[profilePartner.status]} text-[10px]`}>
                      {profilePartner.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Network: {profilePartner.networkStatus}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3 border border-border rounded-xl p-4">
                <h3 className="font-semibold text-sm">Agreements</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {profilePartner.agreements.map((agreement) => (
                    <Card key={agreement.id}>
                      <CardContent className="p-3 space-y-1">
                        <p className="text-xs font-bold">{agreement.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {agreement.termsSummary}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="text-[10px] capitalize">{agreement.status}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {agreement.version}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Agreement Title</Label>
                    <Input
                      className="h-9 text-xs"
                      value={agreementTitle}
                      onChange={(event) => setAgreementTitle(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Terms Summary</Label>
                    <Input
                      className="h-9 text-xs"
                      value={agreementSummary}
                      onChange={(event) => setAgreementSummary(event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="text-xs" onClick={handleAddAgreement}>
                    Add Agreement
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => openEditPartnerDialog(profilePartner)}
                  >
                    Update Partner
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => router.push(`/admin/partners/${profilePartner.id}`)}
                  >
                    Open Full Partner Page
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading">Partner Application Review</DialogTitle>
                <DialogDescription>
                  Review application details and approve or reject.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-xs">
                <div className="grid md:grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3 space-y-1">
                      <p className="font-semibold">{selectedApplication.businessName}</p>
                      <p>{selectedApplication.contactPerson}</p>
                      <p>{selectedApplication.email}</p>
                      <p>{selectedApplication.phone}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 space-y-1">
                      <p>Type: {typeBadge[selectedApplication.type] || selectedApplication.type}</p>
                      <p>Applied: {selectedApplication.appliedDate}</p>
                      <Badge className="capitalize">{selectedApplication.status}</Badge>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Business Description</Label>
                  <Textarea
                    rows={3}
                    readOnly
                    value={selectedApplication.aboutBusiness}
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
                  onClick={() => handleRejectApplication(selectedApplication)}
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
                <Button
                  className="gap-1"
                  onClick={() => handleApproveApplication(selectedApplication)}
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
