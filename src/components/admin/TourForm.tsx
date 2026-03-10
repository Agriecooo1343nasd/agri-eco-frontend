"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Save,
  Eye,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Maximize2,
  Image as ImageIcon,
  Map,
  GraduationCap,
  Globe,
  Plus,
  Home,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MultiLangInput,
  emptyLangValue,
} from "@/components/admin/MultiLangInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { accommodations } from "@/data/accommodations";
import { Tour } from "@/data/tours";

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
  initialData?: Tour;
  mode: "create" | "edit";
}

export function TourForm({ initialData, mode }: TourFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState(
    initialData?.name
      ? { en: initialData.name, rw: "", fr: "", sw: "" }
      : emptyLangValue(),
  );
  const [description, setDescription] = useState(
    initialData?.description
      ? { en: initialData.description, rw: "", fr: "", sw: "" }
      : emptyLangValue(),
  );
  const [longDescription, setLongDescription] = useState(
    initialData?.longDescription
      ? { en: initialData.longDescription, rw: "", fr: "", sw: "" }
      : emptyLangValue(),
  );

  const [highlights, setHighlights] = useState<{ id: string; text: any }[]>(
    initialData?.highlights?.map((h) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: { en: h, rw: "", fr: "", sw: "" },
    })) || [],
  );
  const [requirements, setRequirements] = useState<{ id: string; text: any }[]>(
    initialData?.requirements?.map((r) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: { en: r, rw: "", fr: "", sw: "" },
    })) || [],
  );
  const [included, setIncluded] = useState<{ id: string; text: any }[]>(
    initialData?.includes?.map((i) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: { en: i, rw: "", fr: "", sw: "" },
    })) || [],
  );
  const [timeSlots, setTimeSlots] = useState<
    { id: string; time: string; capacity: string }[]
  >(
    initialData?.timeSlots?.map((ts) => ({
      id: ts.id,
      time: ts.time,
      capacity: ts.capacity.toString(),
    })) || [],
  );

  const [policy, setPolicy] = useState(
    initialData?.cancellationPolicy
      ? { en: initialData.cancellationPolicy, rw: "", fr: "", sw: "" }
      : emptyLangValue(),
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [groupPrice, setGroupPrice] = useState(
    initialData?.groupPrice?.toString() || "",
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initialData?.maxParticipants?.toString() || "",
  );
  const [minParticipants, setMinParticipants] = useState(
    initialData?.minParticipants?.toString() || "1",
  );
  const [status, setStatus] = useState(initialData?.status || "available");
  const [location, setLocation] = useState(initialData?.location || "");
  const [selectedAccommodations, setSelectedAccommodations] = useState<
    string[]
  >(initialData?.accommodation?.map((a) => a.id) || []);

  // Helpers for list management
  const addListItem = (
    setter: React.Dispatch<React.SetStateAction<{ id: string; text: any }[]>>,
  ) => {
    setter((prev) => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), text: emptyLangValue() },
    ]);
  };

  const removeListItem = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<{ id: string; text: any }[]>>,
  ) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const updateListItem = (
    id: string,
    value: any,
    setter: React.Dispatch<React.SetStateAction<{ id: string; text: any }[]>>,
  ) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item)),
    );
  };

  const addTimeSlot = () => {
    setTimeSlots((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        time: "",
        capacity: maxParticipants || "20",
      },
    ]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots((prev) => prev.filter((item) => item.id !== id));
  };

  const updateTimeSlot = (id: string, field: string, value: string) => {
    setTimeSlots((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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
              : `Edit: ${initialData?.name}`}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              mode === "create" ? (
                "Publishing..."
              ) : (
                "Saving..."
              )
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

              {/* What's Included */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">
                      What's Included
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
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Time (e.g., 09:00 AM)
                      </Label>
                      <Input
                        value={slot.time}
                        onChange={(e) =>
                          updateTimeSlot(slot.id, "time", e.target.value)
                        }
                        placeholder="09:00 AM"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="w-full sm:w-32 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Slot Capacity
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
                    <div className="flex items-end pb-0.5">
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
                      No time slots defined. Tourists won't be able to book this
                      experience until you add at least one slot.
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
                  onValueChange={(val) => setStatus(val as any)}
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
                        Upcoming/Hidden
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Market Sector
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="font-medium">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {accommodations.map((accom) => (
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
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">
                        {accom.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {accom.type}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-4 h-4 rounded border border-input flex items-center justify-center transition-colors",
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
                ))}
              </div>
              {selectedAccommodations.length > 0 && (
                <p className="text-[10px] text-muted-foreground text-center">
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
            <CardContent className="pt-0">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Upload Hero Image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  1200 x 800 recommended
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <div className="w-1/4 aspect-square rounded-lg bg-muted border border-border flex items-center justify-center">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                {initialData?.image ? (
                  <div className="w-1/4 aspect-square rounded-lg border border-border overflow-hidden">
                    <img
                      src={initialData.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-1/4 aspect-square rounded-lg bg-muted border border-border" />
                )}
                {initialData?.gallery?.[0] ? (
                  <div className="w-1/4 aspect-square rounded-lg border border-border overflow-hidden">
                    <img
                      src={initialData.gallery[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-1/4 aspect-square rounded-lg bg-muted border border-border" />
                )}
                {initialData?.gallery?.[1] ? (
                  <div className="w-1/4 aspect-square rounded-lg border border-border overflow-hidden">
                    <img
                      src={initialData.gallery[1]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-1/4 aspect-square rounded-lg bg-muted border border-border" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
