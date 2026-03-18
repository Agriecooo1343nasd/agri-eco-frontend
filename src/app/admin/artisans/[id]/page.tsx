"use client";

import { useParams, useRouter } from "next/navigation";
import { artisans, type Artisan, type ArtisanProduct } from "@/data/community";
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

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function ArtisanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const artisan: Artisan | undefined = artisans.find((a) => a.id === id);

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

  const handleDeleteProduct = (product: ArtisanProduct) => {
    toast.success("Product Removed", {
      description: `"${product.name}" has been removed from ${artisan.name}'s catalog.`,
    });
  };

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
              {artisan.specialty} · {artisan.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 md:ml-0">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              router.push(`/admin/artisans/${artisan.id}/add-product`)
            }
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
          <Button
            className="gap-1.5"
            onClick={() => router.push(`/admin/artisans/${artisan.id}/edit`)}
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
                  src={artisan.image}
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
                    className={`${statusColors[artisan.status]} border text-xs capitalize`}
                  >
                    {artisan.status}
                  </Badge>
                  {artisan.featured && (
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
              </div>

              {artisan.approvedDate && (
                <p className="text-xs text-muted-foreground mt-4">
                  Approved: {artisan.approvedDate}
                </p>
              )}
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
                  {artisan.products.length}
                </p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {artisan.products
                    .reduce((sum, p) => sum + p.price, 0)
                    .toLocaleString()}
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
              <p className="text-sm text-foreground leading-relaxed">
                {artisan.description}
              </p>
            </CardContent>
          </Card>

          {/* Story */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {artisan.story}
              </p>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Products ({artisan.products.length})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    router.push(`/admin/artisans/${artisan.id}/add-product`)
                  }
                >
                  <Plus className="h-3 w-3" /> Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {artisan.products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No products yet.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={() =>
                      router.push(`/admin/artisans/${artisan.id}/add-product`)
                    }
                  >
                    <Plus className="h-3 w-3" /> Add First Product
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {artisan.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {product.category && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0"
                            >
                              {product.category}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Stock: {product.stock ?? "—"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {product.price.toLocaleString()} RWF
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              router.push(
                                `/admin/artisans/${artisan.id}/products/${product.id}/edit`,
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
