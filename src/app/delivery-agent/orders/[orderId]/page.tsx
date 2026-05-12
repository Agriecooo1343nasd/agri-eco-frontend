"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  fetchAgentOrderById, 
  updateAgentDeliveryStatus, 
  confirmAgentDelivery 
} from "@/lib/api/agent";
import { QrScannerDialog } from "@/components/delivery-agent/QrScannerDialog";
import { 
  Loader2, 
  MapPin, 
  Phone, 
  User, 
  Package, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Truck,
  QrCode
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeliveryOrderDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [scanOpen, setScanOpen] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["agent-order", orderId],
    queryFn: () => fetchAgentOrderById(orderId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }: { status: any; note?: string }) => 
      updateAgentDeliveryStatus(orderId, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-order", orderId] });
      toast.success("Delivery status updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: (qrPayload: string) => confirmAgentDelivery(orderId, qrPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-order", orderId] });
      toast.success("Delivery confirmed! Great job.");
      setScanOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Invalid QR code for this order");
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Fetching task details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest">Task Not Found</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
            This order may have been unassigned or deleted.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" asChild>
          <a href="/delivery-agent/orders">Back to assignments</a>
        </Button>
      </div>
    );
  }

  const isDelivered = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";
  const statusLabel = order.status.replace(/_/g, " ");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-heading tracking-tight uppercase">{order.orderNumber}</h1>
            <Badge className="text-[9px] font-black uppercase tracking-widest h-5">{statusLabel}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Assigned on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {!isDelivered && !isCancelled && (
            <Button 
              onClick={() => setScanOpen(true)}
              className="rounded-xl h-12 px-6 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
            >
              <QrCode className="mr-2 h-4 w-4" /> Scan to Deliver
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer & Address Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Delivery Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Customer</p>
                  <p className="text-sm font-black">{order.user?.firstName} {order.user?.lastName}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary mt-1">
                    <Phone className="h-3 w-3" /> {order.shippingAddress?.phone || "No phone provided"}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wide">
                      {order.shippingAddress?.addressLine1}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/40">
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Order Items ({order.items?.length || 0})
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted relative">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-tight truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          QTY: {item.quantity} · {(item.unitPrice).toLocaleString()} RWF
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Actions */}
          {!isDelivered && !isCancelled && (
            <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Update Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                    onClick={() => updateStatusMutation.mutate({ status: "picked_up" })}
                    disabled={updateStatusMutation.isPending || order.status === "OUT_FOR_DELIVERY"}
                  >
                    <Package className="mr-2 h-4 w-4" /> Mark Picked Up
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                    onClick={() => updateStatusMutation.mutate({ status: "in_transit" })}
                    disabled={updateStatusMutation.isPending || order.status === "OUT_FOR_DELIVERY"}
                  >
                    <Truck className="mr-2 h-4 w-4" /> Out for Delivery
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => {
                      const reason = prompt("Reason for delivery failure:");
                      if (reason) updateStatusMutation.mutate({ status: "failed", note: reason });
                    }}
                    disabled={updateStatusMutation.isPending}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" /> Report Issue
                  </Button>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/40">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Internal Delivery Note</p>
                  <Textarea 
                    placeholder="Add any specific details about this delivery attempt..." 
                    className="rounded-xl text-[11px] font-bold uppercase tracking-wider min-h-[100px]"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    className="rounded-lg text-[10px] font-black uppercase tracking-widest px-4 h-9"
                    onClick={() => {
                      if (!note) return toast.error("Please enter a note");
                      updateStatusMutation.mutate({ status: order.status.toLowerCase(), note });
                      setNote("");
                    }}
                  >
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden h-fit">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                {order.timeline?.map((event: any, i: number) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute left-0 top-1 h-5 w-5 rounded-full border-4 border-background flex items-center justify-center ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}>
                      {i === 0 && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest">{event.status.replace(/_/g, " ")}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">{event.note}</p>
                      <p className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <QrScannerDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        title={`Scan QR for ${order.orderNumber}`}
        onDetected={(value) => confirmDeliveryMutation.mutate(value)}
      />
    </div>
  );
}
