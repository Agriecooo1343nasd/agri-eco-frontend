"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  artisans as mockArtisans,
  artisanApplications,
  type ArtisanApplication,
} from "@/data/community";
import {
  fetchAdminArtisans,
  fetchAdminArtisanStats,
  toAbsoluteArtisanImage,
} from "@/lib/api/artisans";
import {
  Users,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Plus,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Clock,
  Star,
  Package,
  Trash2,
  Edit,
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  inactive: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const ITEMS_PER_PAGE = 10;

export default function AdminArtisansPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("artisans");
  const [viewApp, setViewApp] = useState<ArtisanApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Delete product confirmation
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<{
    id: string | number;
    name: string;
    artisanName: string;
  } | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(id);
  }, [search]);

  const statsQuery = useQuery({
    queryKey: ["admin-artisan-stats"],
    queryFn: fetchAdminArtisanStats,
  });

  const artisansQuery = useQuery({
    queryKey: ["admin-artisans", page, debouncedSearch],
    queryFn: () =>
      fetchAdminArtisans({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        sort: "createdAt",
        order: "desc",
      }),
    enabled: activeTab === "artisans",
  });

  const activeArtisansCount = statsQuery.data?.activeArtisans ?? 0;
  const pendingApplicationsCount =
    statsQuery.data?.pendingApplications ??
    artisanApplications.filter((a) => a.status === "pending").length;
  const totalProductsCount = statsQuery.data?.totalProducts ?? 0;
  const featuredArtisansCount = statsQuery.data?.featuredCount ?? 0;

  const artisanRows = artisansQuery.data?.data ?? [];
  const artisanPagination =
    artisansQuery.data?.pagination ??
    ({
      total: 0,
      page: 1,
      limit: ITEMS_PER_PAGE,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    } as const);

  const pendingApps = artisanApplications.filter((a) => a.status === "pending");
  const allProducts = mockArtisans.flatMap((a) =>
    a.products.map((p) => ({ ...p, artisanName: a.name, artisanId: a.id })),
  );

  const filteredApps = artisanApplications.filter(
    (a) =>
      !search ||
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty.toLowerCase().includes(search.toLowerCase()),
  );

  const handleApprove = (app: ArtisanApplication) => {
    toast.success("Application Approved", {
      description: `${app.fullName} has been approved as an artisan.`,
    });
    setViewApp(null);
  };

  const handleReject = (app: ArtisanApplication) => {
    toast.error("Application Rejected", {
      description: `${app.fullName}'s application has been rejected.`,
    });
    setViewApp(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Artisan Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {activeArtisansCount} active artisans | {pendingApplicationsCount}{" "}
            pending applications | {totalProductsCount} products
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/admin/artisans/create")}
        >
          <Plus className="h-4 w-4" /> Add Artisan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Artisans",
            value: activeArtisansCount,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Pending Applications",
            value: pendingApplicationsCount,
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Total Products",
            value: totalProductsCount,
            icon: Package,
            color: "text-primary",
          },
          {
            label: "Featured Artisans",
            value: featuredArtisansCount,
            icon: Star,
            color: "text-amber-500",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto p-1">
          <TabsTrigger value="artisans" className="gap-1.5 text-sm py-2">
            <Users className="h-4 w-4" /> Artisans
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="gap-1.5 text-sm py-2 relative"
          >
            <Mail className="h-4 w-4" /> Applications
            {pendingApplicationsCount > 0 && (
              <span className="ml-1 bg-amber-500 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingApplicationsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5 text-sm py-2">
            <ShoppingBag className="h-4 w-4" /> Products
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="flex items-center border border-border rounded-lg bg-card max-w-xs mt-4">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Artisans Tab */}
        <TabsContent value="artisans" className="mt-4">
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Artisan</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artisansQuery.isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading artisans...
                      </TableCell>
                    </TableRow>
                  )}
                  {!artisansQuery.isLoading && artisanRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No artisans found.
                      </TableCell>
                    </TableRow>
                  )}
                  {artisanRows.map((a) => {
                    const status = a.isActive ? "active" : "inactive";

                    return (
                      <TableRow key={a.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={toAbsoluteArtisanImage(a.image)}
                              alt={a.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {a.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {a.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {a.specialty}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {a.location || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {a.products?.length ?? 0}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusColors[status]} border text-xs capitalize`}
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {a.isFeatured && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
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
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() =>
                                  router.push(`/admin/artisans/${a.id}`)
                                }
                              >
                                <Eye className="h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() =>
                                  router.push(
                                    `/admin/artisans/${a.id}/add-product`,
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" /> Add Product
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() =>
                                  router.push(`/admin/artisans/${a.id}/edit`)
                                }
                              >
                                <Edit className="h-4 w-4" /> Edit Artisan
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" /> Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row mt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Showing page {artisanPagination.page} of {artisanPagination.pages}{" "}
              ( {artisanPagination.total} total artisans)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={
                  !artisanPagination.hasPrev || artisansQuery.isFetching
                }
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={
                  !artisanPagination.hasNext || artisansQuery.isFetching
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>

          {artisansQuery.isError && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive mt-4">
              Failed to load artisans. Please refresh or verify your admin
              authorization.
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="mt-4">
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Applicant</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {app.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {app.specialty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {app.location}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {app.appliedDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[app.status]} border text-xs capitalize`}
                        >
                          {app.status}
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => setViewApp(app)}
                            >
                              <Eye className="h-4 w-4" /> Review Application
                            </DropdownMenuItem>
                            {app.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleApprove(app)}
                                >
                                  <CheckCircle className="h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 text-destructive"
                                  onClick={() => handleReject(app)}
                                >
                                  <XCircle className="h-4 w-4" /> Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredApps.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-4">
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>Artisan</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts
                    .filter(
                      (p) =>
                        !search ||
                        p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.artisanName
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {p.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.artisanName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {p.category || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {p.price.toLocaleString()} RWF
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.stock ?? "â€”"}
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
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() =>
                                  router.push(
                                    `/admin/artisans/${p.artisanId}/products/${p.id}/edit`,
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => {
                                  setDeleteProductTarget({
                                    id: p.id,
                                    name: p.name,
                                    artisanName: p.artisanName,
                                  });
                                  setDeleteProductOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
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

      {/* View Application Dialog */}
      <Dialog open={!!viewApp} onOpenChange={() => setViewApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewApp && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  Artisan Application Review
                </DialogTitle>
                <DialogDescription>
                  Review the application details and approve or reject.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Applicant Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {viewApp.fullName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{viewApp.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{viewApp.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {viewApp.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Applied: {viewApp.appliedDate}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Craft Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Specialty
                        </p>
                        <Badge className="bg-primary/10 text-primary border-primary/20 border">
                          {viewApp.specialty}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Experience
                        </p>
                        <p className="text-sm text-foreground">
                          {viewApp.experience}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Status
                        </p>
                        <Badge
                          className={`${statusColors[viewApp.status]} border text-xs capitalize`}
                        >
                          {viewApp.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bio */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      About the Applicant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">
                      {viewApp.bio}
                    </p>
                  </CardContent>
                </Card>

                {/* Portfolio */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Portfolio Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">
                      {viewApp.portfolioDescription}
                    </p>
                  </CardContent>
                </Card>

                {/* Review Notes (if reviewed) */}
                {viewApp.reviewNotes && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Review Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground">
                        {viewApp.reviewNotes}
                      </p>
                      {viewApp.reviewedDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed on {viewApp.reviewedDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Admin Actions */}
                {viewApp.status === "pending" && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label>Review Notes (optional)</Label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={3}
                      />
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleReject(viewApp)}
                      >
                        <XCircle className="h-4 w-4" /> Reject Application
                      </Button>
                      <Button
                        className="gap-1.5"
                        onClick={() => handleApprove(viewApp)}
                      >
                        <CheckCircle className="h-4 w-4" /> Approve & Create
                        Artisan
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-destructive">
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteProductTarget && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                {deleteProductTarget.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Assigned to: {deleteProductTarget.artisanName}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteProductOpen(false);
                setDeleteProductTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.success("Product Deleted", {
                  description: `"${deleteProductTarget?.name}" has been removed.`,
                });
                setDeleteProductOpen(false);
                setDeleteProductTarget(null);
              }}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
