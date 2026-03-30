"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Home,
  Users,
  DollarSign,
  Tag,
  ChevronRight,
  Check,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  fetchAdminAccommodations,
  fetchAccommodationStats,
  deleteAdminAccommodation,
  toAbsoluteAccommodationImage,
  type AccommodationCategory,
  type AccommodationStatus,
  type AdminAccommodation,
} from "@/lib/api/accommodations";
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

const statusColors: Record<AccommodationStatus, string> = {
  available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  occupied: "bg-green-500/10 text-green-600 border-green-500/20",
};

const categoryLabels: Record<AccommodationCategory, string> = {
  standard: "Standard",
  premium: "Premium",
  family: "Family",
  luxury: "Luxury",
  eco: "Eco",
};

function getLocalizedText(value?: {
  en?: string;
  rw?: string;
  fr?: string;
  sw?: string;
}) {
  if (!value) return "Untitled";
  return value.en || value.rw || value.fr || value.sw || "Untitled";
}

export default function AdminAccommodationsPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AccommodationStatus | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<
    AccommodationCategory | "all"
  >("all");
  const [sort, setSort] = useState<
    "ratePerNightRwf" | "maxGuests" | "createdAt"
  >("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [deletingAccommodation, setDeletingAccommodation] =
    useState<AdminAccommodation | null>(null);

  const accommodationsQuery = useQuery({
    queryKey: [
      "admin-accommodations",
      page,
      limit,
      searchQuery,
      statusFilter,
      categoryFilter,
      sort,
      order,
    ],
    queryFn: () =>
      fetchAdminAccommodations({
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        sort,
        order,
      }),
    staleTime: 20_000,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-accommodations-stats"],
    queryFn: fetchAccommodationStats,
    staleTime: 20_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAccommodation(id),
    onSuccess: () => {
      toast.success("Accommodation deleted", {
        description: deletingAccommodation
          ? `\"${getLocalizedText(deletingAccommodation.name)}\" was removed successfully.`
          : "Accommodation deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-accommodations-stats"],
      });
      setDeletingAccommodation(null);
    },
    onError: (error: Error) => {
      setDeletingAccommodation(null);
    },
  });

  const rows = accommodationsQuery.data?.data ?? [];
  const pagination = accommodationsQuery.data?.pagination;
  const stats = statsQuery.data;

  const emptyStateMessage = useMemo(() => {
    if (searchQuery.trim()) {
      return "No accommodations match your search and filter settings.";
    }
    return "No accommodations found yet.";
  }, [searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <Home className="h-3 w-3" />
            <span>Management</span>
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
            Stay Options
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Manage on-site accommodations with real-time inventory, pricing, and
            availability insights.
          </p>
        </div>
        <Link href="/admin/accommodations/create">
          <Button>
            <Plus className="h-5 w-5" />
            <span>Add New Stay</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Units",
            value: stats?.total ?? 0,
            icon: Home,
            color: "text-green-600",
          },
          {
            label: "Available",
            value: stats?.available ?? 0,
            icon: Check,
            color: "text-emerald-600",
          },
          {
            label: "Maintenance",
            value: stats?.maintenance ?? 0,
            icon: Trash2,
            color: "text-amber-600",
          },
          {
            label: "Revenue Portf.",
            value: `${Math.round((stats?.revenuePortfolio ?? 0) / 1000).toLocaleString()}K`,
            icon: DollarSign,
            color: "text-primary",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={cn(
                  "p-2.5 rounded-xl bg-background border border-border/50 shadow-sm",
                  stat.color,
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-foreground leading-tight">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="p-6 bg-muted/20 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stay name..."
                className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 rounded-xl"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value as AccommodationCategory | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 min-w-[170px] rounded-xl border-border/50 bg-background/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="eco">Eco</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as AccommodationStatus | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 min-w-[150px] rounded-xl border-border/50 bg-background/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sort}:${order}`}
                onValueChange={(value) => {
                  const [nextSort, nextOrder] = value.split(":") as [
                    "ratePerNightRwf" | "maxGuests" | "createdAt",
                    "asc" | "desc",
                  ];
                  setSort(nextSort);
                  setOrder(nextOrder);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-11 min-w-[190px] rounded-xl border-border/50 bg-background/50">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Newest</SelectItem>
                  <SelectItem value="createdAt:asc">Oldest</SelectItem>
                  <SelectItem value="ratePerNightRwf:asc">
                    Price Low to High
                  </SelectItem>
                  <SelectItem value="ratePerNightRwf:desc">
                    Price High to Low
                  </SelectItem>
                  <SelectItem value="maxGuests:desc">
                    Capacity High to Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {accommodationsQuery.isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground mt-3">
                Loading accommodations...
              </p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4 shadow-inner">
                <Home className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-bold">No stay options found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                {emptyStateMessage}
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-xl border-primary text-primary hover:bg-primary/5"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setSort("createdAt");
                  setOrder("desc");
                  setPage(1);
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/10 border-b border-border/50">
                      <th className="p-4 pl-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Properties
                      </th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Category
                      </th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Rate (RWF)
                      </th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                        Capacity
                      </th>
                      <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="p-4 pr-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/50">
                    {rows.map((acc) => {
                      const mainImage = toAbsoluteAccommodationImage(
                        acc.mainImage || acc.gallery?.[0],
                      );

                      return (
                        <tr
                          key={acc.id}
                          className="hover:bg-muted/20 transition-colors group"
                        >
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-16 rounded-lg bg-muted border border-border/50 overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                                {mainImage ? (
                                  <img
                                    src={mainImage}
                                    alt={getLocalizedText(acc.name)}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Home className="h-5 w-5 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {getLocalizedText(acc.name)}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                  ID: {acc.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-primary/5 text-primary border border-primary/10">
                                {acc.category === "family" ? (
                                  <Users className="h-3.5 w-3.5" />
                                ) : acc.category === "premium" ? (
                                  <Tag className="h-3.5 w-3.5" />
                                ) : (
                                  <Home className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <span className="text-sm font-medium">
                                {categoryLabels[acc.category]}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 font-bold text-sm">
                            {Number(acc.ratePerNightRwf || 0).toLocaleString()}
                          </td>

                          <td className="p-4 text-center">
                            <Badge
                              variant="outline"
                              className="rounded-full px-3 py-0 h-6 text-xs bg-muted/30 border-border/50 font-medium"
                            >
                              {acc.maxGuests} Guests
                            </Badge>
                          </td>

                          <td className="p-4">
                            <Badge
                              className={cn(
                                "px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                                statusColors[acc.status],
                              )}
                            >
                              {acc.status}
                            </Badge>
                          </td>

                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link href={`/admin/accommodations/${acc.id}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Link
                                href={`/admin/accommodations/${acc.id}/edit`}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                onClick={() => setDeletingAccommodation(acc)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-end group-hover:hidden text-muted-foreground/30">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 p-4">
                <p className="text-xs text-muted-foreground">
                  Showing {rows.length} of {pagination?.total ?? rows.length}{" "}
                  accommodations
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={!pagination?.hasPrev}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-xs text-muted-foreground px-1">
                    Page {pagination?.page ?? page} / {pagination?.pages ?? 1}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={!pagination?.hasNext}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 p-4 rounded-xl border border-green-100 bg-green-50/50 text-green-800">
        <div className="p-2 rounded-lg bg-white shadow-sm">
          <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wider">
          Linked accommodations automatically appear in tour creation for faster
          bundling.
        </p>
      </div>

      <AlertDialog
        open={Boolean(deletingAccommodation)}
        onOpenChange={(open) => {
          if (!open) setDeletingAccommodation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Accommodation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove
              {deletingAccommodation
                ? ` \"${getLocalizedText(deletingAccommodation.name)}\"`
                : " this accommodation"}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingAccommodation) {
                  deleteMutation.mutate(deletingAccommodation.id);
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
