"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Save,
  Package,
  Layers,
  Truck,
  Tag,
  Info,
  BarChart3,
  Search,
  Check,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { usePricing } from "@/context/PricingContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { products as baseProducts } from "@/data/products";

interface Batch {
  id: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
}

const CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Organic Honey",
  "Green Tea",
  "Grains",
  "Oils",
  "Spices",
];

export default function UpdateProduct({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { formatPrice } = usePricing();

  const existingProduct = baseProducts.find((p) => p.id === Number(productId));

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialStatus, setInitialStatus] = useState<
    "Active" | "Draft" | "Inactive"
  >("Draft");
  const [isActivated, setIsActivated] = useState(false);

  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [unit, setUnit] = useState("kg");
  const [activeCategory, setActiveCategory] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [categories, setCategories] = useState(CATEGORIES);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");

  const [shelfLife, setShelfLife] = useState("");
  const [storage, setStorage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setShortDesc(existingProduct.shortDescription || "");
      setLongDesc(existingProduct.longDescription || "");
      setUnit(existingProduct.unit || "kg");
      setActiveCategory(existingProduct.category || "");
      setPrice(existingProduct.price.toString());
      setOldPrice(existingProduct.oldPrice?.toString() || "");

      const mockStatus = Number(productId) % 4 === 0 ? "Draft" : "Active";
      setInitialStatus(mockStatus);
      setIsActivated(mockStatus === "Active");

      setPreviews([existingProduct.image, ...(existingProduct.images || [])]);
      setFeatures([
        "Organic Certified",
        "Local Farm Sourced",
        "Pesticide Free",
      ]);
      setBenefits([
        "High in Nutrients",
        "Supports Local Economy",
        "Better Flavor",
      ]);
      setTags([existingProduct.category, "Fresh", "Organic"]);
      setBatches([
        {
          id: "b1",
          batchNumber: `B-${Number(productId)}-01`,
          manufactureDate: "2024-02-01",
          expiryDate: "2024-05-01",
          quantity: existingProduct.stock || 50,
        },
      ]);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [existingProduct, productId]);

  useEffect(() => {
    if (!isLoading) setIsDirty(true);
  }, [
    name,
    shortDesc,
    longDesc,
    price,
    activeCategory,
    batches,
    shelfLife,
    storage,
    weight,
    dimensions,
    images,
  ]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = (t: string) => setTags(tags.filter((tag) => tag !== t));

  const addFeature = () => setFeatures([...features, ""]);
  const updateFeature = (i: number, val: string) => {
    const next = [...features];
    next[i] = val;
    setFeatures(next);
  };
  const removeFeature = (i: number) =>
    setFeatures(features.filter((_, idx) => idx !== i));

  const addBenefit = () => setBenefits([...benefits, ""]);
  const updateBenefit = (i: number, val: string) => {
    const next = [...benefits];
    next[i] = val;
    setBenefits(next);
  };
  const removeBenefit = (i: number) =>
    setBenefits(benefits.filter((_, idx) => idx !== i));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };
  const removeImage = (i: number) => {
    setImages(images.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const addBatch = () => {
    setBatches([
      ...batches,
      {
        id: Date.now().toString(),
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        quantity: 0,
      },
    ]);
  };
  const updateBatch = (batchId: string, field: keyof Batch, value: any) => {
    setBatches(
      batches.map((b) => (b.id === batchId ? { ...b, [field]: value } : b)),
    );
  };
  const removeBatch = (batchId: string) => {
    setBatches(batches.filter((b) => b.id !== batchId));
  };

  const createCategory = () => {
    if (searchCategory && !categories.includes(searchCategory)) {
      setCategories([...categories, searchCategory]);
      setActiveCategory(searchCategory);
      setIsCategoryOpen(false);
      toast.success("New Category Added", {
        description: `Added "${searchCategory}" to categories.`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStatus = isActivated ? "Active" : "Draft";
    toast.success("Product Updated", {
      description: `"${name}" has been updated successfully as ${finalStatus}.`,
    });
    router.push("/admin/products");
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading product details...
      </div>
    );
  if (!existingProduct)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Product not found.
      </div>
    );

  const buttonLabel = isActivated ? "Update Product" : "Save Changes";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent -ml-2 text-muted-foreground hover:text-primary transition-colors h-auto flex items-center gap-2 group mb-2"
            onClick={() => router.push("/admin/products")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Products
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black font-heading text-foreground tracking-tight">
              Update Product
            </h1>
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground border-border text-[10px] h-5 uppercase font-black tracking-widest"
            >
              ID: #{productId}
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium text-sm">
            Modify the properties and stock levels for {name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4" />
            {buttonLabel}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-white border p-1 rounded-2xl h-auto flex-wrap justify-start gap-1">
              <TabsTrigger
                value="general"
                className="rounded-xl font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="rounded-xl font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Inventory & Batches
              </TabsTrigger>
              <TabsTrigger
                value="logistics"
                className="rounded-xl font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Logistics & Media
              </TabsTrigger>
              <TabsTrigger
                value="marketing"
                className="rounded-xl font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Features & Benefits
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="mt-6 space-y-6">
              <Card className="rounded-md border-border shadow-soft overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        General Information
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Update the key identity details of this product.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Product Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Pure Mountain Honey"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Category <span className="text-destructive">*</span>
                      </label>
                      <Popover
                        open={isCategoryOpen}
                        onOpenChange={setIsCategoryOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              " w-full justify-between bg-muted/20 border-border text-left font-medium px-4",
                              !activeCategory && "text-muted-foreground",
                            )}
                          >
                            {activeCategory
                              ? activeCategory
                              : "Select or create category..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[300px] p-0 border-border"
                          align="start"
                        >
                          <Command className="rounded-2xl">
                            <CommandInput
                              placeholder="Search category..."
                              value={searchCategory}
                              onValueChange={setSearchCategory}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="p-4 flex flex-col items-center text-center gap-3">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    &quot;{searchCategory}&quot; not found
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="rounded-lg h-9 font-black"
                                    onClick={createCategory}
                                  >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Create New Category
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {categories.map((c) => (
                                  <CommandItem
                                    key={c}
                                    value={c}
                                    onSelect={(currentValue) => {
                                      setActiveCategory(
                                        currentValue === activeCategory
                                          ? ""
                                          : currentValue,
                                      );
                                      setIsCategoryOpen(false);
                                    }}
                                    className="py-3 px-4 rounded-xl m-1"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        activeCategory === c
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="font-medium">{c}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Measurement Unit{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger className="h-14 bg-muted/20 border-border font-medium">
                          <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                          <SelectItem value="oz">Ounces (oz)</SelectItem>
                          <SelectItem value="pack">Packets / Units</SelectItem>
                          <SelectItem value="liter">Liters (L)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Short Description{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Brief summary for product cards..."
                        value={shortDesc}
                        onChange={(e) => setShortDesc(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Long Description{" "}
                        <span className="text-muted-foreground ml-2 text-[10px] italic">
                          (Optional)
                        </span>
                      </label>
                      <Textarea
                        placeholder="Detailed product information, origin, organic certifications..."
                        className="min-h-[160px] bg-muted/20 border-border p-4 font-medium resize-none focus:bg-white transition-all"
                        value={longDesc}
                        onChange={(e) => setLongDesc(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-md border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Pricing Strategy
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Set competitive prices and manage discounts.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Selling Price{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Original/Old Price{" "}
                        <span className="text-muted-foreground ml-2 text-[10px] italic">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={oldPrice}
                        onChange={(e) => setOldPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="mt-6 space-y-6">
              <Card className="rounded-md border-border shadow-soft overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border p-8 pb-4">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="font-heading font-black text-xl">
                          Inventory & Stock
                        </CardTitle>
                        <CardDescription className="font-medium">
                          Manage current batches for {name}.
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBatch}
                      className="rounded-xl border-primary/20 text-primary font-medium hover:bg-primary/5"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add New Batch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-white border rounded-sm overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-6 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Batch Name / #
                          </th>
                          <th className="px-6 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Mfg Date
                          </th>
                          <th className="px-6 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Expiry Date
                          </th>
                          <th className="px-6 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Qty Available
                          </th>
                          <th className="px-6 py-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {batches.map((batch) => (
                          <tr key={batch.id}>
                            <td className="px-6 py-3">
                              <Input
                                placeholder="e.g. B-2026-A"
                                value={batch.batchNumber}
                                onChange={(e) =>
                                  updateBatch(
                                    batch.id,
                                    "batchNumber",
                                    e.target.value,
                                  )
                                }
                                className="h-10 border-none shadow-none focus-visible:ring-0 font-medium p-0"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className={cn(
                                      "h-10 justify-start px-0 text-left font-medium hover:bg-transparent",
                                      !batch.manufactureDate &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {batch.manufactureDate
                                      ? format(
                                          new Date(
                                            `${batch.manufactureDate}T00:00:00`,
                                          ),
                                          "PPP",
                                        )
                                      : "Select mfg date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={
                                      batch.manufactureDate
                                        ? new Date(
                                            `${batch.manufactureDate}T00:00:00`,
                                          )
                                        : undefined
                                    }
                                    onSelect={(date: Date | undefined) =>
                                      updateBatch(
                                        batch.id,
                                        "manufactureDate",
                                        date ? format(date, "yyyy-MM-dd") : "",
                                      )
                                    }
                                    disabled={(date: Date) => date > new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </td>
                            <td className="px-6 py-3">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className={cn(
                                      "h-10 justify-start px-0 text-left font-medium text-red-500 hover:bg-transparent",
                                      !batch.expiryDate &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {batch.expiryDate
                                      ? format(
                                          new Date(
                                            `${batch.expiryDate}T00:00:00`,
                                          ),
                                          "PPP",
                                        )
                                      : "Select expiry date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={
                                      batch.expiryDate
                                        ? new Date(
                                            `${batch.expiryDate}T00:00:00`,
                                          )
                                        : undefined
                                    }
                                    onSelect={(date: Date | undefined) =>
                                      updateBatch(
                                        batch.id,
                                        "expiryDate",
                                        date ? format(date, "yyyy-MM-dd") : "",
                                      )
                                    }
                                    disabled={(date: Date) => {
                                      if (!batch.manufactureDate) {
                                        return false;
                                      }
                                      return (
                                        date <
                                        new Date(
                                          `${batch.manufactureDate}T00:00:00`,
                                        )
                                      );
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </td>
                            <td className="px-6 py-3">
                              <Input
                                type="number"
                                placeholder="0"
                                value={batch.quantity || ""}
                                onChange={(e) =>
                                  updateBatch(
                                    batch.id,
                                    "quantity",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="h-10 w-24 border-none shadow-none focus-visible:ring-0 font-black p-0 text-base"
                              />
                            </td>
                            <td className="px-6 py-3 text-right">
                              {batches.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeBatch(batch.id)}
                                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logistics Tab */}
            <TabsContent value="logistics" className="mt-6 space-y-6">
              <Card className="rounded-md border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Logistics & Shipping
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Update handling and size metrics.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Shelf Life (Months){" "}
                        <span className="text-muted-foreground ml-2 text-[10px] italic">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        placeholder="e.g. 12"
                        value={shelfLife}
                        onChange={(e) => setShelfLife(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Storage Condition{" "}
                        <span className="text-muted-foreground ml-2 text-[10px] italic">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        placeholder="e.g. Store in cool, dry place"
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Gross Weight ({unit}){" "}
                        <span className="text-muted-foreground ml-2 text-[10px] italic">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Dimensions (LxWxH in cm){" "}
                      <span className="text-muted-foreground ml-2 text-[10px] italic">
                        (Optional)
                      </span>
                    </label>
                    <Input
                      placeholder="e.g. 10 x 5 x 15"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-md border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Product Media
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Update images for this product.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previews.map((src, i) => (
                      <div
                        key={src + i}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/10"
                      >
                        <img
                          src={src}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt="Product Image"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {i === 0 && (
                          <div className="absolute inset-x-0 bottom-0 bg-primary text-white text-[9px] font-black uppercase text-center py-1">
                            Main Image
                          </div>
                        )}
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all group">
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                        Replace/Add
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing" className="mt-6 space-y-6">
              <Card className="rounded-md border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Marketing Hooks
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Update descriptions and features.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Key Features
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addFeature}
                      >
                        + Add Feature
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {features.map((f, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            placeholder="e.g. 100% Raw and Unfiltered"
                            value={f}
                            onChange={(e) => updateFeature(i, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(i)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Health & Organic Benefits
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addBenefit}
                      >
                        + Add Benefit
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {benefits.map((b, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            placeholder="e.g. Boosts Immune System"
                            value={b}
                            onChange={(e) => updateBenefit(i, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBenefit(i)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Search Tags (SEO)
                    </label>
                    <div className="p-4 bg-muted/30 rounded-md border border-border border-dashed">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="rounded-sm py-1 pl-3 pr-1 text-xs font-medium gap-1 group"
                          >
                            {t}
                            <X
                              className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors"
                              onClick={() => removeTag(t)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add more tags..."
                        className="h-10 border-none bg-transparent shadow-none focus-visible:ring-0 p-1 font-medium italic"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border">
                    <div
                      className={cn(
                        "flex items-center gap-4 p-6 rounded-[24px] border transition-all",
                        initialStatus === "Active"
                          ? "bg-muted/50 border-border opacity-70"
                          : "bg-primary/5 border-primary/10",
                      )}
                    >
                      <Checkbox
                        id="activate-update"
                        checked={isActivated}
                        disabled={initialStatus === "Active"}
                        onCheckedChange={(checked) =>
                          setIsActivated(checked as boolean)
                        }
                        className="h-6 w-6 rounded-lg border-primary data-[state=checked]:bg-primary"
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor="activate-update"
                          className="text-base font-black text-primary cursor-pointer"
                        >
                          {initialStatus === "Active"
                            ? "Product is Active"
                            : "Activate Product"}
                        </label>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                          {initialStatus === "Active"
                            ? "Active products cannot be reverted to draft. You can update details, but it remains published."
                            : "Check this to move the product from Draft/Inactive to Active status."}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-8">
          <Card className="rounded-md border-border shadow-soft overflow-hidden sticky top-8">
            <div className="aspect-video bg-muted/30 relative">
              {previews[0] ? (
                <img
                  src={previews[0]}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              {activeCategory && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur-md text-primary hover:bg-white text-[10px] font-black uppercase px-3 py-1 shadow-sm">
                    {activeCategory}
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-black font-heading mb-1">
                  {name || "Unnamed"}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-2 italic">
                  {shortDesc}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-muted-foreground uppercase opacity-60 tracking-tighter mb-1">
                    Price
                  </span>
                  <span className="text-3xl font-black text-primary leading-none">
                    {price ? formatPrice(parseFloat(price)) : formatPrice(0)}
                  </span>
                </div>
                <div className="text-right">
                  <Badge
                    className={cn(
                      "rounded-lg h-7 font-black text-xs px-3",
                      isActivated
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200",
                    )}
                  >
                    {isActivated ? "Active" : "Draft"}
                  </Badge>
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>Total Stock:</span>
                  <span className="text-foreground">
                    {batches.reduce((acc, b) => acc + (b.quantity || 0), 0)}{" "}
                    {unit}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>Batches:</span>
                  <span className="text-foreground">{batches.length}</span>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-14  font-medium text-lg gap-3 shadow-xl shadow-primary/20"
              >
                <Save className="h-5 w-5" />
                {buttonLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
