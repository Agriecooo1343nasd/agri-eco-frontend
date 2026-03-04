"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturesBar from "@/components/FeaturesBar";
import ShopProductCard from "@/components/ShopProductCard";
import { products } from "@/data/products";
import { deals } from "@/data/deals";
import { Slider } from "@/components/ui/slider";

const allCategories = ["All", "Fruits", "Vegetables", "Honey"];
const popularTags = [
  "Nature",
  "Organic",
  "Health",
  "Fresh",
  "Vegan",
  "Bio",
  "Farm",
  "Green",
  "Local",
  "Diet",
];

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "rating"
  | "name-az"
  | "name-za";

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dealId = searchParams.get("deal");
  const categoryParam = searchParams.get("category");

  const activeDeal = dealId ? deals.find((d) => d.id === dealId) : null;

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "All",
  );
  const [priceRange, setPriceRange] = useState<number[]>([0, 15]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [gridView, setGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync category param
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const itemsPerPage = 9;

  const filtered = useMemo(() => {
    let result = [...products];

    // Deal filter
    if (activeDeal) {
      result = result.filter((p) => activeDeal.productIds.includes(p.id));
    }

    // Category
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Price
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name-az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-za":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [selectedCategory, priceRange, sortBy, searchQuery, activeDeal]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const topRated = useMemo(
    () => products.filter((p) => p.rating === 5).slice(0, 3),
    [],
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 15]);
    setSearchQuery("");
    setSelectedTags([]);
    setSortBy("default");
    setCurrentPage(1);
    router.push(pathname);
  };

  const clearDeal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("deal");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 15 ||
    searchQuery.trim() !== "" ||
    !!activeDeal;

  const pageTitle = activeDeal ? `Deal: ${activeDeal.title}` : "Shop";

  // Sidebar content
  const sidebarContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Search Products
        </h3>
        <div className="flex border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30">
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-3 py-2 bg-background text-foreground text-sm outline-none placeholder:text-muted-foreground"
          />
          <button className="bg-primary text-primary-foreground px-3 hover:bg-primary/90 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Product Categories
        </h3>
        <ul className="space-y-1">
          {allCategories.map((cat) => {
            const count =
              cat === "All"
                ? products.length
                : products.filter((p) => p.category === cat).length;
            return (
              <li key={cat}>
                <button
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedCategory === cat ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-accent hover:text-accent-foreground"}`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-xs ${selectedCategory === cat ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    ({count})
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Filter by Price
        </h3>
        <div className="px-1">
          <Slider
            value={priceRange}
            onValueChange={(val) => {
              setPriceRange(val);
              setCurrentPage(1);
            }}
            min={0}
            max={15}
            step={0.5}
            className="mb-3"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Price:{" "}
              <span className="font-semibold text-foreground">
                ${priceRange[0].toFixed(2)}
              </span>{" "}
              —{" "}
              <span className="font-semibold text-foreground">
                ${priceRange[1].toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Rated */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Top Rated Products
        </h3>
        <div className="space-y-3">
          {topRated.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="flex gap-3 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {p.name}
                </h4>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < p.rating ? "fill-secondary text-secondary" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold text-primary mt-0.5">
                  ${p.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent to-primary/5 border-b border-border">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            {activeDeal ? (
              <>
                <Link
                  href="/deals"
                  className="hover:text-primary transition-colors"
                >
                  Hot Deals
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-primary font-semibold">
                  {activeDeal.title}
                </span>
              </>
            ) : (
              <span className="text-primary font-semibold">Shop</span>
            )}
          </div>
          {activeDeal && (
            <div className="mt-3 flex items-center gap-3">
              <span className="bg-badge-sale text-card text-xs font-bold uppercase px-3 py-1 rounded-full">
                {activeDeal.discount}
              </span>
              <p className="text-sm text-muted-foreground">
                {activeDeal.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 md:py-12">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-36 bg-card border border-border rounded-xl p-5">
              {sidebarContent}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGridView(true)}
                    className={`p-2 transition-colors ${gridView ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent"}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGridView(false)}
                    className={`p-2 transition-colors ${!gridView ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-accent"}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {paginatedProducts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {filtered.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="default">Default sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="name-az">Name: A to Z</option>
                  <option value="name-za">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground font-semibold">
                  Active:
                </span>
                {activeDeal && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    Deal: {activeDeal.title}
                    <button onClick={clearDeal}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== "All" && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    {selectedCategory}
                    <button onClick={() => handleCategoryChange("All")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] !== 0 || priceRange[1] !== 15) && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    ${priceRange[0]}–${priceRange[1]}
                    <button onClick={() => setPriceRange([0, 15])}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid / List */}
            {paginatedProducts.length > 0 ? (
              <div
                className={
                  gridView
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {paginatedProducts.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    listView={!gridView}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No products found.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-accent"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/50 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card z-50 lg:hidden overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-heading font-bold text-foreground">
                Filters
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">{sidebarContent}</div>
          </div>
        </>
      )}

      <FeaturesBar />
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading shop...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
