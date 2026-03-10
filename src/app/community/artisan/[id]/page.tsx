"use client";

import { use, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { artisans } from "@/data/community";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShoppingBag,
  Heart,
  MessageCircle,
  Share2,
  Award,
  Package,
  Truck,
  Shield,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";

export default function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const artisan = artisans.find((a) => a.id === id);
  const { addToCart } = useCart();
  const { formatPrice } = usePricing();
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!artisan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Artisan Not Found
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            The artisan profile you&#39;re looking for doesn&#39;t exist.
          </p>
          <Button asChild>
            <Link href="/community">Back to Community</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = (product: (typeof artisan.products)[0]) => {
    addToCart({
      id: Math.abs(
        product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
      ),
      name: product.name,
      price: product.price,
      image: product.image,
      rating: 5,
      category: artisan.specialty,
      unit: "piece",
    });
    toast.success("Added to Cart", {
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: artisan.name,
          text: artisan.description,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link Copied!", {
          description: "Artisan profile link copied to clipboard.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        {/* Hero Banner */}
        <section className="relative h-[35vh] min-h-[280px] overflow-hidden">
          <img
            src={artisan.image}
            alt={artisan.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-foreground/10" />
          <div className="relative container h-full flex items-end pb-8">
            <Link
              href="/community"
              className="absolute top-6 left-4 md:left-0 inline-flex items-center gap-1.5 text-card/70 hover:text-card text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Community
            </Link>
          </div>
        </section>

        {/* Profile Header */}
        <section className="relative -mt-16 pb-8">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-28 h-28 rounded-2xl border-4 border-card overflow-hidden shadow-lg shrink-0 bg-card">
                <img
                  src={artisan.image}
                  alt={artisan.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 pt-2">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
                      {artisan.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <Badge className="bg-primary/10 text-primary border-primary/20 border gap-1 text-xs">
                        <Award className="h-3 w-3" /> {artisan.specialty}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {artisan.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={handleShare}
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setContactOpen(true)}
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Contact
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {artisan.products.length}
                    </span>
                    <span className="text-muted-foreground">Products</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-foreground">4.8</span>
                    <span className="text-muted-foreground">(24 reviews)</span>
                  </div>
                  {artisan.featured && (
                    <Badge
                      variant="outline"
                      className="text-xs gap-1 border-amber-500/30 text-amber-600"
                    >
                      <Star className="h-3 w-3 fill-amber-500" /> Featured
                      Artisan
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Content */}
        <section className="pb-16">
          <div className="container">
            <Tabs defaultValue="products" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1">
                <TabsTrigger value="products" className="gap-1.5 text-sm py-2">
                  <ShoppingBag className="h-4 w-4 hidden sm:block" /> Products
                </TabsTrigger>
                <TabsTrigger value="story" className="gap-1.5 text-sm py-2">
                  <Quote className="h-4 w-4 hidden sm:block" /> Story
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-1.5 text-sm py-2">
                  <Shield className="h-4 w-4 hidden sm:block" /> Info
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    Handcrafted Products ({artisan.products.length})
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artisan.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                          onClick={() => setSelectedImage(product.image)}
                        />
                        <Badge className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-xs border-0">
                          Handmade
                        </Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold font-heading text-foreground mb-1 text-sm">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Truck className="h-3.5 w-3.5" /> Free shipping
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 gap-1.5 text-xs"
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                          </Button>
                          <Button variant="outline" size="sm" className="px-3">
                            <Heart className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Story Tab */}
              <TabsContent value="story" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Story Card */}
                  <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Quote className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-heading text-foreground">
                          The Story of {artisan.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {artisan.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed text-sm mb-6">
                        {artisan.story}
                      </p>
                      <p className="text-muted-foreground leading-relaxed text-xs">
                        {artisan.description}
                      </p>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <h3 className="font-semibold text-foreground mb-4">
                      Gallery
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {artisan.products.map((p) => (
                        <img
                          key={p.id}
                          src={p.image}
                          alt={p.name}
                          className="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(p.image)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Craft Process */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold font-heading text-foreground mb-6">
                    The Craft Process
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-6">
                    {[
                      {
                        step: "1",
                        title: "Sourcing",
                        desc: "Materials are ethically sourced from local and sustainable origins",
                      },
                      {
                        step: "2",
                        title: "Crafting",
                        desc: "Each piece is handmade using traditional techniques passed down through generations",
                      },
                      {
                        step: "3",
                        title: "Finishing",
                        desc: "Careful quality checks ensure every product meets our artisan standards",
                      },
                    ].map((s) => (
                      <div key={s.step} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                          {s.step}
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">
                          {s.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {s.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-bold font-heading text-foreground mb-4">
                      Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Specialty</span>
                        <span className="font-medium text-foreground">
                          {artisan.specialty}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium text-foreground">
                          {artisan.location}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Products</span>
                        <span className="font-medium text-foreground">
                          {artisan.products.length} items
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Rating</span>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          4.8{" "}
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className="bg-primary/10 text-primary border-primary/20 border text-xs">
                          {artisan.featured ? "Featured" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-bold font-heading text-foreground mb-4">
                      Shipping &amp; Returns
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: Truck,
                          title: "Free Shipping",
                          desc: "On all orders above 30,000 RWF",
                        },
                        {
                          icon: Shield,
                          title: "Quality Guarantee",
                          desc: "Handmade authenticity certified",
                        },
                        {
                          icon: Package,
                          title: "Careful Packaging",
                          desc: "Items wrapped for safe delivery",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex items-start gap-3"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold font-heading text-foreground mb-4">
                    Customer Reviews
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "Marie N.",
                        rating: 5,
                        text: "Beautiful craftsmanship! The basket is even more stunning in person. Highly recommend.",
                        date: "2 weeks ago",
                      },
                      {
                        name: "David K.",
                        rating: 5,
                        text: "Amazing quality. You can tell each piece is made with love and care. Will buy again!",
                        date: "1 month ago",
                      },
                      {
                        name: "Sarah M.",
                        rating: 4,
                        text: "Lovely products and fast delivery. The wooden bowl set is perfect for entertaining.",
                        date: "2 months ago",
                      },
                    ].map((review, i) => (
                      <div key={i} className="bg-accent/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-foreground">
                            {review.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star
                              key={j}
                              className="h-3 w-3 fill-amber-500 text-amber-500"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />

      {/* Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Contact {artisan.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Send a message about custom orders, availability, or any
              questions.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message Sent!", {
                description: `Your message to ${artisan.name} has been sent. They'll respond within 24 hours.`,
              });
              setContactOpen(false);
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-[11px] mb-1 block">Your Name *</Label>
              <Input required placeholder="Full name" className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Email *</Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Subject *</Label>
              <Input
                required
                placeholder="e.g., Custom order inquiry"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Message *</Label>
              <Textarea
                required
                placeholder="Tell the artisan what you're looking for..."
                rows={4}
                className="text-xs"
              />
            </div>
            <Button type="submit" className="w-full gap-1.5 text-xs h-10">
              <MessageCircle className="h-4 w-4" /> Send Message
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-2xl p-2">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
