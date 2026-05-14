"use client";

import { use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Globe, Mail, Phone, MapPin, Building2, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicPartnerById } from "@/lib/api/partners";
import { Badge } from "@/components/ui/badge";

export default function PartnerDetailsPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = use(params);
  const { t } = useLanguage();

  const { data: partner, isLoading, error } = useQuery({
    queryKey: ["public-partner", partnerId],
    queryFn: () => fetchPublicPartnerById(partnerId),
  });

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main className="container py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !partner ? (
          <div className="text-center py-24 text-destructive">
            <p>{t(translations.common.errorLoading)}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="relative h-56 w-full bg-muted flex items-center justify-center">
                {partner.coverImage ? (
                  <img src={partner.coverImage} alt={partner.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-16 w-16 text-muted-foreground/30" />
                )}
              </div>
              <div className="p-8 relative">
                {partner.logo && (
                  <div className="absolute -top-12 left-8 w-24 h-24 rounded-xl border-4 border-card bg-white overflow-hidden shadow-sm">
                    <img src={partner.logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`${partner.logo ? 'mt-12' : ''}`}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="uppercase tracking-wider text-[10px]">{partner.type.replace("_", " ")}</Badge>
                    {(partner.city || partner.country) && (
                      <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">{partner.city}{partner.city && partner.country ? ", " : ""}{partner.country}</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold font-heading">{partner.name}</h1>
                  {partner.tagline && <p className="text-base text-muted-foreground mt-1 font-medium italic">{partner.tagline}</p>}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 rounded-lg border p-6 bg-card">
                <h3 className="font-semibold mb-3">About Us</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{partner.description || "No description provided."}</p>
                
                {partner.services && partner.services.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Services & Offerings</h3>
                    <div className="flex flex-wrap gap-2">
                      {partner.services.map((service, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">{service}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {partner.certifications && partner.certifications.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {partner.certifications.map((cert, i) => (
                        <Badge key={i} variant="outline" className="font-normal">{cert}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border p-6 bg-card space-y-3">
                  <h3 className="font-semibold mb-2">Contact Details</h3>
                  {partner.email && <p className="text-sm flex items-center gap-3 text-muted-foreground"><Mail className="h-4 w-4 shrink-0" /> <a href={`mailto:${partner.email}`} className="hover:underline truncate">{partner.email}</a></p>}
                  {partner.phone && <p className="text-sm flex items-center gap-3 text-muted-foreground"><Phone className="h-4 w-4 shrink-0" /> {partner.phone}</p>}
                  {(partner.website || partner.socialLinks?.website) && (
                    <p className="text-sm flex items-center gap-3 text-muted-foreground">
                      <Globe className="h-4 w-4 shrink-0" /> 
                      <a href={partner.website || partner.socialLinks?.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        {partner.website || partner.socialLinks?.website}
                      </a>
                    </p>
                  )}
                  {(partner.address || partner.location) && (
                    <p className="text-sm flex items-start gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" /> 
                      <span>{partner.address || partner.location}</span>
                    </p>
                  )}
                </div>

                {partner.referenceUrls && partner.referenceUrls.length > 0 && (
                  <div className="rounded-lg border p-6 bg-card">
                    <h3 className="font-semibold mb-3">Links</h3>
                    <ul className="space-y-2">
                      {partner.referenceUrls.map((url: string, i: number) => (
                        <li key={i}>
                          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5 break-all">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center space-y-4">
              <h3 className="text-xl font-bold font-heading">{t(translations.partnerPage.applyTitle)}</h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                {t(translations.partnerPage.applyDescription)}
              </p>
              <div className="flex justify-center">
                <Button asChild className="font-bold uppercase tracking-widest text-xs h-11 px-10 shadow-lg shadow-primary/20">
                  <Link href="/account/partner">
                    {t(translations.partnerPage.applyBtn)}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
