"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { artisans } from "@/data/community";
import {
  Handshake,
  Users,
  ShoppingBag,
  MapPin,
  ArrowRight,
  Star,
  Heart,
  Leaf,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";

export default function CommunityPage() {
  const { formatPrice } = usePricing();
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<
    (typeof artisans)[0] | null
  >(null);

  const culturalImg = "/assets/tours/cultural.jpg";

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[45vh] min-h-[380px] overflow-hidden">
          <img
            src={culturalImg}
            alt="Community at Agri-Eco"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/30" />
          <div className="relative container h-full flex items-center">
            <div className="max-w-xl text-card">
              <Badge className="bg-secondary text-secondary-foreground mb-4 gap-1.5 text-[10px] py-0 px-2 font-bold">
                <Handshake className="h-3.5 w-3.5" /> Community & Partners
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white leading-tight">
                Stronger Together
              </h1>
              <p className="text-card/80 text-lg mb-6 text-white/90">
                Meet our local artisans, join as a partner, and support Rwanda's
                vibrant farming communities and cultural heritage.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  size="lg"
                  className="gap-2 text-sm"
                  onClick={() => setPartnerDialogOpen(true)}
                >
                  <Handshake className="h-4 w-4" /> Become a Partner
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-card/30 text-white bg-card/10 hover:bg-card/40 gap-2 text-sm"
                >
                  <ShoppingBag className="h-4 w-4" /> Shop Artisan Crafts
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 border-b border-border bg-card">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: "Local Artisans", value: "15+", icon: Users },
                { label: "Tourism Partners", value: "12", icon: Handshake },
                { label: "Crafts Available", value: "50+", icon: ShoppingBag },
                { label: "Community Members", value: "200+", icon: Heart },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-2xl font-bold text-foreground font-heading">
                    {s.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Artisan Showcase */}
        <section className="py-16">
          <div className="container">
            <h2 className="section-heading text-xl">Meet Our Artisans</h2>
            <p className="section-subheading text-muted-foreground text-sm">
              Talented craftspeople preserving Rwanda's cultural heritage
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              {artisans.map((a) => (
                <div
                  key={a.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="md:flex">
                    <div className="w-full md:w-52 h-56 md:h-auto overflow-hidden shrink-0">
                      <img
                        src={a.image}
                        alt={a.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-2 font-semibold"
                        >
                          {a.specialty}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold font-heading text-foreground mb-1 group-hover:text-primary transition-colors">
                        {a.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" />
                        {a.location}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                        {a.description}
                      </p>
                      <div className="flex items-center gap-2 mb-4 mt-auto">
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {a.products.length} products available
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs w-fit"
                        onClick={() => setSelectedArtisan(a)}
                      >
                        View Profile & Products{" "}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership CTA */}
        <section className="py-16 bg-primary/5 border-y border-border">
          <div className="container text-center">
            <h2 className="section-heading text-xl mb-3">Partner With Us</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-sm">
              Are you a tourism operator, hotel, restaurant, or organization?
              Join our partner network and create unique agritourism packages.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8 text-left">
              {[
                {
                  title: "Create Packages",
                  desc: "Bundle tours, accommodation, and dining into unique offerings",
                },
                {
                  title: "Earn Commissions",
                  desc: "Competitive rates on every booking through your channel",
                },
                {
                  title: "Shared Calendar",
                  desc: "Real-time availability visibility for seamless coordination",
                },
              ].map((b) => (
                <div
                  key={b.title}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold font-heading text-foreground mb-2 text-sm text-primary">
                    {b.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              className="gap-2 text-sm"
              onClick={() => setPartnerDialogOpen(true)}
            >
              <Handshake className="h-4 w-4" /> Apply to Join
            </Button>
          </div>
        </section>
      </main>
      <Footer />

      {/* Artisan Profile Dialog */}
      <Dialog
        open={!!selectedArtisan}
        onOpenChange={() => setSelectedArtisan(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedArtisan && (
            <>
              <DialogHeader className="border-b pb-3">
                <DialogTitle className="font-heading text-lg">
                  {selectedArtisan.name}
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-primary">
                  {selectedArtisan.specialty}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 aspect-video overflow-hidden rounded-lg">
                <img
                  src={selectedArtisan.image}
                  alt={selectedArtisan.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 space-y-4">
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedArtisan.story}
                </p>
                <h4 className="font-bold font-heading text-foreground text-sm border-t pt-4">
                  Products by {selectedArtisan.name}
                </h4>
                <div className="space-y-3">
                  {selectedArtisan.products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 bg-accent/30 rounded-lg p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {p.description}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 shrink-0"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Partner Application Dialog */}
      <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading">
              Partner Application
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apply to join Agri-Eco's partner network. We'll review and respond
              within 5 business days.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Application Submitted!", {
                description: "We'll contact you within 5 business days.",
              });
              setPartnerDialogOpen(false);
            }}
            className="space-y-4 pt-3"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Business Name *
                </Label>
                <Input
                  required
                  placeholder="Your business name"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">
                  Contact Person *
                </Label>
                <Input
                  required
                  placeholder="Full name"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Email *</Label>
                <Input
                  type="email"
                  required
                  placeholder="email@business.com"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Phone *</Label>
                <Input
                  required
                  placeholder="+250 7XX XXX XXX"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">
                  Business Type *
                </Label>
                <Select required>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism-operator" className="text-xs">
                      Tourism Operator
                    </SelectItem>
                    <SelectItem value="hotel" className="text-xs">
                      Hotel / Lodge
                    </SelectItem>
                    <SelectItem value="restaurant" className="text-xs">
                      Restaurant
                    </SelectItem>
                    <SelectItem value="school" className="text-xs">
                      School / Institution
                    </SelectItem>
                    <SelectItem value="ngo" className="text-xs">
                      NGO / Non-profit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Tell us about your business
                </Label>
                <Textarea
                  placeholder="How you'd like to partner with Agri-Eco..."
                  className="text-xs"
                  rows={3}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 text-xs">
              Submit Application
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
