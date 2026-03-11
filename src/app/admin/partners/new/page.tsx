"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import type { Partner } from "@/data/community";
import {
  createPartnerFromInput,
  getPartners,
  savePartners,
} from "@/lib/partner-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";

export default function RegisterPartnerPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    type: "tourism-operator" as Partner["type"],
    aboutBusiness: "",
    status: "active" as Partner["status"],
    networkStatus: "onboarding" as Partner["networkStatus"],
    commissionRate: "10",
    partnerSharePercent: "90",
    platformSharePercent: "10",
    grossRevenue: "0",
    totalBookings: "0",
    payoutCycle: "monthly" as Partner["payoutCycle"],
    payoutStatus: "pending" as Partner["payoutStatus"],
    notes: "",
  });

  const handleCreatePartner = () => {
    if (
      !formState.businessName ||
      !formState.contactPerson ||
      !formState.email ||
      !formState.phone
    ) {
      toast.error("Missing Required Fields", {
        description:
          "Business name, contact person, email and phone are required.",
      });
      return;
    }

    const partnerShare = Number(formState.partnerSharePercent);
    const platformShare = Number(formState.platformSharePercent);
    if (partnerShare + platformShare !== 100) {
      toast.error("Invalid Revenue Share", {
        description:
          "Partner share and platform share must add up to exactly 100%.",
      });
      return;
    }

    const created = createPartnerFromInput({
      businessName: formState.businessName,
      contactPerson: formState.contactPerson,
      email: formState.email,
      phone: formState.phone,
      type: formState.type,
      aboutBusiness: formState.aboutBusiness,
      status: formState.status,
      networkStatus: formState.networkStatus,
      commissionRate: Number(formState.commissionRate),
      partnerSharePercent: partnerShare,
      platformSharePercent: platformShare,
      grossRevenue: Number(formState.grossRevenue),
      totalBookings: Number(formState.totalBookings),
      payoutCycle: formState.payoutCycle,
      payoutStatus: formState.payoutStatus,
      notes: formState.notes,
    });

    const partners = getPartners();
    savePartners([created, ...partners]);

    toast.success("Partner Registered", {
      description: `${created.businessName} has been added successfully.`,
    });
    router.push("/admin/partners");
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
          Capture partner profile, finance model, network status and agreement
          context.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
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
              <Label className="text-[11px]">Phone *</Label>
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
                onValueChange={(value: Partner["type"]) =>
                  setFormState((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tourism-operator">
                    Tourism Operator
                  </SelectItem>
                  <SelectItem value="hotel">Hotel / Lodge</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="school">School / Institution</SelectItem>
                  <SelectItem value="ngo">NGO / Non-profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Partner Status</Label>
              <Select
                value={formState.status}
                onValueChange={(value: Partner["status"]) =>
                  setFormState((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Network Status</Label>
              <Select
                value={formState.networkStatus}
                onValueChange={(value: Partner["networkStatus"]) =>
                  setFormState((prev) => ({ ...prev, networkStatus: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Gross Revenue (RWF)</Label>
              <Input
                type="number"
                min="0"
                placeholder="Example: 1200000"
                value={formState.grossRevenue}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    grossRevenue: event.target.value,
                  }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Commission %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Example: 10"
                value={formState.commissionRate}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    commissionRate: event.target.value,
                  }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Partner Share %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Example: 90"
                value={formState.partnerSharePercent}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    partnerSharePercent: event.target.value,
                  }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Platform Share %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="Example: 10"
                value={formState.platformSharePercent}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    platformSharePercent: event.target.value,
                  }))
                }
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Payout Cycle</Label>
              <Select
                value={formState.payoutCycle}
                onValueChange={(value: Partner["payoutCycle"]) =>
                  setFormState((prev) => ({ ...prev, payoutCycle: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Payout Status</Label>
              <Select
                value={formState.payoutStatus}
                onValueChange={(value: Partner["payoutStatus"]) =>
                  setFormState((prev) => ({ ...prev, payoutStatus: value }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-[11px]">About Business</Label>
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
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-[11px]">Internal Notes</Label>
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
          </div>

          <div className="flex gap-2 pt-5">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/partners")}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePartner}>
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Register Partner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
