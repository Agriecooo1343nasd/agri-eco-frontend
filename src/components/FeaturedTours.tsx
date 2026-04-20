"use client";

import { Star, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePricing } from "@/context/PricingContext";
import { useQuery } from "@tanstack/react-query";
import { fetchExperiences, toAbsoluteExperienceImage } from "@/lib/api/experiences";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { translations } from "@/i18n/translations";

const FeaturedTours = () => {
  const { formatPrice } = usePricing();
  const { locale, t } = useLanguage();
  const [page, setPage] = useState(1);
  const [allTours, setAllTours] = useState<any[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["experiences-list", locale, page],
    queryFn: () => fetchExperiences({ page, limit: 4 }),
  });

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllTours(data.data);
      } else {
        setAllTours((prev) => {
          const newItems = data.data.filter(item => !prev.find(p => p.id === item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  const pagination = data?.pagination;

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-heading !text-left">{t(translations.sections.popularExperiences.title)}</h2>
            <p className="section-subheading !text-left !mx-0 mt-2">
              {t(translations.sections.popularExperiences.sub)}
            </p>
          </div>
          <Link
            href="/tours"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {t(translations.sections.popularExperiences.exploreMore)} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading && page === 1
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            : allTours.map((tour) => {
                const spotsLeft = tour.slots?.reduce(
                  (sum: number, ts: any) => sum + (ts.capacity - ts.bookedParticipants),
                  0,
                ) || 0;

                return (
                  <Link
                    key={tour.id}
                    href={`/tours/${tour.slug}`}
                    className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={toAbsoluteExperienceImage(tour.heroImage)}
                        alt={t(tour.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {tour.isActive && spotsLeft > 0 && spotsLeft < 10 && (
                        <span className="absolute top-3 left-3 bg-badge-sale text-card text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                          {t(translations.sections.popularExperiences.limited)}
                        </span>
                      )}
                      {tour.seasonStart && (
                        <span className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                          {t(translations.sections.popularExperiences.seasonal)}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {tour.expectedDuration || `${tour.durationMinutes} min`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> Max {tour.capacity}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-1">
                        {t(tour.title)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {t(tour.shortDescription)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                        <span className="text-xs font-semibold text-foreground">
                          4.9
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          (120+ reviews)
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div>
                          <span className="text-lg font-bold text-foreground">
                           {formatPrice(tour.priceRwf)}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            {t(translations.sections.popularExperiences.perPerson)}
                          </span>
                        </div>
                        {spotsLeft > 0 && (
                          <span className="text-[11px] font-semibold text-badge-sale">
                            {spotsLeft} {t(translations.sections.popularExperiences.spotsLeft)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
        
        {isFetching && page > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                 {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                    </div>
                 ))}
            </div>
        )}

        {!isLoading && allTours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No experiences available at the moment.</p>
          </div>
        )}

        {pagination && pagination.hasNext && (
            <div className="mt-10 text-center">
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-8 py-3 rounded-full font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50"
                >
                    {isFetching ? "Loading..." : t(translations.sections.popularExperiences.loadMore)}
                </button>
            </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTours;
