"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  ShoppingBag,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  deleteAdminArtisanProduct,
  fetchAdminArtisanById,
  fetchAdminArtisanProductById,
  toAbsoluteArtisanImage,
  type ArtisanMultiLangText,
} from "@/lib/api/artisans";

function getText(value?: ArtisanMultiLangText): string {
  if (!value) {
    return "";
  }

  return value.en || value.rw || value.fr || value.sw || "";
}

function getProvidedTranslations(value?: ArtisanMultiLangText) {
  if (!value) {
    return [] as Array<{ code: string; label: string; text: string }>;
  }

  const labels: Record<string, string> = {
    en: "English",
    rw: "Kinyarwanda",
    fr: "French",
    sw: "Swahili",
  };

  return Object.entries(value)
    .filter(([, text]) => typeof text === "string" && text.trim().length > 0)
    .map(([code, text]) => ({
      code,
      label: labels[code] ?? code.toUpperCase(),
      text: text.trim(),
    }));
}

export default function ArtisanProductViewPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const artisanQuery = useQuery({
    queryKey: ["admin-artisan", id],
    queryFn: () => fetchAdminArtisanById(id),
  });

  const productQuery = useQuery({
    queryKey: ["admin-artisan-product", id, productId],
    queryFn: () => fetchAdminArtisanProductById(id, productId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminArtisanProduct(id, productId),
    onSuccess: () => {
      toast.success("Product deleted", {
        description: "The artisan product has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-artisan-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-artisan", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-artisan-stats"] });
      router.push(`/admin/artisans/${id}`);
    },
    onError: (error: Error) => {
      toast.error("Unable to delete product", {
        description:
          error.message || "Please retry or verify your admin authorization.",
      });
    },
  });

  const artisan = artisanQuery.data;
  const product = productQuery.data;

  const nameTranslations = useMemo(
    () => getProvidedTranslations(product?.name),
    [product?.name],
  );
  const descriptionTranslations = useMemo(
    () => getProvidedTranslations(product?.description),
    [product?.description],
  );

  if (artisanQuery.isLoading || productQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/artisans/${id}`)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Loading Product...
          </h1>
        </div>
      </div>
    );
  }

  if (!artisan || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/artisans/${id}`)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Product Not Found
          </h1>
        </div>
      </div>
    );
  }

  const displayName = getText(product.name) || "Product";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/artisans/${id}`)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">{artisan.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              router.push(`/admin/artisans/${id}/products/${productId}/edit`)
            }
          >
            <Edit className="h-4 w-4" /> Edit Product
          </Button>
          <Button
            variant="destructive"
            className="gap-1.5"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-4">
                <img
                  src={toAbsoluteArtisanImage(product.image)}
                  alt={displayName}
                  className="w-36 h-36 rounded-xl object-cover border border-border"
                />
                <div>
                  <h2 className="font-semibold text-foreground text-lg">
                    {displayName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {artisan.name}
                  </p>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-foreground">
                      {(Number(product.price) || 0).toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stock</span>
                    <span className="font-semibold text-foreground">
                      {product.stock ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline" className="text-xs">
                  {product.category?.name || "Uncategorized"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Artisan:</span>
                <span className="text-foreground">{artisan.name}</span>
              </div>
              {product.createdAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">
                    {new Date(product.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
              {product.updatedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="text-foreground">
                    {new Date(product.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" /> Product Names
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nameTranslations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No names available.
                </p>
              ) : (
                <div className="space-y-3">
                  {nameTranslations.map((entry) => (
                    <div
                      key={`name-${entry.code}`}
                      className="rounded-lg border border-border p-3 bg-muted/20"
                    >
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {entry.label}
                      </p>
                      <p className="text-sm text-foreground mt-1">
                        {entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {descriptionTranslations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No product description provided.
                </p>
              ) : (
                <div className="space-y-3">
                  {descriptionTranslations.map((entry) => (
                    <div
                      key={`description-${entry.code}`}
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                All Fields
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Product ID:</span>{" "}
                {product.id}
              </p>
              <p>
                <span className="text-muted-foreground">Artisan ID:</span> {id}
              </p>
              <p>
                <span className="text-muted-foreground">Category ID:</span>{" "}
                {product.categoryId || "N/A"}
              </p>
              <p>
                <span className="text-muted-foreground">Image Path:</span>{" "}
                {product.image || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDeleteConfirmOpen(false);
            return;
          }

          setDeleteConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be removed from the
              artisan catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Separator />
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/artisans/${id}`)}
        >
          Back to Artisan
        </Button>
      </div>
    </div>
  );
}
