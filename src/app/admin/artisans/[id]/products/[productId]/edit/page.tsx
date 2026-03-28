"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  ShoppingBag,
  Tag,
  Package,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  fetchAdminArtisanById,
  fetchAdminArtisanProductById,
  toAbsoluteArtisanImage,
  updateAdminArtisanProduct,
  type AdminArtisan,
  type AdminArtisanProduct,
  type ArtisanMultiLangText,
} from "@/lib/api/artisans";
import { fetchCategoriesForAdmin } from "@/lib/api/products";
import { uploadSingleImage } from "@/lib/api/uploads";
import {
  MultiLangInput,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function toRequiredMultiLang(
  value: MultiLangValue,
): ArtisanMultiLangText | null {
  const en = value.en.trim();
  const rw = value.rw.trim();
  const fr = value.fr.trim();
  const sw = value.sw.trim();

  if (!en) {
    return null;
  }

  return {
    en,
    ...(rw ? { rw } : {}),
    ...(fr ? { fr } : {}),
    ...(sw ? { sw } : {}),
  };
}

function toOptionalMultiLang(
  value: MultiLangValue,
): ArtisanMultiLangText | undefined {
  const mapped = toRequiredMultiLang(value);
  return mapped ?? undefined;
}

function fromMultiLang(value?: ArtisanMultiLangText): MultiLangValue {
  return {
    en: value?.en ?? "",
    rw: value?.rw ?? "",
    fr: value?.fr ?? "",
    sw: value?.sw ?? "",
  };
}

function EditProductForm({
  artisan,
  product,
}: {
  artisan: AdminArtisan;
  product: AdminArtisanProduct;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: () => fetchCategoriesForAdmin(),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({
      artisanId,
      currentProductId,
      payload,
    }: {
      artisanId: string;
      currentProductId: string;
      payload: Parameters<typeof updateAdminArtisanProduct>[2];
    }) => updateAdminArtisanProduct(artisanId, currentProductId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-artisan-products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-artisan-product", id, productId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-artisan", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-artisan-stats"] });
    },
  });

  const [name, setName] = useState<MultiLangValue>(() =>
    fromMultiLang(product.name),
  );
  const [price, setPrice] = useState(() => String(Number(product.price) || 0));
  const [stock, setStock] = useState(() => String(product.stock ?? 0));
  const [categoryId, setCategoryId] = useState(() => product.categoryId ?? "");
  const [description, setDescription] = useState<MultiLangValue>(() =>
    fromMultiLang(product.description),
  );
  const [imageUrl, setImageUrl] = useState(() => product.image ?? "");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please choose an image file (PNG, JPG, WEBP, ...).",
      });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large", {
        description: "Please choose an image up to 5MB.",
      });
      return;
    }

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    const preview = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setSelectedImagePreview(preview);
  };

  const handleSave = async () => {
    const mappedName = toRequiredMultiLang(name);

    if (!mappedName) {
      toast.error("Missing Fields", {
        description: "Please fill in at least the product name (English).",
      });
      return;
    }

    const numericPrice = Number(price);
    if (!price.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      toast.error("Invalid Price", {
        description: "Please enter a valid price in RWF.",
      });
      return;
    }

    const numericStock = stock.trim() ? Number(stock) : 0;
    if (Number.isNaN(numericStock) || numericStock < 0) {
      toast.error("Invalid Stock", {
        description: "Stock must be zero or a positive integer.",
      });
      return;
    }

    try {
      let uploadedImagePath = imageUrl.trim();

      if (selectedImageFile) {
        const uploaded = await uploadSingleImage(selectedImageFile);
        uploadedImagePath = uploaded.path;
      }

      await updateProductMutation.mutateAsync({
        artisanId: id,
        currentProductId: productId,
        payload: {
          name: mappedName,
          description: toOptionalMultiLang(description),
          price: numericPrice,
          stock: Math.floor(numericStock),
          categoryId: categoryId || undefined,
          image: uploadedImagePath || undefined,
        },
      });

      toast.success("Product Updated", {
        description: `"${mappedName.en}" has been updated successfully.`,
      });

      router.push(`/admin/artisans/${id}/products/${productId}`);
    } catch (error) {
      toast.error("Unable to update product", {
        description:
          error instanceof Error
            ? error.message
            : "Please retry or verify your admin authorization.",
      });
    }
  };

  const productDisplayName =
    product.name.en ||
    product.name.rw ||
    product.name.fr ||
    product.name.sw ||
    "Product";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/admin/artisans/${id}/products/${productId}`)
            }
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Edit Product
            </h1>
            <p className="text-sm text-muted-foreground">
              {productDisplayName} · {artisan.name}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateProductMutation.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
        <img
          src={toAbsoluteArtisanImage(artisan.image)}
          alt={artisan.name}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{artisan.name}</p>
          <p className="text-xs text-muted-foreground">{artisan.specialty}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" /> Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiLangInput
                label="Product Name"
                value={name}
                onChange={setName}
                placeholder="e.g., Handwoven Peace Basket"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (RWF) *</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="25000"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                    Stock
                  </Label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" /> Category
                </Label>
                <Select
                  value={categoryId || "none"}
                  onValueChange={(value) =>
                    setCategoryId(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Uncategorized</SelectItem>
                    {(categoriesQuery.data?.data ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <MultiLangInput
                label="Description"
                value={description}
                onChange={setDescription}
                placeholder="Describe the product, materials used, crafting process..."
                type="textarea"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <img
                src={selectedImagePreview || toAbsoluteArtisanImage(imageUrl)}
                alt={productDisplayName}
                className="w-full aspect-square object-cover rounded-xl border border-border"
              />
              <div
                className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  Click to replace image
                </p>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
              <div>
                <Label>Or use existing image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/uploads/filename.jpg or https://..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSave}
              disabled={updateProductMutation.isPending}
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(`/admin/artisans/${id}/products/${productId}`)
              }
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditProductPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const router = useRouter();

  const artisanQuery = useQuery({
    queryKey: ["admin-artisan", id],
    queryFn: () => fetchAdminArtisanById(id),
  });

  const productQuery = useQuery({
    queryKey: ["admin-artisan-product", id, productId],
    queryFn: () => fetchAdminArtisanProductById(id, productId),
  });

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

  if (!artisanQuery.data || !productQuery.data) {
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

  return (
    <EditProductForm
      key={`${productQuery.data.id}-${productQuery.data.updatedAt ?? "initial"}`}
      artisan={artisanQuery.data}
      product={productQuery.data}
    />
  );
}
