"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  Mail,
  MessageSquareReply,
  Search,
  ShieldCheck,
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
  deleteContact,
  fetchAdminContactById,
  fetchAdminContacts,
  fetchContactStats,
  replyToContact,
  toggleContactRead,
  type AdminContact,
  type FetchAdminContactsParams,
} from "@/lib/api/contacts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ReadFilter = "all" | "unread" | "read";

const PAGE_SIZE = 10;

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
          <Skeleton className="h-10" />
        </div>
      ))}
    </div>
  );
}

export default function ContactsManagementPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "firstName" | "lastName" | "email" | "subject"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminContact | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo<FetchAdminContactsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      isRead:
        readFilter === "all"
          ? undefined
          : readFilter === "read"
            ? "true"
            : "false",
      from: fromDate || undefined,
      to: toDate || undefined,
      sort: sortBy,
      order: sortOrder,
    }),
    [page, debouncedSearch, readFilter, fromDate, toDate, sortBy, sortOrder],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts", params],
    queryFn: () => fetchAdminContacts(params),
    placeholderData: (previousData) => previousData,
  });

  const { data: stats } = useQuery({
    queryKey: ["contact-stats"],
    queryFn: fetchContactStats,
  });

  const { data: selectedContact, isFetching: isContactLoading } = useQuery({
    queryKey: ["admin-contact", selectedContactId],
    queryFn: () => fetchAdminContactById(selectedContactId as string),
    enabled: !!selectedContactId,
  });

  useEffect(() => {
    if (!selectedContactId || !selectedContact) return;
    queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
  }, [selectedContactId, selectedContact, queryClient]);

  const toggleReadMutation = useMutation({
    mutationFn: (id: string) => toggleContactRead(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      queryClient.setQueryData(["admin-contact", updated.id], updated);
      toast.success(updated.isRead ? "Marked as read" : "Marked as unread");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to toggle read status"));
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      replyToContact(id, message),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      queryClient.setQueryData(["admin-contact", updated.id], updated);
      setReplyMessage("");
      toast.success("Reply sent successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to send reply"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      setDeleteTarget(null);
      if (selectedContactId && deleteTarget?.id === selectedContactId) {
        setDetailOpen(false);
        setSelectedContactId(null);
      }
      toast.success("Message deleted");
    },
    onError: (error) => {
      setDeleteTarget(null);
      console.error(getErrorMessage(error, "Failed to delete message"));
    },
  });

  const contacts = data?.data ?? [];
  const pagination = data?.pagination;

  function openContact(contactId: string) {
    setSelectedContactId(contactId);
    setReplyMessage("");
    setDetailOpen(true);
  }

  function handleReply() {
    if (!selectedContactId) return;
    const message = replyMessage.trim();
    if (message.length < 5) {
      toast.error("Reply must be at least 5 characters");
      return;
    }

    replyMutation.mutate({ id: selectedContactId, message });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Contact Messages
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review inquiries, reply to customers, and manage inbox status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold">{stats?.unread ?? 0}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
              <Clock3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Read</p>
              <p className="text-2xl font-bold">{stats?.read ?? 0}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Replied</p>
              <p className="text-2xl font-bold">{stats?.replied ?? 0}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700">
              <MessageSquareReply className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Inbox</CardTitle>
          <CardDescription>
            Filter by read status, date range, and sender details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
                placeholder="Search by name, email, subject..."
              />
            </div>

            <Select
              value={readFilter}
              onValueChange={(value: ReadFilter) => {
                setReadFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
              className="w-40"
            />

            <Input
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setPage(1);
              }}
              className="w-40"
            />

            <Select
              value={sortBy}
              onValueChange={(value: typeof sortBy) => {
                setSortBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest</SelectItem>
                <SelectItem value="firstName">First Name</SelectItem>
                <SelectItem value="lastName">Last Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value: typeof sortOrder) => {
                setSortOrder(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-52">Sender</TableHead>
                    <TableHead className="min-w-56">Subject</TableHead>
                    <TableHead className="min-w-28">Status</TableHead>
                    <TableHead className="min-w-28">Replied</TableHead>
                    <TableHead className="min-w-40">Received</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <TableSkeleton />
                      </TableCell>
                    </TableRow>
                  ) : contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <div className="space-y-1">
                          <p className="font-medium">
                            No contact messages found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your filters or date range.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium leading-tight">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contact.email}
                            </p>
                            {contact.phone ? (
                              <p className="text-xs text-muted-foreground">
                                {contact.phone}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="font-medium text-sm leading-tight">
                            {contact.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-80">
                            {contact.message}
                          </p>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={cn(
                              "border",
                              contact.isRead
                                ? "bg-sky-500/10 text-sky-700 border-sky-500/20"
                                : "bg-amber-500/10 text-amber-700 border-amber-500/20",
                            )}
                          >
                            {contact.isRead ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {contact.repliedAt ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                              Replied
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(contact.createdAt)}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                toggleReadMutation.mutate(contact.id)
                              }
                              disabled={toggleReadMutation.isPending}
                              aria-label="Toggle read status"
                            >
                              {contact.isRead ? (
                                <Clock3 className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openContact(contact.id)}
                              aria-label="View message"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTarget(contact)}
                              aria-label="Delete message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.pages > 1 ? (
              <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Page {pagination.page} of {pagination.pages} ·{" "}
                  {pagination.total} message
                  {pagination.total !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedContactId(null);
            setReplyMessage("");
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Message</DialogTitle>
            <DialogDescription>
              View details, toggle read status, and send a reply.
            </DialogDescription>
          </DialogHeader>

          {isContactLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : !selectedContact ? (
            <p className="text-sm text-muted-foreground">Message not found.</p>
          ) : (
            <div className="space-y-5 py-1">
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.email}
                      {selectedContact.phone
                        ? ` · ${selectedContact.phone}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        "border",
                        selectedContact.isRead
                          ? "bg-sky-500/10 text-sky-700 border-sky-500/20"
                          : "bg-amber-500/10 text-amber-700 border-amber-500/20",
                      )}
                    >
                      {selectedContact.isRead ? "Read" : "Unread"}
                    </Badge>
                    {selectedContact.repliedAt ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        Replied
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedContact.subject}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Message</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Received: {formatDate(selectedContact.createdAt)}</p>
                  <p>Read at: {formatDate(selectedContact.readAt)}</p>
                  <p>Replied at: {formatDate(selectedContact.repliedAt)}</p>
                </div>
              </div>

              {selectedContact.replyMessage ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-medium">Latest Reply Sent</p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedContact.replyMessage}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="reply-message">Reply message</Label>
                <Textarea
                  id="reply-message"
                  rows={6}
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  placeholder="Write your response to the customer..."
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 5 characters. Sending a reply will also mark this
                  message as read.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() =>
                  selectedContactId &&
                  toggleReadMutation.mutate(selectedContactId)
                }
                disabled={!selectedContactId || toggleReadMutation.isPending}
                className="gap-2"
              >
                {toggleReadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Toggle Read
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setDetailOpen(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                onClick={handleReply}
                disabled={
                  !selectedContactId ||
                  replyMutation.isPending ||
                  replyMessage.trim().length < 5
                }
                className="gap-2 w-full sm:w-auto"
              >
                {replyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareReply className="h-4 w-4" />
                )}
                Send Reply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact message from{" "}
              <span className="font-semibold">
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
