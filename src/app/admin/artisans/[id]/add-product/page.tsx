"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { artisans } from "@/data/community";
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

export default function AddProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const artisan = artisans.find((a) => a.id === id);

  const [name, setName] = useState<MultiLangValue>(emptyLangValue());
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] =
    useState<MultiLangValue>(emptyLangValue());
  const [saving, setSaving] = useState(false);

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

  const handleAddProduct = () => {
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
      toast.success("Product Added", {
        description: `"${name.en}" has been added to ${artisan.name}'s catalog.`,
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
              Add Product
            </h1>
            <p className="text-sm text-muted-foreground">For {artisan.name}</p>
          </div>
        </div>
        <Button onClick={handleAddProduct} disabled={saving} className="gap-2">
          <Plus className="h-4 w-4" />
          {saving ? "Adding..." : "Add Product"}
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
          {/* Product Details */}
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
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag &amp; drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleAddProduct}
              disabled={saving}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Adding..." : "Add Product"}
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
