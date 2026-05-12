"use client";

import { use, useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  fetchAgentReturnById, 
  markReturnPickedUp, 
  markReturnAtWarehouse 
} from "@/lib/api/agent";
import { 
  Loader2, 
  MapPin, 
  User, 
  Package, 
  Calendar, 
  AlertCircle,
  RotateCcw,
  Warehouse,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeliveryReturnDetails({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = use(params);
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const { data: returnReq, isLoading, error } = useQuery({
    queryKey: ["agent-return", returnId],
    queryFn: () => fetchAgentReturnById(returnId),
  });

  const pickUpMutation = useMutation({
    mutationFn: (note?: string) => markReturnPickedUp(returnId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-return", returnId] });
      toast.success("Item marked as picked up");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to mark as picked up");
    }
  });

  const warehouseMutation = useMutation({
    mutationFn: (note?: string) => markReturnAtWarehouse(returnId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-return", returnId] });
      toast.success("Return completed! Item at warehouse.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update warehouse status");
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Fetching return details...
        </p>
      </div>
    );
  }

  if (error || !returnReq) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest">Return Not Found</h2>
        <Button variant="outline" className="rounded-xl" asChild>
          <a href="/delivery-agent/returns">Back to returns</a>
        </Button>
      </div>
    );
  }

  const isCompleted = returnReq.status === "returned_to_warehouse";
  const isPickedUp = returnReq.status === "picked_up";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-heading tracking-tight uppercase">RTN-{returnReq.id.slice(0, 8).toUpperCase()}</h1>
            <Badge className="text-[9px] font-black uppercase tracking-widest h-5 bg-purple-600">
              {returnReq.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Assigned for pickup
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-purple-600" /> Return Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Customer</p>
                  <p className="text-sm font-black">{returnReq.user?.firstName} {returnReq.user?.lastName}</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1">{returnReq.user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Original Order</p>
                  <p className="text-sm font-black text-primary">{returnReq.order?.orderNumber}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <p className="text-[9px] font-black uppercase text-destructive/70 tracking-widest mb-1">Reason for Return</p>
                <p className="text-[11px] font-bold leading-relaxed uppercase tracking-tight">{returnReq.reason}</p>
              </div>
            </CardContent>
          </Card>

          {!isCompleted && (
            <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Update Pickup Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-wrap gap-3">
                  {!isPickedUp && (
                    <Button 
                      className="rounded-xl h-12 px-8 text-[10px] font-black uppercase tracking-widest bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
                      onClick={() => pickUpMutation.mutate(note)}
                      disabled={pickUpMutation.isPending}
                    >
                      <Package className="mr-2 h-4 w-4" /> Confirm Pickup
                    </Button>
                  )}
                  {isPickedUp && (
                    <Button 
                      className="rounded-xl h-12 px-8 text-[10px] font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                      onClick={() => warehouseMutation.mutate(note)}
                      disabled={warehouseMutation.isPending}
                    >
                      <Warehouse className="mr-2 h-4 w-4" /> Handover to Warehouse
                    </Button>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-border/40">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Pickup Notes</p>
                  <Textarea 
                    placeholder="Add details about item condition or pickup issues..." 
                    className="rounded-xl text-[11px] font-bold uppercase tracking-wider min-h-[100px]"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/60 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Status</span>
                <span className="text-primary">{returnReq.status.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Type</span>
                <span>{returnReq.appealStatus !== "none" ? "Appeal" : "Standard Return"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
