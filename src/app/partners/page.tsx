"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicPartners } from "@/lib/api/partners";

export default function PartnersPage() {
  const { t } = useLanguage();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-partners"],
    queryFn: () => fetchPublicPartners({ limit: 50 }),
  });

  const partners = data?.data || [];

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        <section className="bg-primary/5 border-b border-border">
          <div className="container py-12 text-center">
            <Badge className="mb-3 bg-secondary text-secondary-foreground">
              {t(translations.communityPage.community)}
            </Badge>
            <h1 className="text-3xl font-bold font-heading">{t(translations.partnerPage.partnerNetwork)}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {t(translations.partnerPage.trackSub)}
            </p>
            <div className="mt-6">
              <Button asChild className="font-bold uppercase tracking-widest text-[10px] h-10 px-8">
                <Link href="/account/partner">
                  {t(translations.partnerPage.applyBtn)}
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="container py-10">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-24 text-destructive">
              <p>Failed to load partners. Please try again later.</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p>No public partners found.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="relative h-40 w-full bg-muted flex items-center justify-center">
                    {p.coverImage || p.logo ? (
                      <img src={p.coverImage || p.logo!} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="h-10 w-10 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center overflow-hidden shrink-0">
                        {p.logo ? (
                          <img src={p.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold font-heading text-base">{p.name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.type.replace("_", " ")}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {p.tagline || p.description || "-"}
                  </p>
                  <div className="grid grid-cols-3 gap-3 mt-4 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{p.city || p.country || p.location || "-"}</span></span>
                    <span className="inline-flex items-center gap-1 truncate"><Users className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{p.teamSize || "-"}</span></span>
                    <span className="inline-flex items-center gap-1 truncate"><Calendar className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{p.foundedYear || "-"}</span></span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                    <Link href={`/partners/${p.id}`} className="gap-1">
                      {t(translations.common.viewDetails)} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
