"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sampleSchoolVisits, type SchoolVisit } from "@/data/education";
import {
  ArrowLeft,
  School,
  User,
  Mail,
  Phone,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  FileText,
  MessageSquare,
  Check,
  X,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const statusConfig = {
  pending: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: AlertCircle,
    label: "Pending Review",
  },
  approved: {
    color: "bg-primary/10 text-primary border-primary/20",
    icon: CheckCircle,
    label: "Approved",
  },
  completed: {
    color: "bg-muted text-muted-foreground border-border",
    icon: CheckCircle,
    label: "Completed",
  },
  cancelled: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function SchoolVisitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const visitId = params.id as string;

  const visit = sampleSchoolVisits.find((v) => v.id === visitId);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!visit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Visit Not Found
          </h1>
          <p className="text-muted-foreground mb-4">
            The school visit you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/admin/education")}>
            Back to Education Hub
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[visit.status].icon;

  const handleConfirmVisit = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setConfirmDialogOpen(false);
    toast.success("Visit Confirmed!", {
      description: `${visit.schoolName} visit has been scheduled for ${visit.preferredDate}.`,
    });
    router.push("/admin/education");
  };

  const handleDeclineVisit = async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setDeclineDialogOpen(false);
    toast.success("Visit Declined", {
      description: `Invitation for ${visit.schoolName} has been declined.`,
    });
    router.push("/admin/education");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/education")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-heading text-foreground">
                School Visit Request
              </h1>
              <p className="text-sm text-muted-foreground">
                Review and manage school visit application
              </p>
            </div>
            <Badge
              className={`${statusConfig[visit.status].color} border text-xs font-bold px-3 py-1`}
            >
              <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
              {statusConfig[visit.status].label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Institution Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <School className="h-5 w-5 text-primary" />
                  Institution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        School Name
                      </Label>
                      <p className="text-lg font-bold text-foreground">
                        {visit.schoolName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Grade Level
                      </Label>
                      <Badge
                        variant="secondary"
                        className="text-sm font-bold py-1 px-3 bg-primary/5 text-primary border-primary/20"
                      >
                        {visit.gradeLevel}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Student Count
                      </Label>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold text-foreground">
                          {visit.studentCount} students
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Preferred Date
                      </Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold text-foreground">
                          {visit.preferredDate}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Request Date
                      </Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {visit.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Curriculum Alignment
                  </Label>
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {visit.curriculumAlignment}
                  </p>
                </div>
                {visit.specialNeeds && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                        Special Requirements
                      </Label>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-amber-800 font-medium">
                            {visit.specialNeeds}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        Contact Person
                      </Label>
                      <p className="text-sm font-bold text-foreground">
                        {visit.contactPerson}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        Email Address
                      </Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={`mailto:${visit.email}`}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {visit.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        Phone Number
                      </Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={`tel:${visit.phone}`}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {visit.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {visit.status === "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                    onClick={() => setConfirmDialogOpen(true)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Visit
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeclineDialogOpen(true)}
                  >
                    <XCircle className="h-4 w-4" />
                    Decline Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Visit Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visit Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">
                      {visit.studentCount}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      Students
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <School className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">1</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      School
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grade Level:</span>
                    <span className="font-medium">{visit.gradeLevel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">
                      {visit.curriculumAlignment}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{visit.preferredDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">
                        Request Submitted
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {visit.createdAt}
                      </p>
                    </div>
                  </div>
                  {visit.status === "approved" && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">
                          Visit Approved
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Scheduled for {visit.preferredDate}
                        </p>
                      </div>
                    </div>
                  )}
                  {visit.status === "completed" && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">
                            Visit Approved
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Scheduled for {visit.preferredDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">
                            Visit Completed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Successfully conducted
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {visit.status === "cancelled" && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                        <XCircle className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">
                          Request Cancelled
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Request was declined
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Visit Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Confirm School Visit
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this school visit request? This
              will schedule the visit for {visit.schoolName} on{" "}
              {visit.preferredDate}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmVisit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Visit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Visit Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Decline School Visit
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this visit request. This
              will be communicated to the school.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-sm font-medium mb-2 block">
              Reason for Decline
            </Label>
            <Textarea
              placeholder="Please explain why this visit request cannot be accommodated..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeclineDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineVisit}
              disabled={isProcessing || !declineReason.trim()}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Declining...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Decline Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
