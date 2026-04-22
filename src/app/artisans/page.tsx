"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchArtisans, toAbsoluteArtisanImage, type AdminArtisan } from "@/lib/api/artisans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState<AdminArtisan[]>([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    fetchArtisans({ limit: 24 })
      .then((r) => setArtisans(r.data ?? []))
      .catch(() => setArtisans([]));
  }, []);

  const filtered = useMemo(() => {
    let rows = [...artisans];
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((a) =>
        `${a.name} ${a.specialty} ${a.location || ""}`.toLowerCase().includes(q),
      );
    }
    if (location !== "all") {
      rows = rows.filter((a) => (a.location || "").toLowerCase().includes(location));
    }
    if (sortBy === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "featured") rows.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    return rows;
  }, [artisans, query, location, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const locations = Array.from(
    new Set(artisans.map((a) => (a.location || "").toLowerCase()).filter(Boolean)),
  );

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        <section className="bg-accent/40 border-b border-border">
          <div className="container py-12 text-center">
            <Badge variant="secondary" className="mb-3">Community</Badge>
            <h1 className="text-3xl font-bold font-heading">Our Artisans</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Independent craftspeople bringing traditional skills to modern homes.
            </p>
          </div>
        </section>
        <section className="container py-10 space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Search artisans..." value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} />
            <Select value={location} onValueChange={(v) => { setPage(1); setLocation(v); }}>
              <SelectTrigger><SelectValue placeholder="Filter by location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured first</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <img src={toAbsoluteArtisanImage(a.image)} alt={a.name} className="h-52 w-full object-cover" />
                <div className="p-5 space-y-2">
                  <h3 className="font-bold font-heading text-base">{a.name}</h3>
                  <p className="text-xs text-primary">{a.specialty}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {a.location || "Rwanda"}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5" /> Crafts</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Featured</span>
                  </div>
                  <Button size="sm" variant="outline" asChild className="mt-2">
                    <Link href={`/community/artisan/${a.id}`}>View profile</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {page} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
