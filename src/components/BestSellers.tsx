"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { resolveProductDiscountLabel } from "@/lib/discount-display";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategoriesForAdmin } from "@/lib/api/products";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

const BestSellers = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("Best Deals");

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCats } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => fetchCategoriesForAdmin(),
  });

  const categories = categoriesData?.data || [];
  const tabs = ["Best Deals", ...categories.map((c) => t(c.name)), "All Products"];

  // Fetch Products based on active tab
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["home-products", activeTab],
    queryFn: () => {
      const params: any = { limit: 10 };
      if (activeTab === "Best Deals") {
        // Assuming backend has a way to filter for sales or we filter locally
        // For now, let's just fetch all and we'll see if backend supports ?isOnSale=true
        params.isOnSale = "true";
      } else if (activeTab !== "All Products") {
        const cat = categories.find((c) => c.name === activeTab);
        if (cat) params.category = cat.id;
      }
      return fetchProducts(params);
    },
    // Only fetch products once we have categories (unless it's Best Deals or All Products)
    enabled: activeTab === "Best Deals" || activeTab === "All Products" || categories.length > 0,
  });

  const products = productsData?.data || [];

  return (
    <section id="products" className="py-12 md:py-16">
      <div className="container">
        <h2 className="section-heading">{t(translations.sections.ourProducts.title)}</h2>
        <p className="section-subheading">
          {t(translations.sections.ourProducts.sub)}
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {isLoadingCats ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))
          ) : (
            tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {tab === "Best Deals" ? t(translations.sections.ourProducts.bestDeals) : tab === "All Products" ? t(translations.sections.ourProducts.allProducts) : tab}
              </button>
            ))
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-8">
          {isLoadingProducts
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))
            : products.map((product) => {
                // Map AdminProduct to ProductCard expected type
                const backendDiscountLabel = resolveProductDiscountLabel({
                  discount: product.discount,
                  applicableDiscounts: product.applicableDiscounts,
                });
                const mappedProduct = {
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.sellingPrice,
                  oldPrice: product.originalPrice > product.sellingPrice ? product.originalPrice : undefined,
                  image: product.images?.[0]?.url || "/assets/products/placeholder.jpg",
                  rating: product.averageRating || 5,
                  badge: backendDiscountLabel
                    ? "sale"
                    : product.isFeatured
                      ? "new"
                      : undefined,
                  backendDiscountLabel,
                  category: product.category?.name || "Organic",
                  unit: product.unit || "kg",
                  ownerName: product.id.endsWith("1") ? "Artisan Collective" : undefined,
                  ownerHref: product.id.endsWith("1") ? "/artisan/a7bfa9eb-4980-4ea4-814c-b74c05e0ccee" : undefined,
                };
                return <ProductCard key={product.id} product={mappedProduct as any} />;
              })}
        </div>

        {!isLoadingProducts && products.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            {t(translations.sections.ourProducts.noneFound)}
          </p>
        )}

        <div className="mt-12 text-center">
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 group"
            >
                {t(translations.sections.ourProducts.exploreShop)} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
