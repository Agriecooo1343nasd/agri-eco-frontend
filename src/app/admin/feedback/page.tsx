"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
import {
  deleteAdminFeedback,
  fetchAdminFeedback,
  fetchAdminFeedbackById,
  fetchFeedbackStats,
  updateFeedbackStatus,
  type AdminFeedback,
  type AdminFeedbackStatus,
  type AdminFeedbackType,
  type FetchAdminFeedbackParams,
} from "@/lib/api/feedback";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterStatus = "all" | AdminFeedbackStatus;
type FilterType = "all" | AdminFeedbackType;

const PAGE_SIZE = 10;

const TYPE_LABELS: Record<AdminFeedbackType, string> = {
  compliment: "Compliment",
  feature_request: "Feature Request",
  bug_report: "Bug Report",
  general: "General",
  complaint: "Complaint",
};

const TYPE_COLORS: Record<AdminFeedbackType, string> = {
  compliment: "bg-primary/10 text-primary border-primary/20",
  feature_request: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  bug_report: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  general: "bg-muted text-muted-foreground border-border",
  complaint: "bg-amber-500/10 text-amber-700 border-amber-500/20",
};

const STATUS_CONFIG: Record<
  AdminFeedbackStatus,
  { label: string; color: string; icon: typeof Clock3 }
> = {
  new: {
    label: "New",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: Clock3,
  },
  reviewed: {
    label: "Reviewed",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-sky-500/10 text-sky-700 border-sky-500/20",
    icon: Clock3,
  },
  resolved: {
    label: "Resolved",
    color: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    icon: CheckCircle2,
  },
  archived: {
    label: "Archived",
    color: "bg-muted text-muted-foreground border-border",
    icon: Archive,
  },
};

const STATUS_OPTIONS: AdminFeedbackStatus[] = [
  "new",
  "reviewed",
  "in_progress",
  "resolved",
  "archived",
];

const FILTER_STATUS_OPTIONS: Array<{ value: FilterStatus; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "archived", label: "Archived" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

function getErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-RW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function RatingStars({
  rating,
  size = "sm",
}: {
  rating?: number | null;
  size?: "sm" | "md";
}) {
  const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  if (!rating) {
    return <span className="text-xs text-muted-foreground">No rating</span>;
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            iconClass,
            index < rating ? "fill-secondary text-secondary" : "text-border",
          )}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}/5</span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 items-center">
          <Skeleton className="h-10 col-span-2" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ))}
    </div>
  );
}

