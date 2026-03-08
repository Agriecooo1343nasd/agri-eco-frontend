"use client";

import { ArrowRight, Clock, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";
import { tours } from "@/data/tours";
import { usePricing } from "@/context/PricingContext";

const FeaturedTours = () => {
  const { formatPrice } = usePricing();
  const featured = tours.filter((t) => t.featured).slice(0, 4);

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-heading !text-left">Popular Experiences</h2>
            <p className="section-subheading !text-left !mx-0 mt-2">
              Book immersive agritourism experiences on our organic farm
            </p>
          </div>
          <Link
            href="/tours"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            View All Tours <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((tour) => {
            const spotsLeft = tour.timeSlots.reduce(
              (sum, ts) => sum + (ts.capacity - ts.booked),
              0,
            );
            return (
              <Link
                key={tour.id}
                href={`/tours/${tour.slug}`}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {tour.status === "limited" && (
                    <span className="absolute top-3 left-3 bg-badge-sale text-card text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                      Limited Spots
                    </span>
                  )}
                  {tour.seasonal && (
                    <span className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                      Seasonal
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {tour.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> Max {tour.maxParticipants}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                    {tour.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {tour.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 fill-secondary text-secondary" />
                    <span className="text-xs font-semibold text-foreground">
                      {tour.rating}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({tour.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div>
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(tour.price)}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        per person
                      </span>
                    </div>
                    {spotsLeft > 0 && spotsLeft < 10 && (
                      <span className="text-[11px] font-semibold text-badge-sale">
                        {spotsLeft} spots left
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            View All Tours <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;
