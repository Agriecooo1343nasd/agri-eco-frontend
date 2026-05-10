"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Save,
  Trash2,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Maximize2,
  Image as ImageIcon,
  Globe,
  Plus,
  Home,
  Check,
  Search,
  ChevronLeft,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tour } from "@/data/tours";
import {
  createAdminExperience,
  updateAdminExperience,
  type AdminExperience,
  type ExperienceType,
} from "@/lib/api/experiences";
import { uploadMultipleImages, uploadSingleImage } from "@/lib/api/uploads";
import { Badge } from "@/components/ui/badge";
import {
  fetchAdminAccommodations,
  type AdminAccommodation,
} from "@/lib/api/accommodations";
import { fetchCategoriesForAdmin } from "@/lib/api/products";

const EXPERIENCE_TYPE_MAP: Record<string, ExperienceType> = {
  "farm-tour": "farm_tour",
  beekeeping: "beekeeping",
  harvesting: "harvesting",
  cultural: "cultural",
  educational: "educational",
  "farm-stay": "farm_stay",
  workshop: "workshop",
};

const BACKEND_TO_FORM_TYPE_MAP: Partial<Record<ExperienceType, string>> = {
  farm_tour: "farm-tour",
  farm_stay: "farm-stay",
  beekeeping: "beekeeping",
  harvesting: "harvesting",
  cultural: "cultural",
  educational: "educational",
  workshop: "workshop",
};

function isAdminExperience(
  data: Tour | AdminExperience | undefined,
): data is AdminExperience {
  return (
    !!data &&
    "title" in data &&
    typeof (data as AdminExperience).title === "object"
  );
}

function toFormLangValue(
  value: { en: string; rw?: string; fr?: string; sw?: string } | undefined,
): MultiLangValue {
  if (!value) return emptyLangValue();
  return {
    en: value.en ?? "",
    rw: value.rw ?? "",
    fr: value.fr ?? "",
    sw: value.sw ?? "",
  };
}

function toFormList(
  items:
    | Array<string | { en: string; rw?: string; fr?: string; sw?: string }>
    | undefined,
): { id: string; text: MultiLangValue }[] {
  if (!items?.length) return [];
  return items.map((item) => ({
    id: Math.random().toString(36).substr(2, 9),
    text:
      typeof item === "string"
        ? { en: item, rw: "", fr: "", sw: "" }
        : {
            en: item.en ?? "",
            rw: item.rw ?? "",
            fr: item.fr ?? "",
            sw: item.sw ?? "",
          },
  }));
}

function deriveFormStatus(
  data: AdminExperience,
): "available" | "limited" | "sold-out" | "upcoming" {
  return (data.availabilityStatus as any) || "available";
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeLang = (value: MultiLangValue): MultiLangValue => ({
  en: value.en.trim(),
  rw: value.rw.trim(),
  fr: value.fr.trim(),
  sw: value.sw.trim(),
});

const toMultiLangList = (items: { id: string; text: MultiLangValue }[]) =>
  items
    .map((item) => normalizeLang(item.text))
    .filter((value) => Boolean(value.en));

const parseDurationMinutes = (value: string): number => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 120;

  const hourMatch = trimmed.match(/(\d+)\s*h/);
  const minMatch = trimmed.match(/(\d+)\s*m/);

  if (hourMatch || minMatch) {
    const hours = hourMatch ? Number.parseInt(hourMatch[1], 10) : 0;
    const mins = minMatch ? Number.parseInt(minMatch[1], 10) : 0;
    const total = hours * 60 + mins;
    return total >= 15 ? total : 120;
  }

  const asNumber = Number.parseInt(trimmed, 10);
  if (Number.isFinite(asNumber) && asNumber >= 15) {
    return asNumber;
  }

  return 120;
};

const categoryLabels: Record<string, string> = {
  "farm-tour": "Farm Tour",
  beekeeping: "Beekeeping",
  harvesting: "Harvesting",
  cultural: "Cultural",
  educational: "Educational",
  "farm-stay": "Farm Stay",
  workshop: "Workshop",
};

