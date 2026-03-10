"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Home,
  Users,
  DollarSign,
  Tag,
  Check,
  Calendar,
  MapPin,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { accommodations, Accommodation } from "@/data/accommodations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { languages } from "@/i18n/config";

export default function ViewAccommodationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(
    null,
  );

  useEffect(() => {
    // Simulate fetching data
    const data = accommodations.find((a) => a.id === id);
    if (data) {
      setAccommodation(data);
      setLoading(false);
    } else {
      toast.error("Accommodation not found");
      router.push("/admin/accommodations");
    }
  }, [id, router]);

  if (loading || !accommodation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
          Fetching Stay Details...
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    occupied: "bg-green-500/10 text-green-600 border-green-500/20",
    hidden: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Header section with actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
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
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                  statusColors[accommodation.status],
                )}
              >
                {accommodation.status}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                ID: {accommodation.id}
              </span>
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              {accommodation.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/accommodations/${accommodation.id}/edit`}>
            <Button
              variant="outline"
              className="h-11 px-6 rounded-xl border-border/50 font-bold gap-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Property</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Hero Image */}
          <div className="aspect-[16/7] rounded-2xl overflow-hidden border border-border/50 bg-muted relative group shadow-2xl">
            {accommodation.images[0] ? (
              <img
                src={accommodation.images[0]}
                alt={accommodation.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                <Home className="h-16 w-16 mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">
                  No Image Uploaded
                </p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Description & Languages */}
          <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg font-heading">
                Marketing Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {languages.map((lang) => (
                  <div key={lang.code} className="p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {lang.code}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {lang.label}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">
                        {accommodation.translatedName[lang.code] || "—"}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "
                        {accommodation.description[lang.code] ||
                          "No description provided for this language."}
                        "
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Amenities Grid */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading">
                Facilities & Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {accommodation.amenities.map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10 group hover:border-primary/30 transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Stats & Quick Info */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-xl overflow-hidden bg-primary/5 border-primary/20 ring-1 ring-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                Stay Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Rate Nightly
                    </span>
                  </div>
                  <span className="font-bold text-lg">
                    {accommodation.pricePerNight.toLocaleString()} RWF
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Max Capacity
                    </span>
                  </div>
                  <span className="font-bold text-lg">
                    {accommodation.capacity} Adults
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                      <Tag className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Unit Type
                    </span>
                  </div>
                  <span className="font-bold text-sm capitalize">
                    {accommodation.type.replace("-", " ")}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  <span>HISTORY</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Created On</span>
                    <span className="font-medium">
                      {accommodation.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Last Performance Update
                    </span>
                    <span className="font-medium italic">Never</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Link to Tours */}
          <Card className="border-border/50 shadow-sm border-dashed bg-muted/10">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-background border border-border/50 shadow-inner flex items-center justify-center mx-auto">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Tour Integration</h4>
                <p className="text-[11px] text-muted-foreground mt-1 px-2 leading-relaxed">
                  This stay can be linked to any experience during the tour
                  creation process.
                </p>
              </div>
              <Link href="/admin/tours/create-tour">
                <Button
                  variant="link"
                  className="text-primary text-xs font-bold gap-1 mt-2"
                >
                  Start Linking <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
