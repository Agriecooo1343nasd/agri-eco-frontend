"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  ImagePlus,
  User,
  MapPin,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  createAdminArtisan,
  type ArtisanMultiLangText,
} from "@/lib/api/artisans";
import { uploadSingleImage } from "@/lib/api/uploads";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function toOptionalMultiLang(
  value: MultiLangValue,
): ArtisanMultiLangText | undefined {
  const en = value.en.trim();
  const rw = value.rw.trim();
  const fr = value.fr.trim();
  const sw = value.sw.trim();

  if (!en) {
    return undefined;
  }

  return {
    en,
    ...(rw ? { rw } : {}),
    ...(fr ? { fr } : {}),
    ...(sw ? { sw } : {}),
  };
}

export default function CreateArtisanPage() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [description, setDescription] =
    useState<MultiLangValue>(emptyLangValue());
  const [story, setStory] = useState<MultiLangValue>(emptyLangValue());
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  const createMutation = useMutation({
    mutationFn: createAdminArtisan,
  });

  const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please choose an image file (PNG, JPG, WEBP, ...).",
      });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image too large", {
        description: "Please choose an image up to 5MB.",
      });
      return;
    }

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    const preview = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setSelectedImagePreview(preview);
  };

  const handleCreate = async () => {
    if (!name.trim() || !specialty.trim() || !location.trim()) {
      toast.error("Missing Fields", {
        description:
          "Please fill in at least the name, specialty, and location.",
      });
      return;
    }
    if (!description.en.trim()) {
      toast.error("Missing Fields", {
        description: "Please add an English description.",
      });
      return;
    }

    setSaving(true);
    try {
      let uploadedImagePath = imageUrl.trim();

      if (selectedImageFile) {
        const uploaded = await uploadSingleImage(selectedImageFile);
        uploadedImagePath = uploaded.path;
      }

      await createMutation.mutateAsync({
        name: name.trim(),
        specialty: specialty.trim(),
        location: location.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        shortDescription: toOptionalMultiLang(description),
        fullStory: toOptionalMultiLang(story),
        image: uploadedImagePath || undefined,
        isFeatured: featured,
        isActive,
      });

      toast.success("Artisan Created", {
        description: `${name.trim()} has been added as an artisan.`,
      });
      router.push("/admin/artisans");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create artisan.";
      toast.error("Create failed", {
        description: message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/artisans")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Add New Artisan
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new artisan profile
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={saving} className="gap-2">
          <Plus className="h-4 w-4" />
          {saving ? "Creating..." : "Create Artisan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Artisan's full name"
                />
              </div>
              <div>
                <Label>Specialty *</Label>
                <Input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g., Basket Weaving, Pottery"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                    Phone
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                  />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                  Location *
                </Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Musanze District"
                />
              </div>
            </CardContent>
          </Card>

          {/* Description & Story */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Description &amp; Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiLangInput
                label="Short Description"
                value={description}
                onChange={setDescription}
                placeholder="Brief description shown on community listing..."
                required
                type="textarea"
                rows={2}
              />
              <MultiLangInput
                label="Full Story"
                value={story}
                onChange={setStory}
                placeholder="The artisan's background, journey, and craft philosophy..."
                type="textarea"
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Profile Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedImagePreview ? (
                <img
                  src={selectedImagePreview}
                  alt="Selected artisan"
                  className="w-full aspect-square object-cover rounded-xl border border-border"
                />
              ) : (
                <div className="w-full aspect-square rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground text-xs">
                  No image selected
                </div>
              )}
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload profile photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
              <div>
                <Label>Or use existing image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/uploads/filename.jpg or https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-500" /> Featured
                    Artisan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Show in featured sections
                  </p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Inactive artisans are hidden from public listing
                  </p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Creating..." : "Create Artisan"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/admin/artisans")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
