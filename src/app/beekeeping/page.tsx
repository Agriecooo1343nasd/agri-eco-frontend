"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tours } from "@/data/tours";
import {
  Bug,
  Droplets,
  FlaskConical,
  Calendar,
  Clock,
  Users,
  Star,
  ArrowRight,
  MapPin,
  Flower2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePricing } from "@/context/PricingContext";

const beekeepingTours = tours.filter(
  (t) => t.category === "beekeeping" || t.category === "workshop",
);

const features = [
  {
    icon: Bug,
    title: "Live Hive Inspections",
    description:
      "Get up close with active colonies under expert supervision with full protective gear.",
  },
  {
    icon: Droplets,
    title: "Honey Harvesting",
    description:
      "Experience the sweet reward of extracting raw organic honey straight from the comb.",
  },
  {
    icon: FlaskConical,
    title: "Wax Workshops",
    description:
      "Create candles, balms, and soaps from pure beeswax in our artisan studio.",
  },
];

const honeyVarieties = [
  {
    name: "Eucalyptus Honey",
    season: "June - August",
    flavor: "Bold, slightly medicinal",
    color: "bg-amber-600",
  },
  {
    name: "Wildflower Honey",
    season: "Year-round",
    flavor: "Floral, delicate sweetness",
    color: "bg-amber-400",
  },
  {
    name: "Coffee Blossom Honey",
    season: "March - May",
    flavor: "Rich, caramel notes",
    color: "bg-amber-800",
  },
];

export default function BeekeepingPage() {
  const { formatPrice } = usePricing();

  const beekeepingImg = "/assets/tours/beekeeping.jpg";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img
            src={beekeepingImg}
            alt="Beekeeping at Agri-Eco"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/30" />
          <div className="relative container h-full flex items-center">
            <div className="max-w-xl text-card">
              <Badge className="bg-secondary text-secondary-foreground mb-4 gap-1.5 text-xs">
                <Flower2 className="h-3.5 w-3.5" /> Beekeeping Showcase
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 leading-tight text-white">
                Discover the World of Bees
              </h1>
              <p className="text-card/80 text-lg mb-6 text-white/90">
                From live hive inspections to honey harvesting and beeswax
                crafting — immerse yourself in the magic of our apiary.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/tours/beekeeping-discovery">
                  <Button size="lg" className="gap-2 text-sm">
                    Book Beekeeping Tour <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/tours/beeswax-workshop">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-card/30 text-white bg-card/10 hover:bg-card/40 text-sm"
                  >
                    Wax Workshop
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container">
            <h2 className="section-heading mb-2">Our Beekeeping Experiences</h2>
            <p className="section-subheading mb-12">
              Three unique ways to explore the world of bees at Agri-Eco
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <f.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honey Varieties */}
        <section className="py-16 bg-accent/30">
          <div className="container">
            <h2 className="section-heading mb-2">Our Honey Varieties</h2>
            <p className="section-subheading mb-12">
              Taste the seasons — each harvest brings unique flavors
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {honeyVarieties.map((h) => (
                <div
                  key={h.name}
                  className="bg-card border border-border rounded-xl p-6 flex items-start gap-4"
                >
                  <div
                    className={`w-12 h-12 ${h.color} rounded-full shrink-0`}
                  />
                  <div>
                    <h3 className="font-bold text-foreground font-heading">
                      {h.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {h.flavor}
                    </p>
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {h.season}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Available Experiences */}
        <section className="py-16">
          <div className="container">
            <h2 className="section-heading mb-2 text-xl font-bold">
              Book a Beekeeping Experience
            </h2>
            <p className="section-subheading mb-12 text-sm text-muted-foreground">
              Choose from our available beekeeping and wax workshops
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {beekeepingTours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow"
                >
                  <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden shrink-0">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-2 capitalize"
                      >
                        {tour.category.replace("-", " ")}
                      </Badge>
                      {tour.seasonal && (
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[10px] py-0 px-2">
                          Seasonal
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold font-heading text-foreground text-lg mb-1">
                      {tour.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {tour.description}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {tour.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Max {tour.maxParticipants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                        {tour.rating}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(tour.price)}
                        </span>
                        {tour.groupPrice && (
                          <span className="text-[10px] text-muted-foreground block">
                            {formatPrice(tour.groupPrice)} (group)
                          </span>
                        )}
                      </div>
                      <Link href={`/tours/${tour.slug}`}>
                        <Button size="sm" className="gap-1 text-xs">
                          Book Now <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container text-center">
            <h2 className="section-heading mb-3">Visit Our Apiary</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6 text-sm">
              Our apiary is home to over 50 hives producing premium organic
              honey. Located in Musanze District, Rwanda, it's the perfect
              destination for nature lovers and curious minds.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
              <MapPin className="h-4 w-4 text-primary" />
              Agri-Eco Apiary, Musanze District, Rwanda
            </div>
            <Link href="/tours">
              <Button size="lg" className="text-sm">
                Explore All Experiences
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
