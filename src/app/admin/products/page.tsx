"use client";

import { useState, useMemo } from "react";
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
import { products as baseProducts } from "@/data/products";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";
import Link from "next/link";

/* ---- Extended product type for admin ---- */
interface AdminProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  sold: number;
  status: "Active" | "Draft" | "Inactive";
  createdAt: string;
  unit: string;
}

/* ---- Generate admin product list from base products ---- */
const adminProducts: AdminProduct[] = baseProducts.map((p, i) => ({
  id: p.id,
  name: p.name,
  image: p.image,
  category: p.category,
  price: p.price,
  oldPrice: p.oldPrice,
  stock: [120, 45, 200, 78, 156, 89, 34, 210, 67, 143][i] ?? 100,
  sold: [342, 187, 256, 98, 214, 176, 312, 64, 198, 145][i] ?? 50,
  status:
    (
      [
        "Active",
        "Active",
        "Active",
        "Draft",
        "Active",
        "Active",
        "Active",
        "Inactive",
        "Active",
        "Active",
      ] as const
    )[i] ?? "Active",
  createdAt:
    [
      "2025-08-12",
      "2025-09-03",
      "2025-07-22",
      "2025-11-15",
      "2025-06-18",
      "2025-10-01",
      "2025-05-30",
      "2025-12-05",
      "2025-04-14",
      "2025-08-28",
    ][i] ?? "2025-01-01",
  unit: p.unit,
}));

// Duplicate some to have more data for pagination demo
const allProducts: AdminProduct[] = [
  ...adminProducts,
  ...adminProducts.map((p) => ({
    ...p,
    id: p.id + "-bulk",
    name: p.name + " (Bulk)",
    stock: p.stock + 50,
    sold: p.sold + 20,
  })),
];

type SortKey = "name" | "price" | "stock" | "sold" | "createdAt";
type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE = 8;

const statusStyles: Record<string, string> = {
  Active: "bg-primary/10 text-primary border-primary/20",
  Draft: "bg-muted text-muted-foreground border-border",
  Inactive: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminProductsPage() {
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  /* ---- Filtering ---- */
  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }
    return list;
  }, [search, statusFilter, categoryFilter]);

  /* ---- Sorting ---- */
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "stock") cmp = a.stock - b.stock;
      else if (sortKey === "sold") cmp = a.sold - b.sold;
      else if (sortKey === "createdAt")
        cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  /* ---- Pagination ---- */
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const categories = [...new Set(allProducts.map((p) => p.category))];

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

  function handleAction(action: string, product: AdminProduct) {
    toast.success(`${action} Product`, {
      description: `Action initiated for "${product.name}".`,
    });
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

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Product Inventory
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Manage your commodity catalog ({sorted.length} total products)
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
                placeholder="Search products by name or category..."
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
                <SelectTrigger className="w-[130px] h-9 text-xs font-bold">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Status
                  </SelectItem>
                  <SelectItem value="Active" className="text-xs">
                    Active
                  </SelectItem>
                  <SelectItem value="Draft" className="text-xs">
                    Draft
                  </SelectItem>
                  <SelectItem value="Inactive" className="text-xs">
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
                <SelectTrigger className="w-[140px] h-9 text-xs font-bold">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">
                    All Categories
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
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
                <TableHead className="w-[70px] text-[10px] font-bold uppercase tracking-wider text-center">
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
                <TableHead className="w-[60px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-12 text-muted-foreground font-bold"
                  >
                    No matching products in your inventory.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((product) => {
                  const discount = product.oldPrice
                    ? Math.round(
                        ((product.oldPrice - product.price) /
                          product.oldPrice) *
                          100,
                      )
                    : null;

                  return (
                    <TableRow
                      key={product.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border mx-auto shadow-sm">
                          <img
                            src={product.image}
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
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-[11px]">
                            {formatPrice(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-[10px] text-muted-foreground line-through font-bold opacity-60">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {discount ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-bold py-0 px-2 shadow-none">
                            -{discount}%
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-bold opacity-30">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-[11px] font-bold ${
                            product.stock < 50
                              ? "text-destructive"
                              : product.stock < 100
                                ? "text-amber-600"
                                : "text-primary"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground">
                            {product.sold} sales
                          </span>
                          <span className="text-[9px] text-muted-foreground font-bold">
                            {formatPrice(product.sold * product.price)} earn
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusStyles[product.status]} border text-[10px] font-bold py-0 px-2 shadow-none`}
                        >
                          {product.status}
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
                            <Link href={`/product/${product.id}`}>
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
                              className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleAction("Delete", product)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <p className="text-sm text-muted-foreground font-medium">
            Showing{" "}
            <span className="text-foreground font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-bold">{sorted.length}</span>{" "}
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
