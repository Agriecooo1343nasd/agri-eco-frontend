"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Package,
  Layers,
  Truck,
  Tag,
  Info,
  BarChart3,
  Check,
  Star,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePricing } from "@/context/PricingContext";
import { cn } from "@/lib/utils";
import { products as baseProducts } from "@/data/products";

interface Batch {
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  qty: number;
}

export default function ViewProduct({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { formatPrice } = usePricing();

  const product = baseProducts.find((p) => p.id === Number(productId));

  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [mockDetails, setMockDetails] = useState({
    status: "Active" as "Active" | "Draft" | "Inactive",
    batches: [] as Batch[],
    features: [
      "Organic Certified",
      "Local Farm Sourced",
      "No Preservatives",
      "Hand-picked",
    ],
    benefits: ["Boosts Immunity", "Rich in Antioxidants", "Natural Sweetener"],
    tags: ["Health", "Organic", "Sustainable", "Farm Fresh"],
    soldCount: 142,
    rating: 4.8,
    reviewsCount: 24,
    dimensions: "12 x 8 x 5 cm",
    weight: "500g",
    storage: "Store in a cool, dry place.",
    shelfLife: "12 Months",
  });

  useEffect(() => {
    if (product) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setMockDetails((prev) => ({
          ...prev,
          status:
            Number(productId) % 3 === 0
              ? "Active"
              : Number(productId) % 3 === 1
                ? "Draft"
                : "Inactive",
          batches: [
            {
              batchNumber: `B-${productId}-001`,
              mfgDate: "2024-01-15",
              expiryDate: "2024-12-15",
              qty: Math.floor(product.stock * 0.4),
            },
            {
              batchNumber: `B-${productId}-002`,
              mfgDate: "2024-02-20",
              expiryDate: "2025-01-20",
              qty: Math.floor(product.stock * 0.6),
            },
          ],
        }));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [product, productId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">
          Loading product details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
          <Info className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black">Product Not Found</h2>
        <p className="text-muted-foreground">
          The product with ID #{productId} does not exist.
        </p>
        <Button
          onClick={() => router.push("/admin/products")}
          variant="outline"
          className="rounded-xl"
        >
          Back to Catalog
        </Button>
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])];
  const statusColors = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Draft: "bg-amber-100 text-amber-700 border-amber-200",
    Inactive: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/products")}
            className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary flex items-center gap-2 group mb-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Catalog
          </Button>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight">
              {product.name}
            </h1>
            <Badge
              className={cn(
                "rounded-lg py-1 px-3 text-xs font-black uppercase tracking-wider",
                statusColors[mockDetails.status],
              )}
            >
              {mockDetails.status}
            </Badge>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-primary" />
              {product.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              ID: #{productId}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              {mockDetails.rating} ({mockDetails.reviewsCount} reviews)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold shadow-sm"
            asChild
          >
            <Link href={`/admin/products/${productId}/update`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          </Button>
          <Button
            className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 bg-primary text-white"
            asChild
          >
            <Link href={`/product/${productId}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Store
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left: Gallery + Tabs */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="rounded-[32px] overflow-hidden border-border shadow-soft bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 relative group">
                <div className="aspect-square bg-muted/20 flex items-center justify-center">
                  <img
                    src={allImages[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {allImages.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full h-10 w-10 shadow-lg"
                      onClick={() =>
                        setActiveImage((prev) =>
                          prev > 0 ? prev - 1 : allImages.length - 1,
                        )
                      }
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full h-10 w-10 shadow-lg"
                      onClick={() =>
                        setActiveImage((prev) =>
                          prev < allImages.length - 1 ? prev + 1 : 0,
                        )
                      }
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 p-4 lg:p-6 bg-muted/5 border-l border-border flex flex-col gap-4 overflow-y-auto max-h-[100%]">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Product Gallery
                </h4>
                <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={cn(
                        "aspect-square rounded-xl overflow-hidden border-2 transition-all p-1 bg-white",
                        activeImage === idx
                          ? "border-primary shadow-md scale-105"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover rounded-lg"
                        alt="Thumbnail"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto w-full justify-start border overflow-x-auto whitespace-nowrap">
              <TabsTrigger
                value="details"
                className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="batches"
                className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Batches & Inventory
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Reviews ({mockDetails.reviewsCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6 space-y-6">
              <Card className="rounded-[32px] border-border shadow-soft p-8 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-xl font-black font-heading flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Description
                  </h4>
                  <div className="prose prose-sm max-w-none text-muted-foreground font-medium leading-relaxed">
                    <p className="text-foreground text-base mb-4">
                      {product.shortDescription}
                    </p>
                    <p>
                      {product.longDescription ||
                        "No detailed description provided for this product yet."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Key Features
                    </h4>
                    <ul className="space-y-3">
                      {mockDetails.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm font-semibold text-foreground"
                        >
                          <Check className="h-5 w-5 text-primary shrink-0 p-1 bg-primary/10 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Health Benefits
                    </h4>
                    <ul className="space-y-3">
                      {mockDetails.benefits.map((benefit, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm font-semibold text-foreground"
                        >
                          <Check className="h-5 w-5 text-amber-500 shrink-0 p-1 bg-amber-50 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Unit
                    </p>
                    <p className="font-bold text-foreground">
                      per {product.unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Weight
                    </p>
                    <p className="font-bold text-foreground">
                      {mockDetails.weight}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Dimensions
                    </p>
                    <p className="font-bold text-foreground">
                      {mockDetails.dimensions}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Shelf Life
                    </p>
                    <p className="font-bold text-foreground">
                      {mockDetails.shelfLife}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="batches" className="mt-6">
              <Card className="rounded-[32px] border-border shadow-soft overflow-hidden">
                <CardHeader className="p-8 border-b bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="font-black text-xl">
                          Current Inventory Batches
                        </CardTitle>
                        <CardDescription className="font-medium text-sm">
                          Real-time stock tracking by batch numbers.
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">
                        Total Available
                      </p>
                      <p className="text-2xl font-black text-primary">
                        {product.stock} {product.unit}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                          <th className="px-8 py-4">Batch ID</th>
                          <th className="px-8 py-4">Mfg Date</th>
                          <th className="px-8 py-4">Expiry Date</th>
                          <th className="px-8 py-4 text-center">
                            Remaining Qty
                          </th>
                          <th className="px-8 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-b">
                        {mockDetails.batches.map((batch, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-muted/10 transition-colors"
                          >
                            <td className="px-8 py-5 font-bold text-foreground">
                              {batch.batchNumber}
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-muted-foreground">
                              {batch.mfgDate}
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-destructive">
                              {batch.expiryDate}
                            </td>
                            <td className="px-8 py-5 text-center">
                              <Badge className="bg-primary/5 text-primary border-primary/20 rounded-full px-4 h-7 text-xs font-black">
                                {batch.qty} {product.unit}
                              </Badge>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-1.5 font-bold text-xs text-green-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                On Sale
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-8 bg-muted/20">
                    <div className="flex gap-4 p-5 rounded-2xl bg-white border border-border shadow-sm">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-black text-sm uppercase">
                          Storage Requirement
                        </h5>
                        <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">
                          &quot;{mockDetails.storage}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="rounded-[32px] border-border shadow-soft p-8">
                <div className="flex flex-col md:flex-row gap-8 mb-10 pb-10 border-b border-border">
                  <div className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-[24px] border border-primary/10 text-center min-w-[200px]">
                    <p className="text-5xl font-black text-primary mb-2">
                      {mockDetails.rating}
                    </p>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4 fill-amber-500 text-amber-500",
                            i > 4 && "opacity-30",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                      {mockDetails.reviewsCount} Product Reviews
                    </p>
                  </div>
                  <div className="flex-1 space-y-4 py-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-4">
                        <span className="text-xs font-black text-muted-foreground w-4">
                          {star}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{
                              width:
                                star === 5 ? "80%" : star === 4 ? "15%" : "5%",
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-8">
                          {star === 5 ? "80%" : star === 4 ? "15%" : "5%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  {product.reviews?.length ? (
                    product.reviews.map((rev, i) => (
                      <div
                        key={i}
                        className="flex gap-4 bg-muted/10 p-6 rounded-2xl border border-border/40"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-xs">
                          {rev.user.charAt(0)}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-black text-sm">{rev.user}</h5>
                            <span className="text-[10px] font-black text-muted-foreground uppercase">
                              {rev.date}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={cn(
                                  "h-3 w-3 fill-amber-500 text-amber-500",
                                  s > rev.rating && "opacity-30",
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">
                            &quot;{rev.comment}&quot;
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
                      <MessageCircle className="h-12 w-12 text-muted-foreground" />
                      <p className="font-medium italic">
                        No customer reviews yet available for display.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card className="rounded-[32px] border-border shadow-soft overflow-hidden bg-[#0a3622] text-white p-8 space-y-8 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Package className="w-24 h-24" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Selling Strategy
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-white/40 font-bold uppercase tracking-widest">
                  / {product.unit}
                </span>
              </div>
              {product.oldPrice && (
                <p className="text-sm font-bold text-white/30 line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase mb-1">
                  Stock
                </p>
                <p className="text-xl font-black text-white">
                  {product.stock}{" "}
                  <span className="text-[10px] uppercase text-white/40">
                    {product.unit}
                  </span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase mb-1">
                  Sold Out
                </p>
                <p className="text-xl font-black text-white">
                  {mockDetails.soldCount}
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-white/40">Market Share</span>
                <span className="font-black text-primary">12% Growth</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 rounded-full"></div>
              </div>
              <p className="text-[10px] text-white/30 font-bold uppercase text-center italic">
                Calculated based on category performance
              </p>
            </div>
          </Card>

          <Card className="rounded-[32px] border-border shadow-soft p-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Handling Details
            </h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Lead Time
                  </p>
                  <p className="text-sm font-bold">
                    Standard Delivery (2-3 Days)
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Packaging
                  </p>
                  <p className="text-sm font-bold">
                    Biodegradable Organic Pack
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Return Policy
                  </p>
                  <p className="text-sm font-bold">7 Days Replacement Only</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[32px] border-border shadow-soft p-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              SEO & Search Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {mockDetails.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="rounded-lg py-1 px-3 text-xs font-bold border-border"
                >
                  #{t}
                </Badge>
              ))}
            </div>
            <div className="mt-8 p-4 bg-muted/20 rounded-2xl border border-dashed border-border text-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">
                Created On
              </p>
              <p className="text-sm font-bold text-foreground mt-1">
                March 03, 2026
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
