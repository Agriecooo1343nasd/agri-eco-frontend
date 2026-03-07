"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
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
import { usePricing } from "@/context/PricingContext";
import { toast } from "sonner";

/* ---- Extended product type for admin ---- */
interface AdminProduct {
  id: number;
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
    id: p.id + 100,
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

export default function Products() {
  const router = useRouter();
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
    if (action === "Update") {
      router.push(`/admin/products/${product.id}/update`);
      return;
    }
    if (action === "View") {
      router.push(`/admin/products/${product.id}/view`);
      return;
    }
    toast.info(`${action} Product`, {
      description: `${action} "${product.name}" — this is a demo action.`,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your product catalog ({sorted.length} products)
          </p>
        </div>
        <Link href="/admin/products/create">
          <Button className="gap-2 shrink-0 rounded-xl h-11 font-bold shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
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
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(v) => {
                  setCategoryFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Product Name
                    <SortIndicator column="name" />
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("price")}
                >
                  <div className="flex items-center">
                    Price
                    <SortIndicator column="price" />
                  </div>
                </TableHead>
                <TableHead>Discount</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("stock")}
                >
                  <div className="flex items-center">
                    Stock
                    <SortIndicator column="stock" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("sold")}
                >
                  <div className="flex items-center">
                    Sold
                    <SortIndicator column="sold" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created
                    <SortIndicator column="createdAt" />
                  </div>
                </TableHead>
                <TableHead className="w-[60px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No products found.
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
                    <TableRow key={product.id} className="group">
                      <TableCell>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            per {product.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {formatPrice(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {discount ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                            -{discount}%
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm font-medium ${
                            product.stock < 50
                              ? "text-destructive"
                              : product.stock < 100
                                ? "text-yellow-600"
                                : "text-foreground"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">
                          {product.sold}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusStyles[product.status]}`}
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
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
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleAction("View", product)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("Update", product)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Update Product
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleAction("Delete", product)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Product
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of{" "}
            {sorted.length} products
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
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
                      className="cursor-pointer"
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
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
