"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Tour, TourCategory, TourStatus } from "@/data/tours";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Clock,
  MapPin,
  Star,
  Users,
  Calendar,
  Leaf,
  ArrowRight,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  fetchExperiences,
  Experience,
  toAbsoluteExperienceImage,
} from "@/lib/api/experiences";
import {
  fetchAccommodations,
  AdminAccommodation,
} from "@/lib/api/accommodations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePricing } from "@/context/PricingContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const categoryLabels: Record<TourCategory, keyof typeof translations.tours> = {
  "farm-tour": "catFarmTour",
  beekeeping: "catBeekeeping",
  harvesting: "catHarvesting",
  cultural: "catCultural",
  educational: "catEducational",
  "farm-stay": "catFarmStay",
  workshop: "catWorkshops",
};

const statusColors: Record<string, string> = {
  available: "bg-primary/10 text-primary border-primary/20",
  limited: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  "sold-out": "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-accent text-accent-foreground border-border",
};

const statusLabels: Record<string, keyof typeof translations.tours> = {
  available: "statusAvailable",
  limited: "statusLimited",
  "sold-out": "statusSoldOut",
  upcoming: "statusUpcoming",
};

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "duration";

// Helper: Map backend experience to frontend Tour type
function mapExperienceToTour(
  exp: Experience,
  t: (val: any) => string,
  accommodationsMap: Record<string, AdminAccommodation> = {},
): Tour {
  // Map slots to timeSlots (flatten date/timeSlot)
  const timeSlots = (exp.slots || []).map((slot) => ({
    id: slot.id,
    time: slot.timeSlot,
    capacity: slot.capacity,
    booked: slot.bookedParticipants,
  }));

  // Map linked accommodations
  let accommodation: Tour["accommodation"] = undefined;
  if (exp.linkedAccommodationIds && exp.linkedAccommodationIds.length > 0) {
    accommodation = exp.linkedAccommodationIds
      .map((id) => accommodationsMap[id])
      .filter(Boolean)
      .map((acc) => ({
        id: acc.id,
        name: t(acc.name),
        type:
          acc.category === "standard" ||
          acc.category === "premium" ||
          acc.category === "family"
            ? acc.category
            : "standard",
        pricePerNight: acc.ratePerNightRwf,
        capacity: acc.maxGuests,
        available: acc.status === "available",
        description: t(acc.description),
        gallery: acc.gallery,
      }));
  }

  // Derive status (simple logic: available if isActive, sold-out if not)
  let status: TourStatus = "available";
  if (!exp.isActive) status = "sold-out";

  // Derive seasonal
  const now = new Date();
  let seasonal = false;
  let season: string | undefined = undefined;
  if (exp.seasonStart && exp.seasonEnd) {
    const start = new Date(exp.seasonStart);
    const end = new Date(exp.seasonEnd);
    seasonal = true;
    season = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  return {
    id: exp.id,
    name: t(exp.title),
    slug: exp.slug,
    category: exp.type.replace("_", "-") as TourCategory,
    description: t(exp.shortDescription),
    longDescription: t(exp.fullOverview),
    image: toAbsoluteExperienceImage(exp.heroImage),
    gallery: exp.gallery,
    duration: exp.expectedDuration || `${exp.durationMinutes} min`,
    price: exp.priceRwf,
    groupPrice: exp.pricePerGroupRwf,
    maxParticipants: exp.capacity,
    minParticipants: exp.minParticipants,
    rating: exp.averageRating || 0,
    reviewCount: exp.reviewCount || 0,
    status,
    seasonal,
    season,
    includes: exp.inclusions.map((i) => (typeof i === "string" ? i : t(i))),
    highlights: exp.highlights.map((h) => (typeof h === "string" ? h : t(h))),
    requirements: exp.requirements.map((r) =>
      typeof r === "string" ? r : t(r),
    ),
    location: exp.destination || "Musanze",
    timeSlots,
    accommodation,
    cancellationPolicy: t(exp.cancellationPolicy) || "",
    featured: exp.isFeatured,
    createdAt: exp.createdAt,
  };
}

const TourCard = ({ tour }: { tour: Tour }) => {
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const spotsLeft = tour.timeSlots.reduce(
    (sum, ts) => sum + (ts.capacity - ts.booked),
    0,
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge
            className={`${statusColors[tour.status]} border text-xs font-semibold`}
          >
            {t(translations.tours[statusLabels[tour.status]])}
          </Badge>
          {tour.seasonal && (
            <Badge className="bg-secondary/90 text-secondary-foreground text-xs">
              {t(translations.tours.seasonalBadge)}
            </Badge>
          )}
        </div>
        {tour.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground text-xs">
              {t(translations.tours.featuredBadge)}
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-foreground/60 to-transparent p-4">
          <span className="text-primary-foreground text-xs font-medium bg-foreground/30 px-2 py-1 rounded-full backdrop-blur-sm">
            {t(translations.tours[categoryLabels[tour.category]])}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold font-heading text-foreground mb-2 line-clamp-1">
          {tour.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {tour.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {tour.duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {t(translations.tours.max)} {tour.maxParticipants}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Musanze
          </span>
        </div>

        <div className="flex items-center gap-1 mb-4">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.floor(tour.rating) ? "fill-secondary text-secondary" : "text-border"}`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-foreground">
            {tour.rating}
          </span>
          <span className="text-xs text-muted-foreground">
            ({tour.reviewCount})
          </span>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">{t(translations.tours.fromLabel)}</p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(tour.price)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                {t(translations.tours.perPerson)}
              </span>
            </p>
            {tour.groupPrice && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(tour.groupPrice)} {t(translations.tours.groupRate)}
              </p>
            )}
          </div>
          <div className="text-right">
            {tour.status !== "sold-out" && tour.status !== "upcoming" && (
              <p className="text-xs text-muted-foreground mb-1">
                {spotsLeft} {t(translations.tours.spotsLeft)}
              </p>
            )}
            <Link href={`/tours/${tour.slug}`}>
              <Button
                size="sm"
                disabled={tour.status === "sold-out"}
                className="gap-1 text-xs"
              >
                {tour.status === "upcoming"
                  ? t(translations.tours.notifyMe)
                  : tour.status === "sold-out"
                    ? t(translations.tours.joinWaitlist)
                    : t(translations.tours.bookNow)}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ToursPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "all";
  const sortParam = searchParams.get("sort") || "featured";
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(categoryParam);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam as SortOption);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch experiences and accommodations, then map
  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all accommodations (for mapping)
        const accRes = await fetchAccommodations({ limit: 100 });
        const accommodationsMap: Record<string, AdminAccommodation> = {};
        accRes.data.forEach((acc) => {
          accommodationsMap[acc.id] = acc;
        });

        // Fetch all public experiences (tours)
        const expRes = await fetchExperiences({ limit: 100 });
        const mapped = expRes.data.map((exp) =>
          mapExperienceToTour(exp, t, accommodationsMap),
        );
        if (!ignore) setTours(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load experiences");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [t]);

  // Sync state with URL params
  useEffect(() => {
    if (searchParam !== searchQuery) setSearchQuery(searchParam);
    if (categoryParam !== selectedCategory) setSelectedCategory(categoryParam);
    if (sortParam !== sortBy) setSortBy(sortParam as SortOption);
    // eslint-disable-next-line
  }, [searchParam, categoryParam, sortParam]);

  // Update URL params on filter change
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || value === "featured") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filtered = useMemo(() => {
    let result = [...tours];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.includes(q),
      );
    }
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    return result;
  }, [tours, searchQuery, selectedCategory, sortBy]);

  const toursHero = "/assets/tours/tours-hero.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-85 md:h-105 overflow-hidden">
        <img
          src={toursHero}
          alt="Agri-Eco Tours"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="text-primary-foreground/80 text-sm font-medium">
                  Agri-Eco Iter Ltd
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-heading text-primary-foreground mb-3 leading-tight whitespace-pre-line">
                {t(translations.tours.heroTitle)}
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base max-w-md">
                {t(translations.tours.heroSub)}
              </p>
              <div className="flex gap-3 mt-5">
                <Link href="#tours-list">
                  <Button size="lg" className="gap-2">
                    <Calendar className="h-4 w-4" /> {t(translations.tours.browseExp)}
                  </Button>
                </Link>
                <Link href="/tours/guided-organic-farm-tour">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20"
                  >
                    {t(translations.tours.popularTour)}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-b border-border">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: `${tours.length}+`, label: t(translations.tours.statUnique) },
              { value: "500+", label: t(translations.tours.statVisitors) },
              { value: "4.8★", label: t(translations.tours.statRating) },
              { value: "50 acres", label: t(translations.tours.statArea) },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-primary font-heading">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section id="tours-list" className="bg-background">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {t(translations.tours.allExp)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filtered.length} {t(translations.tours.expAvailable)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card flex-1 md:flex-initial md:w-64">
                <Search className="h-4 w-4 ml-3 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder={t(translations.tours.searchTours)}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateParam("search", e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") updateParam("search", searchQuery);
                  }}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      updateParam("search", "");
                    }}
                    className="pr-3"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  updateParam("category", val);
                }}
              >
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.tours.allCat)}</SelectItem>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {t(translations.tours[v])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v as SortOption);
                  updateParam("sort", v);
                }}
              >
                <SelectTrigger className="w-36 bg-card">
                  <SelectValue placeholder={t(translations.tours.sortByPlaceholder)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t(translations.tours.sortFeatured)}</SelectItem>
                  <SelectItem value="price-low">{t(translations.shop.sortPriceLowHigh)}</SelectItem>
                  <SelectItem value="price-high">{t(translations.shop.sortPriceHighLow)}</SelectItem>
                  <SelectItem value="rating">{t(translations.shop.sortTopRated)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-6 text-xs">
            <button
              onClick={() => {
                setSelectedCategory("all");
                updateParam("category", "all");
              }}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}
            >
              {t(translations.shop.activeLabel).replace(":", "") || "All"}
            </button>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <button
                key={k}
                onClick={() => {
                  setSelectedCategory(k);
                  updateParam("category", k);
                }}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === k ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}
              >
                {t(translations.tours[v])}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-16">{t(translations.tours.loadingTours)}</div>
          ) : error ? (
            <div className="text-center py-16 text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                {t(translations.tours.noTours)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(translations.tours.adjustFilters)}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-y border-border">
        <div className="container py-12 text-center text-xs">
          <h2 className="text-2xl font-bold font-heading text-foreground mb-2">
            {t(translations.tours.groupTitle)}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            {t(translations.tours.groupDesc)}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact">
              <Button variant="outline" className="gap-2">
                {t(translations.tours.contactGroup)}
              </Button>
            </Link>
            <Link href="/education/school-visit">
              <Button className="gap-2">
                <Calendar className="h-4 w-4" /> {t(translations.tours.schoolBookings)}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
