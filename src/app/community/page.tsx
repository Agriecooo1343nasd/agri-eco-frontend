"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { artisans } from "@/data/community";
import {
  Handshake,
  Users,
  ShoppingBag,
  MapPin,
  ArrowRight,
  Heart,
  Palette,
  Star,
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
import { appendPartnerApplication } from "@/lib/partner-store";

export default function CommunityPage() {
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [artisanDialogOpen, setArtisanDialogOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    type: "tourism-operator",
    aboutBusiness: "",
  });

  const activeArtisans = artisans.filter((a) => a.status === "active");
  const culturalImg = "/assets/tours/cultural.jpg";

  const resetPartnerForm = () => {
    setPartnerForm({
      businessName: "",
      contactPerson: "",
      email: "",
      phone: "",
      type: "tourism-operator",
      aboutBusiness: "",
    });
  };

  const submitPartnerApplication = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !partnerForm.businessName.trim() ||
      !partnerForm.contactPerson.trim() ||
      !partnerForm.email.trim() ||
      !partnerForm.phone.trim()
    ) {
      toast.error("Missing Required Fields", {
        description:
          "Please provide business name, contact person, email and phone.",
      });
      return;
    }

    const emailValid = /\S+@\S+\.\S+/.test(partnerForm.email);
    if (!emailValid) {
      toast.error("Invalid Email", {
        description: "Please provide a valid business email address.",
      });
      return;
    }

    appendPartnerApplication({
      businessName: partnerForm.businessName.trim(),
      contactPerson: partnerForm.contactPerson.trim(),
      email: partnerForm.email.trim(),
      phone: partnerForm.phone.trim(),
      type: partnerForm.type as
        | "tourism-operator"
        | "hotel"
        | "restaurant"
        | "school"
        | "ngo",
      aboutBusiness:
        partnerForm.aboutBusiness.trim() ||
        "No additional business summary provided.",
    });

    toast.success("Application Submitted", {
      description:
        "Your partner application has been received and is now pending review.",
    });
    resetPartnerForm();
    setPartnerDialogOpen(false);
  };

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
                <Handshake className="h-3.5 w-3.5" /> Community &amp; Partners
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white leading-tight">
                Stronger Together
              </h1>
              <p className="text-card/80 text-lg mb-6 text-white/90">
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
                  value: `${activeArtisans.length}+`,
                  icon: Users,
                },
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
            <p className="section-subheading text-muted-foreground text-sm mb-12">
              Talented craftspeople preserving Rwanda&#39;s cultural heritage
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {activeArtisans.map((a) => (
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
                        {a.featured && (
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Application Submitted!", {
                description:
                  "Thank you for applying! We'll review your application and get back to you within 5 business days.",
              });
              setArtisanDialogOpen(false);
            }}
            className="space-y-4 pt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">Full Name *</Label>
                <Input
                  required
                  placeholder="Your full name"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Email *</Label>
                <Input
                  type="email"
                  required
                  placeholder="email@example.com"
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
                <Label className="text-[11px] mb-1 block">Location *</Label>
                <Input
                  required
                  placeholder="e.g., Musanze District"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Specialty *</Label>
                <Select required>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Your craft" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basket-weaving" className="text-xs">
                      Basket Weaving
                    </SelectItem>
                    <SelectItem value="wood-carving" className="text-xs">
                      Wood Carving
                    </SelectItem>
                    <SelectItem value="pottery" className="text-xs">
                      Pottery &amp; Ceramics
                    </SelectItem>
                    <SelectItem value="textile" className="text-xs">
                      Textile Weaving
                    </SelectItem>
                    <SelectItem value="leather" className="text-xs">
                      Leather Crafting
                    </SelectItem>
                    <SelectItem value="jewelry" className="text-xs">
                      Jewelry Making
                    </SelectItem>
                    <SelectItem value="candles" className="text-xs">
                      Candles &amp; Skincare
                    </SelectItem>
                    <SelectItem value="other" className="text-xs">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Years of Experience *
                </Label>
                <Input
                  required
                  placeholder="e.g., 5 years of basket weaving, trained by..."
                  className="h-9 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Tell us about yourself *
                </Label>
                <Textarea
                  required
                  placeholder="Your background, passion for your craft, what makes your work unique..."
                  rows={3}
                  className="text-xs"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Describe your portfolio / products *
                </Label>
                <Textarea
                  required
                  placeholder="What types of products do you create? Materials used? Price range?"
                  rows={3}
                  className="text-xs"
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-1.5 text-xs h-10">
              <Palette className="h-4 w-4" /> Submit Application
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
          <form onSubmit={submitPartnerApplication} className="space-y-4 pt-3">
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
                  value={partnerForm.contactPerson}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      contactPerson: e.target.value,
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
                  value={partnerForm.type}
                  onValueChange={(value) =>
                    setPartnerForm((prev) => ({ ...prev, type: value }))
                  }
                >
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
                  value={partnerForm.aboutBusiness}
                  onChange={(e) =>
                    setPartnerForm((prev) => ({
                      ...prev,
                      aboutBusiness: e.target.value,
                    }))
                  }
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