interface TourFormProps {
  initialData?: Tour | AdminExperience;
  mode: "create" | "edit";
}

export function TourForm({ initialData, mode }: TourFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Accommodations search & pagination
  const [accommodationsPage, setAccommodationsPage] = useState(1);
  const [accommodationsSearch, setAccommodationsSearch] = useState("");
  const [accommodationsLimit] = useState(5);

  // Form states
  const [name, setName] = useState<MultiLangValue>(
    isAdminExperience(initialData)
      ? toFormLangValue(initialData.title)
      : initialData?.name
        ? { en: initialData.name, rw: "", fr: "", sw: "" }
        : emptyLangValue(),
  );
  const [description, setDescription] = useState<MultiLangValue>(
    isAdminExperience(initialData)
      ? toFormLangValue(initialData.shortDescription)
      : initialData?.description
        ? { en: initialData.description, rw: "", fr: "", sw: "" }
        : emptyLangValue(),
  );
  const [longDescription, setLongDescription] = useState<MultiLangValue>(
    isAdminExperience(initialData)
      ? toFormLangValue(initialData.fullOverview)
      : initialData?.longDescription
        ? { en: initialData.longDescription, rw: "", fr: "", sw: "" }
        : emptyLangValue(),
  );

  const [highlights, setHighlights] = useState<
    { id: string; text: MultiLangValue }[]
  >(
    isAdminExperience(initialData)
      ? toFormList(initialData.highlights)
      : initialData?.highlights?.map((h) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: { en: h, rw: "", fr: "", sw: "" },
        })) || [],
  );
  const [requirements, setRequirements] = useState<
    { id: string; text: MultiLangValue }[]
  >(
    isAdminExperience(initialData)
      ? toFormList(initialData.requirements)
      : initialData?.requirements?.map((r) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: { en: r, rw: "", fr: "", sw: "" },
        })) || [],
  );
  const [included, setIncluded] = useState<
    { id: string; text: MultiLangValue }[]
  >(
    isAdminExperience(initialData)
      ? toFormList(initialData.inclusions)
      : (initialData as Tour | undefined)?.includes?.map((i) => ({
          id: Math.random().toString(36).substr(2, 9),
          text: { en: i, rw: "", fr: "", sw: "" },
        })) || [],
  );
  // ExperienceSlot (booking slots) ≠ form time-slot templates; not prefilled from backend
  const [timeSlots, setTimeSlots] = useState<
    { id: string; date: string; time: string; capacity: string; isBackend?: boolean }[]
  >(
    isAdminExperience(initialData)
      ? (initialData.slots?.map((s) => ({
          id: s.id,
          date: s.date.split("T")[0],
          time: s.timeSlot,
          capacity: s.capacity.toString(),
          isBackend: true,
        })) || [])
      : [],
  );
  const [deletedSlotIds, setDeletedSlotIds] = useState<string[]>([]);

  const [policy, setPolicy] = useState<MultiLangValue>(
    isAdminExperience(initialData)
      ? toFormLangValue(initialData.cancellationPolicy)
      : initialData?.cancellationPolicy
        ? {
            en: (initialData as Tour).cancellationPolicy,
            rw: "",
            fr: "",
            sw: "",
          }
        : emptyLangValue(),
  );
  const [tourType, setTourType] = useState(
    isAdminExperience(initialData)
      ? (BACKEND_TO_FORM_TYPE_MAP[initialData.type] ?? "")
      : (initialData as Tour | undefined)?.category || "",
  );
  const [categoryId, setCategoryId] = useState(
    isAdminExperience(initialData) ? ((initialData as any).categoryId ?? "") : "",
  );
  const [duration, setDuration] = useState(
    isAdminExperience(initialData)
      ? (initialData.expectedDuration ?? "")
      : (initialData as Tour | undefined)?.duration || "",
  );
  const [price, setPrice] = useState(
    isAdminExperience(initialData)
      ? String(initialData.priceRwf || "")
      : (initialData as Tour | undefined)?.price?.toString() || "",
  );
  const [groupPrice, setGroupPrice] = useState(
    isAdminExperience(initialData)
      ? initialData.pricePerGroupRwf
        ? String(initialData.pricePerGroupRwf)
        : ""
      : (initialData as Tour | undefined)?.groupPrice?.toString() || "",
  );
  const [maxParticipants, setMaxParticipants] = useState(
    isAdminExperience(initialData)
      ? String(initialData.capacity || "")
      : (initialData as Tour | undefined)?.maxParticipants?.toString() || "",
  );
  const [minParticipants, setMinParticipants] = useState(
    isAdminExperience(initialData)
      ? String(initialData.minParticipants || "1")
      : (initialData as Tour | undefined)?.minParticipants?.toString() || "1",
  );
  const [status, setStatus] = useState(
    isAdminExperience(initialData)
      ? deriveFormStatus(initialData)
      : (initialData as Tour | undefined)?.status || "available",
  );
  const [marketSector, setMarketSector] = useState(
    isAdminExperience(initialData) ? (initialData.marketSector ?? "") : "",
  );
  const [location, setLocation] = useState(
    isAdminExperience(initialData)
      ? (initialData.destination ?? "")
      : (initialData as Tour | undefined)?.location || "",
  );
  const [heroImageUrl, setHeroImageUrl] = useState(
    isAdminExperience(initialData)
      ? (initialData.heroImage ?? "")
      : (initialData as Tour | undefined)?.image || "",
  );
  const [galleryDraft, setGalleryDraft] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    isAdminExperience(initialData)
      ? (initialData.gallery ?? [])
      : ((initialData as Tour | undefined)?.gallery ?? []),
  );
  const [selectedAccommodations, setSelectedAccommodations] = useState<
    string[]
  >(
    isAdminExperience(initialData)
      ? (initialData.linkedAccommodationIds ?? [])
      : (initialData as Tour | undefined)?.accommodation?.map((a) => a.id) ||
          [],
  );

  // Fetch accommodations from backend
  const { data: accommodationsData, isLoading: accommodationsLoading } =
    useQuery({
      queryKey: [
        "accommodations",
        accommodationsPage,
        accommodationsSearch,
        accommodationsLimit,
      ],
      queryFn: async () => {
        try {
          return await fetchAdminAccommodations({
            page: accommodationsPage,
            limit: accommodationsLimit,
            search: accommodationsSearch || undefined,
          });
        } catch {
          toast.error("Failed to load accommodations", {
            description:
              "Backend error. Using fallback mock accommodations data.",
          });
          return null;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  const { data: categoriesResult, isLoading: categoriesLoading } = useQuery({
    queryKey: ["adminCategories", "tour"],
    queryFn: () => fetchCategoriesForAdmin({ type: "tour", limit: 100 }),
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoriesResult?.data || [];
  const addListItem = (
    setter: React.Dispatch<
      React.SetStateAction<{ id: string; text: MultiLangValue }[]>
    >,
  ) => {
    setter((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), text: emptyLangValue() },
    ]);
  };

  const removeListItem = (
    id: string,
    setter: React.Dispatch<
      React.SetStateAction<{ id: string; text: MultiLangValue }[]>
    >,
  ) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const updateListItem = (
    id: string,
    value: MultiLangValue,
    setter: React.Dispatch<
      React.SetStateAction<{ id: string; text: MultiLangValue }[]>
    >,
  ) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item)),
    );
  };

  const addTimeSlot = () => {
    setTimeSlots((prev) => [
      ...prev,
      {
        id: `new-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        capacity: maxParticipants || "20",
      },
    ]);
  };

  const removeTimeSlot = (id: string) => {
    const slotToRemove = timeSlots.find((s) => s.id === id);
    if (slotToRemove?.isBackend) {
      setDeletedSlotIds((prev) => [...prev, id]);
    }
    setTimeSlots((prev) => prev.filter((item) => item.id !== id));
  };

  const updateTimeSlot = (id: string, field: string, value: string) => {
    setTimeSlots((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value, isDirty: true } : item,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedName = normalizeLang(name);
    const normalizedDescription = normalizeLang(description);
    const normalizedLongDescription = normalizeLang(longDescription);
    const normalizedPolicy = normalizeLang(policy);

    if (!normalizedName.en) {
      toast.error("Missing title", {
        description: "Please provide at least an English title.",
      });
      return;
    }

    if (!normalizedDescription.en) {
      toast.error("Missing short description", {
        description: "Please provide at least an English short description.",
      });
      return;
    }

    if (!normalizedLongDescription.en) {
      toast.error("Missing overview", {
        description: "Please provide at least an English full overview.",
      });
      return;
    }

    const backendType = EXPERIENCE_TYPE_MAP[tourType];
    if (!backendType) {
      toast.error("Missing experience type", {
        description: "Please select the tour type before publishing.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (status === "sold-out") {
        toast.warning("Sold-out status is not persisted in backend", {
          description:
            "Backend currently stores only isActive/isFeatured. This record will be saved as active without sold-out state.",
        });
      }

      if (mode === "create") {
        const validAccommodationIds = selectedAccommodations.filter((id) =>
          UUID_RE.test(id),
        );

        const languages = Array.from(
          new Set(
            [
              normalizedName.en ? "en" : "",
              normalizedName.rw ||
              normalizedDescription.rw ||
              normalizedLongDescription.rw
                ? "rw"
                : "",
              normalizedName.fr ||
              normalizedDescription.fr ||
              normalizedLongDescription.fr
                ? "fr"
                : "",
              normalizedName.sw ||
              normalizedDescription.sw ||
              normalizedLongDescription.sw
                ? "sw"
                : "",
            ].filter(Boolean),
          ),
        );

        const experience = await createAdminExperience({
          title: normalizedName,
          type: backendType,
          shortDescription: normalizedDescription,
          fullOverview: normalizedLongDescription,
          cancellationPolicy: normalizedPolicy.en
            ? normalizedPolicy
            : undefined,
          heroImage: heroImageUrl.trim() || undefined,
          gallery: galleryUrls,
          highlights: toMultiLangList(highlights),
          requirements: toMultiLangList(requirements),
          inclusions: toMultiLangList(included),
          priceRwf: Number.parseFloat(price || "0") || 0,
          pricePerGroupRwf: Number.parseFloat(groupPrice || "0") || 0,
          capacity: Number.parseInt(maxParticipants || "20", 10) || 20,
          minParticipants: Number.parseInt(minParticipants || "1", 10) || 1,
          expectedDuration: duration.trim() || undefined,
          durationMinutes: parseDurationMinutes(duration),
          marketSector: marketSector.trim() || undefined,
          destination: location.trim() || undefined,
          linkedAccommodationIds: validAccommodationIds,
          availabilityStatus: status as any,
          isActive: status !== "upcoming",
          isFeatured: status === "limited",
          languageSupport: languages.length > 0 ? languages : ["en"],
        });

        // Sync slots if any
        if (timeSlots.length > 0) {
          const { createExperienceSlot } = await import("@/lib/api/experiences");
          for (const slot of timeSlots) {
            await createExperienceSlot(experience.id, {
              date: slot.date,
              timeSlot: slot.time,
              capacity: Number.parseInt(slot.capacity, 10),
            });
          }
        }

        if (selectedAccommodations.length !== validAccommodationIds.length) {
          toast.warning("Some linked accommodations were skipped", {
            description:
              "Only UUID accommodation IDs are accepted by backend, so local mock IDs were not sent.",
          });
        }

        // No misleading warning here anymore.
      } else {
        const adminData = initialData as AdminExperience;
        const validAccommodationIds = selectedAccommodations.filter((id) =>
          UUID_RE.test(id),
        );

        const languages = Array.from(
          new Set(
            [
              normalizedName.en ? "en" : "",
              normalizedName.rw ||
              normalizedDescription.rw ||
              normalizedLongDescription.rw
                ? "rw"
                : "",
              normalizedName.fr ||
              normalizedDescription.fr ||
              normalizedLongDescription.fr
                ? "fr"
                : "",
              normalizedName.sw ||
              normalizedDescription.sw ||
              normalizedLongDescription.sw
                ? "sw"
                : "",
            ].filter(Boolean),
          ),
        );

        await updateAdminExperience(adminData.id, {
          title: normalizedName,
          type: backendType,
          shortDescription: normalizedDescription,
          fullOverview: normalizedLongDescription,
          cancellationPolicy: normalizedPolicy.en
            ? normalizedPolicy
            : undefined,
          heroImage: heroImageUrl.trim() || undefined,
          gallery: galleryUrls,
          highlights: toMultiLangList(highlights),
          requirements: toMultiLangList(requirements),
          inclusions: toMultiLangList(included),
          priceRwf: Number.parseFloat(price || "0") || 0,
          pricePerGroupRwf: Number.parseFloat(groupPrice || "0") || 0,
          capacity: Number.parseInt(maxParticipants || "20", 10) || 20,
          minParticipants: Number.parseInt(minParticipants || "1", 10) || 1,
          expectedDuration: duration.trim() || undefined,
          durationMinutes: parseDurationMinutes(duration),
          marketSector: marketSector.trim() || undefined,
          destination: location.trim() || undefined,
          linkedAccommodationIds: validAccommodationIds,
          availabilityStatus: status as any,
          isActive: status !== "upcoming",
          isFeatured: status === "limited",
          languageSupport: languages.length > 0 ? languages : ["en"],
        });

        const {
          createExperienceSlot,
          updateExperienceSlot,
          deleteExperienceSlot,
        } = await import("@/lib/api/experiences");

        // Sync deleted slots
        for (const id of deletedSlotIds) {
          await deleteExperienceSlot(adminData.id, id);
        }

        // Sync new slots
        const newSlots = timeSlots.filter((s) => s.id.startsWith("new-"));
        for (const slot of newSlots) {
          await createExperienceSlot(adminData.id, {
            date: slot.date,
            timeSlot: slot.time,
            capacity: Number.parseInt(slot.capacity, 10),
          });
        }

        // Sync modified existing slots
        const dirtySlots = timeSlots.filter((s) => s.isBackend && (s as any).isDirty);
        for (const slot of dirtySlots) {
          await updateExperienceSlot(adminData.id, slot.id, {
            date: slot.date,
            timeSlot: slot.time,
            capacity: Number.parseInt(slot.capacity, 10),
          });
        }
      }

      toast.success(
        mode === "create" ? "Experience Published" : "Experience Updated",
        {
          description:
            mode === "create"
              ? "Your new experience is now active in the catalog."
              : "Changes have been saved successfully.",
        },
      );
      router.push("/admin/tours");
    } catch (error) {
      toast.error(mode === "create" ? "Publication Failed" : "Update Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeroFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const uploaded = await uploadSingleImage(file);
      setHeroImageUrl(uploaded.path);
      toast.success("Hero image uploaded");
    } catch (error) {
      toast.error("Hero image upload failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploadingMedia(false);
      event.target.value = "";
    }
  };

  const handleGalleryFilesUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsUploadingMedia(true);
    try {
      const uploaded = await uploadMultipleImages(files);
      const paths = uploaded.map((item) => item.path).filter(Boolean);

      if (paths.length > 0) {
        setGalleryUrls((prev) => [...prev, ...paths]);
        toast.success("Gallery images uploaded", {
          description: `${paths.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      toast.error("Gallery upload failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploadingMedia(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
            <Link
              href="/admin/tours"
              className="hover:text-primary transition-colors"
            >
              Experience Catalog
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">
              {mode === "create" ? "Add Experience" : "Edit Experience"}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-3">
            <Link href="/admin/tours">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            {mode === "create"
              ? "Create New Agritourism Experience"
              : `Edit: ${
                  isAdminExperience(initialData)
                    ? initialData.title.en
                    : ((initialData as Tour | undefined)?.name ?? "")
                }`}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden sm:flex gap-2"
            onClick={() => router.push("/admin/tours")}
          >
            Discard
          </Button>
          <Button
            className="shadow-sm gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingMedia}
          >
            {isSubmitting ? (
              mode === "create" ? (
                "Publishing..."
              ) : (
                "Saving..."
              )
            ) : isUploadingMedia ? (
              "Uploading media..."
            ) : (
              <>
                <Save className="h-4 w-4" />{" "}
                {mode === "create" ? "Publish Experience" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Content Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg font-heading">
                  Experience Identity
                </CardTitle>
              </div>
              <CardDescription>
                Define how your experience will look across all supported
                languages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <MultiLangInput
                label="Experience Title"
                value={name}
                onChange={setName}
                placeholder="e.g., Morning Coffee Harvest & Brewing"
                required
              />

              <MultiLangInput
                label="Short Teaser Description"
                value={description}
                onChange={setDescription}
                placeholder="A brief 1-2 sentence hook for search results..."
                required
                type="textarea"
                rows={2}
              />

              <MultiLangInput
                label="Full Experience Overview"
                value={longDescription}
                onChange={setLongDescription}
                placeholder="Provide a detailed story and schedule of the experience..."
                required
                type="textarea"
                rows={8}
              />
            </CardContent>
          </Card>

          {/* Logistics & Values Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-secondary/20 text-secondary-foreground">
                  <Maximize2 className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg font-heading">
                  Logistics & Policy
                </CardTitle>
              </div>
              <CardDescription>
                Essential details that help tourists prepare for their visit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-0">
              {/* Highlights */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">
                      Experience Highlights
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Key attractions or activities (appears in bullet points)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(setHighlights)}
                    className="h-7 text-[10px] gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Highlight
                  </Button>
                </div>
                <div className="space-y-3">
                  {highlights.map((h) => (
                    <div key={h.id} className="flex gap-2 items-start group">
                      <div className="flex-1">
                        <MultiLangInput
                          value={h.text}
                          onChange={(val) =>
                            updateListItem(h.id, val, setHighlights)
                          }
                          placeholder="e.g., Organic honey tasting session"
                          hideLabel
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem(h.id, setHighlights)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {highlights.length === 0 && (
                    <div className="text-center py-4 border border-dashed rounded-lg bg-muted/20">
                      <p className="text-[10px] text-muted-foreground">
                        No highlights added yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">
                      Tour Requirements
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      What guests need to know or bring (e.g., Hiking boots)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(setRequirements)}
                    className="h-7 text-[10px] gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Requirement
                  </Button>
                </div>
                <div className="space-y-3">
                  {requirements.map((r) => (
                    <div key={r.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <MultiLangInput
                          value={r.text}
                          onChange={(val) =>
                            updateListItem(r.id, val, setRequirements)
                          }
                          placeholder="e.g., Comfortable walking shoes"
                          hideLabel
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem(r.id, setRequirements)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {requirements.length === 0 && (
                    <div className="text-center py-4 border border-dashed rounded-lg bg-muted/20">
                      <p className="text-[10px] text-muted-foreground">
                        No requirements added yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* What&apos;s Included */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">
                      What&apos;s Included
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Services or items provided during the tour
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addListItem(setIncluded)}
                    className="h-7 text-[10px] gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {included.map((item) => (
                    <div key={item.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <MultiLangInput
                          value={item.text}
                          onChange={(val) =>
                            updateListItem(item.id, val, setIncluded)
                          }
                          placeholder="e.g., Professional English-speaking guide"
                          hideLabel
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem(item.id, setIncluded)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {included.length === 0 && (
                    <div className="text-center py-4 border border-dashed rounded-lg bg-muted/20">
                      <p className="text-[10px] text-muted-foreground">
                        No included items added yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy */}
              <div className="pt-4 border-t border-border/50">
                <MultiLangInput
                  label="Cancellation Policy"
                  value={policy}
                  onChange={setPolicy}
                  placeholder="Specify the terms for cancellations and refunds..."
                  type="textarea"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>
          {/* Scheduling & Time Slots */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg font-heading">
                    Scheduling & Time Slots
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTimeSlot}
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Slot
                </Button>
              </div>
              <CardDescription>
                Define the available departure times and capacity for each slot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-3">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="w-full sm:w-40 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Date
                      </Label>
                      <Input
                        type="date"
                        value={slot.date}
                        onChange={(e) =>
                          updateTimeSlot(slot.id, "date", e.target.value)
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Time (e.g., 09:00)
                      </Label>
                      <Input
                        value={slot.time}
                        onChange={(e) =>
                          updateTimeSlot(slot.id, "time", e.target.value)
                        }
                        placeholder="09:00"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="w-full sm:w-28 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Capacity
                      </Label>
                      <Input
                        type="number"
                        value={slot.capacity}
                        onChange={(e) =>
                          updateTimeSlot(slot.id, "capacity", e.target.value)
                        }
                        placeholder="20"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="flex items-end gap-2 pb-0.5">
                      {slot.isBackend && (
                        <Badge
                          variant="secondary"
                          className="h-9 px-2 gap-1.5 bg-primary/10 text-primary border-primary/20"
                        >
                          <Check className="h-3 w-3" />
                          <span className="text-[9px] font-bold uppercase">
                            Live
                          </span>
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTimeSlot(slot.id)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {timeSlots.length === 0 && (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                      No time slots defined. Tourists won&apos;t be able to book
                      this experience until you add at least one slot.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          {/* Status & Categorization Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Operational Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Launch Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(val) =>
                    setStatus(val as "available" | "limited" | "upcoming")
                  }
                >
                  <SelectTrigger className="font-medium">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Live / Available
                      </div>
                    </SelectItem>
                    <SelectItem value="limited">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Limited Capacity
                      </div>
                    </SelectItem>
                    <SelectItem value="upcoming">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        Upcoming
                      </div>
                    </SelectItem>
                    <SelectItem value="sold-out">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                        Sold-out
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Experience Type
                </Label>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Tour Type
                  </Label>
                  <Select
                    value={tourType}
                    onValueChange={(v) => setTourType(v)}
                  >
                    <SelectTrigger className="w-full bg-muted/20 border-border">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Category
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={(v) => setCategoryId(v)}
                  >
                    <SelectTrigger className="w-full bg-muted/20 border-border">
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Market Sector (Optional)
                </Label>
                <Input
                  value={marketSector}
                  onChange={(e) => setMarketSector(e.target.value)}
                  placeholder="e.g., Family Tourism, Corporate Retreats"
                  className="font-medium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Linked Accommodations Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-heading text-foreground">
                  Linked Accommodations
                </CardTitle>
              </div>
              <CardDescription className="text-[11px]">
                Optionally link existing stay options to this tour.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accommodations..."
                  value={accommodationsSearch}
                  onChange={(e) => {
                    setAccommodationsSearch(e.target.value);
                    setAccommodationsPage(1);
                  }}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              {/* Accommodations List with Fallback */}
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {accommodationsLoading ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground">
                      Loading accommodations...
                    </p>
                  </div>
                ) : accommodationsData && accommodationsData.data.length > 0 ? (
                  accommodationsData.data.map((accom: AdminAccommodation) => (
                    <div
                      key={accom.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border border-border transition-colors cursor-pointer hover:bg-muted/30",
                        selectedAccommodations.includes(accom.id) &&
                          "bg-primary/5 border-primary/30",
                      )}
                      onClick={() => {
                        if (selectedAccommodations.includes(accom.id)) {
                          setSelectedAccommodations((prev) =>
                            prev.filter((id) => id !== accom.id),
                          );
                        } else {
                          setSelectedAccommodations((prev) => [
                            ...prev,
                            accom.id,
                          ]);
                        }
                      }}
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {accom.name.en}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {accom.category} • {accom.maxGuests} guests • RWF{" "}
                          {accom.ratePerNightRwf.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded border border-input flex items-center justify-center transition-colors shrink-0 ml-2",
                          selectedAccommodations.includes(accom.id)
                            ? "bg-primary border-primary"
                            : "bg-background",
                        )}
                      >
                        {selectedAccommodations.includes(accom.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 border border-dashed rounded-lg bg-muted/20">
                    <p className="text-[10px] text-muted-foreground">
                      {accommodationsSearch
                        ? "No accommodations match your search"
                        : "No accommodations available"}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {accommodationsData &&
                accommodationsData.pagination.pages > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAccommodationsPage((p) => Math.max(1, p - 1))
                      }
                      disabled={accommodationsPage === 1}
                      className="h-7 text-xs gap-1"
                    >
                      <ChevronLeft className="h-3 w-3" /> Prev
                    </Button>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Page {accommodationsData.pagination.page} of{" "}
                      {accommodationsData.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAccommodationsPage((p) =>
                          Math.min(accommodationsData.pagination.pages, p + 1),
                        )
                      }
                      disabled={
                        accommodationsPage ===
                        accommodationsData.pagination.pages
                      }
                      className="h-7 text-xs gap-1"
                    >
                      Next <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}

              {/* Summary */}
              {selectedAccommodations.length > 0 && (
                <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border/50">
                  {selectedAccommodations.length} accommodation(s) linked
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pricing & Capacity Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Pricing & Capacity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Base price (RWF)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="25000"
                      className="pl-9 font-medium"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Institutional (RWF)
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="18000"
                      className="pl-9 font-medium"
                      value={groupPrice}
                      onChange={(e) => setGroupPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Max Pax
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="20"
                      className="pl-9 font-medium"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Min Pax
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="1"
                      className="pl-9 font-medium"
                      value={minParticipants}
                      onChange={(e) => setMinParticipants(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Expected Duration
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g., 3 hours"
                    className="pl-9 font-medium"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Destination Marker
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Location details..."
                    className="pl-9 font-medium"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Assets Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Media Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hero Image URL
                </Label>
                <div className="space-y-2">
                  <Input
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="https://example.com/hero-image.jpg"
                    className="font-medium"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroFileUpload}
                    className="font-medium"
                    disabled={isUploadingMedia}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Gallery Image URLs
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={galleryDraft}
                    onChange={(e) => setGalleryDraft(e.target.value)}
                    placeholder="https://example.com/gallery-image.jpg"
                    className="font-medium"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const url = galleryDraft.trim();
                      if (!url) return;
                      setGalleryUrls((prev) => [...prev, url]);
                      setGalleryDraft("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFilesUpload}
                  className="font-medium"
                  disabled={isUploadingMedia}
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/10 p-3">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Media file upload now uses the authenticated upload API and
                  stores returned /uploads paths in hero/gallery fields.
                </p>
              </div>

              <div className="mt-2 flex gap-2">
                <div className="flex aspect-square w-1/4 items-center justify-center rounded-lg border border-border bg-muted">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                {heroImageUrl ? (
                  <div className="aspect-square w-1/4 overflow-hidden rounded-lg border border-border">
                    <img
                      src={heroImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-1/4 rounded-lg border border-border bg-muted" />
                )}
                {galleryUrls[0] ? (
                  <div className="aspect-square w-1/4 overflow-hidden rounded-lg border border-border">
                    <img
                      src={galleryUrls[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-1/4 rounded-lg border border-border bg-muted" />
                )}
                {galleryUrls[1] ? (
                  <div className="aspect-square w-1/4 overflow-hidden rounded-lg border border-border">
                    <img
                      src={galleryUrls[1]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-1/4 rounded-lg border border-border bg-muted" />
                )}
              </div>

              {galleryUrls.length > 0 && (
                <div className="space-y-2">
                  {galleryUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="flex-1 truncate text-[11px] text-muted-foreground">
                        {url}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          setGalleryUrls((prev) =>
                            prev.filter(
                              (_, currentIndex) => currentIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
