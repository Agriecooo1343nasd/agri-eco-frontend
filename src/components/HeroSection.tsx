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
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const getSlides = (t: any) => [
  {
    id: "organic-ecommerce",
    title: t(translations.hero.organic.title),
    description: t(translations.hero.organic.desc),
    image: "/assets/landing/ecommerce.webp",
    cta: t(translations.hero.organic.cta),
    href: "/shop",
    icon: ShoppingBag,
    badge: t(translations.hero.organic.cta),
  },
  {
    id: "beekeeping",
    title: t(translations.hero.beekeeping.title),
    description: t(translations.hero.beekeeping.desc),
    image: "/assets/landing/apiculture.webp",
    cta: t(translations.hero.beekeeping.cta),
    href: "/beekeeping",
    icon: Flower2,
    badge: t(translations.sections.beekeeping.badge),
  },
  {
    id: "training",
    title: t(translations.hero.training.title),
    description: t(translations.hero.training.desc),
    image: "/assets/landing/trainings.webp",
    cta: t(translations.hero.training.cta),
    href: "/education",
    icon: GraduationCap,
    badge: t(translations.hero.training.cta),
  },
  {
    id: "partners-artisans",
    title: t(translations.hero.community.title),
    description: t(translations.hero.community.desc),
    image: "/assets/landing/partnership.webp",
    cta: t(translations.hero.community.cta),
    href: "/artisans",
    icon: Handshake,
    badge: t(translations.header.nav.community),
  },
  {
    id: "tours",
    title: t(translations.hero.tours.title),
    description: t(translations.hero.tours.desc),
    image: "/assets/landing/tours.webp",
    cta: t(translations.hero.tours.cta),
    href: "/tours",
    icon: Calendar,
    badge: t(translations.hero.tours.cta),
  },
];

const HeroSection = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const slides = getSlides(t);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    slides.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.image;
    });
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
            {/* <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slides[current].image})` }}
            /> */}
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
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
                    href="/artisans"
                    className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-base hover:bg-white/20 transition-all shadow-xl"
                  >
                    <Users className="h-5 w-5" />
                    {t(translations.hero.common.meetCommunity)}
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
                {t(translations.header.nav.tours)}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t(translations.hero.tours.title)}
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {t(translations.sections.popularExperiences.exploreMore)} <ArrowRight className="h-3 w-3" />
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
                {t(translations.sections.ourProducts.title)}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t(translations.sections.ourProducts.sub).split(',')[0]}
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {t(translations.sections.ourProducts.exploreShop)} <ArrowRight className="h-3 w-3" />
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
                {t(translations.header.nav.beekeeping)}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t(translations.sections.beekeeping.honeyTasting.title)}
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {t(translations.sections.popularExperiences.exploreMore)} <ArrowRight className="h-3 w-3" />
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
                {t(translations.header.nav.education)}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t(translations.hero.training.title)}
              </p>
              <span className="text-xs font-bold text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {t(translations.sections.popularExperiences.exploreMore)} <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
