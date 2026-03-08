"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Users,
  Download,
  Filter,
} from "lucide-react";
import { sampleBookings, type Booking } from "@/data/tours";
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
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-accent text-accent-foreground border-border",
  waitlisted: "bg-muted text-muted-foreground border-border",
};

type SortKey = "date" | "participants" | "totalPrice" | "createdAt";
type SortDir = "asc" | "desc";

export default function AdminBookingsPage() {
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return (
        <span className="inline-flex flex-col ml-1 opacity-30">
          <ArrowUp className="h-3 w-3" />
          <ArrowDown className="h-3 w-3 -mt-1" />
        </span>
      );
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline" />
    );
  };

  const filtered = useMemo(() => {
    let data = [...sampleBookings];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (b) =>
          b.contactName.toLowerCase().includes(q) ||
          b.tourName.toLowerCase().includes(q) ||
          b.bookingRef.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      data = data.filter((b) => b.status === statusFilter);

    data.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "participants")
        cmp = a.participants - b.participants;
      else if (sortKey === "totalPrice") cmp = a.totalPrice - b.totalPrice;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return data;
  }, [search, statusFilter, sortKey, sortDir]);

  // Stats
  const totalRevenue = sampleBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.totalPrice, 0);
  const confirmedCount = sampleBookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const pendingCount = sampleBookings.filter(
    (b) => b.status === "pending",
  ).length;

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Bookings Management
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {filtered.length} bookings total
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 text-xs h-9 px-4"
          onClick={() =>
            toast.success("Export Started", {
              description: "CSV export is being generated.",
            })
          }
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Bookings",
            value: sampleBookings.length,
            color: "text-foreground",
          },
          { label: "Confirmed", value: confirmedCount, color: "text-primary" },
          { label: "Pending", value: pendingCount, color: "text-amber-600" },
          {
            label: "Revenue",
            value: `${(totalRevenue / 1000).toFixed(0)}K RWF`,
            color: "text-primary",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p className={`text-2xl font-bold font-heading ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none"
            placeholder="Search by name, tour, or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-xs bg-background border-border shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Status
            </SelectItem>
            <SelectItem value="pending" className="text-xs">
              Pending
            </SelectItem>
            <SelectItem value="confirmed" className="text-xs">
              Confirmed
            </SelectItem>
            <SelectItem value="completed" className="text-xs">
              Completed
            </SelectItem>
            <SelectItem value="cancelled" className="text-xs">
              Cancelled
            </SelectItem>
            <SelectItem value="waitlisted" className="text-xs">
              Waitlisted
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Ref
                </TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Guest
                </TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Tour
                </TableHead>
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
                  onClick={() => toggleSort("totalPrice")}
                >
                  Total <SortIcon col="totalPrice" />
                </TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Payment
                </TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Status
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bk) => (
                <TableRow
                  key={bk.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="text-[10px] font-mono text-muted-foreground font-bold">
                    {bk.bookingRef}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-foreground text-[11px] mb-0.5">
                      {bk.contactName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {bk.contactEmail}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-border">
                        <img
                          src={bk.tourImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] text-foreground font-semibold truncate max-w-[140px]">
                        {bk.tourName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-[11px] font-bold text-foreground">
                      {bk.date}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {bk.timeSlot}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {bk.participants}
                    </span>
                    {bk.isGroup && (
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {bk.groupName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-foreground text-sm">
                    {formatPrice(bk.totalPrice)}
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                    {bk.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusBadge[bk.status]} border text-[10px] py-0 px-2 font-bold capitalize shadow-none`}
                    >
                      {bk.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                        <DropdownMenuItem
                          className="gap-2 text-xs py-2 cursor-pointer"
                          onClick={() => setViewBooking(bk)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs py-2 cursor-pointer"
                          onClick={() =>
                            toast.success("Ref: " + bk.bookingRef, {
                              description: "Booking has been confirmed.",
                            })
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() =>
                            toast.error("Booking Cancelled", {
                              description:
                                bk.bookingRef + " has been cancelled.",
                            })
                          }
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel
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

      {/* View dialog */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading text-lg">
              Booking Details
            </DialogTitle>
            <DialogDescription className="text-xs font-bold tracking-widest uppercase">
              Ref: {viewBooking?.bookingRef}
            </DialogDescription>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4 pt-4 text-xs font-medium">
              <div className="flex gap-4 items-start bg-muted/50 p-4 rounded-xl border border-border">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border shadow-sm">
                  <img
                    src={viewBooking.tourImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground text-sm mb-1">
                    {viewBooking.tourName}
                  </h3>
                  <p className="text-[11px] text-primary font-bold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {viewBooking.date} · {viewBooking.timeSlot}
                  </p>
                  <Badge
                    className={`${statusBadge[viewBooking.status]} mt-2 border text-[10px] py-0 px-2 font-bold capitalize shadow-none`}
                  >
                    {viewBooking.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-card border border-border p-4 rounded-xl shadow-sm">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Guest Name
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {viewBooking.contactName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Phone Number
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {viewBooking.contactPhone}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Email Address
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {viewBooking.contactEmail}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Participants
                  </p>{" "}
                  <p className="text-foreground font-bold flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {viewBooking.participants}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Booking Type
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {viewBooking.isGroup
                      ? `Group (${viewBooking.groupName})`
                      : "Individual"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Payment Method
                  </p>{" "}
                  <p className="text-foreground font-bold uppercase tracking-tight">
                    {viewBooking.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Booking Date
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {viewBooking.createdAt.split("T")[0]}
                  </p>
                </div>
              </div>

              {viewBooking.accommodation && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="font-bold text-foreground text-[11px] flex items-center gap-1.5 mb-2 uppercase tracking-wide">
                    🏠 Accommodation
                  </p>
                  <p className="font-bold text-[11px]">
                    {viewBooking.accommodation.name} ·{" "}
                    {viewBooking.accommodation.nights} night(s)
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                    {formatPrice(viewBooking.accommodation.pricePerNight)} per
                    night
                  </p>
                </div>
              )}

              {viewBooking.specialRequirements && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Special Requirements
                  </p>
                  <p className="text-[11px] text-foreground leading-relaxed italic">
                    {viewBooking.specialRequirements}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-lg border-t border-border pt-4 px-2">
                <span className="text-foreground">Grand Total</span>
                <span className="text-primary font-heading">
                  {formatPrice(viewBooking.totalPrice)}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 text-xs h-10 font-bold"
                  onClick={() =>
                    toast.success("Ref: " + viewBooking.bookingRef, {
                      description: "Booking has been confirmed.",
                    })
                  }
                >
                  Confirm Booking
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs h-10 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    toast.error("Booking Cancelled", {
                      description:
                        viewBooking.bookingRef + " has been cancelled.",
                    })
                  }
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
