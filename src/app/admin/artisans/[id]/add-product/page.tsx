"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  ImagePlus,
  ShoppingBag,
  Tag,
  Package,
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
  createAdminArtisanProduct,
  fetchAdminArtisanById,
  toAbsoluteArtisanImage,
  type ArtisanMultiLangText,
} from "@/lib/api/artisans";
import { fetchCategoriesForAdmin } from "@/lib/api/products";
import { uploadSingleImage } from "@/lib/api/uploads";
import {
  MultiLangInput,
  emptyLangValue,
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

export default function AddProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const artisanQuery = useQuery({
    queryKey: ["admin-artisan", id],
    queryFn: () => fetchAdminArtisanById(id),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: fetchCategoriesForAdmin,
  });

  const createProductMutation = useMutation({
    mutationFn: ({
      artisanId,
      payload,
    }: {
      artisanId: string;
      payload: Parameters<typeof createAdminArtisanProduct>[1];
    }) => createAdminArtisanProduct(artisanId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-artisan-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-artisan", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-artisan-stats"] });
    },
  });

  const [name, setName] = useState<MultiLangValue>(emptyLangValue());
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] =
    useState<MultiLangValue>(emptyLangValue());
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");

  const artisan = artisanQuery.data;

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

  const handleAddProduct = async () => {
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

      await createProductMutation.mutateAsync({
        artisanId: id,
        payload: {
          name: mappedName,
          description: toOptionalMultiLang(description),
          price: numericPrice,
          stock: Math.floor(numericStock),
          categoryId: categoryId || undefined,
          image: uploadedImagePath || undefined,
        },
      });

      toast.success("Product Added", {
        description: `"${mappedName.en}" has been added to ${artisan?.name ?? "the artisan"}'s catalog.`,
      });

      router.push(`/admin/artisans/${id}`);
    } catch (error) {
      toast.error("Unable to create product", {
        description:
          error instanceof Error
            ? error.message
            : "Please retry or verify your admin authorization.",
      });
    }
  };

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
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
              Add Product
            </h1>
            <p className="text-sm text-muted-foreground">For {artisan.name}</p>
          </div>
        </div>
        <Button
          onClick={handleAddProduct}
          disabled={createProductMutation.isPending}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {createProductMutation.isPending ? "Adding..." : "Add Product"}
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
                  <Label className="flex items-center gap-1.5">
                    Price (RWF) *
                  </Label>
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
              {selectedImagePreview ? (
                <img
                  src={selectedImagePreview}
                  alt="Selected product"
                  className="w-full aspect-square object-cover rounded-xl border border-border"
                />
              ) : (
                <div className="w-full aspect-square rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">
                  No image selected
                </div>
              )}
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
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
              onClick={handleAddProduct}
              disabled={createProductMutation.isPending}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              {createProductMutation.isPending ? "Adding..." : "Add Product"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/admin/artisans/${id}`)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
