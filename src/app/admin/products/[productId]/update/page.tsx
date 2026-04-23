/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  fetchAdminProductById,
  updateAdminProduct,
  deleteAdminProductBatch,
  deleteAdminProductImage,
  uploadAdminProductMedia,
  fetchCategoriesForAdmin,
  toAbsoluteMediaUrl,
  type CreateAdminProductPayload,
  type ProductCategory,
  type AdminProduct,
} from "@/lib/api/products";
import { fetchAdminArtisans } from "@/lib/api/artisans";

interface Batch {
  id: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  status: "active" | "expired" | "depleted";
  supplier?: string;
  persisted?: boolean;
}

const VALID_UNITS = ["kg", "g", "lb", "oz", "pack", "piece", "bunch", "dozen"] as const;

const normalizeUnit = (value?: string) => {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) return "";

  // Legacy aliases from older data entries.
  if (normalized === "l" || normalized === "liter" || normalized === "litre") {
    return "piece";
  }

  return (VALID_UNITS as readonly string[]).includes(normalized)
    ? normalized
    : "";
};

const toIsoDateTime = (value?: string) => {
  if (!value?.trim()) return undefined;
  const raw = value.trim();

  // Date-only inputs from <input type="date"> need a full RFC3339 datetime.
  const normalized = raw.includes("T") ? raw : `${raw}T00:00:00.000Z`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const toDateInput = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.includes("T") ? value.split("T")[0] : value;
  }
  return parsed.toISOString().slice(0, 10);
};

const parseDimensions = (value: string) => {
  const matches = value
    .split(/[xX]/)
    .map((part) => Number(part.trim()))
    .filter((num) => Number.isFinite(num));

  if (matches.length !== 3) return undefined;

  const [length, width, height] = matches;
  return { length, width, height };
};

const normalizeML = (val: any): MultiLangValue => {
  if (!val) return emptyLangValue();
  if (typeof val === "string") return { ...emptyLangValue(), en: val };
  return { ...emptyLangValue(), ...val };
};

