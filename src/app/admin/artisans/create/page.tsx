"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";

export default function CreateArtisanPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] =
    useState<MultiLangValue>(emptyLangValue());
  const [story, setStory] = useState<MultiLangValue>(emptyLangValue());
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
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
    // Placeholder: will call API on integration
    setTimeout(() => {
      setSaving(false);
      toast.success("Artisan Created", {
        description: `${name} has been added as an artisan.`,
      });
      router.push("/admin/artisans");
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
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload profile photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB
                </p>
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
