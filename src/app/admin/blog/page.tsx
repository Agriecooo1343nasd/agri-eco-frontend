"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getML } from "@/components/admin/MultiLangInput";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import {
  fetchAdminCmsPages,
  deleteCmsPage,
  fetchCmsStats,
  type CmsPage,
  type CmsStatus,
  type CmsPageType,
  type FetchAdminCmsPagesParams,
} from "@/lib/api/cms";

const statusColors: Record<CmsStatus, string> = {
  published: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

const pageTypeIcons: Record<CmsPageType, React.FC<{ className?: string }>> = {
  blog: BookOpen,
  page: FileText,
  resource: LayoutDashboard,
};

const PAGE_SIZE = 10;

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-3.5 w-24" />
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function BlogManagementPage() {
  const queryClient = useQueryClient();

  /* ── filter/pagination state ── */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CmsStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<CmsPageType | "all">("all");
  const [page, setPage] = useState(1);

  /* ── delete confirmation ── */
  const [deleteTarget, setDeleteTarget] = useState<CmsPage | null>(null);

  const params = useMemo<FetchAdminCmsPagesParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      pageType: typeFilter !== "all" ? typeFilter : undefined,
      sort: "createdAt",
      order: "desc",
    }),
    [page, search, statusFilter, typeFilter],
  );

  /* ── queries ── */
  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: ["admin-cms-pages", params],
    queryFn: () => fetchAdminCmsPages(params),
  });

  const { data: statsData } = useQuery({
    queryKey: ["cms-stats"],
    queryFn: fetchCmsStats,
  });

  /* ── delete mutation ── */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCmsPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cms-pages"] });
      queryClient.invalidateQueries({ queryKey: ["cms-stats"] });
      toast.success("Article deleted", {
        description: `"${getML(deleteTarget?.title ?? { en: "Article" }, "en")}" has been permanently removed.`,
      });
      setDeleteTarget(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete article";
      console.error(msg);
      setDeleteTarget(null);
    },
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleStatusChange = useCallback((v: string) => {
    setStatusFilter(v as CmsStatus | "all");
    setPage(1);
  }, []);

  const handleTypeChange = useCallback((v: string) => {
    setTypeFilter(v as CmsPageType | "all");
    setPage(1);
  }, []);

  const pages = pagesData?.data ?? [];
  const pagination = pagesData?.pagination;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-foreground tracking-tight flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Blog & Content
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Manage articles, pages and resources across all languages.
          </p>
        </div>
        <Button className="gap-2 rounded-xl h-10 px-5" asChild>
          <Link href="/admin/blog/create">
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total",
            value: statsData?.total ?? 0,
            icon: Newspaper,
          },
          {
            label: "Published",
            value: statsData?.published ?? 0,
            icon: BookOpen,
            color: "text-primary",
          },
          {
            label: "Draft",
            value: statsData?.draft ?? 0,
            icon: FileText,
            color: "text-amber-600",
          },
          {
            label: "Archived",
            value: statsData?.archived ?? 0,
            icon: LayoutDashboard,
            color: "text-muted-foreground",
          },
          {
            label: "Blog Posts",
            value: statsData?.blogCount ?? 0,
            icon: BookOpen,
          },
          {
            label: "Featured",
            value: statsData?.featured ?? 0,
            icon: Star,
            color: "text-amber-500",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border-border bg-card hover:shadow-sm transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <stat.icon
                  className={`h-4 w-4 ${stat.color ?? "text-primary"}`}
                />
              </div>
              <p className="text-2xl font-black">
                {statsData ? (
                  stat.value
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search title or slug…"
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="resource">Resource</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Title
                </TableHead>
                <TableHead className="hidden md:table-cell font-black text-[11px] uppercase tracking-widest">
                  Author
                </TableHead>
                <TableHead className="hidden sm:table-cell font-black text-[11px] uppercase tracking-widest">
                  Type
                </TableHead>
                <TableHead className="font-black text-[11px] uppercase tracking-widest">
                  Status
                </TableHead>
                <TableHead className="text-right font-black text-[11px] uppercase tracking-widest">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagesLoading ? (
                Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
              ) : pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">
                      No articles found
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Try adjusting your filters or create a new article.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((post) => {
                  const TypeIcon = pageTypeIcons[post.pageType] ?? BookOpen;
                  return (
                    <TableRow
                      key={post.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {post.coverImage ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img
                                src={post.coverImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                              <TypeIcon className="h-4 w-4 text-primary/50" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground line-clamp-1">
                              {getML(post.title, "en")}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "—"}
                              {post.readTime ? ` · ${post.readTime} min` : ""}
                              {post.featured ? " · ★ Featured" : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {post.author
                          ? `${post.author.firstName} ${post.author.lastName}`
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize gap-1"
                        >
                          <TypeIcon className="h-3 w-3" />
                          {post.pageType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${statusColors[post.status]}`}
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            asChild
                          >
                            <Link href={`/admin/blog/${post.id}/view`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            asChild
                          >
                            <Link href={`/admin/blog/create?id=${post.id}`}>
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive/80"
                            onClick={() => setDeleteTarget(post)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}{" "}
            articles
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev || pagesLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-15 text-center">
              {page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext || pagesLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to permanently delete{" "}
              <strong>
                &quot;
                {getML(deleteTarget?.title ?? { en: "this article" }, "en")}
                &quot;
              </strong>
              . This action cannot be undone and will remove the article from
              all public-facing pages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Yes, delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
