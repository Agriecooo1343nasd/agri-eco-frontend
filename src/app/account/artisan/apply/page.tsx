"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, MapPin, Paintbrush, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchArtisanMyApplication, submitArtisanApplication, type AdminArtisanApplication } from "@/lib/api/artisans";
import { Loader2 } from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyRoleStatus } from "@/lib/api/user";

export default function ArtisanApplyPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: roleStatus, isLoading } = useQuery({
    queryKey: ["user-role-status-artisan-apply"],
    queryFn: fetchMyRoleStatus,
  });

  const existing = roleStatus?.artisan?.latestApplication;
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking application status...</p>
      </div>
    );
  }

  const status = existing?.status || "none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <Link
            href="/account/artisan"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to artisan portal
          </Link>
          <h1 className="text-3xl font-black text-foreground font-heading">
            Apply to become an artisan
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Share your specialty and background. We’ll review your application.
          </p>
        </div>
        {status === "pending" && (
          <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Your application is currently pending review
          </div>
        )}
        {status === "approved" && (
          <div className="rounded-md border border-green-500/20 bg-green-50 px-4 py-3 text-sm flex items-center gap-2 font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Your application has been approved!
          </div>
        )}
      </div>

      <Card className="rounded-2xl border-border shadow-soft overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary" />
            Artisan application form
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            className="grid gap-6 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (status === "pending") {
                toast.info("You already have a pending application.");
                return;
              }

              const fd = new FormData(e.currentTarget);
              const payload = {
                fullName: String(fd.get("fullName") || "").trim(),
                email: String(fd.get("email") || "").trim(),
                phone: String(fd.get("phone") || "").trim(),
                specialty: String(fd.get("specialty") || "").trim(),
                location: String(fd.get("location") || "").trim(),
                shortDescription: String(fd.get("shortDescription") || "").trim(),
                fullStory: String(fd.get("fullStory") || "").trim(),
              };

              if (!payload.fullName || !payload.email || !payload.specialty || !payload.location) {
                toast.warning("Please fill in all required fields.");
                return;
              }

              setIsSubmitting(true);
              try {
                await submitArtisanApplication(payload);
                toast.success("Application submitted successfully", { 
                  description: "Agri-Eco team will review your application soon." 
                });
                queryClient.invalidateQueries({ queryKey: ["user-role-status-artisan"] });
                queryClient.invalidateQueries({ queryKey: ["user-role-status-artisan-apply"] });
                queryClient.invalidateQueries({ queryKey: ["user-role-status-header"] });
              } catch (error) {
               console.error("something went wrong")
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full name</Label>
              <Input name="fullName" defaultValue={existing?.fullName ?? user?.name ?? ""} required disabled={status !== "none"} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
              <Input name="email" type="email" defaultValue={existing?.email ?? user?.email ?? ""} required disabled={status !== "none"} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </Label>
              <Input name="phone" defaultValue={existing?.phone ?? user?.phone ?? ""} required disabled={status !== "none"} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
                <Paintbrush className="h-3.5 w-3.5" /> Your Specialty
              </Label>
              <Input name="specialty" defaultValue={existing?.specialty ?? ""} placeholder="e.g. Basket weaving, Pottery" required disabled={status !== "none"} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Business Location
              </Label>
              <Input name="location" defaultValue={existing?.location ?? ""} placeholder="e.g. Musanze, Northern Province" required disabled={status !== "none"} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Description</Label>
              <Textarea
                name="shortDescription"
                defaultValue={existing?.shortDescription?.en ?? ""}
                placeholder="A brief summary of your work..."
                required
                disabled={status !== "none"}
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Full Story</Label>
              <Textarea
                name="fullStory"
                defaultValue={existing?.fullStory?.en ?? ""}
                placeholder="Tell customers about your background, passion, and process…"
                disabled={status !== "none"}
                rows={4}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/account/artisan">Cancel</Link>
              </Button>
              <Button type="submit" className="rounded-xl px-8" disabled={isSubmitting || status !== "none"}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : status === "pending" ? (
                  "Application Pending"
                ) : status === "approved" ? (
                  "Already Approved"
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

