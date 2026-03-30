"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Star,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteAdminReview,
  fetchAdminReviewStats,
  fetchAdminReviews,
  toggleAdminReviewApproval,
  type AdminReview,
  type FetchAdminReviewsParams,
} from "@/lib/api/reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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

type ReviewTab = "all" | "products" | "tours" | "education";
type ApprovalFilter = "all" | "approved" | "pending";
type SortKey = "createdAt" | "rating" | "helpfulCount";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

function entityLabel(review: AdminReview): { type: ReviewTab; label: string } {
  if (review.productId) return { type: "products", label: "Product" };
  if (review.experienceId) return { type: "tours", label: "Tour" };
  if (review.trainingProgramId) return { type: "education", label: "Education" };
  return { type: "all", label: "Unknown" };
}

function starRow(rating: number) {
  const val = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= val ? "fill-amber-500 text-amber-500" : "text-muted-foreground/35"
          }`}
        />
      ))}
    </div>
  );
}

function pageNumbers(current: number, total: number) {
  const safeTotal = Math.max(1, total);
  const cur = Math.min(Math.max(1, current), safeTotal);
  const window = 2;
  const start = Math.max(1, cur - window);
  const end = Math.min(safeTotal, cur + window);
  const nums: number[] = [];
  for (let i = start; i <= end; i++) nums.push(i);
  return { cur, safeTotal, nums };
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<ReviewTab>("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [approval, setApproval] = useState<ApprovalFilter>("pending");
  const [rating, setRating] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const statsQuery = useQuery({
    queryKey: ["admin-review-stats"],
    queryFn: fetchAdminReviewStats,
    staleTime: 30_000,
  });

  const params = useMemo<FetchAdminReviewsParams>(() => {
    const p: FetchAdminReviewsParams = {
      page,
      limit: PAGE_SIZE,
      sort: sortKey,
      order: sortDir,
    };

    if (debouncedSearch) p.search = debouncedSearch;
    if (approval !== "all") p.isApproved = approval === "approved" ? "true" : "false";
    if (rating !== "all") p.rating = Number(rating);
    return p;
  }, [page, debouncedSearch, approval, rating, sortKey, sortDir]);

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: () => fetchAdminReviews(params),
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });

  const toggleApprovalMutation = useMutation({
    mutationFn: (id: string) => toggleAdminReviewApproval(id),
    onSuccess: () => {
      toast.success("Updated review approval");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
    onError: (err: Error) => {
      toast.error("Could not update approval", {
        description: err.message || "Please try again.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminReview(id),
    onSuccess: () => {
      toast.success("Review deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-review-stats"] });
    },
    onError: (err: Error) => {
      toast.error("Could not delete review", {
        description: err.message || "Please try again.",
      });
    },
  });

  const allRows = reviewsQuery.data?.data ?? [];
  const pagination = reviewsQuery.data?.pagination;

  const filteredRows = useMemo(() => {
    if (tab === "all") return allRows;
    return allRows.filter((r) => entityLabel(r).type === tab);
  }, [allRows, tab]);

  const { cur, safeTotal, nums } = pageNumbers(pagination?.page ?? page, pagination?.pages ?? 1);

  const showTypeFilterNote = tab !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Reviews & Ratings
          </h1>
          <p className="text-sm text-muted-foreground">
            Approve or remove customer reviews for products, tours, and education programs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Card className="border-border">
            <CardContent className="py-3 px-4">
              <div className="text-xs text-muted-foreground">Pending</div>
              <div className="text-lg font-bold text-foreground">
                {statsQuery.data?.pending ?? "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="py-3 px-4">
              <div className="text-xs text-muted-foreground">Approved</div>
              <div className="text-lg font-bold text-foreground">
                {statsQuery.data?.approved ?? "—"}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="py-3 px-4">
              <div className="text-xs text-muted-foreground">Avg rating</div>
              <div className="text-lg font-bold text-foreground">
                {statsQuery.data?.averageRating ?? "—"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as ReviewTab);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card className="border-border">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
                <div className="relative flex-1 max-w-xl">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search in title/comment…"
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select
                    value={approval}
                    onValueChange={(v) => {
                      setApproval(v as ApprovalFilter);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Approval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={rating}
                    onValueChange={(v) => {
                      setRating(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ratings</SelectItem>
                      <SelectItem value="5">5 stars</SelectItem>
                      <SelectItem value="4">4 stars</SelectItem>
                      <SelectItem value="3">3 stars</SelectItem>
                      <SelectItem value="2">2 stars</SelectItem>
                      <SelectItem value="1">1 star</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortKey}
                    onValueChange={(v) => {
                      setSortKey(v as SortKey);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="helpfulCount">Helpful</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortDir}
                    onValueChange={(v) => {
                      setSortDir(v as SortDir);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Desc</SelectItem>
                      <SelectItem value="asc">Asc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showTypeFilterNote ? (
                <div className="text-xs text-muted-foreground">
                  Note: type tabs filter only the current page. For perfect server-side filtering by Tour/Education,
                  the backend list endpoint needs `experienceId` and `trainingProgramId` filters.
                </div>
              ) : null}

              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-28">Status</TableHead>
                      <TableHead className="min-w-24">Rating</TableHead>
                      <TableHead className="min-w-40">Entity</TableHead>
                      <TableHead className="min-w-56">Reviewer</TableHead>
                      <TableHead className="min-w-80">Comment</TableHead>
                      <TableHead className="min-w-40">Created</TableHead>
                      <TableHead className="min-w-44 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewsQuery.isLoading && !reviewsQuery.data ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-medium">Loading reviews…</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Star className="h-10 w-10 opacity-30" />
                            <p className="font-medium">No reviews found</p>
                            <p className="text-sm">Try changing filters.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRows.map((r) => {
                        const type = entityLabel(r);
                        const reviewer = r.user?.username || "User";
                        const reviewerEmail = r.user?.email;
                        const title = (r.title || "").trim();
                        const comment = (r.comment || "").trim();

                        const entityName =
                          r.product?.name
                            ? typeof r.product.name === "string"
                              ? r.product.name
                              : r.product.name?.en ?? r.product.slug ?? "Product"
                            : type.label;

                        const entityId =
                          r.productId || r.experienceId || r.trainingProgramId || "";

                        const entityLink =
                          r.productId
                            ? `/admin/products/${r.productId}/view`
                            : r.experienceId
                              ? "/admin/tours"
                              : r.trainingProgramId
                                ? "/admin/education"
                                : "/admin";

                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              {r.isApproved ? (
                                <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Approved
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-800 border border-amber-500/20">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                {starRow(r.rating)}
                                <div className="text-[11px] text-muted-foreground">
                                  {r.rating}/5 • {r.helpfulCount} helpful
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline">{type.label}</Badge>
                                <div className="text-xs text-foreground line-clamp-1">
                                  {entityName}
                                </div>
                                <div className="text-[11px] font-mono text-muted-foreground max-w-56 truncate">
                                  {entityId}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5">
                                <div className="text-sm font-medium text-foreground">
                                  {reviewer}
                                </div>
                                {reviewerEmail ? (
                                  <div className="text-[11px] text-muted-foreground truncate max-w-60">
                                    {reviewerEmail}
                                  </div>
                                ) : null}
                                {r.isVerifiedPurchase ? (
                                  <Badge variant="secondary" className="text-[11px]">
                                    verified
                                  </Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              <div className="space-y-1">
                                {title ? (
                                  <div className="text-sm font-semibold text-foreground line-clamp-1">
                                    {title}
                                  </div>
                                ) : null}
                                <div className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                  {comment || "—"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  asChild
                                  title="Open entity"
                                >
                                  <Link href={entityLink}>
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant={r.isApproved ? "outline" : "default"}
                                  size="sm"
                                  className="h-8 text-xs"
                                  disabled={toggleApprovalMutation.isPending}
                                  onClick={() => toggleApprovalMutation.mutate(r.id)}
                                >
                                  {toggleApprovalMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : r.isApproved ? (
                                    "Unapprove"
                                  ) : (
                                    "Approve"
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget(r)}
                                  title="Delete review"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {pagination ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Showing page <span className="font-medium text-foreground">{cur}</span> of{" "}
                    <span className="font-medium text-foreground">{safeTotal}</span> •{" "}
                    <span className="font-medium text-foreground">{pagination.total}</span> total
                  </p>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.max(1, p - 1));
                          }}
                          className={cur <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {nums.map((n) => (
                        <PaginationItem key={n}>
                          <PaginationLink
                            href="#"
                            isActive={n === cur}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(n);
                            }}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage((p) => Math.min(safeTotal, p + 1));
                          }}
                          className={
                            cur >= safeTotal ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

