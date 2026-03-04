"use client";

import { ChevronRight, Clock, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturesBar from "@/components/FeaturesBar";
import { deals } from "@/data/deals";

const DealsPage = () => {
  const getDaysLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent to-primary/5 border-b border-border">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Hot Deals
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-semibold">Hot Deals</span>
          </div>
        </div>
      </div>

      {/* Deals intro */}
      <div className="container py-8 md:py-12">
        <div className="text-center mb-10">
          <h2 className="section-heading">Exclusive Organic Deals</h2>
          <p className="section-subheading">
            Don't miss out on our hand-picked offers on the freshest organic
            products. Limited time only!
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid gap-6 md:gap-8">
          {deals.map((deal, idx) => {
            const daysLeft = getDaysLeft(deal.endsAt);
            const isEven = idx % 2 === 0;

            return (
              <div
                key={deal.id}
                className={`group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Image */}
                <div className="relative md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden bg-muted">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-badge-sale text-card text-xs font-bold uppercase px-3 py-1.5 rounded-full">
                      {deal.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-card/90 backdrop-blur-sm text-foreground text-lg font-bold px-4 py-2 rounded-xl shadow-lg font-heading">
                      {deal.discount}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {deal.productIds.length} product
                      {deal.productIds.length > 1 ? "s" : ""} included
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold font-heading text-foreground">
                    {deal.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {deal.description}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span>
                      {daysLeft > 0 ? (
                        <>
                          <span className="font-bold text-foreground">
                            {daysLeft}
                          </span>{" "}
                          days left
                        </>
                      ) : (
                        <span className="text-destructive font-semibold">
                          Expired
                        </span>
                      )}
                    </span>
                  </div>

                  <Link
                    href={`/shop?deal=${deal.id}`}
                    className="mt-6 w-fit inline-flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors group/btn"
                  >
                    View Deal Products
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FeaturesBar />
      <Footer />
    </div>
  );
};

export default DealsPage;
