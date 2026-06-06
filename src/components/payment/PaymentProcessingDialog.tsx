"use client";

import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InitiatePaymentResult } from "@/lib/api/payments";

type Phase = "processing" | "success" | "failed";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: Phase;
  result?: InitiatePaymentResult | null;
  errorMessage?: string;
  onRetry?: () => void;
  onDone?: () => void;
};

export function PaymentProcessingDialog({
  open,
  onOpenChange,
  phase,
  result,
  errorMessage,
  onRetry,
  onDone,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {phase === "processing" && "Processing payment"}
            {phase === "success" && "Payment successful"}
            {phase === "failed" && "Payment failed"}
          </DialogTitle>
          <DialogDescription>
            {phase === "processing" &&
              "Check your phone and approve the Mobile Money prompt."}
            {phase === "success" && "Your payment was recorded successfully."}
            {phase === "failed" &&
              (errorMessage || "We could not complete the payment. You can try again.")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 gap-4 text-center">
          {phase === "processing" && (
            <>
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                Waiting for MoMo approval…
              </div>
            </>
          )}
          {phase === "success" && (
            <>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              {result?.reference && (
                <p className="text-xs text-muted-foreground">
                  Reference: <span className="font-mono font-medium text-foreground">{result.reference}</span>
                </p>
              )}
            </>
          )}
          {phase === "failed" && (
            <>
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {phase === "failed" && onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
          {(phase === "success" || phase === "failed") && onDone && (
            <Button onClick={onDone}>
              {phase === "success" ? "Continue" : "Close"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
