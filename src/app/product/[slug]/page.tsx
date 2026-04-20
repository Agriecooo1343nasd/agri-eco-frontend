"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus,
  ChevronRight,
  Check,
  Clock,
  ShieldCheck,
  MessageSquare,
  Play,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fetchProductBySlug } from "@/lib/api/products";
import {
  createReview,
  fetchProductReviews,
  type Review,
} from "@/lib/api/reviews";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { addToCart, removeFromCart, addToWishlist, isInWishlist, isInCart } =
    useCart();
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // DIAGNOSTIC LOGGING: Tracking the source of those -29% discounts
  // Respecting Rules of Hooks by keeping this at the top level
  useEffect(() => {
    if (product) {
      const computedDiscount = product.oldPrice
        ? Math.round(
            ((product.oldPrice - product.price) / product.oldPrice) * 100,
          )
        : 0;
      console.log(`[DISCOUNT_DEBUG] Product: ${product.name}`);
      console.log(`[DISCOUNT_DEBUG] Price: ${product.price}`);
      console.log(`[DISCOUNT_DEBUG] Old Price: ${product.oldPrice}`);
      console.log(`[DISCOUNT_DEBUG] Badge: ${product.badge}`);
      console.log(`[DISCOUNT_DEBUG] Backend Label: ${product.backendDiscountLabel}`);
      console.log(`[DISCOUNT_DEBUG] Raw Discounts:`, product.applicableDiscounts);
      console.log(`[DISCOUNT_DEBUG] Computed Discount: ${computedDiscount}%`);
    }
  }, [product]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await fetchProductBySlug(slug);
        const mappedProduct: Product = {
          id: data.id,
          slug: data.slug,
          name: t(data.name as any),
          price: data.sellingPrice,
          oldPrice: data.originalPrice,
          image: data.images?.[0]?.url || "/assets/products/placeholder.jpg",
          images: data.images?.map((img) => img.url) || [],
          rating:
            typeof data.averageRating === "number" ? data.averageRating : 0,
          badge: data.isOnSale ? "sale" : data.isFeatured ? "new" : undefined,
          backendDiscountLabel: data.discount
            ? (data.discount.type === "percentage" ? `-${data.discount.value}% Off` : data.discount.name)
            : (data.applicableDiscounts && data.applicableDiscounts.length > 0
              ? `-${data.applicableDiscounts[0].value}% Off`
              : undefined),
          category: t(data.category?.name as any) || "",
          unit: data.unit || "piece",
          shortDescription: t(data.shortDescription as any),
          longDescription: t(data.description as any),
          features: Array.isArray(data.features)
            ? data.features.map((f) => t(f as any))
            : [],
          benefits: Array.isArray(data.benefits)
            ? data.benefits.map((b) => t(b as any))
            : [],
          stock: data.stock,
          reviews: [],
          applicableDiscounts: data.applicableDiscounts,
        };
        setProduct(mappedProduct);
        setSelectedImage(mappedProduct.image);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    window.scrollTo(0, 0);
  }, [slug, t]);

  useEffect(() => {
    async function loadReviews() {
      if (!product?.id) {
        setReviews([]);
        return;
      }
      try {
        setLoadingReviews(true);
        const result = await fetchProductReviews(product.id, {
          page: 1,
          limit: 50,
        });
        setReviews(result.data ?? []);
      } catch {
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    }
    void loadReviews();
  }, [product?.id]);

  const inCart = product ? isInCart(product.id) : false;
  const wishlisted = product ? isInWishlist(product.id) : false;

  const handleQuantityChange = (val: number) => {
    if (!product) return;
    if (val >= 1 && val <= (product.stock || 99)) {
      setQuantity(val);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const myReview = user?.id ? reviews.find((r) => r.userId === user.id) : null;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to submit a review.");
      router.push(`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`);
      return;
    }
    if (reviewComment.trim().length < 10) {
      toast.error("Review too short", {
        description: "Please write at least 10 characters.",
      });
      return;
    }
    try {
      setSubmittingReview(true);
      await createReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success("Review submitted", {
        description: "Thanks! It will be visible after moderation.",
      });
      setReviewComment("");
      setReviewRating(5);
      const result = await fetchProductReviews(product.id, { page: 1, limit: 50 });
      setReviews(result.data ?? []);
    } catch (err: any) {
      toast.error("Could not submit review", {
        description:
          err?.response?.data?.message || err?.message || "Please try again.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-10 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">{error || t(translations.productPage.productNotFound)}</h2>
            <Link href="/shop" className="text-primary hover:underline">
              {t(translations.productPage.returnToShop)}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              {t(translations.productPage.home)}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/shop" className="hover:text-primary transition-colors">
              {t(translations.productPage.shop)}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column: Product Media */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-white group">
              <Image
                src={selectedImage || product.image}
                alt={product.name}
                fill
                priority
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
              {product.badge && product.badge !== "organic" && (
                <span
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    product.badge === "sale"
                      ? "bg-badge-sale text-white"
                      : "bg-badge-new text-white"
                  }`}
                >
                  {product.badge === "sale"
                    ? product.backendDiscountLabel || `-${discount}% Off`
                    : product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img
                        ? "border-primary outline outline-offset-1 outline-primary/30"
                        : "border-border grayscale-[0.5] hover:grayscale-0"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumb ${idx}`}
                      fill
                      className="object-cover p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  {product.category}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < product.rating ? "fill-secondary text-secondary" : "text-border"}`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({reviews.length} {t(translations.productPage.customerReviews)})
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-heading">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                <span className="text-muted-foreground">/ {product.unit}</span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.shortDescription ||
                  "Fresh, high-quality organic product sourced directly from local farmers."}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{t(translations.productPage.inStock)}</span>
                  <span className="text-muted-foreground">
                    {product.stock || 0} {t(translations.productPage.unitsAvailable)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{t(translations.productPage.delivery)}</span>
                  <span className="text-muted-foreground">
                    {t(translations.productPage.deliveryTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    {t(translations.productPage.guarantee)}
                  </span>
                  <span className="text-muted-foreground">
                    {t(translations.productPage.organicCertified)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-border rounded-lg h-12 bg-muted/20">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-4 hover:text-primary transition-colors disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-12 text-center bg-transparent border-none focus:ring-0 font-bold"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-4 hover:text-primary transition-colors disabled:opacity-30"
                    disabled={quantity >= (product.stock || 99)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  onClick={() =>
                    inCart ? removeFromCart(product.id) : handleAddToCart()
                  }
                  className={`h-12 px-8 flex-1 sm:flex-none gap-2 font-bold text-lg rounded-xl shadow-lg transition-all active:scale-95 ${
                    inCart
                      ? "bg-accent text-accent-foreground hover:bg-accent/80 shadow-none border border-border"
                      : "bg-primary text-primary-foreground hover:shadow-primary/40 shadow-primary/20"
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {inCart ? t(translations.productPage.addedToCart) : t(translations.productPage.addToCart)}
                </Button>

                <button
                  onClick={() => addToWishlist(product)}
                  className={`h-12 w-12 flex items-center justify-center border border-border rounded-xl transition-all hover:bg-accent ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "text-muted-foreground"}`}
                >
                  <Heart
                    className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`}
                  />
                </button>

                <button className="h-12 w-12 flex items-center justify-center border border-border rounded-xl text-muted-foreground transition-all hover:bg-accent">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground inline-block w-20">
                  SKU:
                </span>
                {product.slug?.toUpperCase() || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-bold text-foreground inline-block w-20">
                  Category:
                </span>
                {product.category}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16 bg-card rounded-3xl border border-border overflow-hidden">
          <Tabs defaultValue="description" className="w-full">
            <div className="border-b border-border bg-muted/20">
              <TabsList className="h-16 w-full flex justify-center sm:justify-start sm:px-8 bg-transparent gap-4">
                <TabsTrigger
                  value="description"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold h-10 px-6 rounded-lg transition-all"
                >
                  {t(translations.productPage.description)}
                </TabsTrigger>
                {((product.features && product.features.length > 0) || (product.benefits && product.benefits.length > 0)) && (
                  <TabsTrigger
                    value="additional"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold h-10 px-6 rounded-lg transition-all"
                  >
                    {t(translations.productPage.highlights)}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold h-10 px-6 rounded-lg transition-all"
                >
                  {t(translations.productPage.reviews)} ({reviews.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent
                value="description"
                className="mt-0 focus-visible:ring-0"
              >
                <div className="prose prose-green max-w-none">
                  <h3 className="text-xl font-bold mb-4">{t(translations.productPage.productDetails)}</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.longDescription ||
                      "No detailed description available for this product yet. Rest assured, all our products are hand-picked for quality and freshness."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent
                value="additional"
                className="mt-0 focus-visible:ring-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {product.features && product.features.length > 0 && (
                    <div className="bg-primary/5 p-6 rounded-2xl">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" /> {t(translations.productPage.features)}
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {product.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.benefits && product.benefits.length > 0 && (
                    <div className="bg-primary/5 p-6 rounded-2xl">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" /> {t(translations.productPage.benefits)}
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {product.benefits.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="reviews"
                className="mt-0 focus-visible:ring-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {t(translations.productPage.clientReviews)}
                    </h3>

                    {loadingReviews ? (
                      <div className="bg-muted/20 p-8 rounded-2xl text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading reviews...</p>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-8">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border-b border-border pb-8 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                  {(review.user?.username || "G").charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-foreground">
                                    {review.user?.username || "Guest"}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < review.rating ? "fill-secondary text-secondary" : "text-border"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed italic">
                              "{review.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted/20 p-8 rounded-2xl text-center">
                        <p className="text-muted-foreground">
                          {t(translations.productPage.noReviews)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/20 p-8 rounded-2xl h-fit border border-border">
                    <h3 className="text-xl font-bold mb-6 text-foreground">
                      {t(translations.productPage.addReview)}
                    </h3>
                    {!isAuthenticated ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {t(translations.productPage.signToReviewPrompt)}
                        </p>
                        <Button asChild className="w-full h-11 rounded-xl font-bold">
                          <Link href={`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`}>
                            {t(translations.productPage.signInToReview)}
                          </Link>
                        </Button>
                      </div>
                    ) : myReview ? (
                      <div className="rounded-lg border border-border p-4 bg-background">
                        <p className="text-sm font-semibold text-foreground">
                          {t(translations.productPage.alreadyReviewed)} ({myReview.rating}/5)
                        </p>
                        {[myReview.title, myReview.comment].filter(Boolean).length > 0 ? (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {[myReview.title, myReview.comment].filter(Boolean).join(" — ")}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                    <form onSubmit={handleAddReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          {t(translations.productPage.rating)}
                        </label>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewRating(i + 1)}
                              className="text-border hover:text-secondary transition-colors"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  i < reviewRating
                                    ? "fill-secondary text-secondary"
                                    : "text-border"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          {t(translations.productPage.reviews)}
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full rounded-lg border border-input px-3 py-2 text-sm h-32 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                          placeholder={t(translations.productPage.reviewPlaceholder)}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submittingReview || reviewComment.trim().length < 10}
                        className="w-full font-bold h-12 rounded-xl"
                      >
                        {submittingReview ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t(translations.productPage.submitting)}
                          </span>
                        ) : (
                          t(translations.productPage.submitReview)
                        )}
                      </Button>
                    </form>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
