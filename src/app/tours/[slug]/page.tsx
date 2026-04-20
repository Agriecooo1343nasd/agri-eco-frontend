"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Clock,
  Users,
  Star,
  MapPin,
  ChevronRight,
  Calendar,
  Leaf,
  Check,
  AlertCircle,
  Info,
  Home,
  MinusCircle,
  PlusCircle,
  Loader2,
  Eye,
  Wifi,
  Coffee,
  Shield,
  ChevronLeft,
  X,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  fetchExperienceBySlug,
  Experience,
  toAbsoluteExperienceImage,
} from "@/lib/api/experiences";
import {
  fetchAccommodations,
  AdminAccommodation,
  toAbsoluteAccommodationImage,
} from "@/lib/api/accommodations";
import {
  createBooking,
  fetchMyBookings,
  type Booking,
  type BookingType,
} from "@/lib/api/bookings";
import {
  createExperienceReview,
  fetchExperienceReviews,
  type Review,
} from "@/lib/api/reviews";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/i18n/translations";

const statusColors: Record<string, string> = {
  available: "bg-primary/10 text-primary",
  limited: "bg-secondary/10 text-secondary-foreground",
  "sold-out": "bg-destructive/10 text-destructive",
  upcoming: "bg-accent text-accent-foreground",
};

