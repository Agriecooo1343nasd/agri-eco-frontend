"use client";

import { use, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Palette,
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
  type AdminArtisan,
  toAbsoluteArtisanImage,
} from "@/lib/api/artisans";
import { fetchProducts, type AdminProduct } from "@/lib/api/products";
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
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const { formatPrice } = usePricing();
  const { locale: activeLang, t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "default");
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 100000,
  ]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [onlyDiscounted, setOnlyDiscounted] = useState(searchParams.get("onSale") === "true");
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get("rating") ? Number(searchParams.get("rating")) : null
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags") ? searchParams.get("tags")!.split(",") : []
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const itemsPerPage = 6;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state to URL
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(window.location.search);
      let hasChanged = false;

      Object.entries(updates).forEach(([key, value]) => {
        const currentValue = params.get(key);
        const newValue = (value === null || value === "" || value === "All" || (key === "page" && value === "1")) ? null : value;
        
        if (currentValue !== newValue) {
          if (newValue === null) {
            params.delete(key);
          } else {
            params.set(key, newValue);
          }
          hasChanged = true;
        }
      });

      if (hasChanged) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    updateQueryParams({
      search: debouncedSearch,
      sort: sortBy === "default" ? null : sortBy,
      minPrice: priceRange[0] === 0 ? null : priceRange[0].toString(),
      maxPrice: priceRange[1] === 100000 ? null : priceRange[1].toString(),
      category: selectedCategory,
      onSale: onlyDiscounted ? "true" : null,
      rating: selectedRating?.toString() || null,
      tags: selectedTags.length > 0 ? selectedTags.join(",") : null,
      page: currentPage.toString(),
    });
  }, [debouncedSearch, sortBy, priceRange, selectedCategory, onlyDiscounted, selectedRating, selectedTags, currentPage, updateQueryParams]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [artisanData, productsData] = await Promise.all([
          fetchArtisanById(id),
          fetchProducts({ artisanId: id, limit: 100 }),
        ]);
        setArtisan(artisanData);
        setProducts(productsData.data || []);
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

  const toCartProduct = (product: AdminProduct): Product => ({
    id: product.id,
    slug: product.slug,
    name: getLangText(product.name),
    price: product.sellingPrice || 0,
    oldPrice: product.originalPrice,
    image: product.images?.[0]?.url || "/assets/products/placeholder.jpg",
    rating: product.averageRating || 5,
    category: product.category?.name || artisan?.specialty || "Artisan",
    unit: product.unit || "piece",
    stock: product.stock,
    ownerName: artisan?.name,
    ownerHref: artisan?.id ? `/community/artisan/${artisan.id}` : undefined,
    source: product.source,
    artisan: product.artisan,
  });

  const artisanCategories = useMemo(() => {
    const cats = new Map<string, number>();
    cats.set("All", products.length);
    products.forEach((p) => {
      const cat = p.category?.name || artisan?.specialty || "General";
      cats.set(cat, (cats.get(cat) || 0) + 1);
    });
    return Array.from(cats.entries());
  }, [products, artisan]);

  const artisanTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => tags.add(t));
      }
    });
    return Array.from(tags);
  }, [products]);

  const shopStyleProducts = useMemo(() => {
    if (!artisan) return [];
    const q = search.trim().toLowerCase();
    let rows = products.filter((p) => {
      const name = getLangText(p.name).toLowerCase();
      const desc = getLangText(p.description).toLowerCase();
      const cat = p.category?.name || artisan?.specialty || "General";
      
      const matchesRating = !selectedRating || (p.averageRating || 5) >= selectedRating;
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => p.tags?.includes(tag));
      
      return (
        (!q || name.includes(q) || desc.includes(q)) &&
        (p.sellingPrice || 0) >= priceRange[0] &&
        (p.sellingPrice || 0) <= priceRange[1] &&
        (selectedCategory === "All" || cat === selectedCategory) &&
        matchesRating &&
        matchesTags
      );
    });
    if (sortBy === "price-low")
      rows = [...rows].sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
    if (sortBy === "price-high")
      rows = [...rows].sort((a, b) => (b.sellingPrice || 0) - (a.sellingPrice || 0));
    if (sortBy === "name")
      rows = [...rows].sort((a, b) =>
        getLangText(a.name).localeCompare(getLangText(b.name)),
      );
    return rows.map((p) => toCartProduct(p));
  }, [artisan, products, search, sortBy, priceRange, selectedCategory, onlyDiscounted, selectedRating, selectedTags]);

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
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" asChild>
                      <Link href="/account/artisan/apply">
                        <Palette className="h-3.5 w-3.5" /> {t(translations.communityPage.applyArtisanBtn)}
                      </Link>
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
                <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
                  {/* Sidebar - Always Visible */}
                  <aside className="lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 overflow-y-auto custom-scrollbar">
                    <div className="bg-card border border-border rounded-xl p-5 space-y-8">
                      {/* Search */}
                      <div className="space-y-3">
                        <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                          <span className="w-1 h-5 bg-primary rounded-full" />
                          {t(translations.shop.searchHeading)}
                        </h3>
                        <div className="flex border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30">
                          <input
                            type="text"
                            placeholder={t(translations.shop.searchPlaceholder)}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 px-3 py-2 bg-background text-foreground text-xs outline-none placeholder:text-muted-foreground"
                          />
                          <button className="bg-primary text-primary-foreground px-3 hover:bg-primary/90 transition-colors">
                            <Search className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="space-y-3">
                        <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                          <span className="w-1 h-5 bg-primary rounded-full" />
                          {t(translations.shop.categoriesHeading)}
                        </h3>
                        <div className="mb-2">
                          <input
                            type="text"
                            placeholder={t(translations.shop.filterCategories)}
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                        <ul className="space-y-1">
                          {artisanCategories
                            .filter(([name]) => name.toLowerCase().includes(categorySearch.toLowerCase()))
                            .map(([name, count]) => (
                            <li key={name}>
                              <button
                                onClick={() => {
                                  setSelectedCategory(name);
                                  setCurrentPage(1);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                                  selectedCategory === name
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                              >
                                <span>{name}</span>
                                <span className={`opacity-70 ${selectedCategory === name ? "text-primary-foreground/70" : "text-muted-foreground"}`}>({count})</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price Filter */}
                      <div className="space-y-3">
                        <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                          <span className="w-1 h-5 bg-primary rounded-full" />
                          {t(translations.shop.priceHeading)}
                        </h3>
                        <div className="px-1">
                          <Slider
                            min={0}
                            max={100000}
                            step={1000}
                            value={priceRange}
                            onValueChange={(val) => {
                              setPriceRange(val);
                              setCurrentPage(1);
                            }}
                            className="mb-3"
                          />
                          <div className="text-[11px] text-muted-foreground font-medium">
                            {t(translations.shop.priceLabel)}{" "}
                            <span className="text-foreground">{formatPrice(priceRange[0])}</span>
                            {" — "}
                            <span className="text-foreground">{formatPrice(priceRange[1])}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating Filter */}
                      <div className="space-y-3">
                        <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                          <span className="w-1 h-5 bg-primary rounded-full" />
                          {t(translations.shop.ratingHeading)}
                        </h3>
                        <div className="space-y-1">
                          {[5, 4, 3, 2, 1, 0].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => {
                                setSelectedRating(selectedRating === rating ? null : rating);
                                setCurrentPage(1);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                                selectedRating === rating
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>{rating} {rating !== 1 ? t(translations.shop.stars) : t(translations.shop.star)}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Discount Filter */}
                      <div className="space-y-3">
                        <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                          <span className="w-1 h-5 bg-primary rounded-full" />
                          {t(translations.shop.specialOffersHeading)}
                        </h3>
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs cursor-pointer hover:bg-accent transition-colors">
                          <input
                            type="checkbox"
                            checked={onlyDiscounted}
                            onChange={(e) => {
                              setOnlyDiscounted(e.target.checked);
                              setCurrentPage(1);
                            }}
                            className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                          />
                          <span className="font-medium text-foreground">
                            {t(translations.shop.discountedProducts)}
                          </span>
                        </label>
                      </div>

                      {/* Popular Tags */}
                      <div className="space-y-3">
                        <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                          <span className="w-1 h-5 bg-primary rounded-full" />
                          {t(translations.shop.popularTagsHeading)}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {artisanTags.length > 0 ? (
                            artisanTags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => {
                                  setSelectedTags(prev => 
                                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                  );
                                  setCurrentPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-colors border ${
                                  selectedTags.includes(tag)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                                }`}
                              >
                                {tag}
                              </button>
                            ))
                          ) : (
                            <p className="text-[10px] text-muted-foreground italic">{t(translations.shop.noTags)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Main Grid Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-8">
                      {/* Toolbar/Sort */}
                      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-xl p-4">
                        <h2 className="text-xl font-bold font-heading text-foreground">
                          {t(translations.artisanPage.handcraftedProducts)} ({shopStyleProducts.length})
                        </h2>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t(translations.artisanPage.sortBy)}:</span>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-8 text-xs min-w-[140px] rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                              <SelectItem value="default">{t(translations.shop.sortDefault)}</SelectItem>
                              <SelectItem value="name">{t(translations.artisanPage.sortNameAZ)}</SelectItem>
                              <SelectItem value="price-low">{t(translations.shop.sortPriceLowHigh)}</SelectItem>
                              <SelectItem value="price-high">{t(translations.shop.sortPriceHighLow)}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {shopStyleProducts.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/20">
                          <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-foreground">{t(translations.artisanPage.noProducts)}</h3>
                          <p className="text-sm text-muted-foreground mt-2">{t(translations.shop.noProductsFound)}</p>
                          <Button 
                            variant="outline" 
                            className="mt-6"
                            onClick={() => {
                              setSearch("");
                              setSelectedCategory("All");
                              setPriceRange([0, 100000]);
                              setSelectedRating(null);
                              setSelectedTags([]);
                              setOnlyDiscounted(false);
                            }}
                          >
                            {t(translations.artisanPage.clearFilters)}
                          </Button>
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
                          <MessageCircle className="h-4 w-4 text-primary" /> {t(translations.artisanPage.contactDetails)}
                        </h4>
                        <div className="space-y-2 text-sm">
                          {artisan.phone && <p className="text-muted-foreground">{t(translations.artisanPage.phone)}: <span className="text-foreground font-medium">{artisan.phone}</span></p>}
                          {artisan.email && <p className="text-muted-foreground">{t(translations.artisanPage.email)}: <span className="text-foreground font-medium">{artisan.email}</span></p>}
                        </div>
                      </div>
                    </div>
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

                  <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Verified Artisan</h4>
                      <p className="text-sm text-muted-foreground max-w-[280px]">
                        This artisan has been personally verified by Agri-Eco for quality, authenticity, and sustainable practices.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Official Artisan</Badge>
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
