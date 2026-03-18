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

        <Card>
          <CardContent className="p-4 space-y-2 text-xs">
            <h2 className="text-sm font-semibold">Business Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              {application.description || "-"}
            </p>
            {application.reviewedAt && (
              <>
                <p>
                  <span className="text-muted-foreground">Reviewed:</span>{" "}
                  {formatDate(application.reviewedAt)}
                </p>
                {application.reviewNote && (
                  <p>
                    <span className="text-muted-foreground">Note:</span>{" "}
                    {application.reviewNote}
                  </p>
                )}
              </>
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
