"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import type { Product } from "@/components/ProductCard";
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
  Loader2,
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
import {
  fetchArtisanById,
  fetchPublicArtisanProducts,
  type AdminArtisan,
  type AdminArtisanProduct,
  toAbsoluteArtisanImage,
} from "@/lib/api/artisans";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [artisan, setArtisan] = useState<AdminArtisan | null>(null);
  const [products, setProducts] = useState<AdminArtisanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { formatPrice } = usePricing();
  const { locale: activeLang, t } = useLanguage();
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [artisanData, productsData] = await Promise.all([
          fetchArtisanById(id),
          fetchPublicArtisanProducts(id, { limit: 100 }),
        ]);
        setArtisan(artisanData);
        setProducts(Array.isArray(productsData.data) ? productsData.data : []);
      } catch (err) {
        console.error("Failed to load artisan profile:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-12">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="flex gap-6 mb-12">
            <Skeleton className="h-28 w-28 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t(translations.artisanPage.artisanNotFound)}
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {t(translations.artisanPage.artisanNotFoundDesc)}
          </p>
          <Button asChild>
            <Link href="/community">{t(translations.artisanPage.backToCommunity)}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const getLangText = (text?: any, lang?: string) => {
    if (!text) return "";
    if (typeof text === "string") return text;
    if (lang && text[lang]) return text[lang];
    return text.en || text.rw || text.fr || text.sw || "";
  };

  const hasLang = (text?: any, lang?: string) => {
    return text && typeof text === "object" && text[lang as any];
  };

  const toCartProduct = (product: AdminArtisanProduct): Product => ({
    id: product.id,
    artisanProductId: product.id,
    slug: `artisan-product-${product.id}`,
    name: getLangText(product.name),
    price: product.price || 0,
    image: toAbsoluteArtisanImage(product.image),
    rating: 5,
    category: artisan.specialty,
    unit: "piece",
    stock: product.stock,
  });

  const handleAddToCart = (product: AdminArtisanProduct) => {
    addToCart(toCartProduct(product));
    toast.success(t(translations.artisanPage.addedToCart), {
      description: `${getLangText(product.name)} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = (product: AdminArtisanProduct) => {
    const p = toCartProduct(product);
    if (isInWishlist(p.id)) {
      void removeFromWishlist(p.id);
      toast.info(t(translations.artisanPage.removedWishlist));
    } else {
      void addToWishlist(p);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({ title: artisan.name, text: getLangText(artisan.shortDescription) || artisan.specialty, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success(t(translations.artisanPage.linkCopied));
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
            src={toAbsoluteArtisanImage(artisan.image)}
            alt={artisan.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-foreground/10" />
          <div className="relative container h-full flex items-end pb-8">
            <Link href="/community" className="absolute top-6 left-4 md:left-0 inline-flex items-center gap-1.5 text-card/70 hover:text-card text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> {t(translations.artisanPage.backToCommunity)}
            </Link>
          </div>
        </section>

        {/* Profile Header */}
        <section className="relative -mt-16 pb-8">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-28 h-28 rounded-2xl border-4 border-card overflow-hidden shadow-lg shrink-0 bg-card">
                <img
                  src={toAbsoluteArtisanImage(artisan.image)}
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
                      <Badge className="bg-primary/10 text-primary border-primary/20 border gap-1 text-xs px-2 py-0.5">
                        <Award className="h-3 w-3" /> {artisan.specialty}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {artisan.location || "Rwanda"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleShare}>
                      <Share2 className="h-3.5 w-3.5" /> {t(translations.artisanPage.share)}
                    </Button>
                    <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => setContactOpen(true)}>
                      <MessageCircle className="h-3.5 w-3.5" /> {t(translations.artisanPage.contactTitle)}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {products.length}
                    </span>
                    <span className="text-muted-foreground">{t(translations.artisanPage.productsLabel)}</span>
                  </div>
                  {artisan.isFeatured && (
                    <Badge
                      variant="outline"
                      className="text-xs gap-1 border-amber-500/30 text-amber-600 bg-amber-50"
                    >
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {t(translations.artisanPage.featuredArtisan)}
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
              <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="products" className="gap-1.5 text-sm py-2 rounded-lg">
                  <ShoppingBag className="h-4 w-4 hidden sm:block" /> {t(translations.artisanPage.products)}
                </TabsTrigger>
                <TabsTrigger value="story" className="gap-1.5 text-sm py-2 rounded-lg">
                  <Quote className="h-4 w-4 hidden sm:block" /> {t(translations.artisanPage.story)}
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-1.5 text-sm py-2 rounded-lg">
                  <Shield className="h-4 w-4 hidden sm:block" /> {t(translations.artisanPage.info)}
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    {t(translations.artisanPage.handcraftedProducts)} ({products.length})
                  </h2>
                </div>
                {products.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                    <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t(translations.artisanPage.noProducts)}</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={toAbsoluteArtisanImage(product.image)}
                            alt={product.name.en}
                            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                            onClick={() => setSelectedImage(toAbsoluteArtisanImage(product.image))}
                          />
                          <Badge className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-[10px] border-0 px-2 py-0">
                            {t(translations.artisanPage.handmade)}
                          </Badge>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold font-heading text-foreground mb-1 text-sm">
                            {getLangText(product.name)}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                            {getLangText(product.description) || t(translations.artisanPage.defaultProductDesc)}
                          </p>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-foreground">
                              {formatPrice(product.price || 0)}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Truck className="h-3 w-3" /> {t(translations.artisanPage.locallySourced)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 gap-1.5 text-xs"
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingBag className="h-3.5 w-3.5" /> {t(translations.artisanPage.addToCart)}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3"
                              onClick={() => handleToggleWishlist(product)}
                              aria-label={
                                isInWishlist(product.id)
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              <Heart
                                className={`h-3.5 w-3.5 ${isInWishlist(product.id) ? "fill-primary text-primary" : ""}`}
                              />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Story Tab */}
              <TabsContent value="story" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Story Card */}
                  <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Quote className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold font-heading text-foreground">
                            {t(translations.artisanPage.storyOf)} {artisan.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {artisan.specialty}
                          </p>
                        </div>
                      </div>
                      
                      {/* No language switcher — uses global header language */}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed text-sm mb-6 whitespace-pre-wrap">
                        {getLangText(artisan.fullStory, activeLang) || getLangText(artisan.shortDescription) || t(translations.artisanPage.noStory)}
                      </p>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                    <h3 className="font-semibold text-foreground mb-4">
                      {t(translations.artisanPage.portfolioGallery)}
                    </h3>
                    {products.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-muted-foreground italic">{t(translations.artisanPage.noGallery)}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {products.map((p) => (
                          <img
                            key={p.id}
                            src={toAbsoluteArtisanImage(p.image)}
                            alt={getLangText(p.name)}
                            className="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(toAbsoluteArtisanImage(p.image))}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Craft Process */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold font-heading text-foreground mb-6">
                    {t(translations.artisanPage.craftPromise)}
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-6">
                    {[
                      {
                        step: "1",
                        title: t(translations.artisanPage.step1Title),
                        desc: t(translations.artisanPage.step1Desc),
                      },
                      {
                        step: "2",
                        title: t(translations.artisanPage.step2Title),
                        desc: t(translations.artisanPage.step2Desc),
                      },
                      {
                        step: "3",
                        title: t(translations.artisanPage.step3Title),
                        desc: t(translations.artisanPage.step3Desc),
                      },
                    ].map((s) => (
                      <div key={s.step} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                          {s.step}
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">
                          {s.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
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
                      {t(translations.artisanPage.artisanDetails)}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t(translations.artisanPage.specLabel)}</span>
                        <span className="font-medium text-foreground">
                          {artisan.specialty}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t(translations.artisanPage.locationLabel)}</span>
                        <span className="font-medium text-foreground">
                          {artisan.location || "Rwanda"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t(translations.artisanPage.productsLabel)}</span>
                        <span className="font-medium text-foreground">
                          {products.length} {t(translations.artisanPage.items)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t(translations.artisanPage.memberSince)}</span>
                        <span className="font-medium text-foreground">
                          {artisan.createdAt ? new Date(artisan.createdAt).getFullYear() : "2024"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">{t(translations.artisanPage.statusLabel)}</span>
                        <Badge className="bg-primary/10 text-primary border-primary/20 border text-[10px] px-2 py-0">
                          {artisan.isFeatured ? t(translations.artisanPage.featuredArtisan) : t(translations.artisanPage.verified)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-bold font-heading text-foreground mb-4">
                      {t(translations.artisanPage.shippingAuth)}
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          icon: Truck,
                          title: t(translations.artisanPage.deliveryTitle),
                          desc: t(translations.artisanPage.deliveryDesc),
                        },
                        {
                          icon: Shield,
                          title: t(translations.artisanPage.authenticTitle),
                          desc: t(translations.artisanPage.authenticDesc),
                        },
                        {
                          icon: Package,
                          title: t(translations.artisanPage.customTitle),
                          desc: t(translations.artisanPage.customDesc),
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
                            <p className="text-xs text-muted-foreground italic">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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
              {t(translations.artisanPage.contactDialogDesc)}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(t(translations.artisanPage.messageSent), {
                description: `Your message to ${artisan.name} has been sent. They'll respond within 24 hours.`,
              });
              setContactOpen(false);
            }}
            className="space-y-4 pt-2"
          >
             <div>
              <Label className="text-[11px] mb-1 block">{t(translations.artisanPage.yourName)}</Label>
              <Input required placeholder="Full name" className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">{t(translations.artisanPage.emailLbl)}</Label>
              <Input type="email" required placeholder="you@example.com" className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">{t(translations.artisanPage.subjectLbl)}</Label>
              <Input required placeholder="e.g., Custom order inquiry" className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">{t(translations.artisanPage.messageLbl)}</Label>
              <Textarea required placeholder="Tell the artisan what you're looking for..." rows={4} className="text-xs" />
            </div>
            <Button type="submit" className="w-full gap-1.5 text-xs h-10">
              <MessageCircle className="h-4 w-4" /> {t(translations.artisanPage.sendMessage)}
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
