"use client";

import { ArrowRight, Users, Clock, Calendar, Award } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchTrainingPrograms } from "@/lib/api/education";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { usePricing } from "@/context/PricingContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  full: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  completed: "bg-muted text-muted-foreground border-border",
};

const EducationPreview = () => {
  const { locale, t } = useLanguage();
  const { formatPrice } = usePricing();
  const [page, setPage] = useState(1);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["education-programs-list", locale, page],
    queryFn: () => fetchTrainingPrograms({ page, limit: 3 }),
  });

  useEffect(() => {
    if (data?.data) {
      const mapped = data.data.map((p: any) => ({
        ...p,
        image: p.coverImage || p.heroImage || "/assets/tours/educational.jpg",
      }));

      if (page === 1) {
        setAllPrograms(mapped);
      } else {
        setAllPrograms((prev) => {
          const newItems = mapped.filter(item => !prev.find(p => p.id === item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  const pagination = data?.pagination;

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold font-heading mb-3">
              Organic Education Hub
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Empowering farmers and enthusiasts with practical organic knowledge
            </p>
          </div>
          <Link
            href="/education"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-all"
          >
            Explore Academy <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading && page === 1
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            : allPrograms.map((program) => {
                const enrolled = 0;
                let status = "open";
                if (program.startDate && new Date(program.startDate) > new Date())
                  status = "upcoming";
                if (program.endDate && new Date(program.endDate) < new Date())
                  status = "completed";
                if (enrolled >= (program.capacity || 0)) status = "full";
                
                const topics = (program.topics || []).map((t: any) => ({ en: t.name?.en || "" }));
                const certificate = program.type === "certification";

                return (
                  <div
                    key={program.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={program.image}
                        alt={t(program.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] py-0 px-2"
                        >
                          {program.type || "General"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] py-0 px-2"
                        >
                          {program.level || "Beginner"}
                        </Badge>
                        <Badge
                          className={`${statusColors[status]} border text-[10px] py-0 px-2 capitalize`}
                        >
                          {status}
                        </Badge>
                      </div>
                      <h3 className="font-bold font-heading text-foreground text-lg mb-2">
                         {t(program.title)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {t(program.shortDescription || program.fullDescription) || ""}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {program.durationWeeks ? `${program.durationWeeks} Weeks` : "Self-paced"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {program.startDate ? new Date(program.startDate).toLocaleDateString() : "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {enrolled}/{program.capacity || 0}
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Enrollment</span>
                          <span>
                            {Math.round((enrolled / Math.max(program.capacity || 1, 1)) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(enrolled / Math.max(program.capacity || 1, 1)) * 100}
                          className="h-1.5"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {topics.slice(0, 4).map((topic: any) => (
                          <span
                            key={t(topic)}
                            className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
                          >
                            {t(topic)}
                          </span>
                        ))}
                        {topics.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{topics.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                        <div>
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(program.priceRwf)}
                          </span>
                          {certificate && (
                            <span className="flex items-center gap-1 text-[10px] text-primary mt-0.5 font-semibold">
                              <Award className="h-3 w-3" />
                              Certificate included
                            </span>
                          )}
                        </div>
                        <Link href={`/education/programs/${program.id}`}>
                          <Button
                            size="sm"
                            className="text-xs"
                            variant="outline"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {isFetching && page > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="space-y-4">
                     <Skeleton className="aspect-video w-full rounded-2xl" />
                   </div>
                ))}
            </div>
        )}

        {!isLoading && allPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No training programs available at this time.</p>
          </div>
        )}

        {pagination && pagination.hasNext && (
            <div className="mt-10 text-center">
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-2.5 rounded-full font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50"
                >
                    {isFetching ? "Loading..." : "Load More Programs"}
                </button>
            </div>
        )}
      </div>
    </section>
  );
};

export default EducationPreview;
