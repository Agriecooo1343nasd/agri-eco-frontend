"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Save,
  Trash2,
  Plus,
  Home,
  Users,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Check,
  Info,
  Upload,
  Loader2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";
import { toast } from "sonner";
import {
  createAdminAccommodation,
  toAbsoluteAccommodationImage,
  type AccommodationCategory,
  type AccommodationStatus,
} from "@/lib/api/accommodations";
import { uploadSingleImage, uploadMultipleImages } from "@/lib/api/uploads";

const categories: AccommodationCategory[] = [
  "standard",
  "premium",
  "family",
  "luxury",
  "eco",
];

const statuses: AccommodationStatus[] = [
  "available",
  "maintenance",
  "occupied",
];

const normalizeLang = (value: MultiLangValue): MultiLangValue => ({
  en: value.en.trim(),
  rw: value.rw.trim(),
  fr: value.fr.trim(),
  sw: value.sw.trim(),
});

export default function CreateAccommodationPage() {
  const router = useRouter();

  const mainImageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(emptyLangValue());
  const [description, setDescription] = useState(emptyLangValue());
  const [category, setCategory] = useState<AccommodationCategory>("standard");
  const [price, setPrice] = useState("");
  const [maxGuests, setMaxGuests] = useState("");
  const [status, setStatus] = useState<AccommodationStatus>("available");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [mainImagePath, setMainImagePath] = useState("");
  const [galleryPaths, setGalleryPaths] = useState<string[]>([]);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const createMutation = useMutation({
    mutationFn: createAdminAccommodation,
    onSuccess: () => {
      toast.success("Accommodation created successfully");
      router.push("/admin/accommodations");
    },
    onError: (error: Error) => {
      toast.error("Failed to create accommodation", {
        description: error.message || "Please try again.",
      });
    },
  });

  const handleAddAmenity = () => {
    const trimmed = newAmenity.trim();
    if (!trimmed) return;
    if (amenities.includes(trimmed)) {
      toast.warning("Amenity already added");
      return;
    }
    setAmenities((prev) => [...prev, trimmed]);
    setNewAmenity("");
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadMainImage = async (file?: File) => {
    if (!file) return;
    setUploadingMain(true);
    try {
      const uploaded = await uploadSingleImage(file);
      setMainImagePath(uploaded.path);
      toast.success("Main image uploaded");
    } catch (error) {
      toast.error("Main image upload failed", {
        description: error instanceof Error ? error.message : "Please retry.",
      });
    } finally {
      setUploadingMain(false);
    }
  };

  const handleUploadGalleryImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uploaded = await uploadMultipleImages(Array.from(files));
      setGalleryPaths((prev) => [...prev, ...uploaded.map((f) => f.path)]);
      toast.success(`${uploaded.length} gallery image(s) uploaded`);
    } catch (error) {
      toast.error("Gallery upload failed", {
        description: error instanceof Error ? error.message : "Please retry.",
      });
    } finally {
      setUploadingGallery(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedName = normalizeLang(name);
    const normalizedDescription = normalizeLang(description);

    if (!normalizedName.en) {
      toast.error("Property name is required", {
        description: "Please provide at least the English property name.",
      });
      return;
    }

    if (!normalizedDescription.en) {
      toast.error("Description is required", {
        description: "Please provide at least the English description.",
      });
      return;
    }

    const parsedRate = Number.parseFloat(price);
    if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
      toast.error("Invalid nightly rate", {
        description: "Rate per night must be a positive number.",
      });
      return;
    }

    const parsedMaxGuests = Number.parseInt(maxGuests || "2", 10);
    if (!Number.isFinite(parsedMaxGuests) || parsedMaxGuests < 1) {
      toast.error("Invalid guest capacity", {
        description: "Max guests must be at least 1.",
      });
      return;
    }

    await createMutation.mutateAsync({
      name: normalizedName,
      description: normalizedDescription,
      category,
      status,
      ratePerNightRwf: parsedRate,
      maxGuests: parsedMaxGuests,
      amenities,
      mainImage: mainImagePath || undefined,
      gallery: galleryPaths,
      isActive,
    });
  };

  const isSubmitting = createMutation.isPending;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/80 backdrop-blur-md pb-4 pt-2 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Link href="/admin/accommodations">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-muted"
            >
              <ChevronLeft className="h-6 w-6 text-muted-foreground" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">
              <Home className="h-3 w-3" />
              <span>Accommodation Engine</span>
            </div>
            <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">
              Draft New Stay
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Discard
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSubmitting || uploadingMain || uploadingGallery}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSubmitting ? "Publishing..." : "Publish Unit"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <div className="h-1.5 bg-primary/20 w-full" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Tag className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl font-heading">
                  Stay Identity
                </CardTitle>
              </div>
              <CardDescription>
                Define how this accommodation appears across all languages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <MultiLangInput
                label="Property Name"
                value={name}
                onChange={setName}
                placeholder="e.g., Garden View Cottage"
                required
              />

              <MultiLangInput
                label="Marketing Description"
                value={description}
                onChange={setDescription}
                placeholder="Describe the experience, views, and unique features..."
                required
                type="textarea"
                rows={6}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Check className="h-4 w-4" />
                </div>
                <CardTitle className="text-xl font-heading">
                  Amenities & Features
                </CardTitle>
              </div>
              <CardDescription>
                List the specific perks and facilities included in this stay.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Add New Amenity</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Rainfall Shower, Wifi, Solar Power..."
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddAmenity())
                    }
                    className="h-11 rounded-xl"
                  />
                  <Button
                    type="button"
                    onClick={handleAddAmenity}
                    variant="secondary"
                    className="h-11 px-6 rounded-xl gap-2 font-bold"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {amenities.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-sm font-medium animate-in zoom-in-95 duration-200"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="p-0.5 hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {amenities.length === 0 && (
                  <div className="w-full py-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                    <Info className="h-6 w-6 mb-2 opacity-50" />
                    <p className="text-xs font-medium">
                      No amenities added yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Operational Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Unit Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as AccommodationCategory)}
                >
                  <SelectTrigger className="font-medium h-11 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Inventory Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as AccommodationStatus)}
                >
                  <SelectTrigger className="font-medium h-11 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Active Listing
                </Label>
                <Button
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className="h-8 px-3"
                  onClick={() => setIsActive((prev) => !prev)}
                >
                  {isActive ? "Active" : "Inactive"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Pricing & Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Rate Per Night (RWF)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="45000"
                    className="pl-10 h-11 rounded-xl font-bold"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Max Guests
                </Label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="2"
                    className="pl-10 h-11 rounded-xl font-bold"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Stay Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <input
                ref={mainImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadMainImage(e.target.files?.[0])}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUploadGalleryImages(e.target.files)}
              />

              <button
                type="button"
                onClick={() => mainImageInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/30 transition-colors group"
                disabled={uploadingMain}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform text-muted-foreground">
                  {uploadingMain ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Upload Main Image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mainImagePath
                    ? "Main image uploaded"
                    : "Aspect ratio 4:3 recommended"}
                </p>
              </button>

              {mainImagePath ? (
                <img
                  src={toAbsoluteAccommodationImage(mainImagePath)}
                  alt="Main preview"
                  className="h-28 w-full rounded-xl object-cover border border-border"
                />
              ) : null}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
              >
                {uploadingGallery ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                {uploadingGallery ? "Uploading..." : "Upload Gallery Images"}
              </Button>

              {galleryPaths.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {galleryPaths.slice(0, 6).map((path, index) => (
                    <img
                      key={`${path}-${index}`}
                      src={toAbsoluteAccommodationImage(path)}
                      alt={`Gallery ${index + 1}`}
                      className="aspect-square rounded-lg object-cover border border-border"
                    />
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
