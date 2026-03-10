"use client";

import { useState } from "react";
import {
  artisans,
  artisanApplications,
  type Artisan,
  type ArtisanApplication,
} from "@/data/community";
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
  ImagePlus,
  Save,
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
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MultiLangInput } from "@/components/admin/MultiLangInput";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminArtisansPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("artisans");
  const [viewApp, setViewApp] = useState<ArtisanApplication | null>(null);
  const [viewArtisan, setViewArtisan] = useState<Artisan | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productArtisan, setProductArtisan] = useState<Artisan | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Edit product dialog
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<{
    name: string;
    price: string;
    description: string;
    category: string;
    stock: string;
  } | null>(null);
  const [editProductId, setEditProductId] = useState<string | number | null>(
    null,
  );

  // Delete product confirmation
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<{
    id: string | number;
    name: string;
    artisanName: string;
  } | null>(null);

  // New artisan dialog (for approved applications or manual)
  const [createArtisanOpen, setCreateArtisanOpen] = useState(false);
  const [newArtisan, setNewArtisan] = useState({
    name: "",
    specialty: "",
    location: "",
    description: "",
    story: "",
    email: "",
    phone: "",
    featured: false,
  });

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  const activeArtisans = artisans.filter((a) => a.status === "active");
  const pendingApps = artisanApplications.filter((a) => a.status === "pending");
  const allProducts = artisans.flatMap((a) =>
    a.products.map((p) => ({ ...p, artisanName: a.name, artisanId: a.id })),
  );

  const filteredArtisans = artisans.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty.toLowerCase().includes(search.toLowerCase()),
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

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error("Missing Fields", {
        description: "Please fill in at least the product name and price.",
      });
      return;
    }
    toast.success("Product Added", {
      description: `"${newProduct.name}" has been added to ${productArtisan?.name}'s catalog.`,
    });
    setNewProduct({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: "",
    });
    setAddProductOpen(false);
  };

  const handleCreateArtisan = () => {
    if (!newArtisan.name || !newArtisan.specialty) {
      toast.error("Missing Fields", {
        description: "Please fill in at least the name and specialty.",
      });
      return;
    }
    toast.success("Artisan Created", {
      description: `${newArtisan.name} has been added as an artisan.`,
    });
    setNewArtisan({
      name: "",
      specialty: "",
      location: "",
      description: "",
      story: "",
      email: "",
      phone: "",
      featured: false,
    });
    setCreateArtisanOpen(false);
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
            {activeArtisans.length} active artisans · {pendingApps.length}{" "}
            pending applications · {allProducts.length} products
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateArtisanOpen(true)}>
          <Plus className="h-4 w-4" /> Add Artisan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Artisans",
            value: activeArtisans.length,
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Pending Applications",
            value: pendingApps.length,
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Total Products",
            value: allProducts.length,
            icon: Package,
            color: "text-primary",
          },
          {
            label: "Featured Artisans",
            value: artisans.filter((a) => a.featured).length,
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
            {pendingApps.length > 0 && (
              <span className="ml-1 bg-amber-500 text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingApps.length}
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
                  {filteredArtisans.map((a) => (
                    <TableRow key={a.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={a.image}
                            alt={a.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {a.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.email}
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
                          {a.location}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {a.products.length}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[a.status]} border text-xs capitalize`}
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {a.featured && (
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
                              onClick={() => setViewArtisan(a)}
                            >
                              <Eye className="h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => {
                                setProductArtisan(a);
                                setAddProductOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" /> Add Product
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" /> Edit Artisan
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Star className="h-4 w-4" />{" "}
                              {a.featured ? "Remove Featured" : "Mark Featured"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="h-4 w-4" /> Deactivate
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
                          {p.stock ?? "—"}
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
                                onClick={() => {
                                  setEditProductId(p.id);
                                  setEditProduct({
                                    name: p.name,
                                    price: String(p.price),
                                    description: p.description,
                                    category: p.category || "",
                                    stock: String(p.stock ?? ""),
                                  });
                                  setEditProductOpen(true);
                                }}
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

      {/* View Artisan Details Dialog */}
      <Dialog open={!!viewArtisan} onOpenChange={() => setViewArtisan(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewArtisan && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {viewArtisan.name}
                </DialogTitle>
                <DialogDescription>
                  {viewArtisan.specialty} · {viewArtisan.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                <div className="flex items-start gap-4">
                  <img
                    src={viewArtisan.image}
                    alt={viewArtisan.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground">
                      {viewArtisan.description}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {viewArtisan.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {viewArtisan.email}
                        </span>
                      )}
                      {viewArtisan.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {viewArtisan.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${statusColors[viewArtisan.status]} border text-xs capitalize`}
                      >
                        {viewArtisan.status}
                      </Badge>
                      {viewArtisan.featured && (
                        <Badge
                          variant="outline"
                          className="text-xs gap-1 border-amber-500/30 text-amber-600"
                        >
                          <Star className="h-3 w-3 fill-amber-500" /> Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-sm">
                      Products ({viewArtisan.products.length})
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => {
                        setProductArtisan(viewArtisan);
                        setAddProductOpen(true);
                        setViewArtisan(null);
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add Product
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {viewArtisan.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-foreground">
                            {p.price.toLocaleString()} RWF
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {p.stock ?? "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">
                    Story
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {viewArtisan.story}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Add Product for {productArtisan?.name}
            </DialogTitle>
            <DialogDescription>
              Create a new product and assign it to this artisan's catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <MultiLangInput
              label="Product Name"
              value={{ en: newProduct.name, rw: "", fr: "", sw: "" }}
              onChange={(v) => setNewProduct((p) => ({ ...p, name: v.en }))}
              placeholder="e.g., Handwoven Peace Basket"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (RWF) *</Label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="25000"
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, stock: e.target.value }))
                  }
                  placeholder="10"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newProduct.category}
                onValueChange={(v) =>
                  setNewProduct((p) => ({ ...p, category: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baskets">Baskets</SelectItem>
                  <SelectItem value="Sculptures">Sculptures</SelectItem>
                  <SelectItem value="Pottery">Pottery</SelectItem>
                  <SelectItem value="Kitchenware">Kitchenware</SelectItem>
                  <SelectItem value="Candles">Candles</SelectItem>
                  <SelectItem value="Skincare">Skincare</SelectItem>
                  <SelectItem value="Textiles">Textiles</SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <MultiLangInput
              label="Description"
              value={{ en: newProduct.description, rw: "", fr: "", sw: "" }}
              onChange={(v) =>
                setNewProduct((p) => ({ ...p, description: v.en }))
              }
              placeholder="Describe the product, materials used, crafting process..."
              type="textarea"
              rows={3}
            />
            <div>
              <Label>Product Image</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Artisan Dialog */}
      <Dialog open={createArtisanOpen} onOpenChange={setCreateArtisanOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Add New Artisan</DialogTitle>
            <DialogDescription>
              Manually create an artisan profile. Fields here populate the
              public artisan profile page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={newArtisan.name}
                onChange={(e) =>
                  setNewArtisan((a) => ({ ...a, name: e.target.value }))
                }
                placeholder="Artisan's full name"
              />
            </div>
            <div>
              <Label>Specialty *</Label>
              <Input
                value={newArtisan.specialty}
                onChange={(e) =>
                  setNewArtisan((a) => ({ ...a, specialty: e.target.value }))
                }
                placeholder="e.g., Basket Weaving, Pottery"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newArtisan.email}
                  onChange={(e) =>
                    setNewArtisan((a) => ({ ...a, email: e.target.value }))
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newArtisan.phone}
                  onChange={(e) =>
                    setNewArtisan((a) => ({ ...a, phone: e.target.value }))
                  }
                  placeholder="+250 7XX XXX XXX"
                />
              </div>
            </div>
            <div>
              <Label>Location *</Label>
              <Input
                value={newArtisan.location}
                onChange={(e) =>
                  setNewArtisan((a) => ({ ...a, location: e.target.value }))
                }
                placeholder="e.g., Musanze District"
              />
            </div>
            <MultiLangInput
              label="Short Description"
              value={{ en: newArtisan.description, rw: "", fr: "", sw: "" }}
              onChange={(v) =>
                setNewArtisan((a) => ({ ...a, description: v.en }))
              }
              placeholder="Brief description shown on community listing..."
              required
              type="textarea"
              rows={2}
            />
            <MultiLangInput
              label="Full Story"
              value={{ en: newArtisan.story, rw: "", fr: "", sw: "" }}
              onChange={(v) => setNewArtisan((a) => ({ ...a, story: v.en }))}
              placeholder="The artisan's background, journey, and craft philosophy..."
              type="textarea"
              rows={4}
            />
            <div>
              <Label>Profile Image</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload profile photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateArtisanOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateArtisan} className="gap-1.5">
              <Plus className="h-4 w-4" /> Create Artisan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below.
            </DialogDescription>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4 mt-2">
              <MultiLangInput
                label="Product Name"
                value={{ en: editProduct.name, rw: "", fr: "", sw: "" }}
                onChange={(v) =>
                  setEditProduct((p) => (p ? { ...p, name: v.en } : p))
                }
                placeholder="Product name"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (RWF) *</Label>
                  <Input
                    type="number"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct((p) =>
                        p ? { ...p, price: e.target.value } : p,
                      )
                    }
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={editProduct.stock}
                    onChange={(e) =>
                      setEditProduct((p) =>
                        p ? { ...p, stock: e.target.value } : p,
                      )
                    }
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={editProduct.category}
                  onValueChange={(v) =>
                    setEditProduct((p) => (p ? { ...p, category: v } : p))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baskets">Baskets</SelectItem>
                    <SelectItem value="Sculptures">Sculptures</SelectItem>
                    <SelectItem value="Pottery">Pottery</SelectItem>
                    <SelectItem value="Kitchenware">Kitchenware</SelectItem>
                    <SelectItem value="Candles">Candles</SelectItem>
                    <SelectItem value="Skincare">Skincare</SelectItem>
                    <SelectItem value="Textiles">Textiles</SelectItem>
                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <MultiLangInput
                label="Description"
                value={{ en: editProduct.description, rw: "", fr: "", sw: "" }}
                onChange={(v) =>
                  setEditProduct((p) => (p ? { ...p, description: v.en } : p))
                }
                placeholder="Product description..."
                type="textarea"
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProductOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editProduct?.name || !editProduct?.price) {
                  toast.error("Missing Fields", {
                    description:
                      "Please fill in at least the product name and price.",
                  });
                  return;
                }
                toast.success("Product Updated", {
                  description: `"${editProduct.name}" has been updated successfully.`,
                });
                setEditProductOpen(false);
                setEditProduct(null);
                setEditProductId(null);
              }}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
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