export default function FeedbackManagementPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);

  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null,
  );
  const [statusDraft, setStatusDraft] = useState<AdminFeedbackStatus>("new");
  const [adminNoteDraft, setAdminNoteDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminFeedback | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo<FetchAdminFeedbackParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      sort: "createdAt",
      order: "desc",
    }),
    [page, debouncedSearch, statusFilter, typeFilter],
  );

  const feedbackQuery = useQuery({
    queryKey: ["admin-feedback", params],
    queryFn: () => fetchAdminFeedback(params),
    placeholderData: (previousData) => previousData,
  });

  const statsQuery = useQuery({
    queryKey: ["feedback-stats"],
    queryFn: fetchFeedbackStats,
  });

  const detailQuery = useQuery({
    queryKey: ["admin-feedback", selectedFeedbackId],
    queryFn: () => fetchAdminFeedbackById(selectedFeedbackId as string),
    enabled: Boolean(selectedFeedbackId),
  });

  const feedbackList = feedbackQuery.data?.data ?? [];
  const pagination = feedbackQuery.data?.pagination;
  const selectedFeedback = detailQuery.data ?? null;

  useEffect(() => {
    if (!selectedFeedback) return;
    setStatusDraft(selectedFeedback.status);
    setAdminNoteDraft(selectedFeedback.adminNote ?? "");
  }, [
    selectedFeedback?.id,
    selectedFeedback?.status,
    selectedFeedback?.adminNote,
  ]);

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNote,
    }: {
      id: string;
      status: AdminFeedbackStatus;
      adminNote: string;
    }) =>
      updateFeedbackStatus(id, {
        status,
        adminNote: adminNote.trim() || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
      queryClient.setQueryData(["admin-feedback", updated.id], updated);
      toast.success(
        `Feedback marked as ${STATUS_CONFIG[updated.status].label}`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update feedback status"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
      if (selectedFeedbackId === deleteTarget?.id) {
        setSelectedFeedbackId(null);
      }
      setDeleteTarget(null);
      toast.success("Feedback deleted successfully");
    },
    onError: (error) => {
      console.error(getErrorMessage(error, "Failed to delete feedback"));
      setDeleteTarget(null);
    },
  });

  const totalCount = statsQuery.data?.total ?? pagination?.total ?? 0;
  const newCount = statsQuery.data?.byStatus.new ?? 0;
  const reviewedCount = statsQuery.data?.byStatus.reviewed ?? 0;
  const archivedCount = statsQuery.data?.byStatus.archived ?? 0;
  const averageRating = statsQuery.data?.averageRating ?? "0.0";

  const selectedHasChanges = Boolean(
    selectedFeedback &&
    (statusDraft !== selectedFeedback.status ||
      adminNoteDraft !== (selectedFeedback.adminNote ?? "")),
  );

  function openDetails(id: string) {
    setSelectedFeedbackId(id);
  }

  function closeDetails(open: boolean) {
    if (!open) {
      setSelectedFeedbackId(null);
    }
  }

  function handleSaveStatus() {
    if (!selectedFeedback) return;

    updateStatusMutation.mutate({
      id: selectedFeedback.id,
      status: statusDraft,
      adminNote: adminNoteDraft,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold font-heading text-foreground">
            <MessageCircle className="h-6 w-6 text-primary" />
            Feedback Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review submissions, update statuses, and remove feedback entries
            from the admin dashboard.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {feedbackList.length} of {totalCount} total feedback entries.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Feedback</CardDescription>
            <CardTitle className="text-3xl">{totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-3xl">{newCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reviewed</CardDescription>
            <CardTitle className="text-3xl">{reviewedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Archived</CardDescription>
            <CardTitle className="text-3xl">{archivedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Rating</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Star className="h-6 w-6 fill-secondary text-secondary" />
              {averageRating}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Feedback Inbox</CardTitle>
              <CardDescription>
                Filter by status or type, then open a record to review details
                and update its status.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statsQuery.data?.byType ?? {}).map(
                ([type, count]) => (
                  <Badge key={type} variant="outline" className="capitalize">
                    {TYPE_LABELS[type as AdminFeedbackType] ?? type}: {count}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, email, subject, or message"
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as FilterStatus);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value as FilterType);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {feedbackQuery.isLoading ? (
            <TableSkeleton />
          ) : feedbackList.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">No feedback found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting the search or filters to find matching
                  submissions.
                </p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Rating
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Submitted
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackList.map((item) => {
                    const status = STATUS_CONFIG[item.status];
                    const StatusIcon = status.icon;

                    return (
                      <TableRow
                        key={item.id}
                        className={
                          item.status === "new" ? "bg-emerald-500/5" : undefined
                        }
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {item.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-65">
                          <div className="space-y-1">
                            <p className="line-clamp-1 text-sm font-medium text-foreground">
                              {item.subject}
                            </p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {item.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              TYPE_COLORS[item.type],
                            )}
                          >
                            {TYPE_LABELS[item.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <RatingStars rating={item.rating} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1 text-[10px]", status.color)}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openDetails(item.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination?.page ?? 1} of {pagination?.pages ?? 1}
                </p>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination?.hasPrev}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination?.hasNext}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedFeedbackId)} onOpenChange={closeDetails}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              View the full submission and update its review status.
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading || !selectedFeedback ? (
            <div className="space-y-4 py-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedFeedback.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedFeedback.subject}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedFeedback.email}
                    </span>
                    {selectedFeedback.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedFeedback.phone}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      TYPE_COLORS[selectedFeedback.type],
                    )}
                  >
                    {TYPE_LABELS[selectedFeedback.type]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      STATUS_CONFIG[selectedFeedback.status].color,
                    )}
                  >
                    {STATUS_CONFIG[selectedFeedback.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr,0.9fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Message</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {selectedFeedback.message}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <RatingStars rating={selectedFeedback.rating} size="md" />
                      <span className="text-xs text-muted-foreground">
                        Submitted {formatDate(selectedFeedback.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-status">Status</Label>
                      <Select
                        value={statusDraft}
                        onValueChange={(value) =>
                          setStatusDraft(value as AdminFeedbackStatus)
                        }
                      >
                        <SelectTrigger id="feedback-status">
                          <SelectValue placeholder="Choose a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_CONFIG[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedback-note">Admin Note</Label>
                      <Textarea
                        id="feedback-note"
                        value={adminNoteDraft}
                        onChange={(event) =>
                          setAdminNoteDraft(event.target.value)
                        }
                        placeholder="Add internal notes for follow-up or context"
                        rows={6}
                      />
                    </div>

                    <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          Reviewed at
                        </span>
                        <span className="text-right text-foreground">
                          {formatDate(selectedFeedback.reviewedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Reviewer</span>
                        <span className="text-right text-foreground">
                          {selectedFeedback.reviewer
                            ? `${selectedFeedback.reviewer.firstName ?? ""} ${selectedFeedback.reviewer.lastName ?? ""}`.trim() ||
                              selectedFeedback.reviewer.id
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => setDeleteTarget(selectedFeedback)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedFeedbackId(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={
                      !selectedHasChanges || updateStatusMutation.isPending
                    }
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the feedback entry from
              {deleteTarget
                ? ` ${deleteTarget.fullName}`
                : " the selected user"}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending || !deleteTarget}
              onClick={(event) => {
                event.preventDefault();
                if (!deleteTarget) return;
                deleteMutation.mutate(deleteTarget.id);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
