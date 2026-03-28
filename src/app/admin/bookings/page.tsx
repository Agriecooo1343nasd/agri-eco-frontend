"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Download,
  Users,
  Calendar,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  fetchAdminBookings,
  updateBookingStatus,
  type AdminBooking,
  type BookingStatus,
} from "@/lib/api/bookings";
import { toAbsoluteExperienceImage } from "@/lib/api/experiences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";

const PAGE_LIMIT = 15;

type SortKey = "date" | "participants" | "amountRwf" | "createdAt";
type SortDir = "asc" | "desc";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-accent text-accent-foreground border-border",
  waitlisted: "bg-muted text-muted-foreground border-border",
};

const paymentBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  paid: "bg-primary/10 text-primary border-primary/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-border",
};

function getLocalText(v: any): string {
  if (!v) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.en || v.rw || v.fr || v.sw || "—";
  return String(v);
}

export default function AdminBookingsPage() {
  const { formatPrice } = usePricing();
  const queryClient = useQueryClient();

  // Filters & pagination (default status = pending)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Dialogs
  const [viewBooking, setViewBooking] = useState<AdminBooking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryKey = ["admin-bookings", statusFilter, debouncedSearch, sortKey, sortDir, page];

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      fetchAdminBookings({
        page,
        limit: PAGE_LIMIT,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: debouncedSearch || undefined,
        sort: sortKey === "amountRwf" ? "createdAt" : sortKey,
        order: sortDir,
      }),
    staleTime: 30_000,
  });

  const bookings = data?.data ?? [];
  const pagination = data?.pagination;

  // Stats derived from the current query total (approx)
  const totalInQuery = pagination?.total ?? 0;

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      cancellationReason,
    }: {
      id: string;
      status: BookingStatus;
      cancellationReason?: string;
    }) => updateBookingStatus(id, status, cancellationReason),
    onSuccess: (updated) => {
      toast.success("Booking updated", {
        description: `Booking ${updated.referenceNumber} is now ${updated.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setViewBooking(null);
      setCancelTarget(null);
      setCancelReason("");
    },
    onError: (err: any) => {
      toast.error("Update failed", {
        description: err?.response?.data?.message || err.message || "Please try again.",
      });
    },
  });

  const handleConfirm = useCallback(
    (booking: AdminBooking) => {
      updateStatusMutation.mutate({ id: booking.id, status: "confirmed" });
    },
    [updateStatusMutation],
  );

  const handleComplete = useCallback(
    (booking: AdminBooking) => {
      updateStatusMutation.mutate({ id: booking.id, status: "completed" });
    },
    [updateStatusMutation],
  );

  const handleCancelSubmit = useCallback(() => {
    if (!cancelTarget) return;
    updateStatusMutation.mutate({
      id: cancelTarget.id,
      status: "cancelled",
      cancellationReason: cancelReason.trim() || undefined,
    });
  }, [cancelTarget, cancelReason, updateStatusMutation]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col align-middle ml-1">
      <ArrowUp className={`h-2.5 w-2.5 ${sortKey === col && sortDir === "asc" ? "text-foreground" : "text-muted-foreground/30"}`} />
      <ArrowDown className={`h-2.5 w-2.5 -mt-0.5 ${sortKey === col && sortDir === "desc" ? "text-foreground" : "text-muted-foreground/30"}`} />
    </span>
  );

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Bookings Management</h1>
          <p className="text-sm text-muted-foreground font-medium">
            {isLoading ? "Loading…" : `${totalInQuery} bookings total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs h-9"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-xs h-9 px-4"
            onClick={() => toast.success("Export Started", { description: "CSV export is being generated." })}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-sm focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground shrink-0" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none"
            placeholder="Search by name, email, or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
        >
          <SelectTrigger className="w-40 h-9 text-xs bg-background border-border shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Status</SelectItem>
            <SelectItem value="pending" className="text-xs">Pending</SelectItem>
            <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
            <SelectItem value="waitlisted" className="text-xs">Waitlisted</SelectItem>
            <SelectItem value="completed" className="text-xs">Completed</SelectItem>
            <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 text-center">
          <p className="text-destructive font-semibold text-sm">Failed to load bookings.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading bookings…</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No bookings found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider">Ref</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider">Guest</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider">Experience</TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-[10px] uppercase font-bold tracking-wider"
                    onClick={() => toggleSort("date")}
                  >
                    Date <SortIcon col="date" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-[10px] uppercase font-bold tracking-wider"
                    onClick={() => toggleSort("participants")}
                  >
                    Guests <SortIcon col="participants" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-[10px] uppercase font-bold tracking-wider"
                    onClick={() => toggleSort("amountRwf")}
                  >
                    Amount <SortIcon col="amountRwf" />
                  </TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider">Payment</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-wider">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((bk) => (
                  <TableRow key={bk.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-[10px] font-mono text-muted-foreground font-bold">
                      {bk.referenceNumber}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-foreground text-[11px] mb-0.5">{bk.fullName}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{bk.email}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bk.experience && (
                          <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-border">
                            <img
                              src={toAbsoluteExperienceImage(bk.experience.heroImage)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="text-[11px] text-foreground font-semibold truncate max-w-[140px]">
                          {bk.experience ? getLocalText(bk.experience.title) : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {bk.date}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">{bk.timeSlot}</p>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {bk.participants}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">{bk.bookingType}</span>
                    </TableCell>
                    <TableCell className="font-bold text-foreground text-sm">
                      {formatPrice(bk.amountRwf)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${paymentBadge[bk.paymentStatus] ?? ""} border text-[10px] py-0 px-2 font-bold capitalize shadow-none`}>
                        {bk.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusBadge[bk.status] ?? ""} border text-[10px] py-0 px-2 font-bold capitalize shadow-none`}>
                        {bk.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem
                            className="gap-2 text-xs py-2 cursor-pointer"
                            onClick={() => setViewBooking(bk)}
                          >
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </DropdownMenuItem>
                          {(bk.status === "pending" || bk.status === "waitlisted") && (
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => handleConfirm(bk)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Confirm
                            </DropdownMenuItem>
                          )}
                          {bk.status === "confirmed" && (
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => handleComplete(bk)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Mark Completed
                            </DropdownMenuItem>
                          )}
                          {["pending", "confirmed", "waitlisted"].includes(bk.status) && (
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => { setCancelTarget(bk); setCancelReason(""); }}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancel Booking
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground font-medium">
            Page {pagination.page} of {pagination.pages} · {pagination.total} total
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const half = Math.floor(Math.min(5, pagination.pages) / 2);
              const start = Math.max(1, Math.min(pagination.page - half, pagination.pages - Math.min(5, pagination.pages) + 1));
              const pg = start + i;
              return (
                <Button
                  key={pg}
                  variant={pg === pagination.page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              Booking Details
              {viewBooking && (
                <Badge className={`${statusBadge[viewBooking.status] ?? ""} border text-[10px] font-bold capitalize shadow-none`}>
                  {viewBooking.status}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold tracking-widest uppercase">
              Ref: {viewBooking?.referenceNumber}
            </DialogDescription>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4 pt-2 text-xs font-medium">
              {/* Experience */}
              {viewBooking.experience && (
                <div className="flex gap-4 items-start bg-muted/40 p-4 rounded-xl border border-border">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border shadow-sm">
                    <img
                      src={toAbsoluteExperienceImage(viewBooking.experience.heroImage)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground text-sm mb-1">
                      {getLocalText(viewBooking.experience.title)}
                    </h3>
                    <p className="text-[11px] text-primary font-bold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {viewBooking.date} · {viewBooking.timeSlot}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize">{viewBooking.experience.type}</p>
                  </div>
                </div>
              )}

              {/* Guest details */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-card border border-border p-4 rounded-xl shadow-sm">
                {[
                  { label: "Full Name", value: viewBooking.fullName },
                  { label: "Phone", value: viewBooking.phone },
                  { label: "Email", value: viewBooking.email, colSpan: true },
                  { label: "Participants", value: `${viewBooking.participants} (${viewBooking.bookingType})` },
                  { label: "Payment Method", value: viewBooking.paymentMethod || "—" },
                  { label: "Payment Status", value: viewBooking.paymentStatus },
                  { label: "Amount", value: formatPrice(viewBooking.amountRwf) },
                  { label: "Booked At", value: format(new Date(viewBooking.createdAt), "PPp") },
                ].map(({ label, value, colSpan }) => (
                  <div key={label} className={colSpan ? "col-span-2" : ""}>
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">{label}</p>
                    <p className="text-foreground font-bold">{value}</p>
                  </div>
                ))}
              </div>

              {/* Special requirements */}
              {viewBooking.specialRequirements && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">Special Requirements</p>
                  <p className="text-[11px] text-foreground leading-relaxed italic">{viewBooking.specialRequirements}</p>
                </div>
              )}

              {/* Cancellation reason */}
              {viewBooking.cancellationReason && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1">Cancellation Reason</p>
                  <p className="text-[11px] text-foreground">{viewBooking.cancellationReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                {(viewBooking.status === "pending" || viewBooking.status === "waitlisted") && (
                  <Button
                    className="flex-1 text-xs h-10 font-bold gap-1.5"
                    onClick={() => handleConfirm(viewBooking)}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Confirm Booking
                  </Button>
                )}
                {viewBooking.status === "confirmed" && (
                  <Button
                    className="flex-1 text-xs h-10 font-bold gap-1.5"
                    onClick={() => handleComplete(viewBooking)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Completed
                  </Button>
                )}
                {["pending", "confirmed", "waitlisted"].includes(viewBooking.status) && (
                  <Button
                    variant="outline"
                    className="flex-1 text-xs h-10 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                    onClick={() => { setCancelTarget(viewBooking); setCancelReason(""); setViewBooking(null); }}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm Dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to cancel booking <strong>{cancelTarget?.referenceNumber}</strong> for{" "}
              <strong>{cancelTarget?.fullName}</strong>. This action cannot be undone, and funds may need to be refunded manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-2">
            <Label className="text-xs font-semibold">Reason (optional)</Label>
            <Textarea
              placeholder="e.g. Capacity issue, weather cancellation…"
              className="text-xs resize-none h-20"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Go Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
              onClick={handleCancelSubmit}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
