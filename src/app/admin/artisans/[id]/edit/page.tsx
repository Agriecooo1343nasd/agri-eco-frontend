"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { artisans, type Artisan } from "@/data/community";
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Mail,
  Phone,
  Star,
  ImagePlus,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";

export default function EditArtisanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const artisan: Artisan | undefined = artisans.find((a) => a.id === id);

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

  // Hydrate form from mock data
  useEffect(() => {
    if (!artisan) return;
    setName(artisan.name);
    setSpecialty(artisan.specialty);
    setEmail(artisan.email ?? "");
    setPhone(artisan.phone ?? "");
    setLocation(artisan.location);
    setDescription({ ...emptyLangValue(), en: artisan.description });
    setStory({ ...emptyLangValue(), en: artisan.story });
    setFeatured(artisan.featured);
  }, [artisan]);

  if (!artisan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/artisans")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Artisan Not Found
          </h1>
        </div>
        <div className="border border-border rounded-xl p-12 text-center bg-card">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No artisan found with this ID.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/admin/artisans")}
          >
            Back to Artisans
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!name.trim() || !specialty.trim() || !location.trim()) {
      toast.error("Missing Fields", {
        description:
          "Please fill in at least the name, specialty, and location.",
      });
      return;
    }

    setSaving(true);
    // Placeholder: will call API on integration
    setTimeout(() => {
      setSaving(false);
      toast.success("Artisan Updated", {
        description: `${name}'s profile has been updated.`,
      });
      router.push(`/admin/artisans/${id}`);
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
            onClick={() => router.push(`/admin/artisans/${id}`)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Edit Artisan
            </h1>
            <p className="text-sm text-muted-foreground">{artisan.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
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
          {/* Current Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Profile Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <img
                src={artisan.image}
                alt={artisan.name}
                className="w-full aspect-square object-cover rounded-xl border border-border"
              />
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">
                  Click to replace image
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current:</span>
                <Badge
                  className={`border text-xs capitalize ${
                    artisan.status === "active"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : artisan.status === "pending"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {artisan.status}
                </Badge>
              </div>
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
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/admin/artisans/${id}`)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
