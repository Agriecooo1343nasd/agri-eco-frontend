"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Film,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { showApiErrorToast } from "@/lib/api/error";
import {
  createAdminProduct,
  createCategoryForAdmin,
  fetchCategoriesForAdmin,
  type CreateAdminProductPayload,
  type InventoryBatchPayload,
} from "@/lib/api/products";
import { fetchAdminArtisans } from "@/lib/api/artisans";
import { usePricing } from "@/context/PricingContext";
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
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";

interface BatchRow {
  id: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
  supplier: string;
}

interface LocalDraftShape {
  isActivated: boolean;
  name: MultiLangValue;
  sku: string;
  shortDesc: MultiLangValue;
  longDesc: MultiLangValue;
  unit: UnitValue;
  activeCategoryId: string;
  price: string;
  oldPrice: string;
  costPrice: string;
  lowStockThreshold: string;
  maxReturnDays: string;
  weight: string;
  dimensions: string;
  shelfLife: string;
  storage: MultiLangValue;
  requiresRefrigeration: boolean;
  tags: string[];
  features: MultiLangValue[];
  benefits: MultiLangValue[];
  productType: "consumable" | "articraft";
  batches: BatchRow[];
  artisanId?: string;
}

type UnitValue =
  | "kg"
  | "g"
  | "piece"
  | "bunch"
  | "pack"
  | "dozen"
  | "lb"
  | "piece";

const DRAFT_STORAGE_KEY = "admin-products-create-local-draft-v2";

const UNIT_OPTIONS: Array<{ value: UnitValue; label: string }> = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "piece", label: "Pieces" },
  { value: "bunch", label: "Bunch" },
  { value: "pack", label: "Pack" },
  { value: "dozen", label: "Dozen" },
  { value: "lb", label: "Pounds (lb)" },
  { value: "piece", label: "Pieces" },
];

const EMPTY_BATCH = (): BatchRow => ({
  id: crypto.randomUUID(),
  batchNumber: "",
  manufactureDate: "",
  expiryDate: "",
  quantity: 0,
  costPrice: 0,
  supplier: "",
});

function parseBatchDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toIsoStartOfDay(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function parseDimensions(
  input: string,
): { length: number; width: number; height: number } | undefined {
  const cleaned = input.trim().toLowerCase().replace(/cm/g, "");
  if (!cleaned) return undefined;

  const parts = cleaned
    .split(/[x×]/)
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (parts.length !== 3) return undefined;

  return {
    length: parts[0],
    width: parts[1],
    height: parts[2],
  };
}

const normalizeML = (val: any): MultiLangValue => {
  if (!val) return emptyLangValue();
  if (typeof val === "string") return { ...emptyLangValue(), en: val };
  return { ...emptyLangValue(), ...val };
};

function readInitialLocalDraft(): LocalDraftShape | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!rawDraft) {
    return null;
  }

  try {
    return JSON.parse(rawDraft) as LocalDraftShape;
  } catch {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return null;
  }
}

