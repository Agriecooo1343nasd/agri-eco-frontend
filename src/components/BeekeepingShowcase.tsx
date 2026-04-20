"use client";

import { ArrowRight, Flower2, Droplets, Search, Flame } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const BeekeepingShowcase = () => {
  const { t } = useLanguage();
  const beekeepingImg = "/assets/tours/beekeeping.jpg";
  const waxWorkshopImg = "/assets/tours/wax-workshop.jpg";

  const features = [
    {
      icon: Droplets,
      title: t(translations.sections.beekeeping.honeyTasting.title),
      desc: t(translations.sections.beekeeping.honeyTasting.desc),
    },
    {
      icon: Search,
      title: t(translations.sections.beekeeping.hiveInspections.title),
      desc: t(translations.sections.beekeeping.hiveInspections.desc),
    },
    {
      icon: Flame,
      title: t(translations.sections.beekeeping.waxWorkshops.title),
      desc: t(translations.sections.beekeeping.waxWorkshops.desc),
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden aspect-[3/4]">
              <img
                src={beekeepingImg}
                alt={t(translations.sections.beekeeping.badge)}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[3/4] mt-8">
              <img
                src={waxWorkshopImg}
                alt={t(translations.sections.beekeeping.waxWorkshops.title)}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-secondary/20 text-secondary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              <Flower2 className="h-3.5 w-3.5" /> {t(translations.sections.beekeeping.badge)}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground font-heading leading-tight">
              {t(translations.sections.beekeeping.title)}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              {t(translations.sections.beekeeping.desc)}
            </p>

            <div className="mt-6 space-y-4">
              {features.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/beekeeping"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all hover:gap-3"
              >
                {t(translations.header.nav.beekeeping)} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-accent transition-colors"
              >
                {t(translations.sections.beekeeping.shopHoney)}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeekeepingShowcase;
