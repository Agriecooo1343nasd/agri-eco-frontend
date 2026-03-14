"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  BarChart3,
  Search,
  Check,
  Trash2,
  Leaf,
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

export default function CreateProduct() {
  const router = useRouter();
  const { formatPrice } = usePricing();

  const [isDirty, setIsDirty] = useState(false);
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
  const [features, setFeatures] = useState<string[]>([""]);
  const [benefits, setBenefits] = useState<string[]>([""]);

  const [batches, setBatches] = useState<Batch[]>([
    {
      id: "b1",
      batchNumber: "BATCH-001",
      manufactureDate: "",
      expiryDate: "",
      quantity: 0,
    },
  ]);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (
      name ||
      shortDesc ||
      longDesc ||
      price ||
      activeCategory ||
      batches.some((b) => b.batchNumber || b.quantity > 0)
    ) {
      setIsDirty(true);
    }
  }, [name, shortDesc, longDesc, price, activeCategory, batches]);

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

  const parseBatchDate = (value: string): Date | undefined => {
    if (!value) return undefined;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
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
    if (isActivated) {
      toast.success("Product Published Successfully", {
        description: `"${name}" is now live on the marketplace.`,
      });
    } else {
      toast.success("Draft Saved", {
        description: `Your progress on "${name || "Unnamed Product"}" has been saved.`,
      });
    }
    router.push("/admin/products");
  };

  const buttonLabel = isActivated
    ? "Publish Product"
    : isDirty
      ? "Save Draft"
      : "Publish Product";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20 ">
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
          <h1 className="text-3xl font-black font-heading text-foreground tracking-tight">
            Create New Product
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Add a new item to your organic marketplace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-sm h-11 px-6 font-medium"
          >
            Discard
          </Button>
          <Button
            type="submit"
            className="rounded-sm h-11 px-8 font-medium gap-2 shadow-lg shadow-primary/20"
          >
            <Save className="h-4 w-4" />
            {buttonLabel}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-white border p-1 rounded-sm h-auto flex-wrap justify-start gap-1">
              <TabsTrigger
                value="general"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Inventory & Batches
              </TabsTrigger>
              <TabsTrigger
                value="logistics"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Logistics & Media
              </TabsTrigger>
              <TabsTrigger
                value="marketing"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
              >
                Features & Benefits
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="mt-6 space-y-6">
              <Card className="rounded-sm border-border shadow-soft overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        General Information
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Define the core identity of the organic product.
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
                              "w-full justify-between rounded-sm bg-muted/20 border-border text-left font-medium px-4",
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
                          className="w-[300px] p-0 rounded-sm border-border"
                          align="start"
                        >
                          <Command className="rounded-sm">
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
                                    className="py-3 px-4 rounded-sm m-1"
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
                        <SelectTrigger className="h-14 rounded-sm bg-muted/20 border-border font-medium">
                          <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm border-border">
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
                        className="min-h-[160px] rounded-sm bg-muted/20 border-border p-4 font-medium resize-none focus:bg-white transition-all"
                        value={longDesc}
                        onChange={(e) => setLongDesc(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-sm border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-sm flex items-center justify-center text-amber-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Pricing Strategy
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Set your competitive prices and discounts.
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
              <Card className="rounded-sm border-border shadow-soft overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border p-8 pb-4">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="font-heading font-black text-xl">
                          Inventory Management
                        </CardTitle>
                        <CardDescription className="font-medium">
                          Track product batches and availability.
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBatch}
                      className="rounded-sm border-primary/20 text-primary font-medium hover:bg-primary/5"
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
                                      "h-10 w-full justify-start px-0 text-left font-medium hover:bg-transparent",
                                      !batch.manufactureDate &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {batch.manufactureDate
                                      ? format(
                                          parseBatchDate(
                                            batch.manufactureDate,
                                          ) as Date,
                                          "PPP",
                                        )
                                      : "Select date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={parseBatchDate(
                                      batch.manufactureDate,
                                    )}
                                    onSelect={(date) =>
                                      updateBatch(
                                        batch.id,
                                        "manufactureDate",
                                        date ? format(date, "yyyy-MM-dd") : "",
                                      )
                                    }
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
                                      "h-10 w-full justify-start px-0 text-left font-medium text-red-500 hover:bg-transparent",
                                      !batch.expiryDate &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {batch.expiryDate
                                      ? format(
                                          parseBatchDate(
                                            batch.expiryDate,
                                          ) as Date,
                                          "PPP",
                                        )
                                      : "Select date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={parseBatchDate(batch.expiryDate)}
                                    onSelect={(date) =>
                                      updateBatch(
                                        batch.id,
                                        "expiryDate",
                                        date ? format(date, "yyyy-MM-dd") : "",
                                      )
                                    }
                                    disabled={(date) => {
                                      const mfgDate = parseBatchDate(
                                        batch.manufactureDate,
                                      );
                                      return mfgDate ? date < mfgDate : false;
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
                    {batches.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground italic text-sm">
                        No batches added yet. Click &quot;+ Add New Batch&quot;
                        to start.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="bg-primary/5 border border-primary/10 rounded-sm p-6 flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-black text-sm text-primary mb-1 uppercase tracking-tight">
                    Smart Batch Tracking
                  </h5>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                    Each batch represents a specific production run. Our system
                    automatically follows the{" "}
                    <strong>First-Expiring First-Out (FEFO)</strong> principle,
                    ensuring that batches closest to expiry are sold first to
                    minimize waste.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Logistics Tab */}
            <TabsContent value="logistics" className="mt-6 space-y-6">
              <Card className="rounded-sm border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Logistics & Shipping
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Define handling, storage, and size metrics.
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

              {/* Media Section */}
              <Card className="rounded-sm border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Product Media
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Upload high-quality images of your organic product.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previews.map((src, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square rounded-sm overflow-hidden border border-border bg-muted/10"
                      >
                        <img
                          src={src}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt={`Product ${i + 1}`}
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
                    <label className="aspect-square rounded-sm border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all group">
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">
                        Upload Photo
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
              <Card className="rounded-sm border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Marketing Hooks
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Features, benefits, and discoverability tags.
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
                          {features.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFeature(i)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          )}
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
                        className="text-primary font-black hover:bg-primary/5 text-xs"
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
                            className="h-12 rounded-sm border-border bg-muted/20 focus:bg-white transition-all font-medium"
                          />
                          {benefits.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBenefit(i)}
                              className="text-muted-foreground h-12 w-12 rounded-sm hover:bg-red-50 hover:text-red-500 shrink-0"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Search Tags (SEO)
                    </label>
                    <div className="p-4 bg-muted/20 rounded-sm border border-border border-dashed focus-within:border-primary/30 transition-colors">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="rounded-lg py-1 pl-3 pr-1 text-xs font-medium gap-1 group"
                          >
                            {t}
                            <X
                              className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors"
                              onClick={() => removeTag(t)}
                            />
                          </Badge>
                        ))}
                        {tags.length === 0 && (
                          <span className="text-xs text-muted-foreground font-medium italic p-1">
                            No tags added yet...
                          </span>
                        )}
                      </div>
                      <Input
                        placeholder="Type a tag and press Enter..."
                        className="h-10 border-none bg-transparent shadow-none focus-visible:ring-0 p-1 font-medium italic"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center gap-4 bg-primary/5 p-6 rounded-[24px] border border-primary/10">
                      <Checkbox
                        id="activate"
                        checked={isActivated}
                        onCheckedChange={(checked) =>
                          setIsActivated(checked as boolean)
                        }
                        className="h-6 w-6 rounded-lg border-primary data-[state=checked]:bg-primary"
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor="activate"
                          className="text-base font-black text-primary cursor-pointer"
                        >
                          Activate Product
                        </label>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                          Checking this will validate the product data and
                          switch it from <strong>Draft</strong> to{" "}
                          <strong>Active</strong> status upon saving.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card className="rounded-sm border-border shadow-soft overflow-hidden sticky top-8">
            <div className="aspect-video bg-muted/30 relative">
              {previews[0] ? (
                <img
                  src={previews[0]}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 h-full animate-pulse">
                  <Package className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">
                    Image Preview
                  </p>
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
                  {name || "Unnamed Product"}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-2 italic">
                  {shortDesc || "No description provided yet."}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-muted-foreground uppercase opacity-60 tracking-tighter mb-1">
                    Selling for
                  </span>
                  <span className="text-3xl font-black text-primary leading-none">
                    {price ? formatPrice(parseFloat(price)) : formatPrice(0)}
                  </span>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-lg h-7 font-black text-xs px-3",
                      isActivated
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-primary/5 text-primary border-primary/20",
                    )}
                  >
                    {isActivated ? "Active" : "Draft"}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-widest">
                    Product Status
                  </p>
                </div>
              </div>
              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Check
                    className={cn(
                      "h-3 w-3",
                      name && activeCategory && unit && shortDesc
                        ? "text-primary"
                        : "text-muted-foreground opacity-30",
                    )}
                  />{" "}
                  General info set
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Check
                    className={cn(
                      "h-3 w-3",
                      batches[0]?.batchNumber && batches[0]?.quantity > 0
                        ? "text-primary"
                        : "text-muted-foreground opacity-30",
                    )}
                  />{" "}
                  Inventory batches set
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Check
                    className={cn(
                      "h-3 w-3",
                      previews.length > 0
                        ? "text-primary"
                        : "text-muted-foreground opacity-30",
                    )}
                  />{" "}
                  Media uploaded
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-14 rounded-sm font-medium text-lg gap-3 shadow-xl shadow-primary/20 group"
              >
                <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {buttonLabel}
              </Button>
            </CardContent>
          </Card>
          <div className="p-8 bg-black rounded-[40px] text-white relative overflow-hidden">
            <div className="relative z-10">
              <Leaf className="h-10 w-10 text-primary mb-6" />
              <h4 className="text-xl font-black mb-3 font-heading leading-tight">
                Quality Assurance
              </h4>
              <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                By publishing this product, you confirm it meets the Agri-Eco
                high standards for organic production.
              </p>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </form>
  );
}
