"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Loader2, Clock, AlertTriangle, XCircle, Package, Truck, Banknote, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appealReturn,
  fetchMyReturnById,
  ReturnStatus,
  AppealStatus,
  type ReturnRecord
} from "@/lib/api/returns";
import { uploadMultipleImages } from "@/lib/api/uploads";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  [ReturnStatus.PENDING_REVIEW]: "bg-amber-100 text-amber-700 border-amber-200",
  [ReturnStatus.APPROVED]: "bg-blue-100 text-blue-700 border-blue-200",
  [ReturnStatus.REJECTED]: "bg-rose-100 text-rose-700 border-rose-200",
  [ReturnStatus.PENDING_PICKUP]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  [ReturnStatus.PICKED_UP]: "bg-violet-100 text-violet-700 border-violet-200",
  [ReturnStatus.RETURNED_TO_WAREHOUSE]: "bg-teal-100 text-teal-700 border-teal-200",
  [ReturnStatus.REFUNDED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [ReturnStatus.CLOSED]: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function ReturnDetailsPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = use(params);
  const queryClient = useQueryClient();

  const [appealOpen, setAppealOpen] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [appealImages, setAppealImages] = useState<File[]>([]);

  const { data: row, isLoading, isError } = useQuery({
    queryKey: ["my-return", returnId],
    queryFn: () => fetchMyReturnById(returnId),
  });

  const canAppeal = !!row && row.status === ReturnStatus.REJECTED && row.appealStatus === AppealStatus.NONE;

  const appealMutation = useMutation({
    mutationFn: async () => {
      if (!row) throw new Error("Return not loaded.");
      if (appealReason.trim().length < 5) throw new Error("Please provide a reason (min 5 characters).");
      
      let imageUrls: string[] = [];
      if (appealImages.length > 0) {
        const uploaded = await uploadMultipleImages(appealImages);
        imageUrls = uploaded.map(u => u.path);
      }

      await appealReturn(returnId, {
        reason: appealReason.trim(),
        evidenceImages: imageUrls,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-return", returnId] });
      toast.success("Appeal submitted successfully");
      setAppealOpen(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || e.message || "Failed to submit appeal"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Retrieving return details…</p>
      </div>
    );
  }

  if (isError || !row) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground font-heading">RETURN NOT FOUND</h2>
          <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">
            We couldn't find the return request you're looking for.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 px-8 rounded-lg font-bold text-xs uppercase tracking-widest border-border/60">
          <Link href="/account/returns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to returns
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <Link
            href="/account/returns"
            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline mb-2 group"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            All Returns
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-black text-foreground font-heading uppercase tracking-tight">
              Return {row.returnNumber}
            </h1>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-lg border shadow-none",
                statusStyles[row.status] || "bg-muted text-muted-foreground border-border"
              )}
            >
              {row.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
            From Order{" "}
            <Link href={`/account/orders/${row.orderId}`} className="text-primary hover:underline">
              #{row.order?.orderNumber || row.orderId}
            </Link>
            {" "}· Requested on {format(new Date(row.createdAt), "MMM dd, yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button asChild variant="outline" className="h-11 px-6 rounded-lg font-bold text-xs uppercase tracking-widest border-border/60">
            <Link href={`/account/orders/${row.orderId}`}>View order</Link>
          </Button>
          {canAppeal && (
            <Button onClick={() => setAppealOpen(true)} className="h-11 px-6 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
              <RotateCcw className="h-4 w-4 mr-2" />
              Submit Appeal
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Content: Items */}
          <Card className="rounded-xl border-border/40 shadow-soft bg-white overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/5">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Products in this return</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {row.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 hover:bg-muted/5 transition-colors">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border/40 bg-white shrink-0">
                      <img
                        src="/assets/products/placeholder.jpg" // Items don't have images in this schema, using placeholder
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{it.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                        Quantity: <span className="text-foreground">{it.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-sm text-primary">RWF {it.unitPrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description & Evidence */}
          <Card className="rounded-xl border-border/40 shadow-soft bg-white">
            <CardHeader className="pb-4 border-b border-border/40">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reason & Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Reason</p>
                 <Badge variant="secondary" className="text-xs capitalize px-3 py-1 bg-muted/50 border-border/40">{row.reason.replace(/_/g, " ")}</Badge>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Explanation</p>
                 <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/40">{row.description}</p>
              </div>

              {row.evidenceImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" />
                    Attached evidence
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {row.evidenceImages.map((img, i) => (
                      <div key={i} className="aspect-square border border-border/40 rounded-xl overflow-hidden bg-muted group cursor-zoom-in">
                        <img src={img} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appeal Information if exists */}
          {row.appealStatus !== AppealStatus.NONE && (
            <Card className="rounded-xl border-emerald-100 shadow-soft bg-emerald-50/30 overflow-hidden">
               <CardHeader className="pb-4 border-b border-emerald-100 bg-emerald-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Appeal Details</CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] uppercase font-black tracking-widest">
                      {row.appealStatus}
                    </Badge>
                  </div>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Appeal Reason</p>
                    <p className="text-sm text-emerald-900 font-medium">{row.appealReason}</p>
                  </div>
                  
                  {row.appealEvidenceImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                       {row.appealEvidenceImages.map((img, i) => (
                         <div key={i} className="aspect-square rounded-lg overflow-hidden border border-emerald-100">
                           <img src={img} alt="Appeal Evidence" className="w-full h-full object-cover" />
                         </div>
                       ))}
                    </div>
                  )}

                  {row.appealResolutionNote && (
                    <div className="mt-4 p-4 rounded-lg bg-white border border-emerald-100 shadow-sm">
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Resolution Note</p>
                       <p className="text-sm text-emerald-800">{row.appealResolutionNote}</p>
                    </div>
                  )}
               </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Summary Sidebar */}
          <Card className="rounded-xl border-border/40 shadow-soft bg-white">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Review Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest font-bold">Return #</span>
                  <span className="font-black text-foreground">{row.returnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest font-bold">Status</span>
                  <span className="font-black text-primary uppercase">{row.status.replace(/_/g, " ")}</span>
                </div>
                {row.refundAmount !== undefined && (
                  <div className="flex justify-between pt-2 border-t border-border/40">
                    <span className="text-muted-foreground uppercase tracking-widest font-bold">Refund Amount</span>
                    <span className="font-black text-emerald-600 text-sm">RWF {row.refundAmount?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {row.rejectionReason && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1 inline-flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Rejection Reason
                  </p>
                  <p className="text-xs text-rose-900 font-medium leading-relaxed">{row.rejectionReason}</p>
                </div>
              )}

              {row.reviewNote && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Admin Note</p>
                  <p className="text-xs text-foreground font-medium leading-relaxed">{row.reviewNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={appealOpen} onOpenChange={setAppealOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-black font-heading uppercase tracking-tight">Create an appeal</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
               <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
               <p className="text-xs text-amber-800 font-medium leading-relaxed">
                 You are appealing the rejection of your return request. Please provide compelling reasons and extra evidence to support your claim.
               </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Appeal Reason</p>
              <Textarea 
                className="min-h-[120px] rounded-xl text-sm border-border/60 focus:ring-primary shadow-sm"
                value={appealReason} 
                onChange={(e) => setAppealReason(e.target.value)} 
                placeholder="Describe exactly why your return should be reconsidered…" 
              />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Extra Evidence (Optional)</p>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  className="h-11 pt-2.5 text-xs bg-white cursor-pointer rounded-xl"
                  onChange={(e) => setAppealImages(Array.from(e.target.files ?? []))}
                />
                {!!appealImages.length && (
                  <span className="absolute right-3 top-3 text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                    {appealImages.length} selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" className="h-11 px-8 rounded-lg font-bold text-xs uppercase tracking-widest" onClick={() => setAppealOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="h-11 px-8 rounded-lg font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-primary/20" 
                onClick={() => appealMutation.mutate()} 
                disabled={appealMutation.isPending}
              >
                {appealMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Appeal"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

