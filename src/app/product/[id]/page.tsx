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
} from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { addToCart, removeFromCart, addToWishlist, isInWishlist, isInCart } =
    useCart();
  const { formatPrice } = usePricing();

  const product = products.find((p) => p.id === Number(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const inCart = product ? isInCart(product.id) : false;

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-10 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <Link href="/shop" className="text-primary hover:underline">
              Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQuantityChange = (val: number) => {
    if (val >= 1 && val <= (product.stock || 99)) {
      setQuantity(val);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Review submitted", {
      description:
        "Thank you for your feedback! It will be visible after moderation.",
    });
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const wishlisted = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/shop" className="hover:text-primary transition-colors">
              Shop
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
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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
                    ? `-${discount}% Off`
                    : product.badge}
                </span>
              )}
              {product.video && (
                <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-all transform hover:scale-110">
                  <Play className="h-5 w-5 fill-current" />
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  product.image,
                  ...product.images.filter((img) => img !== product.image),
                ].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img
                        ? "border-primary outline outline-offset-1 outline-primary/30"
                        : "border-border grayscale-[0.5] hover:grayscale-0"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumb ${idx}`}
                      className="w-full h-full object-cover p-1"
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
                    ({product.reviews?.length || 0} Customer Reviews)
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
                  <span className="font-medium text-foreground">In Stock:</span>
                  <span className="text-muted-foreground">
                    {product.stock || 20} units available
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Delivery:</span>
                  <span className="text-muted-foreground">
                    1-2 Business Days
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    Guarantee:
                  </span>
                  <span className="text-muted-foreground">
                    100% Organic Certified
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
                  {inCart ? "Added to Cart" : "Add to Cart"}
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
                AE-{product.id.toString().padStart(4, "0")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-bold text-foreground inline-block w-20">
                  Category:
                </span>
                {product.category}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-bold text-foreground inline-block w-20">
                  Tags:
                </span>
                Organic, Fresh, {product.category}, Farm
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
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="additional"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold h-10 px-6 rounded-lg transition-all"
                >
                  Additional Info
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold h-10 px-6 rounded-lg transition-all"
                >
                  Reviews ({product.reviews?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent
                value="description"
                className="mt-0 focus-visible:ring-0"
              >
                <div className="prose prose-green max-w-none">
                  <h3 className="text-xl font-bold mb-4">Product Details</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.longDescription ||
                      "No detailed description available for this product yet. Rest assured, all our products are hand-picked for quality and freshness."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-primary/5 p-6 rounded-2xl">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" /> Features
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>100% Organic and Natural</li>
                        <li>Non-GMO and Pesticide-Free</li>
                        <li>Sourced from Local Organic Farms</li>
                        <li>Hand-picked and Inspected for Quality</li>
                      </ul>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-2xl">
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" /> Benefits
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Rich in essential vitamins and minerals</li>
                        <li>Fresh flavor unmatched by grocery stores</li>
                        <li>Supports sustainable farming practices</li>
                        <li>Healthier choice for your family</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="additional"
                className="mt-0 focus-visible:ring-0"
              >
                <div className="overflow-hidden border border-border rounded-xl">
                  <table className="w-full text-sm text-left">
                    <tbody>
                      <tr className="border-b border-border">
                        <th className="px-6 py-4 font-bold bg-muted/30 w-1/3 text-foreground">
                          Weight
                        </th>
                        <td className="px-6 py-4 text-muted-foreground">
                          Approx. 1.0 {product.unit}
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <th className="px-6 py-4 font-bold bg-muted/30 text-foreground">
                          Dimensions
                        </th>
                        <td className="px-6 py-4 text-muted-foreground">
                          Varies by item
                        </td>
                      </tr>
                      <tr className="border-b border-border">
                        <th className="px-6 py-4 font-bold bg-muted/30 text-foreground">
                          Shelf Life
                        </th>
                        <td className="px-6 py-4 text-muted-foreground">
                          3-7 Days (Refrigerated)
                        </td>
                      </tr>
                      <tr>
                        <th className="px-6 py-4 font-bold bg-muted/30 text-foreground">
                          Storage
                        </th>
                        <td className="px-6 py-4 text-muted-foreground">
                          Keep in cool, dry place or refrigerate
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                      Client Reviews
                    </h3>

                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="space-y-8">
                        {product.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border-b border-border pb-8 last:border-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                  {review.user.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-foreground">
                                    {review.user}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(review.date).toLocaleDateString()}
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
                          No reviews yet. Be the first to share your experience!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/20 p-8 rounded-2xl h-fit border border-border">
                    <h3 className="text-xl font-bold mb-6 text-foreground">
                      Add a Review
                    </h3>
                    <form onSubmit={handleAddReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          Your Rating
                        </label>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              className="text-border hover:text-secondary transition-colors"
                            >
                              <Star className="h-6 w-6" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          Your Name
                        </label>
                        <Input
                          placeholder="Enter your name"
                          className="bg-background"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="bg-background"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground">
                          Your Review
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-input px-3 py-2 text-sm h-32 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                          placeholder="Write your experience here..."
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full font-bold h-12 rounded-xl"
                      >
                        Submit Review
                      </Button>
                    </form>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
                Related Products
              </h2>
              <Link
                href="/shop"
                className="text-primary font-bold hover:underline"
              >
                View All Shop
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
