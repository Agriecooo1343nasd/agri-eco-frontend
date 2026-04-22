"use client";

import { use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { partnerShowcase } from "@/data/operations-mock";
import { Badge } from "@/components/ui/badge";
import { Globe, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function PartnerDetailsPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = use(params);
  const partner = partnerShowcase.find((p) => p.id === partnerId);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main className="container py-12">
        {!partner ? (
          <p className="text-muted-foreground">{t(translations.common.errorLoading)}</p>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="relative h-56 w-full">
                <Image src={partner.image} alt={partner.name} fill className="object-cover" />
              </div>
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline">{partner.type}</Badge>
                  <Badge variant="secondary">{partner.region}</Badge>
                </div>
                <h1 className="text-2xl font-bold font-heading">{partner.name}</h1>
                <p className="text-muted-foreground mt-2">{partner.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4 bg-card">
                <h3 className="font-semibold mb-2">What they do</h3>
                <p className="text-sm text-muted-foreground">{partner.whatTheyDo || partner.description}</p>
              </div>
              <div className="rounded-lg border p-4 bg-card space-y-2">
                <h3 className="font-semibold mb-2">Contacts & Links</h3>
                <p className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" /> {partner.email || "N/A"}</p>
                <p className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" /> {partner.phone || "N/A"}</p>
                <p className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> {partner.website || "N/A"}</p>
                <p className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> {partner.region}</p>
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-card">
              <h3 className="font-semibold mb-2">Reference URLs</h3>
              <ul className="space-y-1">
                {(partner.links || []).map((url: string) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
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
