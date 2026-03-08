"use client";

import { useState, useMemo } from "react";
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
import { tours, type Tour, type TourCategory } from "@/data/tours";
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

const categoryLabels: Record<TourCategory, string> = {
  "farm-tour": "Farm Tours",
  beekeeping: "Beekeeping",
  harvesting: "Harvesting",
  cultural: "Cultural",
  educational: "Educational",
  "farm-stay": "Farm Stay",
  workshop: "Workshops",
};

const statusColors: Record<string, string> = {
  available: "bg-primary/10 text-primary border-primary/20",
  limited: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  "sold-out": "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-accent text-accent-foreground border-border",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  limited: "Limited Spots",
  "sold-out": "Sold Out",
  upcoming: "Coming Soon",
};

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "duration";

const TourCard = ({ tour }: { tour: Tour }) => {
  const { formatPrice } = usePricing();
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
            {statusLabels[tour.status]}
          </Badge>
          {tour.seasonal && (
            <Badge className="bg-secondary/90 text-secondary-foreground text-xs">
              Seasonal
            </Badge>
          )}
        </div>
        {tour.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground text-xs">
              ⭐ Featured
            </Badge>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/60 to-transparent p-4">
          <span className="text-primary-foreground text-xs font-medium bg-foreground/30 px-2 py-1 rounded-full backdrop-blur-sm">
            {categoryLabels[tour.category]}
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
            Max {tour.maxParticipants}
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
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(tour.price)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                / person
              </span>
            </p>
            {tour.groupPrice && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(tour.groupPrice)} group rate
              </p>
            )}
          </div>
          <div className="text-right">
            {tour.status !== "sold-out" && tour.status !== "upcoming" && (
              <p className="text-xs text-muted-foreground mb-1">
                {spotsLeft} spots left today
              </p>
            )}
            <Link href={`/tours/${tour.slug}`}>
              <Button
                size="sm"
                disabled={tour.status === "sold-out"}
                className="gap-1 text-xs"
              >
                {tour.status === "upcoming"
                  ? "Notify Me"
                  : tour.status === "sold-out"
                    ? "Join Waitlist"
                    : "Book Now"}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

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
  }, [searchQuery, selectedCategory, sortBy]);

  const toursHero = "/assets/tours/tours-hero.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-[340px] md:h-[420px] overflow-hidden">
        <img
          src={toursHero}
          alt="Agri-Eco Tours"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="text-primary-foreground/80 text-sm font-medium">
                  Agri-Eco Iter Ltd
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-heading text-primary-foreground mb-3 leading-tight">
                Discover Rwanda's
                <br />
                Farm Experiences
              </h1>
              <p className="text-primary-foreground/80 text-sm md:text-base max-w-md">
                Immersive agritourism tours, beekeeping adventures, cultural
                experiences, and farm stays in the heart of Rwanda.
              </p>
              <div className="flex gap-3 mt-5">
                <Link href="#tours-list">
                  <Button size="lg" className="gap-2">
                    <Calendar className="h-4 w-4" /> Browse Experiences
                  </Button>
                </Link>
                <Link href="/tours/guided-organic-farm-tour">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20"
                  >
                    Popular Tour
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
              { value: "7+", label: "Unique Experiences" },
              { value: "500+", label: "Happy Visitors" },
              { value: "4.8★", label: "Average Rating" },
              { value: "50 acres", label: "Farm Area" },
            ].map((s) => (
              <div key={s.label}>
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
                All Experiences
              </h2>
              <p className="text-sm text-muted-foreground">
                {filtered.length} experiences available
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card flex-1 md:flex-initial md:w-64">
                <Search className="h-4 w-4 ml-3 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search tours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="pr-3">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40 bg-card">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-36 bg-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low → High</SelectItem>
                  <SelectItem value="price-high">Price: High → Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-6 text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}
            >
              All
            </button>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setSelectedCategory(k)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${selectedCategory === k ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                No experiences found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters.
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
            Planning a Group Visit?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            We offer special rates for groups, schools, and corporate teams.
            Custom itineraries available.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/contact">
              <Button variant="outline" className="gap-2">
                Contact Us for Group Rates
              </Button>
            </Link>
            <Link href="/tours/school-educational-visit">
              <Button className="gap-2">
                <Calendar className="h-4 w-4" /> School Bookings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
