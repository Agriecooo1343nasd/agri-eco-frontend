"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { PartnerApplication } from "@/data/community";
import {
  createPartnerFromApplication,
  getPartnerApplications,
  getPartners,
  savePartnerApplications,
  savePartners,
} from "@/lib/partner-store";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function PartnerApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const router = useRouter();
  const [applications, setApplications] = useState<PartnerApplication[]>(() =>
    getPartnerApplications(),
  );
  const [reviewNotes, setReviewNotes] = useState(() => {
    const current = getPartnerApplications().find(
      (entry) => entry.id === params.applicationId,
    );
    return current?.reviewNotes || "";
  });

  const application = useMemo(
    () => applications.find((entry) => entry.id === params.applicationId),
    [applications, params.applicationId],
  );

  const handleApprove = () => {
    if (!application) return;

    const approved: PartnerApplication = {
      ...application,
      status: "approved",
      reviewedDate: new Date().toISOString().slice(0, 10),
      reviewNotes: reviewNotes || "Approved by admin.",
    };

    const nextApplications = applications.map((entry) =>
      entry.id === application.id ? approved : entry,
    );
    setApplications(nextApplications);
    savePartnerApplications(nextApplications);

    const partners = getPartners();
    const nextPartner = createPartnerFromApplication(approved);
    savePartners([nextPartner, ...partners]);

    toast.success("Application Approved", {
      description: `${application.businessName} was approved and added as a partner.`,
    });
    router.push("/admin/partners");
  };

  const handleReject = () => {
    if (!application) return;
    if (!reviewNotes.trim()) {
      toast.error("Review notes are required for rejection.");
      return;
    }

    const rejected: PartnerApplication = {
      ...application,
      status: "rejected",
      reviewedDate: new Date().toISOString().slice(0, 10),
      reviewNotes,
    };

    const nextApplications = applications.map((entry) =>
      entry.id === application.id ? rejected : entry,
    );
    setApplications(nextApplications);
    savePartnerApplications(nextApplications);

    toast.error("Application Rejected", {
      description: `${application.businessName} was rejected.`,
    });
    router.push("/admin/partners");
  };

  if (!application) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/partners/application">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Applications
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Application not found. It may have been removed from local data.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/partners/application">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Applications
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-heading mt-3">
          {application.businessName}
        </h1>
        <p className="text-xs text-muted-foreground">
          Partner Application Detail
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2 text-xs">
            <h2 className="text-sm font-semibold">Applicant Information</h2>
            <p>
              <span className="text-muted-foreground">Contact:</span>{" "}
              {application.contactPerson}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {application.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {application.phone}
            </p>
            <p>
              <span className="text-muted-foreground">Type:</span>{" "}
              {application.type}
            </p>
            <p>
              <span className="text-muted-foreground">Applied:</span>{" "}
              {application.appliedDate}
            </p>
            <Badge
              className={`${statusBadge[application.status]} text-[10px] capitalize`}
            >
              {application.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2 text-xs">
            <h2 className="text-sm font-semibold">Business Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              {application.aboutBusiness}
            </p>
            {application.reviewedDate && (
              <p>
                <span className="text-muted-foreground">Reviewed:</span>{" "}
                {application.reviewedDate}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Label className="text-[11px]">Review Notes</Label>
          <Textarea
            rows={4}
            className="text-xs"
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
            placeholder="Add approval/rejection rationale"
          />
          <div className="flex flex-wrap gap-2">
            <Button className="text-xs" onClick={handleApprove}>
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve and Create
              Partner
            </Button>
            <Button
              variant="destructive"
              className="text-xs"
              onClick={handleReject}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
