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
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { fetchAdminProductById, type AdminProduct } from "@/lib/api/products";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewProduct({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { formatPrice } = usePricing();
  const { t, locale } = useLanguage();

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const data = await fetchAdminProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-[32px]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-[32px]" />
            <Skeleton className="h-64 w-full rounded-[32px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
          <Info className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black">Product Not Found</h2>
        <p className="text-muted-foreground">
          The product with ID #{productId} could not be retrieved.
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

  const allImages = product.images?.length 
    ? product.images.map(img => img.url)
    : ["/assets/products/placeholder.jpg"];

  const statusColors = {
    active: "bg-green-100 text-green-700 border-green-200",
    draft: "bg-amber-100 text-amber-700 border-amber-200",
    inactive: "bg-red-100 text-red-700 border-red-200",
  };

  const productStatus = product.status || "active";

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4">
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
              {t(product.nameI18n || product.name)}
            </h1>
            <Badge
              className={cn(
                "rounded-lg py-1 px-3 text-xs font-black uppercase tracking-wider",
                statusColors[productStatus as keyof typeof statusColors] || statusColors.active
              )}
            >
              {productStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-primary" />
              {product.category?.name || "Uncategorized"}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              SKU: {product.sku}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              {product.averageRating || 0} ({product.soldCount || 0} sold)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold shadow-sm"
            asChild
          >
            <Link href={`/admin/products/${productId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Product
            </Link>
          </Button>
          <Button
            className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 bg-primary text-white"
            asChild
          >
            <Link href={`/shop?search=${product.slug}`}>
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
                    alt={t(product.nameI18n || product.name)}
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
              <div className="lg:col-span-4 p-4 lg:p-6 bg-muted/5 border-l border-border flex flex-col gap-4 overflow-y-auto max-h-full">
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
                      {t(product.shortDescriptionI18n || product.shortDescription)}
                    </p>
                    <div dangerouslySetInnerHTML={{ __html: t(product.descriptionI18n || product.description) || "No detailed description provided." }} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Key Features
                      </h4>
                      <ul className="space-y-3">
                        {(product.featuresI18n ? (product.featuresI18n[locale] || product.featuresI18n.en || []) : (product.features || [])).map((feature, i) => (
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
                  )}
                  {product.benefits && product.benefits.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Benefits
                      </h4>
                      <ul className="space-y-3">
                        {(product.healthBenefitsI18n ? (product.healthBenefitsI18n[locale] || product.healthBenefitsI18n.en || []).map(b => b.title) : (product.benefits || [])).map((benefit, i) => (
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
                  )}
                </div>
                <div className="pt-8 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Unit
                    </p>
                    <p className="font-bold text-foreground">
                      per {product.unit}
                    </p>
                  </div>
                  {product.shipping?.weight && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Weight
                      </p>
                      <p className="font-bold text-foreground">
                        {product.shipping.weight}g
                      </p>
                    </div>
                  )}
                  {product.shipping?.shelfLife && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Shelf Life
                      </p>
                      <p className="font-bold text-foreground">
                        {product.shipping.shelfLife}
                      </p>
                    </div>
                  )}
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
                          <th className="px-8 py-4">Received Date</th>
                          <th className="px-8 py-4">Expiry Date</th>
                          <th className="px-8 py-4 text-center">
                            Remaining Qty
                          </th>
                          <th className="px-8 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-b">
                        {product.batches?.map((batch, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-muted/10 transition-colors"
                          >
                            <td className="px-8 py-5 font-bold text-foreground">
                              {batch.batchId}
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-muted-foreground">
                              {batch.receivedDate ? new Date(batch.receivedDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className={cn(
                              "px-8 py-5 text-sm font-medium",
                              batch.status === "expired" ? "text-destructive" : "text-muted-foreground"
                            )}>
                              {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : "No Expiry"}
                            </td>
                            <td className="px-8 py-5 text-center">
                              <Badge className="bg-primary/5 text-primary border-primary/20 rounded-full px-4 h-7 text-xs font-black">
                                {batch.quantity} {product.unit}
                              </Badge>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className={cn(
                                "flex items-center justify-end gap-1.5 font-bold text-xs",
                                batch.status === "active" ? "text-green-600" : "text-muted-foreground"
                              )}>
                                {batch.status === "active" && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                )}
                                {batch.status || "Unknown"}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!product.batches || product.batches.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-8 py-10 text-center text-muted-foreground italic">
                              No inventory batches found for this product.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {product.shipping?.storageCondition && (
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
                            &quot;{t(product.shipping?.storageConditionI18n || product.shipping?.storageCondition)}&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
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
                Pricing Details
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">
                  {formatPrice(product.sellingPrice)}
                </span>
                <span className="text-sm text-white/40 font-bold uppercase tracking-widest">
                  / {product.unit}
                </span>
              </div>
              {product.originalPrice > product.sellingPrice && (
                <p className="text-sm font-bold text-white/30 line-through">
                  {formatPrice(product.originalPrice)}
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
                  Sold
                </p>
                <p className="text-xl font-black text-white">
                  {product.soldCount || 0}
                </p>
              </div>
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
                    {product.shipping?.shelfLife ? `Shelf Life: ${product.shipping.shelfLife}` : "Standard Processing"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Storage
                  </p>
                  <p className="text-sm font-bold">
                    {product.shipping?.requiresRefrigeration ? "Requires Refrigeration" : "Ambient Storage"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {product.tags && product.tags.length > 0 && (
            <Card className="rounded-[32px] border-border shadow-soft p-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Search Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
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
                  {new Date(product.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </Card>
          )}
          
          {product.artisan && (
            <Card className="rounded-[32px] border-border shadow-soft p-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Artisan / Source
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                  {product.artisan.image && (
                    <img src={product.artisan.image} alt={product.artisan.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-black">{product.artisan.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">{product.artisan.specialty}</p>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-6 rounded-xl text-xs font-bold text-primary" asChild>
                <Link href={`/community/artisan/${product.artisan.id}`}>View Profile</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
