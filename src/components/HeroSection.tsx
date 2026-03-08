"use client";

import {
  ArrowRight,
  Calendar,
  ShoppingBag,
  GraduationCap,
  Sprout,
  Tent,
  LeafyGreen,
  Flower2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  const heroBanner = "/assets/hero-banner.jpg";

  return (
    <section className="relative overflow-hidden">
      {/* Main hero */}
      <div className="relative h-[480px] md:h-[540px] lg:h-[620px]">
        <img
          src={heroBanner}
          alt="Agri-Eco organic farm in Rwanda"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="container relative h-full flex items-center">
          <div className="max-w-xl animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              <Sprout className="h-3.5 w-3.5" /> Rwanda's Premier Agritourism
              Destination
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-card font-heading leading-tight">
              Farm Tours, Organic
              <br />
              Products & More
            </h2>
            <p className="mt-4 text-card/80 text-sm md:text-base max-w-md">
              Discover immersive farm experiences, shop certified organic
              produce, learn sustainable agriculture, and connect with Rwanda's
              vibrant farming community.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all hover:gap-3"
              >
                <Calendar className="h-4 w-4" />
                Book a Tour
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-secondary/90 transition-all hover:gap-3"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Organic
              </Link>
              <Link
                href="/education"
                className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm text-card border border-card/30 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-card/30 transition-colors"
              >
                <GraduationCap className="h-4 w-4" />
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div className="container py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/tours"
            className="bg-banner-green rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Tent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                Farm Tours
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Immersive agritourism experiences
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1">
                Explore Tours <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/shop"
            className="bg-banner-cream rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <LeafyGreen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                Organic Shop
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Farm-fresh produce & honey
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1">
                Shop Now <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/beekeeping"
            className="bg-banner-green rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Flower2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                Beekeeping
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Honey tours & wax workshops
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1">
                Discover <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/education"
            className="bg-banner-cream rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                Education
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Training & school visits
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1">
                Learn More <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
