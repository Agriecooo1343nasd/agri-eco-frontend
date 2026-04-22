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

type ArtisanStatus = "none" | "pending" | "approved";

type LocalArtisanApplication = {
  fullName: string;
  email: string;
  phone?: string;
  specialty: string;
  location: string;
  story?: string;
  createdAt: string;
};

const ARTISAN_STATUS_KEY = "agri-eco.mock.artisan.status";
const ARTISAN_APP_KEY = "agri-eco.mock.artisan.application";

function readLocal<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export default function ArtisanApplyPage() {
  const { user } = useAuth();
  const [existing, setExisting] = useState<LocalArtisanApplication | null>(null);
  const [status, setStatus] = useState<ArtisanStatus>("none");

  useEffect(() => {
    setExisting(readLocal<LocalArtisanApplication>(ARTISAN_APP_KEY));
    const s = readLocal<{ status?: ArtisanStatus }>(ARTISAN_STATUS_KEY);
    setStatus(s?.status ?? "none");
  }, []);

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
          <p className="text-muted-foreground font-medium">
            Share your specialty and background. We’ll review your application.
          </p>
        </div>
        {status === "pending" && (
          <div className="rounded-md border bg-muted/20 px-4 py-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Application is pending review
          </div>
        )}
      </div>

      <Card className="rounded-md border-border shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary" />
            Artisan application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const payload: LocalArtisanApplication = {
                fullName: String(fd.get("fullName") || user?.name || "").trim(),
                email: String(fd.get("email") || user?.email || "").trim(),
                phone: String(fd.get("phone") || "").trim() || undefined,
                specialty: String(fd.get("specialty") || "").trim(),
                location: String(fd.get("location") || "").trim(),
                story: String(fd.get("story") || "").trim() || undefined,
                createdAt: new Date().toISOString(),
              };

              if (!payload.fullName || !payload.email || !payload.specialty || !payload.location) {
                toast.warning("Please fill in all required fields.");
                return;
              }

              writeLocal(ARTISAN_APP_KEY, payload);
              writeLocal(ARTISAN_STATUS_KEY, { status: "pending" as const });
              toast.success("Application submitted", { description: "We’ll review it soon." });
              setExisting(payload);
              setStatus("pending");
            }}
          >
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input name="fullName" defaultValue={existing?.fullName ?? user?.name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" defaultValue={existing?.email ?? user?.email ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> Phone (optional)
              </Label>
              <Input name="phone" defaultValue={existing?.phone ?? user?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2">
                <Paintbrush className="h-4 w-4 text-muted-foreground" /> Specialty
              </Label>
              <Input name="specialty" defaultValue={existing?.specialty ?? ""} placeholder="e.g. Basket weaving" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Location
              </Label>
              <Input name="location" defaultValue={existing?.location ?? ""} placeholder="e.g. Kigali" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Story (optional)</Label>
              <Textarea
                name="story"
                defaultValue={existing?.story ?? ""}
                placeholder="Tell customers about your craft and process…"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2 flex-wrap">
              <Button asChild variant="outline">
                <Link href="/account/artisan">Cancel</Link>
              </Button>
              <Button type="submit">Submit application</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Demo note: this application is stored in your browser (localStorage) until backend endpoints are connected.
      </p>
    </div>
  );
}

