"use client";

import { MapPin, User, Palette } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchArtisans, toAbsoluteArtisanImage } from "@/lib/api/artisans";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const ArtisanShowcase = () => {
  const { locale, t } = useLanguage();

  const { data: artisansData, isLoading } = useQuery({
    queryKey: ["featured-artisans", locale],
    queryFn: () => fetchArtisans({ isFeatured: "true", limit: 4 }),
  });

  const featuredArtisans = artisansData?.data || [];

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="section-heading">{t(translations.sections.artisans.title)}</h2>
          <p className="section-subheading">
            {t(translations.sections.artisans.sub)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <div className="space-y-2 text-center">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-1/3 mx-auto" />
                  </div>
                </div>
              ))
            : featuredArtisans.map((artisan) => (
                <div
                  key={artisan.id}
                  className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all group"
                >
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-muted group-hover:border-primary/20 transition-colors">
                    <img
                      src={toAbsoluteArtisanImage(artisan.image)}
                      alt={artisan.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-sm uppercase tracking-tight">
                    {artisan.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary mt-1">
                    {artisan.specialty}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground mt-3 mb-4">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs">{artisan.location}</span>
                  </div>
                  <Link
                    href={`/community/artisan/${artisan.id}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors"
                  >
                    <User className="h-3.5 w-3.5" /> {t(translations.sections.education.viewDetails)}
                  </Link>
                </div>
              ))}
        </div>

        {!isLoading && featuredArtisans.length === 0 && (
          <div className="text-center py-12">
             <p className="text-muted-foreground">No featured partners available at this time.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/artisans"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {t(translations.sections.artisans.exploreArtisans)}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ArtisanShowcase;
