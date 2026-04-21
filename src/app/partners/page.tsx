"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { partnerShowcase } from "@/data/operations-mock";
import { Building2, Users, Calendar, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        <section className="bg-primary/5 border-b border-border">
          <div className="container py-12 text-center">
            <Badge className="mb-3 bg-secondary text-secondary-foreground">Community</Badge>
            <h1 className="text-3xl font-bold font-heading">Our Partners</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Cooperatives, NGOs and logistics organizations powering Agri-Eco.
            </p>
          </div>
        </section>
        <section className="container py-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partnerShowcase.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold font-heading text-base">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.type}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.shortInfo || p.description}</p>
                <div className="grid grid-cols-3 gap-3 mt-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.region}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{p.members}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{p.since}</span>
                </div>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link href={`/partners/${p.id}`} className="gap-1">
                    View partner details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
