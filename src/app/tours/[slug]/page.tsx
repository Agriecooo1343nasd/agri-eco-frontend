"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tours, type TourAccommodation } from "@/data/tours";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePricing } from "@/context/PricingContext";

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
  const { formatPrice } = usePricing();
  const tour = tours.find((t) => t.slug === slug);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
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
  const [selectedAccommodationInfo, setSelectedAccommodationInfo] =
    useState<TourAccommodation | null>(null);
  const [activeAccommodationImage, setActiveAccommodationImage] = useState(0);
  const [bookingStep, setBookingStep] = useState(1);

  // Calculation for prices
  const selectedSlot = tour?.timeSlots.find((ts) => ts.id === selectedTimeSlot);
  const slotFull = selectedSlot
    ? selectedSlot.booked >= selectedSlot.capacity
    : false;
  const accomOption = tour?.accommodation?.find((a) => a.id === selectedAccom);
  const accommodationGallery = selectedAccommodationInfo?.gallery?.length
    ? selectedAccommodationInfo.gallery
    : (tour?.gallery ?? []);
  const pricePerPerson =
    isGroup && tour?.groupPrice && participants >= (tour?.minParticipants || 1)
      ? tour.groupPrice
      : tour?.price || 0;
  const tourTotal = pricePerPerson * participants;
  const accomTotal = accomOption ? accomOption.pricePerNight * accomNights : 0;
  const grandTotal = tourTotal + accomTotal;

  if (!tour) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <Leaf className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading mb-2">
            Tour Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The experience you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/tours">
            <Button>Browse All Tours</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmitBooking = () => {
    if (!contactName || !contactEmail || !contactPhone) {
      toast.error("Missing information. Please fill in all contact details.");
      return;
    }
    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Select date & time. Please choose a date and time slot.");
      return;
    }
    if (!paymentMethod) {
      toast.error("Payment method. Please select a payment method.");
      return;
    }
    const ref = `AGE-${format(new Date(), "yyyy")}-${format(selectedDate, "MMdd")}-${Math.floor(Math.random() * 900 + 100)}`;

    if (slotFull) {
      toast.success(`Ref: ${ref}`, {
        description: "You've been added to the waiting list! We'll notify you.",
      });
    } else {
      toast.success("Booking Confirmed! 🎉", {
        description: `Ref: ${ref} — Confirmation sent to ${contactEmail}`,
      });
    }

    router.push("/account/bookings");
  };

  const relatedTours = tours
    .filter((t) => t.id !== tour.id && t.category === tour.category)
    .slice(0, 2);

  const openAccommodationInfo = (accommodation: TourAccommodation) => {
    setSelectedAccommodationInfo(accommodation);
    setActiveAccommodationImage(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tours" className="hover:text-primary">
            Tours
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate">
            {tour.name}
          </span>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tour info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl aspect-video md:aspect-21/9">
                <Image
                  src={tour.gallery[activeGallery] || tour.image}
                  alt={tour.name}
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              {tour.gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {tour.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveGallery(i)}
                      className={`rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${i === activeGallery ? "border-primary" : "border-transparent"}`}
                    >
                      <Image
                        src={img}
                        alt=""
                        width={80}
                        height={56}
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
                  className={`${statusColors[tour.status]} text-[10px] py-0 px-2`}
                >
                  {tour.status === "available"
                    ? "Available Now"
                    : tour.status === "limited"
                      ? "Limited Spots"
                      : tour.status === "sold-out"
                        ? "Sold Out"
                        : "Coming Soon"}
                </Badge>
                {tour.seasonal && (
                  <Badge variant="outline" className="text-[10px] py-0 px-2">
                    {tour.season}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2 leading-tight">
                {tour.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {tour.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Up to {tour.maxParticipants} guests
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {tour.location}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  {tour.rating} ({tour.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-card border border-border overflow-x-auto">
                <TabsTrigger value="overview" className="text-xs">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="includes" className="text-xs">
                  What&apos;s Included
                </TabsTrigger>
                <TabsTrigger value="highlights" className="text-xs">
                  Highlights
                </TabsTrigger>
                <TabsTrigger value="policy" className="text-xs">
                  Policy
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {tour.longDescription}
                </p>
                {tour.requirements.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-secondary" />{" "}
                      Requirements
                    </h3>
                    <ul className="space-y-1">
                      {tour.requirements.map((r) => (
                        <li
                          key={r}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="includes" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tour.includes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-foreground bg-accent/50 rounded-lg px-3 py-2"
                    >
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="highlights" className="mt-4">
                <div className="space-y-2">
                  {tour.highlights.map((h, i) => (
                    <div key={h} className="flex items-start gap-3 text-xs">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-foreground leading-relaxed">
                        {h}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="policy" className="mt-4">
                <div className="bg-accent/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground text-sm mb-2">
                    Cancellation Policy
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tour.cancellationPolicy}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Related */}
            {relatedTours.length > 0 && (
              <div className="pt-4">
                <h3 className="text-lg font-bold font-heading text-foreground mb-4">
                  Similar Experiences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedTours.map((rt) => (
                    <Link
                      key={rt.id}
                      href={`/tours/${rt.slug}`}
                      className="flex gap-3 bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow group"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={rt.image}
                          alt={rt.name}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                          {rt.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {rt.duration} · {rt.rating}★
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatPrice(rt.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking sidebar */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 md:sticky md:top-24">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">From</p>
                  <p className="text-3xl font-bold text-primary font-heading leading-none">
                    {formatPrice(tour.price)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    per person
                  </p>
                </div>
                {tour.groupPrice && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">
                      Group rate
                    </p>
                    <p className="text-lg font-bold text-foreground leading-none">
                      {formatPrice(tour.groupPrice)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      per person
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
                    1. Select Date & Time
                  </h3>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1.5 block">
                      Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-medium h-12 px-4 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all rounded-xl shadow-sm",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-3 h-5 w-5 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 leading-none mb-0.5">
                              Check-in Date
                            </span>
                            <span className="text-sm">
                              {selectedDate
                                ? format(selectedDate, "PPP")
                                : "Select your visit date"}
                            </span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 rounded-xl border-2 shadow-2xl"
                        align="start"
                      >
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={
                            (date) =>
                              date < new Date() || date < new Date("2024-01-01") // Safety constraint
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1.5 block">
                      Time Slot
                    </Label>
                    <div className="space-y-2">
                      {tour.timeSlots.map((ts) => {
                        const full = ts.booked >= ts.capacity;
                        const almostFull =
                          ts.capacity - ts.booked <= 3 && !full;
                        return (
                          <button
                            key={ts.id}
                            onClick={() => {
                              setSelectedTimeSlot(ts.id);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                              selectedTimeSlot === ts.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="font-medium">{ts.time}</span>
                            <span
                              className={`text-[10px] ${full ? "text-destructive font-semibold" : almostFull ? "text-secondary-foreground font-semibold" : "text-muted-foreground"}`}
                            >
                              {full
                                ? "Full — Waitlist"
                                : `${ts.capacity - ts.booked}/${ts.capacity} spots`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1.5 block">
                      Participants
                    </Label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setParticipants(
                            Math.max(tour.minParticipants, participants - 1),
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
                            Math.min(tour.maxParticipants, participants + 1),
                          )
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        (min {tour.minParticipants}, max {tour.maxParticipants})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <Label className="text-xs text-foreground">
                      Group Booking?
                    </Label>
                    <Switch checked={isGroup} onCheckedChange={setIsGroup} />
                  </div>
                  {isGroup && (
                    <Input
                      placeholder="Organization name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  )}

                  <Button
                    className="w-full text-xs h-9"
                    onClick={() => setBookingStep(2)}
                    disabled={!selectedDate || !selectedTimeSlot}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    2. Your Details
                  </h3>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">
                      Full Name
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
                      Email
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
                      Phone
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
                      Special Requirements
                    </Label>
                    <Textarea
                      placeholder="Dietary needs, etc."
                      value={specialReqs}
                      onChange={(e) => setSpecialReqs(e.target.value)}
                      className="mt-1 text-xs"
                      rows={2}
                    />
                  </div>

                  {/* Accommodation */}
                  {tour.accommodation && tour.accommodation.length > 0 && (
                    <div className="pt-2">
                      <Label className="mb-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Home className="h-3.5 w-3.5" /> Add Accommodation
                      </Label>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedAccom("")}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-[11px] ${!selectedAccom ? "border-primary bg-primary/5" : "border-border"}`}
                        >
                          None needed
                        </button>
                        {tour.accommodation.map((a) => (
                          <div
                            key={a.id}
                            className={`rounded-lg border p-3 text-[11px] transition-colors ${
                              selectedAccom === a.id
                                ? "border-primary bg-primary/5"
                                : a.available
                                  ? "border-border hover:border-primary/50"
                                  : "border-border opacity-70"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  a.available && setSelectedAccom(a.id)
                                }
                                disabled={!a.available}
                                className="flex-1 text-left"
                              >
                                <div className="flex justify-between items-center gap-3">
                                  <span className="font-medium text-foreground">
                                    {a.name}
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    {a.pricePerNight === 0
                                      ? "Included"
                                      : formatPrice(a.pricePerNight)}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                  {a.description} · up to {a.capacity} guests
                                </p>
                              </button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 shrink-0 text-[10px]"
                                onClick={() => openAccommodationInfo(a)}
                              >
                                View Info
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedAccom &&
                        accomOption &&
                        accomOption.pricePerNight > 0 && (
                          <div className="flex items-center gap-3 mt-3">
                            <Label className="text-[11px] text-muted-foreground">
                              Nights:
                            </Label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setAccomNights(Math.max(1, accomNights - 1))
                                }
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-bold">
                                {accomNights}
                              </span>
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
                      Back
                    </Button>
                    <Button
                      className="flex-1 text-xs h-9"
                      onClick={() => setBookingStep(3)}
                      disabled={!contactName || !contactEmail || !contactPhone}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    3. Review & Pay
                  </h3>

                  {/* Summary */}
                  <div className="bg-accent/30 rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tour</span>
                      <span className="max-w-35 truncate text-right font-medium text-foreground">
                        {tour.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">
                        {selectedDate ? format(selectedDate, "PPP") : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="text-foreground">
                        {selectedSlot?.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="text-foreground">
                        {participants} {isGroup ? `(${groupName})` : ""}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Tour Subtotal</span>
                      <span>{formatPrice(tourTotal)}</span>
                    </div>
                    {accomOption && (
                      <>
                        <div className="border-t border-border pt-1" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {accomOption.name}
                          </span>
                          <span className="text-foreground">
                            {accomOption.pricePerNight === 0
                              ? "Included"
                              : `${formatPrice(accomOption.pricePerNight)} × ${accomNights}`}
                          </span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Accommodation</span>
                          <span>{formatPrice(accomTotal)}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t border-border pt-2" />
                    <div className="flex justify-between text-sm font-bold text-primary">
                      <span>Total</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {slotFull && (
                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 flex items-start gap-2 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-800 dark:text-amber-300">
                        This time slot is full. You&apos;ll be added to the{" "}
                        <strong>waiting list</strong>.
                      </p>
                    </div>
                  )}

                  {/* Payment method */}
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-2 block">
                      Payment Method
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "MTN MoMo",
                        "Airtel Money",
                        "Visa/Mastercard",
                        "Cash",
                      ].map((pm) => (
                        <button
                          key={pm}
                          onClick={() => setPaymentMethod(pm)}
                          className={`px-2 py-2 rounded-lg border text-[10px] font-medium transition-colors ${paymentMethod === pm ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-foreground"}`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs h-9"
                      onClick={() => setBookingStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 text-xs h-9"
                      onClick={handleSubmitBooking}
                    >
                      {slotFull ? "Join Waitlist" : "Confirm Booking"}
                    </Button>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center leading-tight">
                    By clicking confirm, you agree to our cancellation policy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedAccommodationInfo}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAccommodationInfo(null);
            setActiveAccommodationImage(0);
          }
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden">
          {selectedAccommodationInfo && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {selectedAccommodationInfo.name}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">
                  {selectedAccommodationInfo.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-border bg-card">
                  <Image
                    src={
                      accommodationGallery[activeAccommodationImage] ??
                      tour.image
                    }
                    alt={selectedAccommodationInfo.name}
                    fill
                    sizes="(min-width: 1024px) 720px, 100vw"
                    className="object-cover"
                  />
                </div>

                {accommodationGallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {accommodationGallery.map((image, index) => (
                      <button
                        key={`${selectedAccommodationInfo.id}-${index}`}
                        type="button"
                        onClick={() => setActiveAccommodationImage(index)}
                        className={`overflow-hidden rounded-lg border-2 transition-colors ${
                          activeAccommodationImage === index
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${selectedAccommodationInfo.name} preview ${index + 1}`}
                          width={96}
                          height={64}
                          className="h-16 w-24 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 rounded-xl bg-accent/30 p-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Type
                  </p>
                  <p className="mt-1 font-medium capitalize text-foreground">
                    {selectedAccommodationInfo.type}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Capacity
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    Up to {selectedAccommodationInfo.capacity} guests
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Price
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {selectedAccommodationInfo.pricePerNight === 0
                      ? "Included"
                      : `${formatPrice(selectedAccommodationInfo.pricePerNight)} / night`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
