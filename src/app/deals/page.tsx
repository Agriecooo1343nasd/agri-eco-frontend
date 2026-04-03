"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Clock, ArrowRight, Tag, Calendar } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturesBar from "@/components/FeaturesBar";
import { fetchActiveDiscounts, type AdminDiscount } from "@/lib/api/discounts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DealsPage = () => {
  const [deals, setDeals] = useState<AdminDiscount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const data = await fetchActiveDiscounts();
        setDeals(data);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDeals();
  }, []);

  const getDaysLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDiscountDisplay = (deal: AdminDiscount) => {
    if (deal.type === "percentage") return `${deal.value}% OFF`;
    if (deal.type === "fixed") return `${deal.value.toLocaleString()} RWF OFF`;
    return "Special Offer";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Breadcrumb Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/20 to-primary/5 border-b border-border">
        <div className="container py-10 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-foreground mb-4">
            Exclusive Deals
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-bold">Hot Deals</span>
          </div>
        </div>
      </div>

      {/* Deals content */}
      <div className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge className="mb-4 px-4 py-1.5 uppercase font-bold tracking-widest text-[10px]">Limited Offers</Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Organic Savings Just for You</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Discover premium organic products at unbeatable prices. Our community-focused deals bring the best of the farm directly to your table for less.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-8">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : deals.length > 0 ? (
          <div className="grid gap-10">
            {deals.map((deal, idx) => {
              const daysLeft = getDaysLeft(deal.endDate);
              const isEven = idx % 2 === 0;
              const productCount = Array.isArray(deal.applicableProducts) 
                ? deal.applicableProducts.filter(Boolean).length 
                : 0;

              return (
                <div
                  key={deal.id}
                  className={`group bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-sm hover:border-primary/20 transition-all duration-500 flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Image/Visual */}
                  <div className="relative md:w-5/12 aspect-[16/10] md:aspect-auto overflow-hidden bg-muted flex items-center justify-center">
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="bg-primary/5 w-full h-full flex flex-col items-center justify-center gap-3">
                         <Tag className="h-16 w-16 text-primary/20" />
                         <span className="text-primary/40 font-bold uppercase tracking-tighter text-3xl opacity-20">{deal.code}</span>
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-primary text-primary-foreground font-black px-4 py-2 rounded-lg shadow-sm">
                        {deal.code}
                      </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <div className="bg-background/95 backdrop-blur-md text-foreground text-2xl font-black px-6 py-3 rounded-2xl shadow-sm font-heading border border-border/50">
                        {getDiscountDisplay(deal)}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-card to-muted/30">
                    {productCount > 0 && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">
                          {productCount} product
                          {productCount !== 1 ? "s" : ""}{" "}
                          included
                        </span>
                      </div>
                    )}

                    <h3 className="text-2xl md:text-4xl font-black font-heading text-foreground mb-4 leading-tight">
                      {deal.name}
                    </h3>
                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed line-clamp-3">
                      {deal.description ||
                        "Enjoy exclusive savings on selected organic products from our local artisans and farmers."}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 mb-10">
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            daysLeft > 0 ? "bg-secondary/10" : "bg-destructive/10",
                          )}
                        >
                          <Clock
                            className={cn(
                              "h-5 w-5",
                              daysLeft > 0 ? "text-secondary" : "text-destructive",
                            )}
                          />
                        </div>
                        <span className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">
                            Status
                          </span>
                          {daysLeft > 0 ? (
                            <span className="text-foreground">
                              {daysLeft} Days Remaining
                            </span>
                          ) : (
                            <span className="text-destructive">Offer Expired</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm font-bold">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <span className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">
                            Validity
                          </span>
                          <span className="text-foreground">
                            {formatDate(deal.startDate)}
                            {" - "}
                            {formatDate(deal.endDate)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/shop?deal=${deal.id}`}
                      className="w-full sm:w-fit inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 px-8 rounded-2xl text-base font-black hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-sm shadow-primary/20 group/btn"
                    >
                      Shop This Deal
                      <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
            <Tag className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">No Active Deals Today</h3>
            <p className="text-muted-foreground">Check back soon for fresh organic offers!</p>
            <Link href="/shop" className="mt-8 inline-block text-primary font-bold hover:underline">
               Browse all products
            </Link>
          </div>
        )}
      </div>

      <FeaturesBar />
      <Footer />
    </div>
  );
};

export default DealsPage;
