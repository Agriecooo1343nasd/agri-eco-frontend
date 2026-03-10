"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type SchoolVisit } from "@/data/education";
import { CheckCircle, XCircle, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SchoolVisitActionsProps {
  visit: SchoolVisit;
  onStatusChange?: (visitId: string, newStatus: SchoolVisit["status"]) => void;
}

export function SchoolVisitActions({
  visit,
  onStatusChange,
}: SchoolVisitActionsProps) {
  const router = useRouter();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmVisit = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setConfirmDialogOpen(false);

    // Update status if callback provided
    if (onStatusChange) {
      onStatusChange(visit.id, "approved");
    }

    toast.success("Visit Confirmed!", {
      description: `${visit.schoolName} visit has been scheduled for ${visit.preferredDate}.`,
    });
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

    // Update status if callback provided
    if (onStatusChange) {
      onStatusChange(visit.id, "cancelled");
    }

    toast.success("Visit Declined", {
      description: `Invitation for ${visit.schoolName} has been declined.`,
    });
  };

  const handleViewFullRequest = () => {
    router.push(`/admin/education/school-visit/${visit.id}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-xs">
          {visit.status === "pending" && (
            <DropdownMenuItem
              className="gap-2 text-xs py-2 cursor-pointer"
              onClick={() => setConfirmDialogOpen(true)}
            >
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              Confirm Visit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="gap-2 text-xs py-2 cursor-pointer"
            onClick={handleViewFullRequest}
          >
            <Eye className="h-3.5 w-3.5" />
            Full Request
          </DropdownMenuItem>
          {visit.status === "pending" && (
            <DropdownMenuItem
              className="gap-2 text-xs py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => setDeclineDialogOpen(true)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Decline
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
                  <CheckCircle className="h-4 w-4 mr-2" />
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
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