export default function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { formatPrice } = usePricing();
  const { t, locale } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [accommodations, setAccommodations] = useState<AdminAccommodation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSlotKey, setSelectedSlotKey] = useState("");
  const [participants, setParticipants] = useState(1);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [specialReqs, setSpecialReqs] = useState("");
  const [selectedAccom, setSelectedAccom] = useState<string>("");
  const [accomNights, setAccomNights] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [activeGallery, setActiveGallery] = useState(0);
  const [bookingStep, setBookingStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [viewAccomDetail, setViewAccomDetail] = useState<AdminAccommodation | null>(null);
  const [accomGalleryIdx, setAccomGalleryIdx] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedTourBookings, setCompletedTourBookings] = useState<Booking[]>(
    [],
  );
  const [tourRateStars, setTourRateStars] = useState(5);
  const [tourRateComment, setTourRateComment] = useState("");
  const [submittingTourReview, setSubmittingTourReview] = useState(false);

  // Pre-fill user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setContactName(user.name || "");
      setContactEmail(user.email || "");
      setContactPhone(user.phone || "");
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const exp = await fetchExperienceBySlug(slug);
        setExperience(exp);

        if (exp.linkedAccommodationIds?.length > 0) {
          const accRes = await fetchAccommodations({ limit: 100 });
          const filtered = accRes.data.filter((a) =>
            exp.linkedAccommodationIds.includes(a.id),
          );
          setAccommodations(filtered);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load experience");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  useEffect(() => {
    async function loadReviews() {
      if (!experience?.id) return;
      try {
        const result = await fetchExperienceReviews(experience.id, {
          limit: 50,
          page: 1,
        });
        setReviews(result.data ?? []);
      } catch {
        setReviews([]);
      }
    }
    void loadReviews();
  }, [experience?.id]);

  useEffect(() => {
    async function loadCompletedBookings() {
      if (!isAuthenticated || !experience?.id) {
        setCompletedTourBookings([]);
        return;
      }
      try {
        const res = await fetchMyBookings({ status: "completed", limit: 100 });
        setCompletedTourBookings(
          res.data.filter((b) => b.experienceId === experience.id),
        );
      } catch {
        setCompletedTourBookings([]);
      }
    }
    void loadCompletedBookings();
  }, [isAuthenticated, experience?.id]);

  const normalizedSlots = (experience?.slots ?? []).map((slot: any) => {
    const slotDate = slot?.date ? new Date(slot.date) : null;
    return {
      key: `${slot.id ?? slot.timeSlot}-${slot.date ?? "na"}`,
      id: slot.id,
      date: slotDate,
      dateLabel: slotDate ? slotDate.toLocaleDateString() : "Scheduled date",
      dateValue: slotDate
        ? `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, "0")}-${String(slotDate.getDate()).padStart(2, "0")}`
        : "",
      timeSlot: slot.timeSlot,
      capacity: Number(slot.capacity) || 0,
      bookedParticipants:
        typeof slot.bookedParticipants === "number" ? slot.bookedParticipants : null,
    };
  });

  const selectedSlot = normalizedSlots.find((slot) => slot.key === selectedSlotKey) ?? null;
  const slotFull =
    selectedSlot &&
    selectedSlot.bookedParticipants !== null &&
    selectedSlot.capacity > 0
      ? selectedSlot.bookedParticipants >= selectedSlot.capacity
      : false;
  const accomOption = accommodations.find((a) => a.id === selectedAccom);

  const pricePerPerson =
    isGroup && experience?.pricePerGroupRwf && participants >= (experience?.minParticipants || 1)
      ? experience.pricePerGroupRwf
      : experience?.priceRwf || 0;
  const tourTotal = pricePerPerson * participants;
  const accomTotal = accomOption ? accomOption.ratePerNightRwf * accomNights : 0;
  const grandTotal = tourTotal + accomTotal;

  const handleSubmitBooking = async () => {
    if (!contactName || !contactEmail || !contactPhone) {
      toast.error("Missing information. Please fill in all contact details.");
      return;
    }
    if (!selectedSlot) {
      toast.error("Select a slot. Please choose one available schedule.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Payment method. Please select a payment method.");
      return;
    }

    if (!experience) return;

    try {
      setSubmitting(true);
      const booking = await createBooking({
        experienceId: (experience as any).id,
        fullName: contactName,
        email: contactEmail,
        phone: contactPhone,
        participants,
        bookingType: (isGroup ? "group" : "individual") as BookingType,
        date:
          selectedSlot.dateValue,
        timeSlot: selectedSlot.timeSlot,
        specialRequirements: specialReqs,
        paymentMethod,
        accommodationId: accomOption?.id,
        accommodationNights: accomOption ? accomNights : undefined,
        amountRwf: grandTotal,
      });

      if (booking.status === "waitlisted") {
        toast.success(`Ref: ${booking.referenceNumber}`, {
          description: "You've been added to the waiting list! We'll notify you.",
        });
      } else {
        toast.success("Booking Confirmed!", {
          description: `Ref: ${booking.referenceNumber} — Confirmation sent to ${contactEmail}`,
        });
      }

      router.push("/account/bookings");
    } catch (err: any) {
      toast.error("Booking failed", {
        description: err.response?.data?.message || err.message || "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">{t(translations.common.loading)}...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <Leaf className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading mb-2">
            {t(translations.common?.error || "Tour Not Found")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || "The experience you're looking for doesn't exist."}
          </p>
          <Link href="/tours">
            <Button>{t(translations.common?.backToTours || "Browse All Tours")}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = experience.gallery.length > 0 ? experience.gallery : [experience.heroImage].filter(Boolean) as string[];

  const myTourReview =
    user?.id != null
      ? reviews.find((r) => r.userId === user.id)
      : undefined;

  const handleSubmitTourReview = async () => {
    if (!experience) return;
    if (tourRateComment.trim().length < 10) {
      toast.error("Review too short", {
        description: "Please write at least 10 characters about your visit.",
      });
      return;
    }
    try {
      setSubmittingTourReview(true);
      await createExperienceReview(experience.id, {
        rating: tourRateStars,
        comment: tourRateComment.trim(),
      });
      toast.success("Thanks for your review!");
      setTourRateComment("");
      setTourRateStars(5);
      const result = await fetchExperienceReviews(experience.id, {
        limit: 50,
        page: 1,
      });
      setReviews(result.data ?? []);
    } catch (err: any) {
      toast.error("Could not submit review", {
        description:
          err.response?.data?.message || err.message || "Please try again.",
      });
    } finally {
      setSubmittingTourReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container py-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            {t(translations.common.home)}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tours" className="hover:text-primary">
            {t(translations.common?.tours || "Tours")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate">
            {t(experience.title)}
          </span>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tour info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl aspect-video md:aspect-21/9 bg-muted">
                <Image
                  src={toAbsoluteExperienceImage(gallery[activeGallery])}
                  alt={t(experience.title)}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {gallery.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveGallery(i)}
                      className={`rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${i === activeGallery ? "border-primary" : "border-transparent"}`}
                    >
                      <img
                        src={toAbsoluteExperienceImage(img)}
                        alt=""
                        className="h-14 w-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge
                  className={`${experience.isActive ? statusColors.available : statusColors["sold-out"]} text-[10px] py-0 px-2`}
                >
                  {experience.isActive ? t(translations.tourDetailPage.available) : t(translations.tourDetailPage.unavailable)}
                </Badge>
                {experience.seasonStart && (
                  <Badge variant="outline" className="text-[10px] py-0 px-2">
                    {t(translations.tourDetailPage.seasonal)}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2 leading-tight">
                {t(experience.title)}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {experience.expectedDuration || `${experience.durationMinutes} min`}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {t(translations.tourDetailPage.guestsCapacity).replace("{count}", String(experience.capacity))}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {experience.destination || "Musanze"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  {(Number(experience.averageRating || 0)).toFixed(1)} ({experience.reviewCount ?? 0} reviews)
                </span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <h3 className="font-heading font-semibold text-foreground text-sm">
                      {t(translations.tourDetailPage.rateThisTour)}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {t(translations.tourDetailPage.joinedDepartures)}
                      {" "}{t(translations.tourDetailPage.bookingRequired)}
                    </p>
                  </div>
                  {!isAuthenticated ? (
                    <Button asChild size="sm" className="text-xs h-9 w-full sm:w-auto">
                      <Link href={`/login?redirect=${encodeURIComponent(`/tours/${slug}`)}`}>
                        {t(translations.tourDetailPage.signInToRate)}
                      </Link>
                    </Button>
                  ) : myTourReview ? (
                    <div className="rounded-lg border border-border bg-background/90 p-3">
                      <p className="text-xs font-semibold text-foreground">
                        {t(translations.tourDetailPage.yourRating)}: {myTourReview.rating}/5
                      </p>
                      {[myTourReview.title, myTourReview.comment]
                        .filter(Boolean)
                        .length > 0 ? (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {[myTourReview.title, myTourReview.comment]
                            .filter(Boolean)
                            .join(" — ")}
                        </p>
                      ) : null}
                    </div>
                  ) : completedTourBookings.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      After you complete a booking for this tour, you can submit a
                      review here or from{" "}
                      <Link
                        href="/account/bookings"
                        className="font-medium text-primary underline underline-offset-2"
                      >
                        My bookings
                      </Link>
                      .
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTourRateStars(star)}
                            className="rounded-md p-1 transition-colors hover:bg-accent"
                          >
                            <Star
                              className={`h-5 w-5 ${star <= tourRateStars ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <Textarea
                        value={tourRateComment}
                        onChange={(e) => setTourRateComment(e.target.value)}
                        placeholder="What stood out? Tips for other travelers? (min. 10 characters)"
                        className="text-xs min-h-[80px] resize-y"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="text-xs"
                        disabled={
                          submittingTourReview || tourRateComment.trim().length < 10
                        }
                        onClick={() => void handleSubmitTourReview()}
                      >
                        {submittingTourReview ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {t(translations.tourDetailPage.submitting)}
                          </span>
                        ) : (
                          t(translations.tourDetailPage.submitReview)
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground text-sm mb-2">
                {t(translations.tourDetailPage.guestReviews)}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {t(translations.tourDetailPage.totalReviews).replace("{count}", String(experience.reviewCount ?? 0))}, 
                {" "}{t(translations.tourDetailPage.averageRating).replace("{rating}", (Number(experience.averageRating || 0)).toFixed(1))}
              </p>
              {reviews.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t(translations.tourDetailPage.noReviews)}</p>
              ) : (
                <div className="space-y-2">
                  {reviews.slice(0, 4).map((review) => (
                    <div key={review.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">
                          {review.user?.username || "Guest"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{review.rating}/5</p>
                      </div>
                      {[review.title, review.comment].filter(Boolean).length >
                      0 ? (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {[review.title, review.comment]
                            .filter(Boolean)
                            .join(" — ")}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-card border border-border overflow-x-auto">
                <TabsTrigger value="overview" className="text-xs">
                  {t(translations.tourDetailPage.tabs.overview)}
                </TabsTrigger>
                <TabsTrigger value="includes" className="text-xs">
                  {t(translations.tourDetailPage.tabs.includes)}
                </TabsTrigger>
                <TabsTrigger value="highlights" className="text-xs">
                  {t(translations.tourDetailPage.tabs.highlights)}
                </TabsTrigger>
                <TabsTrigger value="policy" className="text-xs">
                  {t(translations.tourDetailPage.tabs.policy)}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {t(experience.fullOverview)}
                </p>
                {experience.requirements.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-secondary" />{" "}
                      {t(translations.tourDetailPage.requirements)}
                    </h3>
                    <ul className="space-y-1">
                      {experience.requirements.map((r: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          {typeof r === "string" ? r : t(r)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="includes" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {experience.inclusions.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-foreground bg-accent/50 rounded-lg px-3 py-2"
                    >
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {typeof item === "string" ? item : t(item)}
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="highlights" className="mt-4">
                <div className="space-y-2">
                  {experience.highlights.map((h: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-foreground leading-relaxed">
                        {typeof h === "string" ? h : t(h)}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="policy" className="mt-4">
                <div className="bg-accent/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground text-sm mb-2">
                    {t(translations.tourDetailPage.cancellationPolicy)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(experience.cancellationPolicy) || "Please contact us for cancellation details."}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Booking sidebar */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 md:sticky md:top-24">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">{t(translations.tourDetailPage.from)}</p>
                  <p className="text-3xl font-bold text-primary font-heading leading-none">
                    {formatPrice(experience.priceRwf)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t(translations.tourDetailPage.perPerson)}
                  </p>
                </div>
                {experience.pricePerGroupRwf > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">
                      {t(translations.tourDetailPage.groupRate)}
                    </p>
                    <p className="text-lg font-bold text-foreground leading-none">
                      {formatPrice(experience.pricePerGroupRwf)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {t(translations.tourDetailPage.perPerson)}
                    </p>
                  </div>
                )}
              </div>

              {/* Steps */}
              <div className="flex gap-1 mb-5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full ${bookingStep >= s ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>

              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    {t(translations.tourDetailPage.step1)}
                  </h3>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1.5 block">
                      {t(translations.tourDetailPage.availableSlots)}
                    </Label>
                    {normalizedSlots.length === 0 ? (
                      <div className="rounded-lg border border-border bg-accent/30 px-3 py-2.5 text-xs text-muted-foreground">
                        {t(translations.tourDetailPage.noSlots)}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {normalizedSlots.map((slot: any) => {
                        const full =
                          slot.bookedParticipants !== null && slot.capacity > 0
                            ? slot.bookedParticipants >= slot.capacity
                            : false;
                        return (
                          <button
                            key={slot.key}
                            onClick={() => !full && setSelectedSlotKey(slot.key)}
                            disabled={full}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                              selectedSlotKey === slot.key
                                ? "border-primary bg-primary/5 text-primary"
                                : full
                                  ? "border-border opacity-60 cursor-not-allowed"
                                  : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="font-medium">
                              {slot.dateLabel} - {slot.timeSlot}
                            </span>
                            {slot.bookedParticipants !== null && slot.capacity > 0 ? (
                              <span className={`text-[10px] ${full ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                                {full
                                  ? `${t(translations.tourDetailPage.waitlist)}`
                                  : `${slot.bookedParticipants}/${slot.capacity} ${t(translations.tourDetailPage.joined)}`}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1.5 block">
                      {t(translations.tourDetailPage.participants)}
                    </Label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setParticipants(
                            Math.max(experience.minParticipants, participants - 1),
                          )
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                      <span className="text-base font-bold text-foreground w-6 text-center">
                        {participants}
                      </span>
                      <button
                        onClick={() =>
                          setParticipants(
                            Math.min(experience.capacity, participants + 1),
                          )
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({t(translations.tourDetailPage.minMax).replace("{min}", String(experience.minParticipants)).replace("{max}", String(experience.capacity))})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <Label className="text-xs text-foreground font-bold">
                      {t(translations.tourDetailPage.groupBooking)}
                    </Label>
                    <Switch checked={isGroup} onCheckedChange={setIsGroup} />
                  </div>
                  {isGroup && (
                    <Input
                      placeholder={t(translations.tourDetailPage.organizationName)}
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  )}

                  <Button
                    className="w-full text-xs h-9"
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error(t(translations.common?.authRequired || "Authentication required"), {
                          description: t(translations.common?.signInToComplete || "Please sign in to complete your booking."),
                        });
                        setTimeout(() => router.push(`/login?redirect=${pathname}`), 1500);
                        return;
                      }
                      setBookingStep(2);
                    }}
                    disabled={!selectedSlotKey}
                  >
                    {t(translations.common.continue)}
                  </Button>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    {t(translations.tourDetailPage.step2)}
                  </h3>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      {t(translations.checkoutPage.fullName)}
                    </Label>
                    <Input
                      placeholder="e.g. Jean Baptiste"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      {t(translations.checkoutPage.email)}
                    </Label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      {t(translations.checkoutPage.phone)}
                    </Label>
                    <Input
                      type="tel"
                      placeholder="+250 7XX XXX XXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      {t(translations.checkoutPage.specialRequirements)}
                    </Label>
                    <Textarea
                      placeholder={t(translations.common?.optional || "Optional")}
                      value={specialReqs}
                      onChange={(e) => setSpecialReqs(e.target.value)}
                      className="mt-1 text-xs"
                      rows={2}
                    />
                  </div>

                  {/* Accommodation */}
                  {accommodations.length > 0 && (
                    <div className="pt-2">
                      <Label className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Home className="h-3.5 w-3.5" /> {t(translations.tourDetailPage.addAccommodation)}
                      </Label>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedAccom("")}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-[11px] ${!selectedAccom ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          {t(translations.tourDetailPage.noneNeeded)}
                        </button>
                        {accommodations.map((a) => (
                          <div
                            key={a.id}
                            className={`rounded-lg border text-[11px] transition-colors overflow-hidden ${
                              selectedAccom === a.id
                                ? "border-primary bg-primary/5"
                                : a.status === "available"
                                  ? "border-border hover:border-primary/50"
                                  : "border-border opacity-70"
                            }`}
                          >
                            <div className="flex">
                              {a.mainImage ? (
                                <img
                                  src={toAbsoluteAccommodationImage(a.mainImage)}
                                  alt={t(a.name)}
                                  className="w-16 h-16 object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-muted flex items-center justify-center shrink-0">
                                  <Home className="h-5 w-5 text-muted-foreground/30" />
                                </div>
                              )}
                              <div className="flex-1 p-2.5">
                                <div className="flex items-start justify-between gap-1">
                                  <button
                                    type="button"
                                    onClick={() => a.status === "available" && setSelectedAccom(a.id)}
                                    disabled={a.status !== "available"}
                                    className="flex-1 text-left"
                                  >
                                    <span className="font-semibold text-foreground block leading-tight">{t(a.name)}</span>
                                    <span className="text-[10px] text-primary font-bold">{formatPrice(a.ratePerNightRwf)}/{t(translations.tourDetailPage.nights).toLowerCase().slice(0, -1)}</span>
                                    <span className="text-[10px] text-muted-foreground capitalize block mt-0.5">
                                      {t(a.category)} &middot; {a.maxGuests} {t(translations.tourDetailPage.guests).toLowerCase()}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setViewAccomDetail(a); setAccomGalleryIdx(0); }}
                                    className="shrink-0 p-1 rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    title="View details"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedAccom && accomOption && (
                        <div className="flex items-center gap-3 mt-3">
                          <Label className="text-[11px] text-muted-foreground">
                            {t(translations.tourDetailPage.nights)}:
                          </Label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAccomNights(Math.max(1, accomNights - 1))}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-bold">{accomNights}</span>
                            <button
                              onClick={() => setAccomNights(accomNights + 1)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs h-9"
                      onClick={() => setBookingStep(1)}
                    >
                      {t(translations.common.back)}
                    </Button>
                    <Button
                      className="flex-1 text-xs h-9"
                      onClick={() => setBookingStep(3)}
                    >
                      {t(translations.common.continue)}
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    {t(translations.tourDetailPage.step3)}
                  </h3>

                  {/* Summary */}
                  <div className="bg-accent/30 rounded-lg p-4 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t(translations.tourDetailPage.tour)}</span>
                      <span className="max-w-35 truncate text-right font-medium text-foreground">
                        {t(experience.title)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t(translations.tourDetailPage.slot)}</span>
                      <span className="text-foreground">
                        {selectedSlot
                          ? `${selectedSlot.dateLabel} - ${selectedSlot.timeSlot}`
                          : "Default slot"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t(translations.tourDetailPage.guests)}</span>
                      <span className="text-foreground">
                        {participants} {isGroup ? `(${groupName})` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>{t(translations.tourDetailPage.tourSubtotal)}</span>
                      <span>{formatPrice(tourTotal)}</span>
                    </div>
                    {accomOption && (
                      <>
                        <div className="border-t border-border pt-1" />
                        <div className="flex justify-between font-medium">
                          <span>{t(translations.tourDetailPage.accommodation)}</span>
                          <span>{formatPrice(accomTotal)}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t border-border pt-2" />
                    <div className="flex justify-between text-sm font-bold text-primary">
                      <span>{t(translations.checkoutPage.total)}</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1.5 block">
                      {t(translations.checkoutPage.paymentMethod)}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["mobile_money", "credit_card"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`px-3 py-2 rounded-lg border text-[10px] uppercase font-bold transition-all ${
                            paymentMethod === m
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:bg-accent"
                          }`}
                        >
                          {m === "mobile_money" 
                            ? (locale === "rw" ? "Mobile Money" : t(translations.checkoutPage.momo)) 
                            : (locale === "rw" ? "Ikarita ya Banki" : t(translations.checkoutPage.card))}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs h-9"
                      onClick={() => setBookingStep(2)}
                    >
                      {t(translations.common.back)}
                    </Button>
                    <Button
                      className="flex-1 text-xs h-9"
                      onClick={handleSubmitBooking}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          {t(translations.tourDetailPage.processing)}
                        </>
                      ) : (
                        t(translations.tourDetailPage.confirmPay)
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ─── Accommodation Detail Dialog ─── */}
      <Dialog open={!!viewAccomDetail} onOpenChange={() => setViewAccomDetail(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
          {viewAccomDetail && (() => {
            const accom = viewAccomDetail;
            const allImages = [
              ...(accom.mainImage ? [toAbsoluteAccommodationImage(accom.mainImage)!] : []),
              ...(accom.gallery ?? []).map((g) => toAbsoluteAccommodationImage(g)!).filter(Boolean),
            ];
            return (
              <>
                {/* Gallery */}
                {allImages.length > 0 ? (
                  <div className="relative">
                    <img
                      src={allImages[accomGalleryIdx]}
                      alt={t(accom.name)}
                      className="w-full h-56 object-cover rounded-t-xl"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setAccomGalleryIdx((i) => (i > 0 ? i - 1 : allImages.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAccomGalleryIdx((i) => (i < allImages.length - 1 ? i + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {allImages.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setAccomGalleryIdx(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === accomGalleryIdx ? "bg-white" : "bg-white/40"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {/* Status badge */}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                      accom.status === "available" ? "bg-primary/90 text-white border-primary" :
                      accom.status === "occupied" ? "bg-amber-500/90 text-white border-amber-500" :
                      "bg-destructive/90 text-white border-destructive"
                    }`}>
                      {accom.status}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-muted rounded-t-xl flex items-center justify-center">
                    <Home className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-heading flex items-center gap-2">
                      {t(accom.name)}
                      <span className="text-xs font-normal text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">
                        {accom.category.replace("_", " ")}
                      </span>
                    </DialogTitle>
                  </DialogHeader>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(accom.description)}</p>

                  {/* Key Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-accent/40 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t(translations.tourDetailPage.rateNight)}</p>
                      <p className="text-base font-bold text-primary font-heading">{formatPrice(accom.ratePerNightRwf)}</p>
                    </div>
                    <div className="bg-accent/40 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{t(translations.tourDetailPage.maxGuests)}</p>
                      <p className="text-base font-bold text-foreground font-heading flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-primary" />{accom.maxGuests}
                      </p>
                    </div>
                  </div>

                  {/* Amenities */}
                  {accom.amenities && accom.amenities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">{t(translations.tourDetailPage.amenities)}</h4>
                      <div className="flex flex-wrap gap-2">
                        {accom.amenities.map((amenity, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 text-[11px] bg-primary/5 text-primary border border-primary/20 px-2 py-1 rounded-full font-medium"
                          >
                            <Check className="h-3 w-3" />
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {accom.status === "available" ? (
                      <Button
                        className="flex-1 text-xs h-10 font-bold"
                        onClick={() => {
                          setSelectedAccom(accom.id);
                          setViewAccomDetail(null);
                        }}
                      >
                        <Check className="h-3.5 w-3.5 mr-2" />
                        {t(translations.tourDetailPage.selectThisAccom)}
                      </Button>
                    ) : (
                      <div className="flex-1 text-center text-xs text-muted-foreground py-2">
                        {t(translations.tourDetailPage.accomNotAvailable)}
                      </div>
                    )}
                      <Button
                        variant="outline"
                        className="text-xs h-10"
                        onClick={() => setViewAccomDetail(null)}
                      >
                        {t(translations.common.close)}
                      </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
