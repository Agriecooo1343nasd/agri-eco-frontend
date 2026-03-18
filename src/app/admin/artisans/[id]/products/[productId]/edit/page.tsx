"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { artisans } from "@/data/community";
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
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";

const CATEGORIES = [
  "Baskets",
  "Sculptures",
  "Pottery",
  "Kitchenware",
  "Candles",
  "Skincare",
  "Textiles",
  "Jewelry",
  "Other",
];

export default function EditProductPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const router = useRouter();

  const artisan = artisans.find((a) => a.id === id);
  const product = artisan?.products.find((p) => p.id === productId);

  const [name, setName] = useState<MultiLangValue>(() =>
    product ? { ...emptyLangValue(), en: product.name } : emptyLangValue(),
  );
  const [price, setPrice] = useState(() =>
    product ? String(product.price) : "",
  );
  const [stock, setStock] = useState(() =>
    product ? String(product.stock ?? "") : "",
  );
  const [category, setCategory] = useState(() => product?.category ?? "");
  const [description, setDescription] = useState<MultiLangValue>(() =>
    product
      ? { ...emptyLangValue(), en: product.description }
      : emptyLangValue(),
  );
  const [saving, setSaving] = useState(false);

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
        <div className="border border-border rounded-xl p-12 text-center bg-card">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No product found with this ID.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/admin/artisans/${id}`)}
          >
            Back to Artisan
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!name.en.trim()) {
      toast.error("Missing Fields", {
        description: "Please fill in at least the product name (English).",
      });
      return;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error("Invalid Price", {
        description: "Please enter a valid price in RWF.",
      });
      return;
    }

    setSaving(true);
    // Placeholder: will call API on integration
    setTimeout(() => {
      setSaving(false);
      toast.success("Product Updated", {
        description: `"${name.en}" has been updated successfully.`,
      });
      router.push(`/admin/artisans/${id}`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              Edit Product
            </h1>
            <p className="text-sm text-muted-foreground">
              {product.name} · {artisan.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Artisan context strip */}
      <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
        <img
          src={artisan.image}
          alt={artisan.name}
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div>
          <p className="text-sm font-medium text-foreground">{artisan.name}</p>
          <p className="text-xs text-muted-foreground">{artisan.specialty}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Form */}
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
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Product Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-xl border border-border"
              />
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  Click to replace image
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
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
