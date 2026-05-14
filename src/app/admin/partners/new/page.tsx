"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminPartner, type AdminPartnerType } from "@/lib/api/partners";
import { toast } from "sonner";

type FormState = {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: AdminPartnerType;
  status: "pending" | "active" | "inactive";
  revenueShareRate: string;
  aboutBusiness: string;
  notes: string;
  tagline: string;
  logo: string;
  city: string;
  country: string;
  address: string;
  foundedYear: string;
  teamSize: string;
  registrationNumber: string;
  isPublic: boolean;
};

const initialFormState: FormState = {
  businessName: "",
  contactPerson: "",
  email: "",
  phone: "",
  type: "tourism_operator",
  status: "pending",
  revenueShareRate: "0",
  aboutBusiness: "",
  notes: "",
  tagline: "",
  logo: "",
  city: "",
  country: "",
  address: "",
  foundedYear: "",
  teamSize: "",
  registrationNumber: "",
  isPublic: false,
};

function buildPartnerNotes(
  aboutBusiness: string,
  notes: string,
): string | undefined {
  const sections = [
    aboutBusiness.trim()
      ? `Business description:\n${aboutBusiness.trim()}`
      : "",
    notes.trim() ? `Internal notes:\n${notes.trim()}` : "",
  ].filter(Boolean);

  return sections.length > 0 ? sections.join("\n\n") : undefined;
}

export default function RegisterPartnerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const createMutation = useMutation({
    mutationFn: createAdminPartner,
    onSuccess: (partner) => {
      toast.success("Partner registered", {
        description: `${partner.name} has been added successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-partner-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      router.push("/admin/partners");
    },
    onError: (error: Error) => {
      toast.error("Unable to register partner", {
        description:
          error.message || "Please review the form values and try again.",
      });
    },
  });

  const handleCreatePartner = async () => {
    if (
      !formState.businessName.trim() ||
      !formState.contactPerson.trim() ||
      !formState.email.trim()
    ) {
      toast.error("Missing required fields", {
        description: "Business name, contact person, and email are required.",
      });
      return;
    }

    const revenueShareRate = Number(formState.revenueShareRate);

    if (
      Number.isNaN(revenueShareRate) ||
      revenueShareRate < 0 ||
      revenueShareRate > 100
    ) {
      toast.error("Invalid revenue share rate", {
        description: "Revenue share rate must be a number between 0 and 100.",
      });
      return;
    }

    await createMutation.mutateAsync({
      name: formState.businessName.trim(),
      contactName: formState.contactPerson.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim() || undefined,
      type: formState.type,
      status: formState.status,
      revenueShareRate,
      notes: buildPartnerNotes(formState.aboutBusiness, formState.notes),
      tagline: formState.tagline.trim(),
      logo: formState.logo.trim(),
      city: formState.city.trim(),
      country: formState.country.trim(),
      address: formState.address.trim(),
      foundedYear: formState.foundedYear ? parseInt(formState.foundedYear) : undefined,
      teamSize: formState.teamSize.trim(),
      registrationNumber: formState.registrationNumber.trim(),
      isPublic: formState.isPublic,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/partners">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Partners
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-heading mt-3">
          Register a New Partner
        </h1>
        <p className="text-xs text-muted-foreground">
          This form now submits directly to the backend partner creation API.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Business Name *</Label>
                <Input
                  placeholder="Example: Green Valley Tourism Ltd"
                  value={formState.businessName}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      businessName: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Contact Person *</Label>
                <Input
                  placeholder="Example: Alice Uwimana"
                  value={formState.contactPerson}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      contactPerson: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Email *</Label>
                <Input
                  type="email"
                  placeholder="Example: contact@business.rw"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Phone</Label>
                <Input
                  placeholder="Example: +250 7XX XXX XXX"
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Business Type *</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value: AdminPartnerType) =>
                    setFormState((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourism_operator">Tourism Operator</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Partner Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value: any) =>
                    setFormState((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Tagline / Motto</Label>
                <Input
                  placeholder="Business tagline..."
                  value={formState.tagline}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      tagline: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Founded Year</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2014"
                  value={formState.foundedYear}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      foundedYear: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Registration Number</Label>
                <Input
                  placeholder="RDB / NGO Reg No"
                  value={formState.registrationNumber}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      registrationNumber: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">City</Label>
                <Input
                  placeholder="e.g. Musanze"
                  value={formState.city}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Country</Label>
                <Input
                  placeholder="e.g. Rwanda"
                  value={formState.country}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      country: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px]">Physical Address</Label>
                <Input
                  placeholder="Street, Building..."
                  value={formState.address}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>

          <div className="space-y-1.5">
            <Label className="text-[11px]">About Business (Optional)</Label>
            <Textarea
              rows={3}
              placeholder="Example: We provide curated farm tours and sustainable travel experiences."
              value={formState.aboutBusiness}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  aboutBusiness: event.target.value,
                }))
              }
              className="text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Stored inside the backend `notes` field because there is no
              dedicated business description field on partner creation.
            </p>
          </div>

            <Textarea
              rows={2}
              placeholder="Example: Preferred for school package partnerships in Q2."
              value={formState.notes}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  notes: event.target.value,
                }))
              }
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold">Public Visibility</Label>
              <p className="text-[10px] text-muted-foreground">Display partner on the public directory.</p>
            </div>
            <Switch 
              checked={formState.isPublic}
              onCheckedChange={(v) => setFormState(prev => ({ ...prev, isPublic: v }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/partners")}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePartner}
              disabled={createMutation.isPending}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              {createMutation.isPending ? "Registering..." : "Register Partner"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
