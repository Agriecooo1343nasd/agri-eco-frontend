"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import React, { useEffect, useState } from "react";
import {
  fetchExperiences,
  Experience,
  toAbsoluteExperienceImage,
} from "@/lib/api/experiences";
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
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

import { notFound } from "next/navigation";
import { useFeatures } from "@/context/FeatureContext";

export default function BeekeepingPage() {
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const { isFeatureEnabled } = useFeatures();
  const beekeepingImg = "/assets/tours/beekeeping.jpg";

  if (!isFeatureEnabled("shopping")) {
    notFound();
  }

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchExperiences({ limit: 12, type: "beekeeping" });
        // Also Include workshops for beekeeping page if relevant
        const filtered = res.data.filter(
          (exp) =>
            exp.isActive &&
            (exp.type === "beekeeping" || exp.type === "workshop"),
        );
        if (!ignore) setExperiences(filtered);
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
  }, []);

  const features = [
    {
      icon: Bug,
      title: t(translations.beekeepingPage.feat1Title),
      description: t(translations.beekeepingPage.feat1Desc),
    },
    {
      icon: Droplets,
      title: t(translations.beekeepingPage.feat2Title),
      description: t(translations.beekeepingPage.feat2Desc),
    },
    {
      icon: FlaskConical,
      title: t(translations.beekeepingPage.feat3Title),
      description: t(translations.beekeepingPage.feat3Desc),
    },
  ];

  const honeyVarieties = [
    {
      name: t(translations.beekeepingPage.honey1),
      season: "June - August",
      flavor: t(translations.beekeepingPage.honey1Flav),
      color: "bg-amber-600",
    },
    {
      name: t(translations.beekeepingPage.honey2),
      season: "Year-round",
      flavor: t(translations.beekeepingPage.honey2Flav),
      color: "bg-amber-400",
    },
    {
      name: t(translations.beekeepingPage.honey3),
      season: "March - May",
      flavor: t(translations.beekeepingPage.honey3Flav),
      color: "bg-amber-800",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[50vh] min-h-100 overflow-hidden">
          <img
            src={beekeepingImg}
            alt="Beekeeping at Agri-Eco"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-foreground/80 to-foreground/30" />
          <div className="relative container h-full flex items-center">
            <div className="max-w-xl text-card">
              <Badge className="bg-secondary text-secondary-foreground mb-4 gap-1.5 text-xs">
                <Flower2 className="h-3.5 w-3.5" /> {t(translations.beekeepingPage.showcase)}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 leading-tight text-white">
                {t(translations.beekeepingPage.title)}
              </h1>
              <p className="text-white/90 text-lg mb-6">
                {t(translations.beekeepingPage.desc)}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="#beekeeping-experiences">
                  <Button size="lg" className="gap-2 text-sm">
                    {t(translations.beekeepingPage.bookTour)} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#beekeeping-experiences">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-card/30 text-white bg-card/10 hover:bg-card/40 text-sm"
                  >
                    {t(translations.beekeepingPage.waxWorkshop)}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container">
            <h2 className="section-heading mb-2">{t(translations.beekeepingPage.ourExp)}</h2>
            <p className="section-subheading mb-12">
              {t(translations.beekeepingPage.ourExpSub)}
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
            <h2 className="section-heading mb-2">{t(translations.beekeepingPage.ourHoney)}</h2>
            <p className="section-subheading mb-12">
              {t(translations.beekeepingPage.ourHoneySub)}
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

        {/* Available Experiences (Integrated) */}
        <section id="beekeeping-experiences" className="py-16">
          <div className="container">
            <h2 className="section-heading mb-2 text-xl font-bold">
              {t(translations.beekeepingPage.bookExp)}
            </h2>
            <p className="section-subheading mb-12 text-sm text-muted-foreground">
              {t(translations.beekeepingPage.bookExpSub)}
            </p>
            {loading ? (
              <div className="text-center py-12">{t(translations.tours.loadingTours)}</div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t(translations.tours.noTours)}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow"
                  >
                    <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden shrink-0">
                      <img
                        src={toAbsoluteExperienceImage(exp.heroImage)}
                        alt={t(exp.title)}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-2 capitalize"
                        >
                          {exp.type.replace("_", " ")}
                        </Badge>
                        {(exp.seasonStart || exp.seasonEnd) && (
                          <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[10px] py-0 px-2">
                            {t(translations.tours.seasonalBadge)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold font-heading text-foreground text-lg mb-1">
                        {t(exp.title)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {t(exp.shortDescription)}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {exp.expectedDuration || `${exp.durationMinutes} min`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {t(translations.tours.max)} {exp.capacity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                          4.8
                        </span>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(exp.priceRwf)}
                          </span>
                          {exp.pricePerGroupRwf > 0 && (
                            <span className="text-[10px] text-muted-foreground block">
                              {formatPrice(exp.pricePerGroupRwf)} ({t(translations.tours.groupRate)})
                            </span>
                          )}
                        </div>
                        <Link href={`/tours/${exp.slug}`}>
                          <Button size="sm" className="gap-1 text-xs">
                            {t(translations.tours.bookNow)} <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container text-center">
            <h2 className="section-heading mb-3">{t(translations.beekeepingPage.visitApiary)}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6 text-sm">
              {t(translations.beekeepingPage.visitApiaryDesc)}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
              <MapPin className="h-4 w-4 text-primary" />
              Agri-Eco Apiary, Musanze District, Rwanda
            </div>
            <Link href="/tours">
              <Button size="lg" className="text-sm">
                {t(translations.beekeepingPage.exploreAll)}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
