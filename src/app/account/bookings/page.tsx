"use client";

import { useState, useMemo, useEffect } from "react";
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
  Search,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { fetchMyBookings, cancelMyBooking, type Booking } from "@/lib/api/bookings";
import { toAbsoluteExperienceImage } from "@/lib/api/experiences";
import {
  createExperienceReview,
  fetchExperienceReviews,
  type Review,
} from "@/lib/api/reviews";
import { translations } from "@/i18n/translations";

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

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-100",
  paid: "text-emerald-600 bg-emerald-50 border-emerald-100",
  failed: "text-destructive bg-destructive/5 border-destructive/10",
  refunded: "text-blue-600 bg-blue-50 border-blue-100",
};

export default function MyBookingsPage() {
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Filters & State
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Queries
  const bookingsQuery = useQuery({
    queryKey: ["my-bookings", statusFilter, search, page],
    queryFn: () =>
      fetchMyBookings({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
        page,
        limit: 10,
      }),
  });

  // Mutations
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelMyBooking(id, reason),
    onSuccess: () => {
      toast.success("Booking Cancelled", {
        description: "Your booking has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      setCancelDialog(null);
      setCancelReason("");
    },
    onError: (error: Error) => {
      toast.error("Failed to cancel booking", {
        description: error.message || "Please try again.",
      });
    },
  });

  const selectedExperienceId = selectedBooking?.experience?.id;
  const reviewsQuery = useQuery({
    queryKey: ["experience-reviews", selectedExperienceId],
    queryFn: () =>
      fetchExperienceReviews(selectedExperienceId as string, {
        page: 1,
        limit: 50,
      }),
    enabled: !!selectedExperienceId,
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      createExperienceReview(selectedExperienceId as string, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      }),
    onSuccess: () => {
      toast.success("Review submitted", {
        description: "Thank you for sharing your experience.",
      });
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({
        queryKey: ["experience-reviews", selectedExperienceId],
      });
    },
    onError: (error: Error) => {
      toast.error("Unable to submit review", {
        description: error.message || "Please try again.",
      });
    },
  });

  const experienceReviews = reviewsQuery.data?.data ?? [];
  const myReview = experienceReviews.find((review: Review) => review.userId === user?.id);

  const bookings = bookingsQuery.data?.data ?? [];
  const pagination = bookingsQuery.data?.pagination;

  useEffect(() => {
    setReviewRating(5);
    setReviewComment("");
  }, [selectedBooking?.id]);

  return (
    <div className="min-h-screen bg-background text-xs">
      <div className="container py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {t(translations.bookingsPage.title)}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              {pagination?.total ?? 0} {t(translations.bookingsPage.found)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder={t(translations.bookingsPage.searchTours)}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 h-9 text-xs"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-36 h-9 text-xs bg-card">
                <SelectValue placeholder={t(translations.bookingsPage.status)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{t(translations.ordersPage.allStatuses)}</SelectItem>
                <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
                <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                <SelectItem value="waitlisted" className="text-xs">Waitlisted</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/tours" className="shrink-0">
              <Button size="sm" className="gap-1.5 h-9 text-xs px-4">
                <Calendar className="h-3.5 w-3.5" /> {t(translations.bookingsPage.bookNew)}
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {bookingsQuery.isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="font-medium text-muted-foreground animate-pulse">{t(translations.bookingsPage.loadingExperiences)}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">
              {t(translations.bookingsPage.noBookings)}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              {search || statusFilter !== "all" 
                ? t(translations.ordersPage.adjustFilters) 
                : t(translations.bookingsPage.notMadeBookings)}
            </p>
            {!search && statusFilter === "all" && (
              <Link href="/tours">
                <Button size="lg" className="text-xs h-10 px-6">
                  {t(translations.bookingsPage.browseExperiences)}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const sc = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              const tourTitle = t(booking.experience?.title) || "Unknown Experience";
              const tourImage = toAbsoluteExperienceImage(booking.experience?.heroImage);

              return (
                <div
                  key={booking.id}
                  className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden shrink-0 border border-border/50">
                      <img
                        src={tourImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge
                          className={`${sc.color} border text-[10px] md:text-[11px] gap-1.5 font-bold py-0.5 px-2.5`}
                        >
                          <StatusIcon className={`h-3 w-3 ${booking.status === "pending" ? "animate-spin" : ""}`} />
                          {t((translations.statuses as any)[booking.status.toLowerCase()] || booking.status)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          {t(translations.bookingsPage.bookingRef)} {booking.referenceNumber}
                        </span>
                        {booking.paymentStatus && (
                            <span className={`text-[9px] font-bold uppercase py-0.5 px-2 rounded-full border ${PAYMENT_STATUS_COLORS[booking.paymentStatus]}`}>
                                {t((translations.statuses as any)[booking.paymentStatus.toLowerCase()] || booking.paymentStatus)}
                            </span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground font-heading text-base mb-1 truncate">
                        {tourTitle}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5 text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.timeSlot}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {booking.participants} {t(translations.bookingsPage.guests)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 shrink-0 pt-2 md:pt-0">
                      <div className="md:text-right">
                        <p className="text-xl font-bold text-primary font-heading leading-none">
                          {formatPrice(booking.amountRwf)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tight">
                          {booking.paymentMethod?.replace("_", " ") || "N/A"}
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
                          {t(translations.bookingsPage.details)}
                        </Button>
                        {["pending", "confirmed", "waitlisted"].includes(booking.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
                            onClick={() => setCancelDialog(booking)}
                          >
                            <X className="h-3.5 w-3.5" />
                            {t(translations.bookingsPage.cancel)}
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

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => setPage(p => p - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-4">
              <span className="font-bold text-foreground">{pagination.page}</span>
              <span className="text-muted-foreground">{t(translations.ordersPage.of)}</span>
              <span className="font-bold text-foreground">{pagination.pages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setPage(p => p + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* View detail dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3 text-left">
            <DialogTitle className="font-heading text-lg">
              {t(translations.bookingsPage.bookingOverview)}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold tracking-widest uppercase opacity-70">
              {t(translations.bookingsPage.bookingRef)} {selectedBooking?.referenceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 pt-4 text-[11px]">
              <div className="aspect-video overflow-hidden rounded-xl border border-border/50">
                <img
                  src={toAbsoluteExperienceImage(selectedBooking.experience?.heroImage)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h3 className="font-bold text-foreground text-sm leading-tight">
                    {t(selectedBooking.experience?.title)}
                  </h3>
                  <p className="text-primary font-bold uppercase tracking-tight text-[10px]">
                    {selectedBooking.experience?.type.replace("_", " ")}
                  </p>
                </div>
                <Badge className={`${statusConfig[selectedBooking.status]?.color} border py-0.5`}>
                  {t((translations.statuses as any)[selectedBooking.status.toLowerCase()] || selectedBooking.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-accent/20 rounded-xl p-4 border border-border/30">
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">{t(translations.bookingsPage.date)}</p>{" "}
                  <p className="text-foreground font-bold">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">{t(translations.bookingsPage.timeSlot)}</p>{" "}
                  <p className="text-foreground font-bold">{selectedBooking.timeSlot}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">{t(translations.bookingsPage.participants)}</p>{" "}
                  <p className="text-foreground font-bold">{selectedBooking.participants} {t(translations.bookingsPage.guests)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">{t(translations.bookingsPage.bookingType)}</p>{" "}
                  <p className="text-foreground font-bold capitalize">{selectedBooking.bookingType.replace("_", " ")}</p>
                </div>
                <div className="col-span-2 border-t border-border/20 pt-3 mt-1">
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">{t(translations.bookingsPage.guestName)}</p>{" "}
                  <p className="text-foreground font-bold">{selectedBooking.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">{t(translations.bookingsPage.contactPhone)}</p>{" "}
                  <p className="text-foreground font-bold">{selectedBooking.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-0.5 uppercase tracking-tighter">{t(translations.bookingsPage.paymentStatus)}</p>{" "}
                  <p className="text-foreground font-bold capitalize">{t((translations.statuses as any)[selectedBooking.paymentStatus.toLowerCase()] || selectedBooking.paymentStatus)}</p>
                </div>
              </div>

              {selectedBooking.specialRequirements && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="font-bold text-foreground text-[10px] mb-1 leading-none uppercase tracking-tight flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" /> {t(translations.bookingsPage.specialRequirements)}
                  </p>
                  <p className="text-muted-foreground leading-relaxed italic">
                    {selectedBooking.specialRequirements}
                  </p>
                </div>
              )}

              {/* Rating Section */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <p className="font-bold text-foreground text-[10px] uppercase tracking-tight">
                  {t(translations.bookingsPage.rateExperience)}
                </p>
                {selectedBooking.status === "completed" ? (
                  <>
                    {myReview ? (
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-semibold text-foreground">
                          {t(translations.bookingsPage.alreadyReviewed)} ({myReview.rating}/5)
                        </p>
                        {myReview.comment ? (
                          <p className="text-xs text-muted-foreground mt-1">{myReview.comment}</p>
                        ) : null}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className="p-1 rounded-md transition-colors hover:bg-accent"
                            >
                              <Star
                                className={`h-4 w-4 ${star <= reviewRating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"}`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          value={reviewComment}
                          onChange={(event) => setReviewComment(event.target.value)}
                          placeholder={t(translations.bookingsPage.writeReview)}
                          className="text-xs"
                          rows={3}
                        />
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => reviewMutation.mutate()}
                          disabled={reviewMutation.isPending || !reviewComment.trim()}
                        >
                          {reviewMutation.isPending ? t(translations.bookingsPage.processing) : t(translations.bookingsPage.submitReview)}
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {t(translations.bookingsPage.reviewAvailableAfter)}
                  </p>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {t(translations.bookingsPage.recentReviews)}
                  </p>
                  {experienceReviews.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">No reviews yet.</p>
                  ) : (
                    experienceReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="rounded-lg border border-border p-2">
                        <p className="text-[11px] font-semibold text-foreground">
                          {review.user?.username || "Guest"} - {review.rating}/5
                        </p>
                        {review.comment ? (
                          <p className="text-[11px] text-muted-foreground">{review.comment}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center font-bold text-lg border-t border-border pt-4 px-1">
                <span className="text-foreground">{t(translations.bookingsPage.totalAmount)}</span>
                <span className="text-primary font-heading">
                  {formatPrice(selectedBooking.amountRwf)}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="mt-2 flex-col sm:flex-row gap-2">
              {["pending", "confirmed", "waitlisted"].includes(selectedBooking?.status || "") && (
                <Button 
                  variant="destructive" 
                  className="w-full text-xs font-bold gap-2"
                  onClick={() => {
                    setCancelDialog(selectedBooking);
                    setSelectedBooking(null);
                  }}
                >
                  <X className="h-4 w-4" /> {t(translations.bookingsPage.cancel)}
                </Button>
              )}
              <Button variant="outline" className="w-full text-xs" onClick={() => setSelectedBooking(null)}>{t(translations.common.close)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => {
          if (!open) {
              setCancelDialog(null);
              setCancelReason("");
          }
      }}>
        <DialogContent>
          <DialogHeader className="border-b pb-3 text-left">
            <DialogTitle className="font-heading text-destructive flex items-center gap-2 text-lg">
              <XCircle className="h-5 w-5" /> {t(translations.bookingsPage.cancelBooking)}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              {t(translations.bookingsPage.bookingRef)} {cancelDialog?.referenceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/10">
                <p className="text-[11px] text-foreground font-medium">
                  {t(translations.bookingsPage.sureCancel)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  {t(translations.bookingsPage.cancelInstruction)}
                </p>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight ml-1">{t(translations.bookingsPage.cancelReasonPlaceholder)}</label>
                <Input 
                    placeholder={t(translations.bookingsPage.cancelReasonPlaceholder)} 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-xs h-9"
                />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="text-xs h-9 px-6"
              onClick={() => setCancelDialog(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              className="text-xs h-9 px-6 font-bold"
              onClick={() => cancelDialog && cancelMutation.mutate({ id: cancelDialog.id, reason: cancelReason })}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? t(translations.bookingsPage.processing) : t(translations.bookingsPage.confirmCancellation)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