export default function UpdateProduct() {
  const routeParams = useParams<{ productId: string | string[] }>();
  const routeProductId = Array.isArray(routeParams?.productId)
    ? routeParams.productId[0]
    : routeParams?.productId;
  const productId = routeProductId ?? "";
  const router = useRouter();
  const { formatPrice } = usePricing();

  // Fetch product data
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => fetchAdminProductById(productId),
    enabled: !!productId,
  });

  // Fetch categories
  const { data: categoryResult } = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: () => fetchCategoriesForAdmin(),
  });
  const categories: ProductCategory[] = categoryResult?.data ?? [];

  const [artisanId, setArtisanId] = useState("");
  const [artisanSearch, setArtisanSearch] = useState("");
  const [isArtisanOpen, setIsArtisanOpen] = useState(false);

  const artisansQuery = useQuery({
    queryKey: ["admin-artisans-search", artisanSearch],
    queryFn: () => fetchAdminArtisans({ search: artisanSearch, limit: 10 }),
  });
  const artisans = artisansQuery.data?.data ?? [];
  const activeArtisan = artisans.find((a) => a.id === artisanId) ?? product?.artisan;

  // State for form fields
  const [name, setName] = useState<MultiLangValue>(emptyLangValue());
  const [shortDesc, setShortDesc] = useState<MultiLangValue>(emptyLangValue());
  const [longDesc, setLongDesc] = useState<MultiLangValue>(emptyLangValue());
  const [unit, setUnit] = useState("kg");
  const [activeCategory, setActiveCategory] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [storage, setStorage] = useState<MultiLangValue>(emptyLangValue());
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState<MultiLangValue[]>([]);
  const [benefits, setBenefits] = useState<MultiLangValue[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [productType, setProductType] = useState<"consumable" | "articraft">(
    "consumable",
  );
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);
  const [initialStatus, setInitialStatus] = useState<
    "Active" | "Draft" | "Inactive"
  >("Draft");
  const [activeTab, setActiveTab] = useState("general");
  const [maxReturnDays, setMaxReturnDays] = useState("14");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const selectedCategoryLabel =
    categories.find((c) => c.id === activeCategory)?.name ??
    categories.find((c) => c.name === activeCategory)?.name ??
    product?.category?.name ??
    "";
  const mediaPreviews = existingImageUrls.map((url) => ({
    key: `existing-${url}`,
    src: toAbsoluteMediaUrl(url),
    existing: true as const,
    rawUrl: url,
  }));

  useEffect(() => {
    if (!product) return;
    setName(normalizeML(product.name));
    setShortDesc(normalizeML(product.shortDescription));
    setLongDesc(normalizeML(product.description));
    setUnit(normalizeUnit(product.unit || product.measurementUnit) || "kg");
    setActiveCategory(product.category?.id ?? "");
    setPrice(product.sellingPrice?.toString() ?? "");
    setOldPrice(product.originalPrice ? product.originalPrice.toString() : "");
    setTags(product.tags ?? []);
    setFeatures((product.features ?? []).map(normalizeML));
    setBenefits((product.benefits ?? []).map(normalizeML));
    setMaxReturnDays(String((product as any).maxReturnDays || 14));
    setBatches(
      (product.batches ?? []).map((batch, index) => ({
        id: `${batch.batchId}-${index}`,
        batchNumber: batch.batchId ?? "",
        manufactureDate: toDateInput(batch.receivedDate),
        expiryDate: toDateInput(batch.expiryDate),
        quantity: Number(batch.quantity) || 0,
        status: batch.status ?? "active",
        supplier: batch.supplier,
        persisted: true,
      })),
    );
    setWeight(
      product.shipping?.weight !== undefined
        ? String(product.shipping.weight)
        : "",
    );
    setShelfLife(product.shipping?.shelfLife ?? "");
    setStorage(normalizeML(product.shipping?.storageCondition));
    setProductType(product.productType ?? "consumable");
    setDimensions(
      product.shipping?.dimensions
        ? `${product.shipping.dimensions.length} x ${product.shipping.dimensions.width} x ${product.shipping.dimensions.height}`
        : "",
    );
    setArtisanId(product.artisan?.id ?? "");
    setExistingImageUrls((product.images ?? []).map((img) => img.url));
    setIsActivated(product.isActive ?? false);
    setInitialStatus(product.isActive ? "Active" : "Draft");
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: ({
      payload,
      files,
    }: {
      payload: Partial<CreateAdminProductPayload>;
      files?: { images?: File[]; videos?: File[] };
    }) => updateAdminProduct(productId, payload, files),
    onSuccess: () => {
      toast.success("Product updated successfully");
      router.push("/admin/products");
    },
    onError: (err: Error) => {
      toast.error("Update failed", { description: err.message || "" });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: ({ batchId }: { batchId: string; localId: string }) =>
      deleteAdminProductBatch(productId, batchId),
    onSuccess: (_, variables) => {
      setBatches((prev) =>
        prev.filter((batch) => batch.id !== variables.localId),
      );
      toast.success("Batch deleted");
    },
    onError: (err: Error) => {
      toast.error("Unable to delete batch", {
        description: err.message || "Please try again.",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (url: string) => deleteAdminProductImage(productId, url),
    onSuccess: (updatedProduct, removedUrl) => {
      if (updatedProduct.images?.length) {
        setExistingImageUrls(updatedProduct.images.map((img) => img.url));
      } else {
        setExistingImageUrls((prev) =>
          prev.filter((url) => url !== removedUrl),
        );
      }
      toast.success("Image removed");
    },
    onError: (err: Error) => {
      toast.error("Unable to remove image", {
        description: err.message || "Please try again.",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (files: File[]) =>
      uploadAdminProductMedia(productId, { images: files }),
    onSuccess: (updatedProduct) => {
      setExistingImageUrls((updatedProduct.images ?? []).map((img) => img.url));
      toast.success("Image uploaded");
    },
    onError: (err: Error) => {
      toast.error("Unable to upload image", {
        description: err.message || "Please try again.",
      });
    },
  });

  const persistPartialUpdate = async (
    payload: Partial<CreateAdminProductPayload>,
  ) => {
    try {
      await updateAdminProduct(productId, payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      throw new Error(message);
    }
  };

  // Submit handler
  // Duplicate handleSubmit removed. Only keep one definition.

  if (productLoading) return <div className="p-8 text-center">Loading...</div>;
  if (productError)
    return (
      <div className="p-8 text-center text-red-500">Error loading product.</div>
    );
  if (!product)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Product not found.
      </div>
    );

  // Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = async (t: string) => {
    const previous = tags;
    const next = tags.filter((tag) => tag !== t);
    setTags(next);

    try {
      await persistPartialUpdate({ tags: next });
    } catch (error) {
      setTags(previous);
      toast.error("Unable to remove tag", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const addFeature = () => setFeatures([...features, emptyLangValue()]);
  const updateFeature = (i: number, val: MultiLangValue) => {
    const next = [...features];
    next[i] = val;
    setFeatures(next);
  };
  const removeFeature = async (i: number) => {
    const previous = features;
    const next = features.filter((_, idx) => idx !== i);
    setFeatures(next);

    try {
      await persistPartialUpdate({ features: next });
    } catch (error) {
      setFeatures(previous);
      toast.error("Unable to remove feature", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const addBenefit = () => setBenefits([...benefits, emptyLangValue()]);
  const updateBenefit = (i: number, val: MultiLangValue) => {
    const next = [...benefits];
    next[i] = val;
    setBenefits(next);
  };
  const removeBenefit = async (i: number) => {
    const previous = benefits;
    const next = benefits.filter((_, idx) => idx !== i);
    setBenefits(next);

    try {
      await persistPartialUpdate({ benefits: next });
    } catch (error) {
      setBenefits(previous);
      toast.error("Unable to remove benefit", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    uploadImageMutation.mutate(files);
    e.target.value = "";
  };

  const removeExistingImage = (url: string) => {
    deleteImageMutation.mutate(url);
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
        status: "active",
      },
    ]);
  };
  const updateBatch = <K extends keyof Batch>(
    batchId: string,
    field: K,
    value: Batch[K],
  ) => {
    setBatches(
      batches.map((b) => (b.id === batchId ? { ...b, [field]: value } : b)),
    );
  };
  const removeBatch = (batch: Batch) => {
    if (batch.persisted) {
      deleteBatchMutation.mutate({
        batchId: batch.batchNumber,
        localId: batch.id,
      });
      return;
    }

    setBatches(batches.filter((b) => b.id !== batch.id));
  };

  const createCategory = () => {
    // Category creation logic should be handled via API, not local state.
    // Remove setCategories and fix category handling.
    if (
      searchCategory &&
      !categories.some((cat) => cat.name === searchCategory)
    ) {
      setActiveCategory(searchCategory);
      setIsCategoryOpen(false);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        return next;
      });
      toast.success("New Category Added", {
        description: `Added "${searchCategory}" to categories.`,
      });
    }
  };

  // Validate required fields before submission
  const validateForm = (): {
    valid: boolean;
    errors: Record<string, string>;
    firstErrorTab: string;
    firstErrorFieldId: string;
  } => {
    const errors: Record<string, string> = {};
    if (!name.en.trim()) errors.name = "Product name (English) is required";
    if (!activeCategory) errors.category = "Category is required";
    if (!unit.trim()) errors.unit = "Unit is required";
    if (!shortDesc.en.trim()) errors.shortDesc = "Short description (English) is required";
    if (!price || Number(price) <= 0)
      errors.price = "Selling price must be greater than 0";
    batches.forEach((batch, i) => {
      if (!batch.batchNumber.trim())
        errors[`batch_${i}_batchNumber`] = "Batch name is required";
      if (!batch.expiryDate)
        errors[`batch_${i}_expiryDate`] = "Expiry date is required";
    });
    const generalFieldKeys = ["name", "category", "unit", "shortDesc", "price"];
    const hasGeneralErrors = generalFieldKeys.some((k) => k in errors);
    const hasInventoryErrors = Object.keys(errors).some((k) =>
      k.startsWith("batch_"),
    );
    let firstErrorTab = "general";
    let firstErrorFieldId = "";
    if (hasGeneralErrors) {
      firstErrorTab = "general";
      const firstKey = generalFieldKeys.find((k) => k in errors) ?? "";
      firstErrorFieldId = firstKey ? `field-${firstKey}` : "";
    } else if (hasInventoryErrors) {
      firstErrorTab = "inventory";
      const firstBatchKey = Object.keys(errors).find((k) =>
        k.startsWith("batch_"),
      );
      firstErrorFieldId = firstBatchKey ? `field-${firstBatchKey}` : "";
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors,
      firstErrorTab,
      firstErrorFieldId,
    };
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { errors: validationErrors, firstErrorTab, firstErrorFieldId, valid } = validateForm();
    if (!valid) {
      setFieldErrors(validationErrors);
      setActiveTab(firstErrorTab);
      if (firstErrorFieldId) {
        setTimeout(() => {
          const el = document.getElementById(firstErrorFieldId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            (el as HTMLElement).focus?.();
          }
        }, 150);
      }
      return;
    }
    setFieldErrors({});
    const parsedDimensions = dimensions.trim()
      ? parseDimensions(dimensions)
      : undefined;

    const payload = {
      name,
      shortDescription: shortDesc,
      description: longDesc,
      productType,
      unit: unit.trim().toLowerCase() as CreateAdminProductPayload["unit"],
      category: activeCategory,
      sellingPrice: Number(price),
      originalPrice: (Number(oldPrice) > 0 ? Number(oldPrice) : null) as unknown as number,
      tags,
      features,
      benefits,
      marketingHooks: features.map((f) => ({
        label: f.en || "",
        isActive: true,
      })),
      healthBenefits: benefits.map((b) => ({ title: b.en || "" })),
      batches: batches.map((batch) => ({
        batchId: batch.batchNumber || batch.id,
        quantity: batch.quantity,
        costPrice: 0,
        expiryDate: toIsoDateTime(batch.expiryDate),
        receivedDate: toIsoDateTime(batch.manufactureDate),
        status: batch.status,
        supplier: batch.supplier,
      })),
      shipping:
        weight || shelfLife || storage.en || parsedDimensions
          ? {
              weight: weight ? Number(weight) : undefined,
              dimensions: parsedDimensions,
              shelfLife: shelfLife || undefined,
              storageCondition: storage,
            }
          : undefined,
      isActive: isActivated,
      maxReturnDays: Number(maxReturnDays || 14),
      trackInventory: true,
      stock: batches.reduce((acc, b) => acc + (b.quantity || 0), 0),
      artisanId: artisanId || undefined,
    } as any;
    updateMutation.mutate({ payload });
  };

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
            Modify the properties and stock levels for {name.en}.
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Product Name <span className="text-destructive">*</span>
                      </label>
                      <MultiLangInput
                        value={name}
                        onChange={setName}
                        placeholder="e.g. Pure Mountain Honey"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Product Type <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={productType}
                        onValueChange={(v: any) => setProductType(v)}
                      >
                        <SelectTrigger className="rounded-xl bg-muted/20 border-border font-medium">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                          <SelectItem value="consumable">Consumable</SelectItem>
                          <SelectItem value="articraft">Articraft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                            id="field-category"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              " w-full justify-between bg-muted/20 border-border text-left font-medium px-4",
                              !activeCategory && "text-muted-foreground",
                              fieldErrors.category && "border-destructive",
                            )}
                          >
                            {activeCategory
                              ? selectedCategoryLabel || activeCategory
                              : "Select or create category..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-75 p-0 border-border"
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
                                    key={c.id}
                                    value={c.id}
                                    onSelect={(currentValue) => {
                                      setActiveCategory(
                                        currentValue === activeCategory
                                          ? ""
                                          : currentValue,
                                      );
                                      setIsCategoryOpen(false);
                                      if (fieldErrors.category)
                                        setFieldErrors((prev) => {
                                          const next = { ...prev };
                                          delete next.category;
                                          return next;
                                        });
                                    }}
                                    className="py-3 px-4 rounded-xl m-1"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        activeCategory === c.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="font-medium">
                                      {c.name}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {fieldErrors.category && (
                        <p className="text-destructive text-xs mt-1 font-medium">
                          {fieldErrors.category}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Artisan / Owner
                      </label>
                      <Popover
                        open={isArtisanOpen}
                        onOpenChange={setIsArtisanOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between rounded-sm bg-muted/20 border-border text-left font-medium px-4 h-11",
                              !artisanId && "text-muted-foreground",
                            )}
                          >
                            {artisanId === "" ? "None (Our Shop)" : (activeArtisan?.name || "Select artisan...")}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full min-w-[300px] p-0 rounded-sm border-border"
                          align="start"
                        >
                          <Command className="rounded-sm">
                            <CommandInput
                              placeholder="Search artisan..."
                              value={artisanSearch}
                              onValueChange={setArtisanSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No artisan found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="none"
                                  onSelect={() => {
                                    setArtisanId("");
                                    setIsArtisanOpen(false);
                                  }}
                                  className="py-3 px-4 rounded-sm m-1"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      artisanId === "" ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span className="font-medium">None (Our Shop)</span>
                                </CommandItem>
                                {artisans.map((artisan) => (
                                  <CommandItem
                                    key={artisan.id}
                                    value={artisan.name}
                                    onSelect={() => {
                                      setArtisanId(artisan.id);
                                      setIsArtisanOpen(false);
                                    }}
                                    className="py-3 px-4 rounded-sm m-1"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        artisanId === artisan.id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    <span className="font-medium">{artisan.name}</span>
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
                      <Select
                        value={unit}
                        onValueChange={(val) => {
                          setUnit(normalizeUnit(val));
                          if (fieldErrors.unit)
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.unit;
                              return next;
                            });
                        }}
                      >
                        <SelectTrigger
                          id="field-unit"
                          className={cn(
                            "h-14 bg-muted/20 border-border font-medium",
                            fieldErrors.unit && "border-destructive",
                          )}
                        >
                          <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                          <SelectItem value="oz">Ounces (oz)</SelectItem>
                          <SelectItem value="pack">Packets / Units</SelectItem>
                          <SelectItem value="piece">Pieces</SelectItem>
                          <SelectItem value="bunch">Bunch</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldErrors.unit && (
                        <p className="text-destructive text-xs mt-1 font-medium">
                          {fieldErrors.unit}
                        </p>
                      )}
                    </div>
                  </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Short Description <span className="text-destructive">*</span>
                      </label>
                      <MultiLangInput
                        type="textarea"
                        value={shortDesc}
                        onChange={setShortDesc}
                        placeholder="Brief summary for product cards..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Long Description
                      </label>
                      <MultiLangInput
                        type="textarea"
                        value={longDesc}
                        onChange={setLongDesc}
                        placeholder="Detailed product information..."
                        rows={6}
                      />
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
                        id="field-price"
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (fieldErrors.price)
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.price;
                              return next;
                            });
                        }}
                        className={cn(
                          fieldErrors.price &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        required
                      />
                      {fieldErrors.price && (
                        <p className="text-destructive text-xs mt-1 font-medium">
                          {fieldErrors.price}
                        </p>
                      )}
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
                          Manage current batches for {name.en}.
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
                  <div className="overflow-x-auto">
                    <div className="bg-white border rounded-sm overflow-hidden shadow-sm min-w-[920px]">
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
                            <th className="px-6 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                              Status
                            </th>
                            <th className="px-6 py-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {batches.map((batch, batchIndex) => (
                            <tr key={batch.id}>
                              <td className="px-6 py-3 align-top">
                                <Input
                                  id={`field-batch_${batchIndex}_batchNumber`}
                                  placeholder="e.g. B-2026-A"
                                  value={batch.batchNumber}
                                  onChange={(e) => {
                                    updateBatch(
                                      batch.id,
                                      "batchNumber",
                                      e.target.value,
                                    );
                                    if (
                                      fieldErrors[
                                        `batch_${batchIndex}_batchNumber`
                                      ]
                                    )
                                      setFieldErrors((prev) => {
                                        const next = { ...prev };
                                        delete next[
                                          `batch_${batchIndex}_batchNumber`
                                        ];
                                        return next;
                                      });
                                  }}
                                  className={cn(
                                    "h-10 border-none shadow-none focus-visible:ring-0 font-medium p-0",
                                    batch.persisted &&
                                      "text-muted-foreground cursor-not-allowed",
                                    fieldErrors[
                                      `batch_${batchIndex}_batchNumber`
                                    ] && "ring-1 ring-destructive rounded",
                                  )}
                                  readOnly={batch.persisted}
                                />
                                {fieldErrors[
                                  `batch_${batchIndex}_batchNumber`
                                ] && (
                                  <p className="text-destructive text-[10px] mt-1 font-medium">
                                    {
                                      fieldErrors[
                                        `batch_${batchIndex}_batchNumber`
                                      ]
                                    }
                                  </p>
                                )}
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
                                          date
                                            ? format(date, "yyyy-MM-dd")
                                            : "",
                                        )
                                      }
                                      disabled={(date: Date) =>
                                        date > new Date()
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </td>
                              <td className="px-6 py-3 align-top">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      id={`field-batch_${batchIndex}_expiryDate`}
                                      type="button"
                                      variant="ghost"
                                      className={cn(
                                        "h-10 justify-start px-0 text-left font-medium text-red-500 hover:bg-transparent",
                                        !batch.expiryDate &&
                                          "text-muted-foreground",
                                        fieldErrors[
                                          `batch_${batchIndex}_expiryDate`
                                        ] &&
                                          "text-destructive underline decoration-dashed",
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
                                      onSelect={(date: Date | undefined) => {
                                        updateBatch(
                                          batch.id,
                                          "expiryDate",
                                          date
                                            ? format(date, "yyyy-MM-dd")
                                            : "",
                                        );
                                        if (
                                          date &&
                                          fieldErrors[
                                            `batch_${batchIndex}_expiryDate`
                                          ]
                                        )
                                          setFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next[
                                              `batch_${batchIndex}_expiryDate`
                                            ];
                                            return next;
                                          });
                                      }}
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
                                {fieldErrors[
                                  `batch_${batchIndex}_expiryDate`
                                ] && (
                                  <p className="text-destructive text-[10px] mt-1 font-medium">
                                    {
                                      fieldErrors[
                                        `batch_${batchIndex}_expiryDate`
                                      ]
                                    }
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={batch.quantity || ""}
                                  onChange={(e) => {
                                    const parsed = Number.parseInt(
                                      e.target.value,
                                      10,
                                    );
                                    updateBatch(
                                      batch.id,
                                      "quantity",
                                      Number.isNaN(parsed) ? 0 : parsed,
                                    );
                                  }}
                                  className="h-10 w-24 border-none shadow-none focus-visible:ring-0 font-black p-0 text-base"
                                />
                              </td>
                              <td className="px-6 py-3">
                                <Select
                                  value={batch.status}
                                  onValueChange={(value) =>
                                    updateBatch(
                                      batch.id,
                                      "status",
                                      value as Batch["status"],
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-9 w-32">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="expired">
                                      Expired
                                    </SelectItem>
                                    <SelectItem value="depleted">
                                      Depleted
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-6 py-3 text-right">
                                {batches.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeBatch(batch)}
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
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Max Return Days
                      </label>
                      <Input
                        type="number"
                        placeholder="14"
                        value={maxReturnDays}
                        onChange={(e) => setMaxReturnDays(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground italic ml-1 leading-relaxed">
                        Allowed days for returns after delivery.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Storage Conditions
                      </label>
                      <MultiLangInput
                        value={storage}
                        onChange={setStorage}
                        placeholder="e.g. Store in a cool, dry place"
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
                    {mediaPreviews.map((image, i) => (
                      <div
                        key={image.key}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted/10"
                      >
                        <img
                          src={image.src}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          alt="Product Image"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.rawUrl)}
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
                    <div className="space-y-4">
                      {features.map((f, i) => (
                        <div key={i} className="flex gap-3">
                          <MultiLangInput
                            value={f}
                            onChange={(val) => updateFeature(i, val)}
                            className="flex-1"
                            hideLabel
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(i)}
                            className="shrink-0 text-muted-foreground hover:text-destructive mt-1"
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
                    <div className="space-y-4">
                      {benefits.map((b, i) => (
                        <div key={i} className="flex gap-3">
                          <MultiLangInput
                            value={b}
                            onChange={(val) => updateBenefit(i, val)}
                            className="flex-1"
                            hideLabel
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBenefit(i)}
                            className="shrink-0 text-muted-foreground hover:text-destructive mt-1"
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
              {mediaPreviews[0] ? (
                <img
                  src={mediaPreviews[0].src}
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
                  {name.en || "Unnamed"}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-2 italic">
                  {shortDesc.en}
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
