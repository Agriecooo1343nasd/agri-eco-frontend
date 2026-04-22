"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePricing } from "@/context/PricingContext";
import type { Product } from "@/components/ProductCard";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShoppingBag,
  MessageCircle,
  Share2,
  Award,
  Package,
  Truck,
  Shield,
  Quote,
  Search,
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
import ShopProductCard from "@/components/ShopProductCard";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  
  const { formatPrice } = usePricing();
  const { locale: activeLang, t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const getLangText = (text?: any, lang?: string) => {
    if (!text) return "";
    if (typeof text === "string") return text;
    if (lang && text[lang]) return text[lang];
    return text.en || text.rw || text.fr || text.sw || "";
  };

  const toCartProduct = (product: AdminArtisanProduct): Product => ({
    id: product.id,
    artisanProductId: product.id,
    slug: `artisan-product-${product.id}`,
    name: getLangText(product.name),
    price: product.price || 0,
    image: toAbsoluteArtisanImage(product.image),
    rating: 5,
    category: artisan?.specialty || "Artisan",
    unit: "piece",
    stock: product.stock,
    ownerName: artisan?.name,
    ownerHref: artisan?.id ? `/artisan/${artisan.id}` : undefined,
  });

  const mockedProducts: AdminArtisanProduct[] = useMemo(
    () =>
      products.length
        ? products
        : [
            {
              id: `mock-${id}-1`,
              artisanId: id,
              name: { en: "Handwoven Basket Set", rw: "", fr: "", sw: "" },
              description: {
                en: "Traditional woven basket crafted by hand.",
                rw: "",
                fr: "",
                sw: "",
              },
              image: "/assets/products/placeholder.jpg",
              price: 18000,
              stock: 12,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as AdminArtisanProduct,
            {
              id: `mock-${id}-2`,
              artisanId: id,
              name: { en: "Clay Pot Collection", rw: "", fr: "", sw: "" },
              description: {
                en: "Decorative clay pots for modern and traditional homes.",
                rw: "",
                fr: "",
                sw: "",
              },
              image: "/assets/products/placeholder.jpg",
              price: 25000,
              stock: 9,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as AdminArtisanProduct,
          ],
    [products, id],
  );

  const artisanCategories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    mockedProducts.forEach((p) => {
      const cat = p.category?.name || artisan?.specialty || "General";
      cats.add(cat);
    });
    return Array.from(cats);
  }, [mockedProducts, artisan]);

  const shopStyleProducts = useMemo(() => {
    if (!artisan) return [];
    const q = search.trim().toLowerCase();
    let rows = mockedProducts.filter((p) => {
      const name = getLangText(p.name).toLowerCase();
      const desc = getLangText(p.description).toLowerCase();
      const cat = p.category?.name || artisan?.specialty || "General";
      
      return (
        (!q || name.includes(q) || desc.includes(q)) &&
        (p.price || 0) >= priceRange[0] &&
        (p.price || 0) <= priceRange[1] &&
        (selectedCategory === "All" || cat === selectedCategory)
      );
    });
    if (sortBy === "price-low")
      rows = [...rows].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === "price-high")
      rows = [...rows].sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === "name")
      rows = [...rows].sort((a, b) =>
        getLangText(a.name).localeCompare(getLangText(b.name)),
      );
    return rows.map((p) => toCartProduct(p));
  }, [artisan, mockedProducts, search, sortBy, priceRange, selectedCategory, onlyDiscounted]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return shopStyleProducts.slice(start, start + itemsPerPage);
  }, [shopStyleProducts, currentPage]);

  const totalPages = Math.ceil(shopStyleProducts.length / itemsPerPage);

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
            <Link href="/artisans">{t(translations.artisanPage.backToCommunity)}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

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
        <section className="relative h-[25vh] min-h-[200px] bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="relative container h-full flex items-end pb-12">
            <Link href="/artisans" className="absolute top-6 left-4 md:left-0 inline-flex items-center gap-1.5 text-primary/60 hover:text-primary text-sm font-medium transition-all group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t(translations.artisanPage.backToCommunity)}
            </Link>
          </div>
        </section>

        {/* Profile Header */}
        <section className="relative -mt-16 pb-8">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-card overflow-hidden shadow-2xl shrink-0 bg-card z-10">
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
                    <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => {
                      const infoTab = document.querySelector('[value="info"]') as HTMLElement;
                      if (infoTab) infoTab.click();
                      document.getElementById('tabs-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
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
        <section id="tabs-section" className="pb-16">

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
                {shopStyleProducts.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                    <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t(translations.artisanPage.noProducts)}</p>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
                    <div className="lg:h-[calc(100vh-120px)] lg:sticky lg:top-24 space-y-6 bg-card border border-border rounded-2xl p-6 overflow-y-auto custom-scrollbar shadow-sm">

                      {/* Search */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-3">{t(translations.shop.searchHeading)}</h3>
                        <div className="relative">
                          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pr-8 text-xs h-9" />
                          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Categories</h3>
                        <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {artisanCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                                selectedCategory === cat
                                  ? "bg-primary/10 text-primary font-semibold"
                                  : "text-muted-foreground hover:bg-muted/50"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort */}
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Sort</h3>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="name">Name A-Z</SelectItem>
                            <SelectItem value="price-low">Price low to high</SelectItem>
                            <SelectItem value="price-high">Price high to low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Range */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Price Range</h3>
                        <Slider min={0} max={100000} step={1000} value={priceRange} onValueChange={setPriceRange} />
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </div>

                      {/* Info Summary for Sidebar */}
                      <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{artisan.location || "Rwanda"}</span>
                        </div>
                        {artisan.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MessageCircle className="h-3.5 w-3.5 text-primary" />
                            <span>{artisan.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-8">
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {paginatedProducts.map((product) => (
                          <ShopProductCard key={product.id} product={product} />
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4 pb-8">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="rounded-xl h-9 w-9 p-0"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <Button
                              key={i}
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(i + 1)}
                              className={`rounded-xl h-9 w-9 p-0 font-bold transition-all ${
                                currentPage === i + 1 
                                  ? "shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)] scale-110" 
                                  : "hover:scale-105"
                              }`}
                            >
                              {i + 1}
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="rounded-xl h-9 w-9 p-0"
                          >
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                          </Button>
                        </div>
                      )}
                    </div>
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

                    <div className="mt-8 pt-8 border-t border-border grid sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" /> {t(translations.artisanPage.locationLabel)}
                        </h4>
                        <p className="text-sm text-muted-foreground">{artisan.location || "Rwanda"}</p>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-primary" /> Contact Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          {artisan.phone && <p className="text-muted-foreground">Phone: <span className="text-foreground font-medium">{artisan.phone}</span></p>}
                          {artisan.email && <p className="text-muted-foreground">Email: <span className="text-foreground font-medium">{artisan.email}</span></p>}
                        </div>
                      </div>
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
                      {artisan.phone && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="font-medium text-foreground">{artisan.phone}</span>
                        </div>
                      )}
                      {artisan.email && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium text-foreground">{artisan.email}</span>
                        </div>
                      )}
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
