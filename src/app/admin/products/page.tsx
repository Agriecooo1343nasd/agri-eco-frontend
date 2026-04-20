"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Link2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";
import Link from "next/link";
import {
  fetchAdminProducts,
  fetchCategoriesForAdmin,
  deleteAdminProduct,
  toAbsoluteMediaUrl,
  type AdminProduct,
  type AdminProductSort,
} from "@/lib/api/products";
import {
  fetchAdminDiscounts,
  assignProductsToDiscount,
  unassignProductsFromDiscount,
  type AdminDiscount,
} from "@/lib/api/discounts";

type SortKey = "name" | "price" | "stock" | "sold" | "createdAt";
type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE = 8;

const statusStyles: Record<string, string> = {
  Active: "bg-primary/10 text-primary border-primary/20",
  Draft: "bg-muted text-muted-foreground border-border",
  Inactive: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabelMap = {
  active: "Active",
  draft: "Draft",
  inactive: "Inactive",
} as const;

export default function AdminProductsPage() {
  const { formatPrice } = usePricing();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(
    null,
  );
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [productForDealLink, setProductForDealLink] =
    useState<AdminProduct | null>(null);
  const [dealSearch, setDealSearch] = useState("");
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [initialDealIds, setInitialDealIds] = useState<string[]>([]);

  const apiSortKey: AdminProductSort =
    sortKey === "price"
      ? "sellingPrice"
      : sortKey === "sold"
        ? "soldCount"
        : sortKey;

  const statusQuery =
    statusFilter === "active"
      ? "true"
      : statusFilter === "inactive"
        ? "false"
        : undefined;

  const productsQuery = useQuery({
    queryKey: [
      "admin-products",
      page,
      search,
      statusFilter,
      categoryFilter,
      sortKey,
      sortDir,
    ],
    queryFn: () =>
      fetchAdminProducts({
        page,
        limit: ITEMS_PER_PAGE,
        search,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        isActive: statusQuery,
        sort: apiSortKey,
        order: sortDir,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: () => fetchCategoriesForAdmin(),
  });

  const rows = productsQuery.data?.data ?? [];
  const pagination = productsQuery.data?.pagination;
  const totalPages = pagination?.pages ?? 1;
  const totalItems = pagination?.total ?? 0;
  const currentPage = pagination?.page ?? page;
  const categoryOptions = categoriesQuery.data?.data ?? [];

  const linkableDiscountsQuery = useQuery({
    queryKey: ["admin-discounts-link-options"],
    queryFn: () =>
      fetchAdminDiscounts({
        page: 1,
        limit: 500,
        sort: "createdAt",
        order: "desc",
      }),
    enabled: true,
  });

  const allDiscounts = linkableDiscountsQuery.data?.data ?? [];

  useEffect(() => {
    if (!dealDialogOpen || !productForDealLink) return;

    const linked = allDiscounts
      .filter((discount) =>
        (discount.applicableProducts ?? []).includes(productForDealLink.id),
      )
      .map((discount) => discount.id);
    const initialLinked = linked.slice(0, 1);

    setInitialDealIds(initialLinked);
    setSelectedDealIds(initialLinked);
  }, [allDiscounts, dealDialogOpen, productForDealLink]);

  const productOffersMap = useMemo(() => {
    const byProduct = new Map<string, AdminDiscount[]>();

    for (const discount of allDiscounts) {
      for (const productId of discount.applicableProducts ?? []) {
        const existing = byProduct.get(productId) ?? [];
        existing.push(discount);
        byProduct.set(productId, existing);
      }
    }

    return byProduct;
  }, [allDiscounts]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIndicator({ column }: { column: SortKey }) {
    const isActive = sortKey === column;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-1 cursor-pointer">
        <ArrowUp
          className={`h-3 w-3 ${isActive && sortDir === "asc" ? "text-foreground" : "text-muted-foreground/40"}`}
        />
        <ArrowDown
          className={`h-3 w-3 ${isActive && sortDir === "desc" ? "text-foreground" : "text-muted-foreground/40"}`}
        />
      </span>
    );
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => {
      toast.success("Product removed", {
        description: `"${productToDelete?.name}" has been permanently deleted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setProductToDelete(null);
    },
    onError: () => {
      console.error("Failed to delete", {
        description: "Something went wrong. Please try again.",
      });
      setProductToDelete(null);
    },
  });

  const linkDealsMutation = useMutation({
    mutationFn: async () => {
      if (!productForDealLink) return;
      const initialDiscountId = initialDealIds[0];
      const selectedDiscountId = selectedDealIds[0];

      if (initialDiscountId && initialDiscountId !== selectedDiscountId) {
        await unassignProductsFromDiscount(initialDiscountId, [
          productForDealLink.id,
        ]);
      }

      if (selectedDiscountId && selectedDiscountId !== initialDiscountId) {
        await assignProductsToDiscount(selectedDiscountId, [
          productForDealLink.id,
        ]);
      }

      return initialDiscountId === selectedDiscountId ? 0 : 1;
    },
    onSuccess: (changedCount = 0) => {
      toast.success("Deals linked", {
        description:
          changedCount > 0
            ? `Updated ${changedCount} deal${changedCount > 1 ? "s" : ""} for ${productForDealLink?.name}.`
            : "No deal changes were required.",
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-discounts-link-options"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDealDialogOpen(false);
      setProductForDealLink(null);
      setDealSearch("");
    },
    onError: (error: Error) => {
      toast.error("Failed to link deals", {
        description:
          error.message ||
          "Please retry. The product may already be linked to another discount.",
      });
    },
  });

  function handleDeleteRequest(product: AdminProduct) {
    setProductToDelete(product);
  }

  function openDealLinkDialog(product: AdminProduct) {
    setProductForDealLink(product);
    setDealSearch("");
    setSelectedDealIds([]);
    setInitialDealIds([]);
    setDealDialogOpen(true);
  }

  function toggleDealSelection(discountId: string) {
    setSelectedDealIds((current) =>
      current[0] === discountId ? [] : [discountId],
    );
  }

  /* ---- Pagination range ---- */
  function getPageRange() {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }

  const statusLabel = (product: AdminProduct) => {
    if (product.status) {
      return statusLabelMap[product.status];
    }

    if (product.isActive) {
      return "Active";
    }

    // Fallback for older API payloads.
    return product.soldCount === 0 ? "Draft" : "Inactive";
  };

  const categoryName = (product: AdminProduct) =>
    product.category?.name ?? "Uncategorized";

  const primaryImage = (product: AdminProduct) => {
    const image =
      product.images?.find((entry) => entry.isPrimary) ?? product.images?.[0];

    return toAbsoluteMediaUrl(image?.url);
  };

  const mapUiRows = useMemo(
    () =>
      rows
        .map((product) => ({
          ...product,
          uiStatus: statusLabel(product),
          uiCategory: categoryName(product),
          uiImage: primaryImage(product),
          uiPrice: Number(product.sellingPrice),
          uiStockLevel: Number(product.stockLevel ?? product.stock ?? 0),
          uiOldPrice:
            Number(product.originalPrice) > Number(product.sellingPrice)
              ? Number(product.originalPrice)
              : undefined,
        }))
        .filter((product) => {
          if (statusFilter === "draft") {
            return product.uiStatus === "Draft";
          }

          return true;
        }),
    [rows, statusFilter],
  );

  const filteredDeals = useMemo(() => {
    const q = dealSearch.trim().toLowerCase();
    if (!q) return allDiscounts;

    return allDiscounts.filter((discount) => {
      return (
        discount.name.toLowerCase().includes(q) ||
        discount.code.toLowerCase().includes(q) ||
        (discount.description ?? "").toLowerCase().includes(q) ||
        discount.type.toLowerCase().includes(q)
      );
    });
  }, [allDiscounts, dealSearch]);

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Product Inventory
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Manage your commodity catalog ({totalItems} total products)
          </p>
        </div>
        <Link href="/admin/products/create">
          <Button className="gap-2 shrink-0 text-xs font-bold h-10 px-6">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filters bar */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-xs h-9 bg-muted/20 border-border"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32.5 h-9 text-xs font-bold">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Status
                  </SelectItem>
                  <SelectItem value="active" className="text-xs">
                    Active
                  </SelectItem>
                  <SelectItem value="draft" className="text-xs">
                    Draft
                  </SelectItem>
                  <SelectItem value="inactive" className="text-xs">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(v) => {
                  setCategoryFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-35 h-9 text-xs font-bold">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Categories
                  </SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-17.5 text-[10px] font-bold uppercase tracking-wider text-center">
                  Preview
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Label & Unit
                    <SortIndicator column="name" />
                  </div>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Classification
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("price")}
                >
                  <div className="flex items-center">
                    Current Price
                    <SortIndicator column="price" />
                  </div>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Offer
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("stock")}
                >
                  <div className="flex items-center">
                    Stock Level
                    <SortIndicator column="stock" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("sold")}
                >
                  <div className="flex items-center">
                    Total Revenue
                    <SortIndicator column="sold" />
                  </div>
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Modified
                    <SortIndicator column="createdAt" />
                  </div>
                </TableHead>
                <TableHead className="w-15 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-12 text-muted-foreground font-bold"
                  >
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : mapUiRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-12 text-muted-foreground font-bold"
                  >
                    No matching products in your inventory.
                  </TableCell>
                </TableRow>
              ) : (
                mapUiRows.map((product) => {
                  const linkedOffers = productOffersMap.get(product.id) ?? [];

                  return (
                    <TableRow
                      key={product.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border mx-auto shadow-sm">
                          <img
                            src={product.uiImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-foreground text-[11px] mb-0.5">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                            Base / {product.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold py-0 px-2 bg-muted/30 border-muted-foreground/20"
                        >
                          {product.uiCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-[11px]">
                            {formatPrice(product.uiPrice)}
                          </span>
                          {product.uiOldPrice && (
                            <span className="text-[10px] text-muted-foreground line-through font-bold opacity-60">
                              {formatPrice(product.uiOldPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {linkedOffers.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold py-0 px-2 shadow-none w-fit">
                              {linkedOffers.length} offer
                              {linkedOffers.length > 1 ? "s" : ""}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-semibold truncate max-w-32">
                              {linkedOffers.map((offer) => offer.code).join(", ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-bold opacity-30">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-[11px] font-bold ${
                            product.uiStockLevel < 50
                              ? "text-destructive"
                              : product.uiStockLevel < 100
                                ? "text-amber-600"
                                : "text-primary"
                          }`}
                        >
                          {product.uiStockLevel} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground">
                            {product.soldCount} sales
                          </span>
                          <span className="text-[9px] text-muted-foreground font-bold">
                            {formatPrice(product.soldCount * product.uiPrice)}{" "}
                            earn
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusStyles[product.uiStatus]} border text-[10px] font-bold py-0 px-2 shadow-none`}
                        >
                          {product.uiStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground font-bold whitespace-nowrap opacity-80">
                          {new Date(product.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
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
                            <Link href={`/product/${product.slug || product.id}`}>
                              <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer">
                                <Eye className="h-3.5 w-3.5" />
                                Public Preview
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <DropdownMenuItem className="gap-2 text-xs py-2 cursor-pointer">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Listing
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => openDealLinkDialog(product)}
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              Link to a deal
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDeleteRequest(product)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove product?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{" "}
              <span className="font-semibold text-foreground">
                {productToDelete?.name}
              </span>
              . This action cannot be undone and will remove all associated data
              including images, batches, and inventory records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (productToDelete) {
                  deleteMutation.mutate(productToDelete.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={dealDialogOpen}
        onOpenChange={(open) => {
          setDealDialogOpen(open);
          if (!open) {
            setProductForDealLink(null);
            setDealSearch("");
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Link Product To Deal</DialogTitle>
            <DialogDescription>
              Choose one deal for
              <span className="font-semibold text-foreground">
                {" "}
                {productForDealLink?.name}
              </span>
              . If this product is already linked, selecting another deal will
              switch it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={dealSearch}
              onChange={(e) => setDealSearch(e.target.value)}
              placeholder="Search deals by name, code, type, description..."
              className="h-10"
            />

            <div className="max-h-95 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {linkableDiscountsQuery.isLoading ? (
                <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading deals...
                </div>
              ) : filteredDeals.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">
                  No deals found for your search.
                </div>
              ) : (
                filteredDeals.map((discount: AdminDiscount) => {
                  const selected = selectedDealIds.includes(discount.id);
                  return (
                    <button
                      key={discount.id}
                      type="button"
                      className={`w-full p-3 text-left transition-colors hover:bg-muted/40 flex items-start justify-between gap-3 ${
                        selected ? "bg-primary/5" : ""
                      }`}
                      onClick={() => toggleDealSelection(discount.id)}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {discount.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            {discount.code}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize"
                          >
                            {discount.type.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {discount.description || "No description"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Linked products:{" "}
                          {discount.applicableProducts?.length ?? 0}
                        </p>
                      </div>
                      <div className="shrink-0 pt-1">
                        {selected ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-muted-foreground/40" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDealDialogOpen(false)}
              disabled={linkDealsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => linkDealsMutation.mutate()}
              disabled={linkDealsMutation.isPending || !productForDealLink}
            >
              {linkDealsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                "Save Linked Deals"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <p className="text-sm text-muted-foreground font-medium">
            Showing{" "}
            <span className="text-foreground font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            of <span className="text-foreground font-bold">{totalItems}</span>{" "}
            entries
          </p>
          <Pagination className="justify-center sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer font-bold text-[11px]"
                  }
                >
                  Prev
                </PaginationPrevious>
              </PaginationItem>
              {getPageRange().map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={currentPage === p}
                      onClick={() => setPage(p)}
                      className="cursor-pointer font-bold text-xs"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer font-bold text-[11px]"
                  }
                >
                  Next
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
