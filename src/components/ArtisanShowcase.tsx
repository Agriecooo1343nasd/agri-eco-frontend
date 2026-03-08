"use client";

import { ArrowRight, MapPin, Palette } from "lucide-react";
import Link from "next/link";
import { artisans } from "@/data/community";

const ArtisanShowcase = () => {
  const featured = artisans.filter((a) => a.featured).slice(0, 4);

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-secondary/20 text-secondary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              <Palette className="h-3.5 w-3.5" /> Community & Crafts
            </span>
            <h2 className="section-heading !text-left">Meet Our Artisans</h2>
            <p className="section-subheading !text-left !mx-0 mt-2">
              Handmade crafts and products from local Rwandan artisans
            </p>
          </div>
          <Link
            href="/community"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((artisan) => (
            <Link
              key={artisan.id}
              href="/community"
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={artisan.image}
                  alt={artisan.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-heading font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                  {artisan.name}
                </h3>
                <p className="text-xs text-primary font-semibold mt-0.5">
                  {artisan.specialty}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {artisan.description}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {artisan.location}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {artisan.products.length} products available
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Explore Community <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ArtisanShowcase;
