"use client";

import { Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminFeedback } from "@/lib/api/feedback";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

const Testimonials = () => {
  const { locale, t } = useLanguage();
  const [page, setPage] = useState(1);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["public-feedback-list", page],
    queryFn: () => fetchAdminFeedback({ page, limit: 3 }),
  });

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllFeedback(data.data);
      } else {
        setAllFeedback((prev) => {
          const newItems = data.data.filter(item => !prev.find(p => p.id === item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  const pagination = data?.pagination;

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-heading mb-4">
            What Our Visitors Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from our community of farmers, students, and travelers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && page === 1
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border p-6 rounded-2xl space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-4" />
                    ))}
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                       <Skeleton className="h-4 w-24" />
                       <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))
            : allFeedback.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border p-6 rounded-2xl hover:shadow-md transition-shadow relative group"
                >
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          item.rating && i < item.rating
                            ? "fill-secondary text-secondary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground text-sm italic mb-6 leading-relaxed">
                    "{item.message}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                       {item.fullName?.charAt(0) || item.user?.firstName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {item.fullName || (item.user ? `${item.user.firstName} ${item.user.lastName}` : "Verified User")}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {item.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {isFetching && page > 1 && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="bg-card border border-border p-6 rounded-2xl space-y-4">
                     <Skeleton className="h-32 w-full" />
                   </div>
                ))}
            </div>
        )}

        {!isLoading && allFeedback.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Hear from our community soon!</p>
          </div>
        )}

        {pagination && pagination.hasNext && (
            <div className="mt-10 text-center">
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-2.5 rounded-full font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50"
                >
                    {isFetching ? "Loading..." : "Load More Feedbacks"}
                </button>
            </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
