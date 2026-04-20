"use client";

import { ArrowRight } from "lucide-react";
import { usePricing } from "@/context/PricingContext";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const PromoBanner = () => {
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const farmBanner = "/assets/farm-banner.jpg";

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={farmBanner}
            alt="Organic farm landscape"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/50" />
          <div className="relative px-8 md:px-16 py-12 md:py-20">
            <div className="max-w-lg">
              <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {t(translations.sections.promo.special)}
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-card font-heading mt-4 leading-tight">
                {t(translations.sections.promo.discount)}
                <br />
                {t(translations.sections.promo.firstPurchase)}
              </h2>
              <p className="text-card/80 mt-4 text-sm md:text-base">
                {t(translations.sections.promo.useCode)}{" "}
                <span className="font-bold bg-card/20 px-2 py-0.5 rounded">
                  AGRIECO15
                </span>{" "}
                {t(translations.sections.promo.validFor)}{" "}
                {formatPrice(50)}.
              </p>
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground mt-6 px-6 py-3 rounded-lg font-bold text-sm hover:bg-secondary/90 transition-all hover:gap-3"
              >
                {t(translations.sections.promo.shopNow)} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
