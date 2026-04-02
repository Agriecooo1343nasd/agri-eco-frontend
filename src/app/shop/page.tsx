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

import { usePricing } from "@/context/PricingContext";
import { deals } from "@/data/deals";
import { Slider } from "@/components/ui/slider";
import { fetchProducts, type AdminProduct } from "@/lib/api/products";
import { fetchAdminCategories, type AdminCategory } from "@/lib/api/categories";

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
  const { formatPrice } = usePricing();

  // Backend state
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsTotal, setProductsTotal] = useState(0);
  const [tags, setTags] = useState<string[]>([]);

  const dealId = searchParams.get("deal");
  const categoryParam = searchParams.get("category");

  const activeDeal = dealId ? deals.find((d) => d.id === dealId) : null;

  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "All",
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 15]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const searchParam = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync category/search params
  // Sync category/search params only if they differ from state
  useEffect(() => {
    if (categoryParam && selectedCategory !== categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam);
    }
  }, [categoryParam, searchParam, selectedCategory, searchQuery]);

  // Pagination
  const itemsPerPage = 9;
  const totalPages = Math.ceil(productsTotal / itemsPerPage);
  // Map backend products to UI Product type
  const paginatedProducts = useMemo(
    () =>
      products.map((p) => {
        let badge: "sale" | "new" | "organic" | undefined = undefined;
        let backendDiscountLabel: string | undefined = undefined;

        if (p.applicableDiscounts && p.applicableDiscounts.length > 0) {
          badge = "sale";
          const firstDiscount = p.applicableDiscounts[0];
          backendDiscountLabel =
            firstDiscount.type === "percentage"
              ? `-${firstDiscount.value}% OFF`
              : `Sale!`;
        } else if (p.isOnSale) {
          badge = "sale";
        } else if (p.isFeatured) {
          badge = "new";
        }

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.sellingPrice,
          oldPrice: p.originalPrice,
          backendDiscountLabel,
          image:
            p.images && p.images.length > 0
              ? p.images[0].url
              : "/assets/products/placeholder.jpg",
          images: p.images ? p.images.map((img) => img.url) : [],
          rating: typeof p.averageRating === "number" ? p.averageRating : 0,
          badge,
          category: p.category?.name || "",
          unit: p.unit || "",
          shortDescription: p.shortDescription || "",
          longDescription: p.description || "",
          stock: p.stock,
        };
      }),
    [products],
  );

  // Fetch categories from backend (using shared API)
  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setCategoriesLoading(true);
      try {
        const data = await fetchAdminCategories({
          limit: 100,
          search: categorySearch || undefined,
          isActive: "true",
          sort: "name",
          order: "asc",
        });
        if (!ignore) {
          setCategories([
            { id: "All", name: "All" } as AdminCategory,
            ...(data.data || []),
          ]);
        }
      } finally {
        if (!ignore) setCategoriesLoading(false);
      }
    };
    fetch();
    return () => {
      ignore = true;
    };
  }, [categorySearch]);

  // Fetch products from backend (using shared API)
  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setProductsLoading(true);
      let sort: "sellingPrice" | "averageRating" | "name" | undefined =
        undefined;
      let order: "asc" | "desc" | undefined = undefined;
      switch (sortBy) {
        case "price-low":
          sort = "sellingPrice";
          order = "asc";
          break;
        case "price-high":
          sort = "sellingPrice";
          order = "desc";
          break;
        case "rating":
          sort = "averageRating";
          order = "desc";
          break;
        case "name-az":
          sort = "name";
          order = "asc";
          break;
        case "name-za":
          sort = "name";
          order = "desc";
          break;
        default:
          break;
      }
      try {
        const data = await fetchProducts({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          category:
            selectedCategory && selectedCategory !== "All"
              ? selectedCategory
              : undefined,
          sort,
          order,
        });
        if (!ignore) {
          const inStockProducts = (data.data || []).filter(
            (product) => Number(product.stock ?? 0) > 0,
          );
          setProducts(inStockProducts);
          setProductsTotal(inStockProducts.length);
          // Aggregate tags from products
          const tagSet = new Set<string>();
          (data.data || []).forEach((p: AdminProduct) => {
            if (Array.isArray(p.tags))
              p.tags.forEach((t: string) => tagSet.add(t));
          });
          setTags(Array.from(tagSet));
        }
      } finally {
        if (!ignore) setProductsLoading(false);
      }
    };
    fetch();
    return () => {
      ignore = true;
    };
  }, [
    selectedCategory,
    searchQuery,
    priceRange,
    selectedTags,
    selectedRating,
    onlyWithDiscount,
    sortBy,
    currentPage,
  ]);

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

  // Handle search input and sync with URL
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
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
    setSelectedRating(null);
    setOnlyWithDiscount(false);
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
    selectedRating !== null ||
    onlyWithDiscount ||
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-background text-foreground text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchChange(searchQuery);
            }}
          />
          <button
            className="bg-primary text-primary-foreground px-3 hover:bg-primary/90 transition-colors"
            onClick={() => handleSearchChange(searchQuery)}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Categories with search and max 5 display */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Product Categories
        </h3>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Filter categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul className="space-y-1">
          {categoriesLoading ? (
            <li className="text-muted-foreground text-sm">Loading...</li>
          ) : (
            categories
              .filter((cat) =>
                cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
              )
              .slice(0, 5)
              .map((cat) => {
                const count =
                  cat.id === "All"
                    ? productsTotal
                    : products.filter((p) => p.category?.id === cat.id).length;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-accent hover:text-accent-foreground"}`}
                    >
                      <span>{cat.name}</span>
                      <span
                        className={`text-xs ${selectedCategory === cat.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        ({count})
                      </span>
                    </button>
                  </li>
                );
              })
          )}
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
                {formatPrice(priceRange[0])}
              </span>{" "}
              —{" "}
              <span className="font-semibold text-foreground">
                {formatPrice(priceRange[1])}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          By Rating
        </h3>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1, 0].map((star) => (
            <button
              key={star}
              onClick={() => {
                setSelectedRating(selectedRating === star ? null : star);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${selectedRating === star ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < star ? "fill-secondary text-secondary" : "text-border"}`}
                  />
                ))}
              </div>
              <span>
                {star} Star{star !== 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Discount Filter */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Special Offers
        </h3>
        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-accent transition-colors">
          <input
            type="checkbox"
            checked={onlyWithDiscount}
            onChange={(e) => {
              setOnlyWithDiscount(e.target.checked);
              setCurrentPage(1);
            }}
            className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
          />
          <span className="font-medium text-foreground">
            Discounted Products
          </span>
        </label>
      </div>

      {/* Popular Tags */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <span className="text-muted-foreground text-xs">No tags found</span>
          ) : (
            tags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`}
              >
                {tag}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb Banner */}
      <div className="bg-linear-to-r from-primary/10 via-accent to-primary/5 border-b border-border">
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
                    {productsTotal}
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
                    {categories.find((cat) => cat.id === selectedCategory)
                      ?.name || selectedCategory}
                    <button onClick={() => handleCategoryChange("All")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] !== 0 || priceRange[1] !== 15) && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <button onClick={() => setPriceRange([0, 15])}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedRating !== null && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    {selectedRating} Stars
                    <button onClick={() => setSelectedRating(null)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {onlyWithDiscount && (
                  <span className="flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-semibold">
                    On Sale
                    <button onClick={() => setOnlyWithDiscount(false)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid / List */}
            {productsLoading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  Loading products...
                </p>
              </div>
            ) : paginatedProducts.length > 0 ? (
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
