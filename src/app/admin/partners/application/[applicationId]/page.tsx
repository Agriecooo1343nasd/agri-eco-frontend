"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  fetchAdminPartnerApplicationById,
  reviewAdminPartnerApplication,
  type AdminPartnerApplication,
} from "@/lib/api/partners";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const formatDate = (date?: string | Date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function PartnerApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState("");

  const {
    data: application,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-partner-application", params.applicationId],
    queryFn: () => fetchAdminPartnerApplicationById(params.applicationId),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      status,
      notes,
    }: {
      status: "approved" | "rejected";
      notes: string;
    }) => {
      return reviewAdminPartnerApplication(params.applicationId, {
        status,
        reviewNote: notes || undefined,
      });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to review application";
      toast.error(message);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-partner-applications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-partner-application"],
      });

      if (result.status === "approved") {
        toast.success("Application Approved", {
          description: `${result.businessName} was approved and added as a partner.`,
        });
      } else {
        toast.error("Application Rejected", {
          description: `${result.businessName} was rejected.`,
        });
      }

      setTimeout(() => {
        router.push("/admin/partners/application");
      }, 500);
    },
  });

  const handleApprove = () => {
    if (!application) return;
    reviewMutation.mutate({
      status: "approved",
      notes: reviewNotes || "Approved by admin.",
    });
  };

  const handleReject = () => {
    if (!application) return;
    if (!reviewNotes.trim()) {
      toast.error("Review notes are required for rejection.");
      return;
    }
    reviewMutation.mutate({
      status: "rejected",
      notes: reviewNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/partners/application">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Applications
          </Link>
        </Button>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Application not found or failed to load.
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
              {application.contactName}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {application.email}
            </p>
            <p>
              <span className="text-muted-foreground">Phone:</span>{" "}
              {application.phone || "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Type:</span>{" "}
              {application.businessType}
            </p>
            <p>
              <span className="text-muted-foreground">Applied:</span>{" "}
              {formatDate(application.createdAt)}
            </p>
            <Badge
              className={`${statusBadge[application.status]} text-[10px] capitalize`}
            >
              {application.status}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4 space-y-4 text-xs">
            <h2 className="text-sm font-semibold border-b pb-2">Business Profile & Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {application.logo && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Logo:</span>
                    <img src={application.logo} alt="Logo" className="h-16 w-16 object-contain border rounded bg-white" />
                  </div>
                )}
                <p>
                  <span className="text-muted-foreground">Tagline:</span>{" "}
                  {application.tagline || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Founded Year:</span>{" "}
                  {application.foundedYear || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Team Size:</span>{" "}
                  {application.teamSize || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Registration Number:</span>{" "}
                  {application.registrationNumber || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Website:</span>{" "}
                  {application.website || application.socialLinks?.website ? (
                    <a href={application.website || application.socialLinks?.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {application.website || application.socialLinks?.website}
                    </a>
                  ) : "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Terms Agreed:</span>{" "}
                  {application.agreedToTerms ? "Yes" : "No"}
                </p>
              </div>

              <div className="space-y-3">
                <p>
                  <span className="text-muted-foreground">City:</span>{" "}
                  {application.city || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Country:</span>{" "}
                  {application.country || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Address:</span>{" "}
                  {application.address || "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Form Location:</span>{" "}
                  {application.location || "-"}
                </p>
                
                {application.referenceUrls && application.referenceUrls.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Reference Links:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      {application.referenceUrls.map((url, i) => (
                        <li key={i}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-muted-foreground block mb-1">Public Description (or About):</span>
              <p className="leading-relaxed bg-muted/20 p-3 rounded border">
                {application.publicDescription || application.aboutCompany || application.description || "No description provided."}
              </p>
            </div>

            {application.internalMessage && (
              <div className="pt-2">
                <span className="text-muted-foreground block mb-1 text-amber-600 font-medium">Internal Message / Partnership Goals:</span>
                <p className="leading-relaxed bg-amber-500/10 text-amber-900 dark:text-amber-200 p-3 rounded border border-amber-500/20 italic">
                  {application.internalMessage}
                </p>
              </div>
            )}

            {application.reviewedAt && (
              <div className="pt-4 border-t mt-4">
                <p>
                  <span className="text-muted-foreground">Reviewed:</span>{" "}
                  {formatDate(application.reviewedAt)}
                </p>
                {application.reviewNote && (
                  <p className="mt-1">
                    <span className="text-muted-foreground">Admin Note:</span>{" "}
                    {application.reviewNote}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {application.status === "pending" && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <Label className="text-[11px]">Review Notes</Label>
            <Textarea
              rows={4}
              className="text-xs"
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
              placeholder="Add approval/rejection rationale"
              disabled={reviewMutation.isPending}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                className="text-xs"
                onClick={handleApprove}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                )}
                {reviewMutation.isPending
                  ? "Processing..."
                  : "Approve and Create Partner"}
              </Button>
              <Button
                variant="destructive"
                className="text-xs"
                onClick={handleReject}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                )}
                {reviewMutation.isPending ? "Processing..." : "Reject"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
