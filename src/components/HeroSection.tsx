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
  Users,
  Handshake,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: "organic-ecommerce",
    title: "Farm-Fresh Organic Produce",
    description:
      "Shop certified organic fruits, vegetables, and natural honey directly from Rwanda's best farmers.",
    image: "/assets/landing/ecommerce.webp",
    cta: "Shop Organic",
    href: "/shop",
    icon: ShoppingBag,
    badge: "Organic Ecommerce",
  },
  {
    id: "beekeeping",
    title: "The Magic of Rwandan Honey",
    description:
      "Explore the art of apiculture, from traditional hives to modern sustainable beekeeping practices.",
    image: "/assets/landing/apiculture.webp",
    cta: "Explore Beekeeping",
    href: "/beekeeping",
    icon: Flower2,
    badge: "Apiculture",
  },
  {
    id: "training",
    title: "Sustainable Farming Education",
    description:
      "Join our training programs and school visits to learn the future of sustainable agriculture.",
    image: "/assets/landing/trainings.webp",
    cta: "View Programs",
    href: "/education",
    icon: GraduationCap,
    badge: "Training & Education",
  },
  {
    id: "partners-artisans",
    title: "Empowering Local Communities",
    description:
      "Connecting local artisans and tourism partners to build a vibrant, sustainable ecosystem.",
    image: "/assets/landing/partnership.webp",
    cta: "Become a Partner",
    href: "/community",
    icon: Handshake,
    badge: "Community",
  },
  {
    id: "tours",
    title: "Immersive Agritourism Tours",
    description:
      "Experience the beauty of Rwanda's landscapes with guided tours through tea and coffee plantations.",
    image: "/assets/landing/tours.webp",
    cta: "Book a Tour",
    href: "/tours",
    icon: Calendar,
    badge: "Farm Tours",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Main hero carousel */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[current].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* <img
              src={slides[current].image}
              alt={slides[current].title}
              className="absolute inset-0 w-full h-full object-contain"
              loading="eager"
            /> */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slides[current].image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="container relative h-full flex items-center">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slides[current].id + "-content"}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                <span className="inline-flex items-center gap-1.5 bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                  <Sprout className="h-3.5 w-3.5" /> {slides[current].badge}
                </span>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-heading leading-[1.1]">
                  {slides[current].title}
                </h2>
                <p className="text-white/80 text-lg md:text-xl max-w-lg leading-relaxed">
                  {slides[current].description}
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                  {(() => {
                    const Icon = slides[current].icon;
                    return (
                      <Link
                        href={slides[current].href}
                        className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-md font-bold text-base hover:bg-primary/90 transition-all hover:scale-105 group"
                      >
                        <Icon className="h-5 w-5" />
                        {slides[current].cta}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    );
                  })()}
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-base hover:bg-white/20 transition-all shadow-xl"
                  >
                    <Users className="h-5 w-5" />
                    Meet Our Community
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 transition-all rounded-full ${
                current === i
                  ? "w-12 bg-primary"
                  : "w-6 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick access cards */}
      <div className="container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/tours"
            className="bg-banner-green rounded-2xl p-6 flex items-center gap-5 hover:shadow-xl transition-all hover:-translate-y-1 group border border-primary/5"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Tent className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground transition-colors">
                Farm Tours
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Immersive agritourism
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/shop"
            className="bg-banner-cream rounded-2xl p-6 flex items-center gap-5 hover:shadow-xl transition-all hover:-translate-y-1 group border border-primary/5"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <LeafyGreen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground transition-colors">
                Organic Shop
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Farm-fresh produce
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Shop Now <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/beekeeping"
            className="bg-banner-green rounded-2xl p-6 flex items-center gap-5 hover:shadow-xl transition-all hover:-translate-y-1 group border border-primary/5"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Flower2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground transition-colors">
                Beekeeping
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Honey & workshops
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Discover <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
          <Link
            href="/education"
            className="bg-banner-cream rounded-2xl p-6 flex items-center gap-5 hover:shadow-xl transition-all hover:-translate-y-1 group border border-primary/5"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground transition-colors">
                Education
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Training & school visits
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