export default function CreateProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { formatPrice } = usePricing();

  const initialDraft = useMemo(() => readInitialLocalDraft(), []);

  const [isActivated, setIsActivated] = useState(
    initialDraft?.isActivated ?? false,
  );
  const [name, setName] = useState<MultiLangValue>(
    normalizeML(initialDraft?.name),
  );
  const [sku, setSku] = useState(initialDraft?.sku ?? "");
  const [shortDesc, setShortDesc] = useState<MultiLangValue>(
    normalizeML(initialDraft?.shortDesc),
  );
  const [longDesc, setLongDesc] = useState<MultiLangValue>(
    normalizeML(initialDraft?.longDesc),
  );
  const [unit, setUnit] = useState<UnitValue>(initialDraft?.unit ?? "kg");
  const [productType, setProductType] = useState<"consumable" | "articraft">(
    initialDraft?.productType ?? "consumable",
  );

  const [activeCategoryId, setActiveCategoryId] = useState(
    initialDraft?.activeCategoryId ?? "",
  );
  const [searchCategory, setSearchCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const searchParams = useSearchParams();
  const [artisanId, setArtisanId] = useState(
    initialDraft?.artisanId ?? searchParams.get("artisanId") ?? "",
  );
  const [artisanSearch, setArtisanSearch] = useState("");
  const [isArtisanOpen, setIsArtisanOpen] = useState(false);

  const [price, setPrice] = useState(initialDraft?.price ?? "");
  const [oldPrice, setOldPrice] = useState(initialDraft?.oldPrice ?? "");
  const [costPrice, setCostPrice] = useState(initialDraft?.costPrice ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialDraft?.lowStockThreshold ?? "10",
  );
  const [maxReturnDays, setMaxReturnDays] = useState(
    initialDraft?.maxReturnDays ?? "14",
  );

  const [weight, setWeight] = useState(initialDraft?.weight ?? "");
  const [dimensions, setDimensions] = useState(initialDraft?.dimensions ?? "");
  const [shelfLife, setShelfLife] = useState(initialDraft?.shelfLife ?? "");
  const [storage, setStorage] = useState<MultiLangValue>(
    initialDraft?.storage ?? emptyLangValue(),
  );
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(
    initialDraft?.requiresRefrigeration ?? false,
  );

  const [tags, setTags] = useState<string[]>(initialDraft?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [features, setFeatures] = useState<MultiLangValue[]>(
    initialDraft?.features?.length ? initialDraft.features : [emptyLangValue()],
  );
  const [benefits, setBenefits] = useState<MultiLangValue[]>(
    initialDraft?.benefits?.length ? initialDraft.benefits : [emptyLangValue()],
  );
  const [batches, setBatches] = useState<BatchRow[]>(
    initialDraft?.batches?.length ? initialDraft.batches : [EMPTY_BATCH()],
  );

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [formError, setFormError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: () => fetchCategoriesForAdmin(),
  });

  const artisansQuery = useQuery({
    queryKey: ["admin-artisans-search", artisanSearch],
    queryFn: () => fetchAdminArtisans({ search: artisanSearch, limit: 10 }),
  });

  const artisans = artisansQuery.data?.data ?? [];
  const activeArtisan = artisans.find((a) => a.id === artisanId) ?? null;

  const createCategoryMutation = useMutation({
    mutationFn: createCategoryForAdmin,
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
      setActiveCategoryId(category.id);
      setSearchCategory("");
      setIsCategoryOpen(false);
      toast.success("Category created", {
        description: `${category.name} is now available for products.`,
      });
    },
    onError: showApiErrorToast,
  });

  const createProductMutation = useMutation({
    mutationFn: ({
      payload,
      files,
    }: {
      payload: CreateAdminProductPayload;
      files: { images?: File[]; videos?: File[] };
    }) => createAdminProduct(payload, files),
    onSuccess: (created) => {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(isActivated ? "Product published" : "Draft saved", {
        description: `${created.name} has been successfully ${isActivated ? "published" : "saved as draft"}.`,
      });
      router.push("/admin/products");
    },
    onError: showApiErrorToast,
  });

  const categories = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data?.data],
  );
  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? null;

  const filteredCategories = useMemo(() => {
    const query = searchCategory.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, searchCategory]);

  const isDirty =
    !!name.en ||
    !!sku ||
    !!shortDesc.en ||
    !!longDesc.en ||
    !!price ||
    !!activeCategoryId ||
    tags.length > 0 ||
    features.some((item) => item.en.trim()) ||
    benefits.some((item) => item.en.trim()) ||
    batches.some((b) => b.batchNumber || b.quantity > 0 || b.costPrice > 0);

  useEffect(() => {
    if (!initialDraft) return;

    toast.message("Local draft restored", {
      description:
        "Your unfinished product form has been restored from this browser.",
    });
  }, [initialDraft]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews, videoPreviews]);

  const addFeature = () => setFeatures([...features, emptyLangValue()]);
  const updateFeature = (index: number, value: MultiLangValue) => {
    const next = [...features];
    next[index] = value;
    setFeatures(next);
  };
  const removeFeature = (index: number) =>
    setFeatures(features.filter((_, i) => i !== index));

  const addBenefit = () => setBenefits([...benefits, emptyLangValue()]);
  const updateBenefit = (index: number, value: MultiLangValue) => {
    const next = [...benefits];
    next[index] = value;
    setBenefits(next);
  };
  const removeBenefit = (index: number) =>
    setBenefits(benefits.filter((_, i) => i !== index));

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const value = tagInput.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setTagInput("");
      return;
    }

    setTags([...tags, value]);
    setTagInput("");
  };

  const removeTag = (value: string) => {
    setTags(tags.filter((tag) => tag !== value));
  };

  const addBatch = () => setBatches([...batches, EMPTY_BATCH()]);
  const removeBatch = (batchId: string) =>
    setBatches(batches.filter((batch) => batch.id !== batchId));

  const updateBatch = <K extends keyof BatchRow>(
    batchId: string,
    field: K,
    value: BatchRow[K],
  ) => {
    setBatches(
      batches.map((batch) =>
        batch.id === batchId ? { ...batch, [field]: value } : batch,
      ),
    );
  };

  const handleImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (!picked.length) return;

    const next = [...images, ...picked].slice(0, 10);
    const limited = next.length < images.length + picked.length;

    if (limited) {
      toast.warning("Image limit reached", {
        description: "A product can include up to 10 images.",
      });
    }

    const previews = next.map((file) => URL.createObjectURL(file));
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImages(next);
    setImagePreviews(previews);
    event.target.value = "";
  };

  const handleVideosUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (!picked.length) return;

    const next = [...videos, ...picked].slice(0, 3);
    const limited = next.length < videos.length + picked.length;

    if (limited) {
      toast.warning("Video limit reached", {
        description: "A product can include up to 3 videos.",
      });
    }

    const previews = next.map((file) => URL.createObjectURL(file));
    videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setVideos(next);
    setVideoPreviews(previews);
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    const nextFiles = images.filter((_, i) => i !== index);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImages(nextFiles);
    setImagePreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  };

  const removeVideo = (index: number) => {
    const nextFiles = videos.filter((_, i) => i !== index);
    videoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setVideos(nextFiles);
    setVideoPreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  };

  const createCategory = async () => {
    const value = searchCategory.trim();
    if (!value) return;

    const existing = categories.find(
      (category) => category.name.toLowerCase() === value.toLowerCase(),
    );
    if (existing) {
      setActiveCategoryId(existing.id);
      setIsCategoryOpen(false);
      return;
    }

    await createCategoryMutation.mutateAsync({ name: value });
  };

  const serializeLocalDraft = (): LocalDraftShape => ({
    isActivated,
    name,
    sku,
    shortDesc,
    longDesc,
    unit,
    activeCategoryId,
    price,
    oldPrice,
    costPrice,
    lowStockThreshold,
    maxReturnDays,
    weight,
    dimensions,
    shelfLife,
    storage,
    requiresRefrigeration,
    productType,
    tags,
    features,
    benefits,
    batches,
    artisanId,
  });

  const saveDraftLocally = () => {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(serializeLocalDraft()),
    );
    toast.success("Draft saved locally", {
      description:
        "Incomplete product data was saved in this browser. Complete required fields to save it to backend.",
    });
  };

  const getRequiredValidationMessage = () => {
    if (!name.en.trim()) return "Product name (English) is required.";
    if (!sku.trim()) return "SKU is required.";
    if (!activeCategoryId) return "Category is required.";
    if (!price || Number(price) < 0)
      return "Selling price is required and must be non-negative.";
    if (!longDesc.en.trim() && !shortDesc.en.trim()) {
      return "Provide at least one description in English (short or long).";
    }
    return null;
  };

  const toPayloadBatches = (): InventoryBatchPayload[] =>
    batches
      .filter(
        (batch) =>
          batch.batchNumber.trim() ||
          batch.quantity > 0 ||
          batch.costPrice > 0 ||
          batch.expiryDate ||
          batch.manufactureDate ||
          batch.supplier.trim(),
      )
      .map((batch) => ({
        batchId: batch.batchNumber.trim(),
        quantity: Number(batch.quantity || 0),
        costPrice: Number(batch.costPrice || 0),
        expiryDate: toIsoStartOfDay(batch.expiryDate),
        receivedDate: toIsoStartOfDay(batch.manufactureDate),
        supplier: batch.supplier.trim() || undefined,
        status: "active" as const,
      }))
      .filter((batch) => batch.batchId);

  const buildCreatePayload = (): CreateAdminProductPayload => {
    const sellingPrice = Number(price || 0);
    const originalPrice = Number(oldPrice || 0);
    const parsedCostPrice = Number(costPrice || 0);

    const cleanedFeatures = features
      .map((value) => value.en.trim())
      .filter(Boolean);
    const cleanedBenefits = benefits
      .map((value) => value.en.trim())
      .filter(Boolean);

    const shipping = {
      weight: weight ? Number(weight) : undefined,
      dimensions: parseDimensions(dimensions),
      shelfLife: shelfLife.trim() || undefined,
      storageCondition: storage,
      requiresRefrigeration,
    };

    const batchesPayload = toPayloadBatches();
    const totalBatchQty = batchesPayload.reduce(
      (acc, batch) => acc + batch.quantity,
      0,
    );

    return {
      name,
      sku: sku.trim(),
      description: longDesc,
      shortDescription: shortDesc,
      category: activeCategoryId,
      productType,
      tags: tags.map((tag) => tag.trim()).filter(Boolean),
      sellingPrice,
      originalPrice: originalPrice > 0 ? originalPrice : sellingPrice,
      costPrice: parsedCostPrice > 0 ? parsedCostPrice : 0,
      unit,
      measurementUnit: unit,
      stock: totalBatchQty,
      lowStockThreshold: Number(lowStockThreshold || 10),
      maxReturnDays: Number(maxReturnDays || 14),
      trackInventory: true,
      features,
      benefits,
      marketingHooks: features.map((f) => ({
        label: f.en || "",
        isActive: true,
      })),
      healthBenefits: benefits.map((b) => ({ title: b.en || "" })),
      nutrition: [],
      shipping,
      certifications: [],
      isActive: isActivated,
      isFeatured: false,
      isOnSale:
        (originalPrice > 0 ? originalPrice : sellingPrice) > sellingPrice,
      batches: batchesPayload,
      artisanId: artisanId || undefined,
    } as any;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const requiredError = getRequiredValidationMessage();

    if (!isActivated && requiredError) {
      saveDraftLocally();
      return;
    }

    if (requiredError) {
      setFormError(requiredError);
      return;
    }

    const invalidBatch = toPayloadBatches().find(
      (batch) =>
        !batch.batchId ||
        !Number.isFinite(batch.quantity) ||
        !Number.isFinite(batch.costPrice),
    );
    if (invalidBatch) {
      setFormError(
        "Each batch requires batch name/number, quantity, and cost price.",
      );
      return;
    }

    await createProductMutation.mutateAsync({
      payload: buildCreatePayload(),
      files: {
        images,
        videos,
      },
    });
  };

  const buttonLabel = isActivated
    ? "Publish Product"
    : isDirty
      ? "Save Draft"
      : "Publish Product";

  const busy =
    createProductMutation.isPending ||
    createCategoryMutation.isPending ||
    categoriesQuery.isLoading;

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent -ml-2 text-muted-foreground hover:text-primary transition-colors h-auto flex items-center gap-2 group mb-2"
            onClick={() => router.push("/admin/products")}
            type="button"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
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
            disabled={busy}
          >
            <Save className="h-4 w-4" />
            {createProductMutation.isPending ? "Saving..." : buttonLabel}
          </Button>
        </div>
      </div>

      {formError && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-white border p-1 rounded-sm h-auto flex-wrap justify-start gap-1">
              <TabsTrigger
                value="general"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Inventory & Batches
              </TabsTrigger>
              <TabsTrigger
                value="logistics"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Logistics & Media
              </TabsTrigger>
              <TabsTrigger
                value="marketing"
                className="rounded-sm font-medium py-2.5 px-5 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Features & Benefits
              </TabsTrigger>
            </TabsList>

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
                        Define identity, pricing, and classification.
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
                        <SelectTrigger className="rounded-sm bg-muted/20 border-border font-medium">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm border-border">
                          <SelectItem value="consumable">Consumable</SelectItem>
                          <SelectItem value="articraft">Articraft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        SKU <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g. HNY-ORG-001"
                        value={sku}
                        onChange={(e) => setSku(e.target.value.toUpperCase())}
                        required
                      />
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
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between rounded-sm bg-muted/20 border-border text-left font-medium px-4",
                              !activeCategory && "text-muted-foreground",
                            )}
                          >
                            {activeCategory
                              ? activeCategory.name
                              : "Select or create category..."}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-75 p-0 rounded-sm border-border"
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
                                    disabled={createCategoryMutation.isPending}
                                  >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Create New Category
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredCategories.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    value={category.name}
                                    onSelect={() => {
                                      setActiveCategoryId(category.id);
                                      setIsCategoryOpen(false);
                                    }}
                                    className="py-3 px-4 rounded-sm m-1"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        activeCategoryId === category.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="font-medium">
                                      {category.name}
                                    </span>
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
                        Unit <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={unit}
                        onValueChange={(v) => setUnit(v as UnitValue)}
                      >
                        <SelectTrigger className="h-14 rounded-sm bg-muted/20 border-border font-medium">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-sm border-border">
                          {UNIT_OPTIONS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Short Description
                    </label>
                    <MultiLangInput
                      type="textarea"
                      value={shortDesc}
                      onChange={setShortDesc}
                      placeholder="A brief overview of the product..."
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
                            "w-full justify-between rounded-sm bg-muted/20 border-border text-left font-medium px-4 h-14",
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
                        Set market and internal cost pricing.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        Original Price
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={oldPrice}
                        onChange={(e) => setOldPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Cost Price
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                          Inventory & Batches
                        </CardTitle>
                        <CardDescription className="font-medium">
                          Set threshold and define stock batches.
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
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Low Stock Threshold
                      </label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
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

                  <div className="bg-white border rounded-sm overflow-x-auto shadow-sm">
                    <table className="min-w-[900px] w-full text-left text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Batch ID
                          </th>
                          <th className="px-4 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Received Date
                          </th>
                          <th className="px-4 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Expiry Date
                          </th>
                          <th className="px-4 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Quantity
                          </th>
                          <th className="px-4 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Cost Price
                          </th>
                          <th className="px-4 py-4 font-medium text-muted-foreground uppercase text-[10px]">
                            Supplier
                          </th>
                          <th className="px-4 py-4 text-right" />
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {batches.map((batch) => (
                          <tr key={batch.id}>
                            <td className="px-4 py-3">
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
                                className="h-10"
                              />
                            </td>
                            <td className="px-4 py-3">
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
                            <td className="px-4 py-3">
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
                                      const receivedDate = parseBatchDate(
                                        batch.manufactureDate,
                                      );
                                      return receivedDate
                                        ? date < receivedDate
                                        : false;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                placeholder="0"
                                value={batch.quantity || ""}
                                onChange={(e) =>
                                  updateBatch(
                                    batch.id,
                                    "quantity",
                                    Number(e.target.value || 0),
                                  )
                                }
                                className="h-10"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={batch.costPrice || ""}
                                onChange={(e) =>
                                  updateBatch(
                                    batch.id,
                                    "costPrice",
                                    Number(e.target.value || 0),
                                  )
                                }
                                className="h-10"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                placeholder="Supplier"
                                value={batch.supplier}
                                onChange={(e) =>
                                  updateBatch(
                                    batch.id,
                                    "supplier",
                                    e.target.value,
                                  )
                                }
                                className="h-10"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
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

              <div className="bg-primary/5 border border-primary/10 rounded-sm p-6 flex gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-black text-sm text-primary mb-1 uppercase tracking-tight">
                    Batch notes
                  </h5>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                    Backend accepts per-batch quantity, cost price, supplier,
                    receivedDate and expiryDate. Empty batch rows are ignored
                    when sending.
                  </p>
                </div>
              </div>
            </TabsContent>

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
                        Define handling, storage and physical attributes.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Shelf Life
                      </label>
                      <Input
                        placeholder="e.g. 12 months"
                        value={shelfLife}
                        onChange={(e) => setShelfLife(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Gross Weight ({unit})
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
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
                        Dimensions (L x W x H cm)
                      </label>
                      <Input
                        placeholder="e.g. 10 x 5 x 15"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="requiresRefrigeration"
                      checked={requiresRefrigeration}
                      onCheckedChange={(checked) =>
                        setRequiresRefrigeration(Boolean(checked))
                      }
                    />
                    <label
                      htmlFor="requiresRefrigeration"
                      className="text-sm font-medium text-foreground"
                    >
                      Requires refrigeration
                    </label>
                  </div>
                </CardContent>
              </Card>

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
                        Uploads are sent in multipart as images and videos on
                        create endpoint.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                      Images (max 10)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((src, index) => (
                        <div
                          key={index}
                          className="group relative aspect-square rounded-sm overflow-hidden border border-border bg-muted/10"
                        >
                          <Image
                            src={src}
                            width={400}
                            height={400}
                            unoptimized
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            alt={`Product ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
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
                          onChange={handleImagesUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                      Videos (max 3)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videoPreviews.map((src, index) => (
                        <div
                          key={index}
                          className="group relative rounded-sm overflow-hidden border border-border bg-muted/10 p-3 flex items-center gap-3"
                        >
                          <Film className="h-5 w-5 text-muted-foreground" />
                          <video
                            src={src}
                            controls
                            className="h-20 w-full rounded-sm bg-black"
                          />
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <label className="rounded-sm border-2 border-dashed border-border bg-muted/10 flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all p-6 min-h-24">
                        <Film className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Upload Video
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska"
                          onChange={handleVideosUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="marketing" className="mt-6 space-y-6">
              <Card className="rounded-sm border-border shadow-soft">
                <CardHeader className="bg-muted/30 border-b border-border p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="font-heading font-black text-xl">
                        Features & Benefits
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Hooks for merchandising and customer education.
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
                      {features.map((feature, i) => (
                        <div key={i} className="flex gap-3">
                          <MultiLangInput
                            value={feature}
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
                            <X className="h-4 w-4" />
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
                      {benefits.map((benefit, i) => (
                        <div key={i} className="flex gap-3">
                          <MultiLangInput
                            value={benefit}
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
                            <X className="h-4 w-4" />
                          </Button>
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
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-lg py-1 pl-3 pr-1 text-xs font-medium gap-1 group"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors"
                              onClick={() => removeTag(tag)}
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
                          setIsActivated(Boolean(checked))
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
                          Active means publish now. If unchecked, this will be
                          saved as an inactive draft (if required create fields
                          are provided).
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-8">
          <Card className="rounded-sm border-border shadow-soft overflow-hidden sticky top-8">
            <div className="aspect-video bg-muted/30 relative">
              {imagePreviews[0] ? (
                <Image
                  src={imagePreviews[0]}
                  width={800}
                  height={450}
                  unoptimized
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
                    {activeCategory.name}
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-xl font-black font-heading mb-1">
                  {name.en || "Unnamed Product"}
                </h3>
                <p className="text-sm font-medium text-muted-foreground line-clamp-2 italic">
                  {shortDesc.en || "No description provided yet."}
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
                      name && sku && activeCategoryId && (shortDesc || longDesc)
                        ? "text-primary"
                        : "text-muted-foreground opacity-30",
                    )}
                  />
                  General info set
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Check
                    className={cn(
                      "h-3 w-3",
                      batches.some(
                        (batch) => batch.batchNumber && batch.quantity > 0,
                      )
                        ? "text-primary"
                        : "text-muted-foreground opacity-30",
                    )}
                  />
                  Inventory batches set
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Check
                    className={cn(
                      "h-3 w-3",
                      imagePreviews.length > 0
                        ? "text-primary"
                        : "text-muted-foreground opacity-30",
                    )}
                  />
                  Media uploaded
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-14 rounded-sm font-medium text-lg gap-3 shadow-xl shadow-primary/20 group"
                disabled={busy}
              >
                <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {createProductMutation.isPending ? "Saving..." : buttonLabel}
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
                Publishing confirms the product meets Agri-Eco standards. Drafts
                can be stored locally or saved as inactive in backend when
                required fields are complete.
              </p>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </form>
  );
}
