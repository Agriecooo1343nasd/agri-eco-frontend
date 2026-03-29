"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Handshake,
  Users,
  ShoppingBag,
  MapPin,
  ArrowRight,
  Heart,
  Palette,
  Star,
  Loader2,
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
import { fetchArtisans, submitArtisanApplication, type AdminArtisan, toAbsoluteArtisanImage } from "@/lib/api/artisans";
import { submitPartnerApplication } from "@/lib/api/partners";
import { fetchCommunityStats } from "@/lib/api/community";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityPage() {
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [artisanDialogOpen, setArtisanDialogOpen] = useState(false);
  
  const [artisans, setArtisans] = useState<AdminArtisan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArtisans: 0,
    totalPartners: 0,
    totalProducts: 0,
    totalExperiences: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [partnerForm, setPartnerForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    businessType: "tourism_operator",
    description: "",
  });

  const [artisanForm, setArtisanForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    specialty: "",
    shortDescription: "",
    fullStory: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadArtisans();
  }, [page]);

  useEffect(() => {
    fetchCommunityStats()
      .then((result) => setStats(result))
      .catch(() => {
        // Keep graceful fallback values already in UI.
      });
  }, []);

  const loadArtisans = async () => {
    try {
      setIsLoading(true);
      const res = await fetchArtisans({ page, limit: 6 });
      setArtisans(res.data);
      setHasMore(res.pagination.hasNext);
    } catch (error) {
      console.error("Failed to load artisans:", error);
      toast.error("Failed to load community members");
    } finally {
      setIsLoading(false);
    }
  };

  const culturalImg = "/assets/tours/cultural.jpg";

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitPartnerApplication(partnerForm);
      toast.success("Application Submitted", {
        description: "Your partner application is now pending review.",
      });
      setPartnerDialogOpen(false);
      setPartnerForm({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        businessType: "tourism_operator",
        description: "",
      });
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArtisanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitArtisanApplication(artisanForm);
      toast.success("Application Submitted", {
        description: "Your artisan application is now pending review.",
      });
      setArtisanDialogOpen(false);
      setArtisanForm({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        specialty: "",
        shortDescription: "",
        fullStory: "",
      });
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLangText = (text?: any) => {
    if (!text) return "";
    if (typeof text === "string") return text;
    return text.en || text.rw || text.fr || text.sw || "";
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[45vh] min-h-95 overflow-hidden">
          <img
            src={culturalImg}
            alt="Community at Agri-Eco"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-foreground/80 to-foreground/30" />
          <div className="relative container h-full flex items-center">
            <div className="max-w-xl text-card">
              <Badge className="bg-secondary text-secondary-foreground mb-4 gap-1.5 text-[10px] py-0 px-2 font-bold">
                <Handshake className="h-3.5 w-3.5" /> Community &amp; Partners
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white leading-tight">
                Stronger Together
              </h1>
              <p className="text-lg mb-6 text-white/90">
                Meet our local artisans, join as a partner, and support
                Rwanda&#39;s vibrant farming communities and cultural heritage.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  size="lg"
                  className="gap-2 text-sm"
                  onClick={() => setArtisanDialogOpen(true)}
                >
                  <Palette className="h-4 w-4" /> Become an Artisan
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-card/30 text-white bg-card/10 hover:bg-card/40 gap-2 text-sm"
                  onClick={() => setPartnerDialogOpen(true)}
                >
                  <Handshake className="h-4 w-4" /> Become a Partner
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
                {
                  label: "Local Artisans",
                  value:
                    stats.totalArtisans > 0
                      ? `${stats.totalArtisans}+`
                      : artisans.length > 0
                        ? `${artisans.length}+`
                        : "20+",
                  icon: Users,
                },
                {
                  label: "Tourism Partners",
                  value: stats.totalPartners > 0 ? `${stats.totalPartners}` : "12",
                  icon: Handshake,
                },
                {
                  label: "Crafts Available",
                  value: stats.totalProducts > 0 ? `${stats.totalProducts}+` : "50+",
                  icon: ShoppingBag,
                },
                {
                  label: "Community Experiences",
                  value:
                    stats.totalExperiences > 0 ? `${stats.totalExperiences}` : "200+",
                  icon: Heart,
                },
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
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <h2 className="section-heading text-xl">Meet Our Artisans</h2>
                <p className="section-subheading text-muted-foreground text-sm mb-0">
                  Talented craftspeople preserving Rwanda&#39;s cultural heritage
                </p>
              </div>
            </div>

            {isLoading && artisans.length === 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {artisans.map((a) => (
                  <div
                    key={a.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="md:flex h-full">
                      <div className="w-full md:w-52 h-56 md:h-auto overflow-hidden shrink-0">
                        <img
                          src={toAbsoluteArtisanImage(a.image)}
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
                          {a.isFeatured && (
                            <Badge className="ml-2 text-[10px] py-0 px-2 bg-amber-100 text-amber-700 border border-amber-200">
                              <Star className="h-2.5 w-2.5 fill-amber-500 mr-0.5" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-bold font-heading text-foreground mb-1 group-hover:text-primary transition-colors">
                          {a.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mb-3">
                          <MapPin className="h-3 w-3" />
                          {a.location || "Rwanda"}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {getLangText(a.shortDescription) || getLangText(a.fullStory) || "Preserving traditional Rwandan crafts and techniques."}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs w-fit mt-auto"
                          asChild
                        >
                          <Link href={`/community/artisan/${a.id}`}>
                            View Profile &amp; Products{" "}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {(hasMore || page > 1) && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <div className="text-xs font-medium">Page {page}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Partnership CTA */}
        <section className="py-16 bg-primary/5 border-y border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
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
                    <h3 className="font-bold font-heading text-primary mb-2 text-sm">
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
          </div>
        </section>
      </main>
      <Footer />

      {/* Artisan Application Dialog */}
      <Dialog open={artisanDialogOpen} onOpenChange={setArtisanDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Apply to Become an Artisan
            </DialogTitle>
            <DialogDescription>
              Share your craft with the world. Our team will review your
              application within 5 business days.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleArtisanSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">Full Name *</Label>
                <Input
                  required
                  placeholder="Your full name"
                  className="h-9 text-xs"
                  value={artisanForm.fullName}
                  onChange={(e) => setArtisanForm(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Email *</Label>
                <Input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="h-9 text-xs"
                  value={artisanForm.email}
                  onChange={(e) => setArtisanForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Phone *</Label>
                <Input
                  required
                  placeholder="+250 7XX XXX XXX"
                  className="h-9 text-xs"
                  value={artisanForm.phone}
                  onChange={(e) => setArtisanForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Location *</Label>
                <Input
                  required
                  placeholder="e.g., Musanze District"
                  className="h-9 text-xs"
                  value={artisanForm.location}
                  onChange={(e) => setArtisanForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Specialty *</Label>
                <Input
                  required
                  placeholder="e.g. Basket Weaving"
                  className="h-9 text-xs"
                  value={artisanForm.specialty}
                  onChange={(e) => setArtisanForm(prev => ({ ...prev, specialty: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Short Description *
                </Label>
                <Textarea
                  required
                  placeholder="A brief summary of your work..."
                  rows={2}
                  className="text-xs"
                  value={artisanForm.shortDescription}
                  onChange={(e) => setArtisanForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Full Story
                </Label>
                <Textarea
                  placeholder="Your background, passion for your craft..."
                  rows={3}
                  className="text-xs"
                  value={artisanForm.fullStory}
                  onChange={(e) => setArtisanForm(prev => ({ ...prev, fullStory: e.target.value }))}
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-1.5 text-xs h-10" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palette className="h-4 w-4" />}
              Submit Application
            </Button>
          </form>
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
              Apply to join Agri-Eco&#39;s partner network. We&#39;ll review and
              respond within 5 business days.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePartnerSubmit} className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Business Name *
                </Label>
                <Input
                  required
                  placeholder="Your business name"
                  className="h-9 text-xs"
                  value={partnerForm.businessName}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      businessName: e.target.value,
                    }))
                  }
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
                  value={partnerForm.contactName}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      contactName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Email *</Label>
                <Input
                  type="email"
                  required
                  placeholder="email@business.com"
                  className="h-9 text-xs"
                  value={partnerForm.email}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Phone *</Label>
                <Input
                  required
                  placeholder="+250 7XX XXX XXX"
                  className="h-9 text-xs"
                  value={partnerForm.phone}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">
                  Business Type *
                </Label>
                <Select
                  value={partnerForm.businessType}
                  onValueChange={(value) =>
                    setPartnerForm((prev) => ({ ...prev, businessType: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism_operator" className="text-xs">
                      Tourism Operator
                    </SelectItem>
                    <SelectItem value="hospitality" className="text-xs">
                      Hospitality / Hotel
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
                  value={partnerForm.description}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 text-xs" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
