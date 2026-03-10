"use client";

import { useState } from "react";
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
  ImageIcon,
  Check,
  Info,
} from "lucide-react";
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
} from "@/components/admin/MultiLangInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CreateAccommodationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState(emptyLangValue());
  const [description, setDescription] = useState(emptyLangValue());
  const [type, setType] = useState("standard");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("available");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Accommodation created successfully!");
      router.push("/admin/accommodations");
    } catch (error) {
      toast.error("Failed to create accommodation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sticky Header */}
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
          <Button
            variant="outline"
            className="h-10 px-5 rounded-xl border-border/50 font-semibold text-muted-foreground"
            onClick={() => router.back()}
          >
            Discard
          </Button>
          <Button
            className="h-10 px-6 rounded-xl shadow-lg shadow-primary/20 font-bold gap-2"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSubmitting ? "Publishing..." : "Publish Unit"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Card */}
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

          {/* Amenities & Features */}
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
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-sm font-medium animate-in zoom-in-95 duration-200"
                  >
                    <span>{item}</span>
                    <button
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
                  Unit Category
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="font-medium h-11 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Unit</SelectItem>
                    <SelectItem value="premium">Premium Suite</SelectItem>
                    <SelectItem value="family">Family Farmhouse</SelectItem>
                    <SelectItem value="eco-lodge">Eco Lodge</SelectItem>
                    <SelectItem value="campsite">Grounded Campsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Inventory Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="font-medium h-11 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Live / Bookable
                      </div>
                    </SelectItem>
                    <SelectItem value="maintenance">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Under Maintenance
                      </div>
                    </SelectItem>
                    <SelectItem value="occupied">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Currently Occupied
                      </div>
                    </SelectItem>
                    <SelectItem value="hidden">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        Archived / Internal
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Card */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Stay Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Upload Main Image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aspect ratio 4:3 recommended
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
