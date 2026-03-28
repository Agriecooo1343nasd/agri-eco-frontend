"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Home,
  Users,
  DollarSign,
  Tag,
  Calendar,
  MapPin,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { languages } from "@/i18n/config";
import {
  deleteAdminAccommodation,
  fetchAccommodationById,
  toAbsoluteAccommodationImage,
} from "@/lib/api/accommodations";
import { fetchAdminExperiences } from "@/lib/api/experiences";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function getLocalizedText(value?: {
  en?: string;
  rw?: string;
  fr?: string;
  sw?: string;
}) {
  if (!value) return "Untitled";
  return value.en || value.rw || value.fr || value.sw || "Untitled";
}

/* ─── Sub-component: Linked Tours ─── */
function LinkedToursList({ accommodationId }: { accommodationId: string }) {
  const { data: experiencesResult, isLoading } = useQuery({
    queryKey: ["admin-experiences-linked-to", accommodationId],
    queryFn: () =>
      fetchAdminExperiences({
        limit: 100, // Fetch all to filter manually
      }),
  });

  const linkedTours = (experiencesResult?.data ?? []).filter((exp) =>
    exp.linkedAccommodationIds?.includes(accommodationId),
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground mb-2" />
        <span>Searching for connections...</span>
      </div>
    );
  }

  if (linkedTours.length === 0) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-xs text-muted-foreground font-medium">
          This accommodation is not yet linked to any tours.
        </p>
        <Link href="/admin/tours/create-tour">
          <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider">
            Create Experience
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50 text-xs">
      {linkedTours.map((tour) => (
        <div key={tour.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-16 rounded overflow-hidden border border-border/50 bg-muted shrink-0">
              {tour.heroImage ? (
                <img src={tour.heroImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate">
                {getLocalizedText(tour.title)}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                {tour.type} &middot; {tour.priceRwf.toLocaleString()} RWF
              </p>
            </div>
          </div>
          <Link href={`/admin/tours/${tour.slug}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function ViewAccommodationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const accommodationQuery = useQuery({
    queryKey: ["admin-accommodation", id],
    queryFn: () => fetchAccommodationById(id),
    enabled: Boolean(id),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminAccommodation(id),
    onSuccess: () => {
      toast.success("Accommodation deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      router.push("/admin/accommodations");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete accommodation", {
        description: error.message || "Please try again.",
      });
    },
  });

  if (accommodationQuery.isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
          Fetching Stay Details...
        </p>
      </div>
    );
  }

  if (accommodationQuery.isError || !accommodationQuery.data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-medium text-muted-foreground text-center max-w-md">
          {accommodationQuery.error instanceof Error
            ? accommodationQuery.error.message
            : "Accommodation not found."}
        </p>
        <Link href="/admin/accommodations">
          <Button variant="outline">Back to Accommodations</Button>
        </Link>
      </div>
    );
  }

  const accommodation = accommodationQuery.data;

  const statusColors: Record<string, string> = {
    available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    maintenance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    occupied: "bg-green-500/10 text-green-600 border-green-500/20",
  };

  const mainImage = toAbsoluteAccommodationImage(
    accommodation.mainImage || accommodation.gallery?.[0],
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
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
              {getLocalizedText(accommodation.name)}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/accommodations/${accommodation.id}/edit`}>
            <Button
              variant="outline"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Property</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-[16/7] rounded-2xl overflow-hidden border border-border/50 bg-muted relative group shadow-2xl">
            {mainImage ? (
              <img
                src={mainImage}
                alt={getLocalizedText(accommodation.name)}
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

          <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg font-heading">
                Marketing Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {languages.map((lang) => {
                  const langCode = lang.code as "en" | "rw" | "fr" | "sw";
                  return (
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
                          {accommodation.name?.[langCode] || "—"}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                          {accommodation.description?.[langCode] ||
                            "No description provided for this language."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading">
                Facilities & Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(accommodation.amenities ?? []).map((amenity, i) => (
                  <div
                    key={`${amenity}-${i}`}
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
                    {Number(
                      accommodation.ratePerNightRwf || 0,
                    ).toLocaleString()}{" "}
                    RWF
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
                    {accommodation.maxGuests} Guests
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
                    {accommodation.category}
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
                      {new Date(accommodation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Updated On</span>
                    <span className="font-medium">
                      {new Date(accommodation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Tours */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Linked Experiences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LinkedToursList accommodationId={id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Accommodation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this accommodation and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
