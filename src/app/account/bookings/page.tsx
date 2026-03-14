"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  X,
  Leaf,
  Home,
  Star,
  type LucideIcon,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Loader2,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-accent text-accent-foreground border-border",
    icon: CheckCircle2,
  },
  waitlisted: {
    label: "Waitlisted",
    color: "bg-muted text-muted-foreground border-border",
    icon: AlertCircle,
  },
};

const BOOKING_RATINGS_KEY = "agriEco.bookingRatings";

type BookingRatings = Record<string, number>;

function loadBookingRatings(): BookingRatings {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BOOKING_RATINGS_KEY);
    return raw ? (JSON.parse(raw) as BookingRatings) : {};
  } catch {
    return {};
  }
}

function persistBookingRatings(ratings: BookingRatings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKING_RATINGS_KEY, JSON.stringify(ratings));
}

export default function MyBookingsPage() {
  const { formatPrice } = usePricing();
  const [bookings] = useState<Booking[]>(sampleBookings);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);
  const [bookingRatings, setBookingRatings] = useState<BookingRatings>(() =>
    loadBookingRatings(),
  );
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const filtered =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const handleCancel = (booking: Booking) => {
    toast.success("Booking Cancelled", {
      description: `Booking ${booking.bookingRef} has been cancelled. Refund will be processed.`,
    });
    setCancelDialog(null);
  };

  const handleRateBooking = (bookingId: string, rating: number) => {
    setBookingRatings((prev) => {
      const next = { ...prev, [bookingId]: rating };
      persistBookingRatings(next);
      return next;
    });
    toast.success("Thanks for your rating!", {
      description: `You rated this experience ${rating} out of 5 stars.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              My Bookings
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              {filtered.length} booking(s)
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-36 h-9 text-xs bg-card">
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
            <Link href="/tours" className="shrink-0">
              <Button size="sm" className="gap-1.5 h-9 text-xs px-4">
                <Calendar className="h-3.5 w-3.5" /> Book New Tour
              </Button>
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">
              No bookings found
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              You haven&apos;t made any bookings yet.
            </p>
            <Link href="/tours">
              <Button size="lg" className="text-xs h-10 px-6">
                Browse Experiences
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const sc = statusConfig[booking.status];
              const StatusIcon = sc.icon;
              return (
                <div
                  key={booking.id}
                  className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={booking.tourImage}
                        alt={booking.tourName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge
                          className={`${sc.color} border text-[10px] md:text-[11px] gap-1.5 font-bold py-0.5 px-2.5`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {sc.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Ref: {booking.bookingRef}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground font-heading text-base mb-1 truncate">
                        {booking.tourName}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5 text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.timeSlot}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {booking.participants}{" "}
                          {booking.isGroup
                            ? `(${booking.groupName})`
                            : "guest(s)"}
                        </span>
                      </div>
                      {booking.accommodation && (
                        <p className="text-[10px] text-muted-foreground mt-2 font-semibold flex items-center gap-1.5">
                          🏠 {booking.accommodation.name} ·{" "}
                          {booking.accommodation.nights} night(s)
                        </p>
                      )}
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 pt-2 md:pt-0">
                      <div className="md:text-right">
                        <p className="text-xl font-bold text-primary font-heading leading-none">
                          {formatPrice(booking.totalPrice)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tight">
                          {booking.paymentMethod}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-semibold"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        {(booking.status === "pending" ||
                          booking.status === "confirmed") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
                            onClick={() => setCancelDialog(booking)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View detail dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => {
          setSelectedBooking(null);
          setHoveredRating(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading text-lg">
              Booking Details
            </DialogTitle>
            <DialogDescription className="text-xs font-bold tracking-widest uppercase opacity-70">
              Ref: {selectedBooking?.bookingRef}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 pt-4 text-xs">
              <div className="aspect-video overflow-hidden rounded-xl">
                <img
                  src={selectedBooking.tourImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-foreground text-sm border-b pb-2">
                {selectedBooking.tourName}
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-accent/20 rounded-xl p-4">
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Date
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.date}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Time Slot
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.timeSlot}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Participants
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.participants}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Group Type
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.isGroup
                      ? `Group (${selectedBooking.groupName})`
                      : "Individual"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Contact Name
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.contactName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Phone
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.contactPhone}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Email
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.contactEmail}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Payment
                  </p>{" "}
                  <p className="text-foreground font-bold">
                    {selectedBooking.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">
                    Status
                  </p>{" "}
                  <p className="text-foreground font-bold capitalize">
                    {selectedBooking.status}
                  </p>
                </div>
              </div>

              {selectedBooking.accommodation && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="font-bold text-foreground flex items-center gap-2 mb-1.5">
                    <Home className="h-4 w-4" /> Accommodation Details
                  </p>
                  <div className="flex justify-between items-center text-[11px]">
                    <p className="text-muted-foreground font-medium">
                      {selectedBooking.accommodation.name}
                    </p>
                    <p className="text-foreground font-bold">
                      {selectedBooking.accommodation.nights} night(s) ·{" "}
                      {formatPrice(selectedBooking.accommodation.pricePerNight)}
                      /night
                    </p>
                  </div>
                </div>
              )}

              {selectedBooking.specialRequirements && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="font-bold text-foreground text-[11px] mb-1 leading-none uppercase tracking-tight flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Special Requirements
                  </p>
                  <p className="text-muted-foreground leading-relaxed italic">
                    {selectedBooking.specialRequirements}
                  </p>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <p className="font-bold text-foreground text-[11px] uppercase tracking-tight">
                  Rate This Tour
                </p>
                <div
                  className="flex items-center gap-1"
                  role="radiogroup"
                  aria-label="Rate this tour"
                >
                  {Array.from({ length: 5 }, (_, idx) => {
                    const value = idx + 1;
                    const selected = selectedBooking
                      ? bookingRatings[selectedBooking.id] || 0
                      : 0;
                    const active = (hoveredRating ?? selected) >= value;

                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected === value}
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        className="p-1 rounded-md transition-colors hover:bg-accent"
                        onMouseEnter={() => setHoveredRating(value)}
                        onMouseLeave={() => setHoveredRating(null)}
                        onFocus={() => setHoveredRating(value)}
                        onBlur={() => setHoveredRating(null)}
                        onClick={() =>
                          handleRateBooking(selectedBooking.id, value)
                        }
                      >
                        <Star
                          className={`h-5 w-5 ${
                            active
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-[11px] text-muted-foreground font-medium">
                    {selectedBooking
                      ? `${bookingRatings[selectedBooking.id] || 0}/5`
                      : "0/5"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t border-border pt-4 px-1">
                <span className="text-foreground">Total Paid</span>
                <span className="text-primary font-heading">
                  {formatPrice(selectedBooking.totalPrice)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Cancel Booking
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              Ref: {cancelDialog?.bookingRef}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-foreground font-medium">
              Are you sure you want to cancel this booking?
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              This action will initiate the cancellation process. Refunds are
              subject to the tour&apos;s cancellation policy (usually 48 hours
              notice for full refund).
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="text-xs h-9 px-6"
              onClick={() => setCancelDialog(null)}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              className="text-xs h-9 px-6 font-bold"
              onClick={() => cancelDialog && handleCancel(cancelDialog)}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
