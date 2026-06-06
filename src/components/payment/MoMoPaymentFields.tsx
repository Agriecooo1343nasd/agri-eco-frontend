"use client";

import { Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PaymentProvider } from "@/lib/api/payments";

type Props = {
  provider: PaymentProvider;
  onProviderChange: (p: PaymentProvider) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  compact?: boolean;
  phoneLabel?: string;
  className?: string;
};

export function MoMoPaymentFields({
  provider,
  onProviderChange,
  phone,
  onPhoneChange,
  compact,
  phoneLabel = "Mobile Money number",
  className,
}: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Label className={cn("text-muted-foreground mb-1.5 block", compact ? "text-[11px]" : "text-xs")}>
          Network
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {(["mtn", "airtel"] as PaymentProvider[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onProviderChange(p)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold uppercase transition-all",
                provider === p
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-accent",
              )}
            >
              <Smartphone className="h-4 w-4" />
              {p === "mtn" ? "MTN MoMo" : "Airtel Money"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className={cn("text-muted-foreground mb-1.5 block", compact ? "text-[11px]" : "text-xs")}>
          {phoneLabel}
        </Label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="078X XXX XXX"
          className={cn(compact && "h-9 text-xs")}
        />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          You will receive a prompt on this number to approve the payment via ITEC Pay.
        </p>
      </div>
    </div>
  );
}
