"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Plus,
  Star,
  MapPin,
  Mail,
  Phone,
  Package,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  fetchAdminArtisanById,
  toAbsoluteArtisanImage,
  type ArtisanMultiLangText,
  type AdminArtisanProduct,
} from "@/lib/api/artisans";

const languageLabels: Record<string, string> = {
  en: "English",
  rw: "Kinyarwanda",
  fr: "French",
  sw: "Swahili",
};

function getText(value?: ArtisanMultiLangText): string {
  if (!value) return "";
  return value.en || value.rw || value.fr || value.sw || "";
}

function getProvidedTranslations(value?: ArtisanMultiLangText) {
  if (!value) {
    return [] as Array<{ code: string; label: string; text: string }>;
  }

  return Object.entries(value)
    .filter(([, text]) => typeof text === "string" && text.trim().length > 0)
    .map(([code, text]) => ({
      code,
      label: languageLabels[code] ?? code.toUpperCase(),
      text: text.trim(),
    }));
}

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  inactive: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export default function ArtisanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const artisanQuery = useQuery({
    queryKey: ["admin-artisan", id],
    queryFn: () => fetchAdminArtisanById(id),
  });

  const artisan = artisanQuery.data;
  const products = artisan?.products ?? [];
  const totalProductsValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0),
    0,
  );
  const shortDescriptionTranslations = getProvidedTranslations(
    artisan?.shortDescription,
  );
  const fullStoryTranslations = getProvidedTranslations(artisan?.fullStory);

  if (artisanQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/artisans")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Loading Artisan...
          </h1>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/artisans")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Artisan Not Found
          </h1>
        </div>
        <div className="border border-border rounded-xl p-12 text-center bg-card">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No artisan found with this ID.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/admin/artisans")}
          >
            Back to Artisans
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteProduct = (product: AdminArtisanProduct) => {
    toast.success("Product Removed", {
      description: `"${getText(product.name)}" has been removed from ${artisan.name}'s catalog.`,
    });
  };

  const artisanStatus = artisan.isActive ? "active" : "inactive";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/artisans")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {artisan.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {artisan.specialty} | {artisan.location || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ID: {artisan.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 md:ml-0">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => router.push(`/admin/artisans/${id}/add-product`)}
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
          <Button
            className="gap-1.5"
            onClick={() => router.push(`/admin/artisans/${id}/edit`)}
          >
            <Edit className="h-4 w-4" /> Edit Artisan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <img
                  src={toAbsoluteArtisanImage(artisan.image)}
                  alt={artisan.name}
                  className="w-28 h-28 rounded-xl object-cover border border-border"
                />
                <div>
                  <h2 className="font-semibold text-foreground text-lg">
                    {artisan.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {artisan.specialty}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge
                    className={`${statusColors[artisanStatus]} border text-xs capitalize`}
                  >
                    {artisanStatus}
                  </Badge>
                  {artisan.isFeatured && (
                    <Badge
                      variant="outline"
                      className="text-xs gap-1 border-amber-500/30 text-amber-600"
                    >
                      <Star className="h-3 w-3 fill-amber-500" /> Featured
                    </Badge>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active</span>
                  <span className="text-foreground font-medium">
                    {artisan.isActive ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Featured</span>
                  <span className="text-foreground font-medium">
                    {artisan.isFeatured ? "Yes" : "No"}
                  </span>
                </div>
                {artisan.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{artisan.location}</span>
                  </div>
                )}
                {artisan.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground break-all">
                      {artisan.email}
                    </span>
                  </div>
                )}
                {artisan.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{artisan.phone}</span>
                  </div>
                )}
                {artisan.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created At</span>
                    <span className="text-foreground font-medium">
                      {new Date(artisan.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {artisan.updatedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Updated At</span>
                    <span className="text-foreground font-medium">
                      {new Date(artisan.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {products.length}
                </p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {totalProductsValue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total RWF</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                About the Artisan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shortDescriptionTranslations.length === 0 ? (
                <p className="text-sm text-foreground leading-relaxed">
                  No description available.
                </p>
              ) : (
                <div className="space-y-3">
                  {shortDescriptionTranslations.map((entry) => (
                    <div
                      key={`short-${entry.code}`}
                      className="rounded-lg border border-border p-3 bg-muted/20"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {entry.label}
                      </p>
                      <p className="text-sm text-foreground leading-relaxed mt-1">
                        {entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Story */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Story</CardTitle>
            </CardHeader>
            <CardContent>
              {fullStoryTranslations.length === 0 ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No story available.
                </p>
              ) : (
                <div className="space-y-3">
                  {fullStoryTranslations.map((entry) => (
                    <div
                      key={`story-${entry.code}`}
                      className="rounded-lg border border-border p-3 bg-muted/20"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {entry.label}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                        {entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Products ({products.length})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    router.push(`/admin/artisans/${id}/add-product`)
                  }
                >
                  <Plus className="h-3 w-3" /> Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No products yet.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() =>
                      router.push(`/admin/artisans/${id}/add-product`)
                    }
                  >
                    <Plus className="h-3 w-3" /> Add First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                    >
                      <img
                        src={toAbsoluteArtisanImage(product.image)}
                        alt={getText(product.name)}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getText(product.name)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getText(product.description) || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {product.categoryId && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0"
                            >
                              {product.categoryId}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Stock: {product.stock ?? "—"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {(Number(product.price) || 0).toLocaleString()} RWF
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              router.push(
                                `/admin/artisans/${id}/products/${product.id}`,
                              )
                            }
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              router.push(
                                `/admin/artisans/${id}/products/${product.id}/edit`,
                              )
                            }
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
