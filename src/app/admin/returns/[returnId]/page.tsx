"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Truck, XCircle, DollarSign,
  AlertTriangle, Clock, Loader2, Image as ImageIcon, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { usePricing } from "@/context/PricingContext";
import {
  fetchAdminReturnById, reviewAdminReturn, resolveAdminAppeal,
  assignReturnAgent, markReturnRefunded, fetchDeliveryAgents,
  ReturnStatus, AppealStatus, type DeliveryAgent,
} from "@/lib/api/returns";
import { DeliveryAgentPickerDialog, type DeliveryAgentOption } from "@/components/admin/DeliveryAgentPickerDialog";

const statusStyles: Record<string, string> = {
  [ReturnStatus.PENDING_REVIEW]: "bg-amber-100 text-amber-700",
  [ReturnStatus.APPROVED]: "bg-blue-100 text-blue-700",
  [ReturnStatus.REJECTED]: "bg-rose-100 text-rose-700",
  [ReturnStatus.PENDING_PICKUP]: "bg-indigo-100 text-indigo-700",
  [ReturnStatus.PICKED_UP]: "bg-cyan-100 text-cyan-700",
  [ReturnStatus.RETURNED_TO_WAREHOUSE]: "bg-teal-100 text-teal-700",
  [ReturnStatus.REFUNDED]: "bg-emerald-100 text-emerald-700",
  [ReturnStatus.CLOSED]: "bg-slate-100 text-slate-700",
};

function agentName(a?: DeliveryAgent | null) {
  if (!a) return "Not assigned";
  return [a.firstName, a.lastName].filter(Boolean).join(" ") || a.username || a.email || "Agent";
}

export default function AdminReturnDetailsPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { formatPrice } = usePricing();

  const [reviewNote, setReviewNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [appealNote, setAppealNote] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: ret, isLoading, isError } = useQuery({
    queryKey: ["admin-return", returnId],
    queryFn: () => fetchAdminReturnById(returnId),
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["delivery-agents"],
    queryFn: fetchDeliveryAgents,
    enabled: assignOpen,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-return", returnId] });
    qc.invalidateQueries({ queryKey: ["admin-returns"] });
  };

  const reviewMut = useMutation({
    mutationFn: (decision: "approved" | "rejected") =>
      reviewAdminReturn(returnId, {
        decision,
        reviewNote: reviewNote.trim() || undefined,
        rejectionReason: decision === "rejected" ? rejectionReason.trim() || undefined : undefined,
        refundAmount: decision === "approved" && refundAmount ? Number(refundAmount) : undefined,
      }),
    onSuccess: (_, decision) => {
      invalidate();
      toast.success(`Return ${decision}`, { description: "Decision saved." });
      setReviewNote("");
      setRejectionReason("");
    },
    onError: (e: any) => toast.error("Failed", { description: e?.response?.data?.message || e?.message }),
  });

  const appealMut = useMutation({
    mutationFn: (decision: "accepted" | "denied") =>
      resolveAdminAppeal(returnId, {
        decision,
        note: appealNote.trim() || undefined,
        refundAmount: decision === "accepted" && refundAmount ? Number(refundAmount) : undefined,
      }),
    onSuccess: (_, decision) => {
      invalidate();
      toast.success(`Appeal ${decision}`, { description: "Appeal resolution saved." });
      setAppealNote("");
    },
    onError: (e: any) => toast.error("Failed", { description: e?.response?.data?.message || e?.message }),
  });

  const assignMut = useMutation({
    mutationFn: ({ agentId, notes }: { agentId: string; notes?: string }) =>
      assignReturnAgent(returnId, { deliveryAgentId: agentId, notes }),
    onSuccess: () => {
      invalidate();
      toast.success("Assigned", { description: "Return assigned to delivery agent." });
      setAssignOpen(false);
    },
    onError: (e: any) => toast.error("Failed", { description: e?.response?.data?.message || e?.message }),
  });

  const refundMut = useMutation({
    mutationFn: () => markReturnRefunded(returnId),
    onSuccess: () => {
      invalidate();
      toast.success("Refunded", { description: "Return marked as refunded." });
    },
    onError: (e: any) => toast.error("Failed", { description: e?.response?.data?.message || e?.message }),
  });

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading return…</p>
      </div>
    );
  }

  if (isError || !ret) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold">Return not found</p>
        <Button variant="outline" onClick={() => router.push("/admin/returns")}>Back to returns</Button>
      </div>
    );
  }

  const canReview = ret.status === ReturnStatus.PENDING_REVIEW;
  const hasAppeal = ret.appealStatus === AppealStatus.PENDING;
  const canAssign = [ReturnStatus.APPROVED, ReturnStatus.PENDING_PICKUP].includes(ret.status as ReturnStatus);
  const canRefund = [ReturnStatus.RETURNED_TO_WAREHOUSE, ReturnStatus.APPROVED].includes(ret.status as ReturnStatus) && ret.status !== ReturnStatus.REFUNDED;

  const agentOptions: DeliveryAgentOption[] = agents.map((a) => ({
    id: a.id,
    name: agentName(a),
    email: a.email,
    phone: a.phone,
    assignments: 0,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary flex items-center gap-2 group"
            onClick={() => router.push("/admin/returns")}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to returns
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black font-heading">{ret.returnNumber}</h1>
            <Badge className={cn("text-[10px] font-black uppercase tracking-widest rounded-lg py-0.5 px-2.5", statusStyles[ret.status])}>
              {ret.status.replace(/_/g, " ")}
            </Badge>
            {hasAppeal && (
              <Badge className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg py-0.5 px-2.5">
                <AlertTriangle className="h-3 w-3 mr-1" /> Appeal pending
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Order:{" "}
            <Link className="text-primary hover:underline font-bold" href={`/admin/orders/${ret.orderId}`}>
              {ret.order?.orderNumber || ret.orderId.slice(0, 8)}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canAssign && (
            <Button variant="outline" onClick={() => setAssignOpen(true)}>
              <Truck className="h-4 w-4 mr-2" />
              {ret.deliveryAgentId ? "Reassign" : "Assign"} pickup
            </Button>
          )}
          {canRefund && (
            <Button onClick={() => refundMut.mutate()} disabled={refundMut.isPending}>
              <DollarSign className="h-4 w-4 mr-2" />
              {refundMut.isPending ? "Processing…" : "Mark Refunded"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Items */}
          <Card className="rounded-md border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Return Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ret.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 border rounded-md p-3">
                  <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: <span className="font-bold text-foreground">{it.quantity}</span>
                      {" · "}Unit: <span className="font-bold text-foreground">{formatPrice(it.unitPrice)}</span>
                    </p>
                  </div>
                  <p className="font-black text-sm">{formatPrice(it.unitPrice * it.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reason & Description */}
          <Card className="rounded-md border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Reason & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md border p-3 bg-muted/20">
                <p className="font-black capitalize text-foreground">{ret.reason.replace(/_/g, " ")}</p>
                <p className="text-muted-foreground mt-1 leading-relaxed">{ret.description}</p>
              </div>
              {ret.evidenceImages.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {ret.evidenceImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-md border overflow-hidden block">
                      <img src={img} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Decision (pending_review) */}
          {canReview && (
            <Card className="rounded-md border-primary/30 shadow-sm bg-primary/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Review this return
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Review note (optional)</label>
                    <Textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Internal note…" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Rejection reason (if rejecting)</label>
                    <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Reason shown to customer…" />
                  </div>
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <label className="text-xs font-bold text-muted-foreground">Refund amount (if approving)</label>
                  <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => reviewMut.mutate("approved")} disabled={reviewMut.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button variant="destructive" onClick={() => reviewMut.mutate("rejected")} disabled={reviewMut.isPending}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appeal Resolution */}
          {hasAppeal && (
            <Card className="rounded-md border-amber-300/50 shadow-sm bg-amber-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Resolve appeal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-3 bg-white">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Customer's appeal reason:</p>
                  <p className="text-sm text-foreground leading-relaxed">{ret.appealReason || "No reason provided."}</p>
                </div>
                {ret.appealEvidenceImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {ret.appealEvidenceImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-md border overflow-hidden block">
                        <img src={img} alt={`Appeal ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Resolution note</label>
                  <Textarea value={appealNote} onChange={(e) => setAppealNote(e.target.value)} placeholder="Note for customer…" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <label className="text-xs font-bold text-muted-foreground">Refund amount (if accepting)</label>
                  <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => appealMut.mutate("accepted")} disabled={appealMut.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Accept appeal
                  </Button>
                  <Button variant="destructive" onClick={() => appealMut.mutate("denied")} disabled={appealMut.isPending}>
                    <XCircle className="h-4 w-4 mr-2" /> Deny appeal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Overview */}
          <Card className="rounded-md border-border shadow-sm p-6 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Overview</h4>
            {[
              { label: "Return Status", value: ret.status.replace(/_/g, " ") },
              { label: "Appeal Status", value: ret.appealStatus.replace(/_/g, " ") },
              { label: "Refund Amount", value: ret.refundAmount != null ? formatPrice(ret.refundAmount) : "—" },
              { label: "Refunded At", value: ret.refundedAt ? new Date(ret.refundedAt).toLocaleDateString() : "—" },
              { label: "Created", value: new Date(ret.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">{item.label}</span>
                <span className="font-bold text-foreground capitalize">{item.value}</span>
              </div>
            ))}
          </Card>

          {/* Assignment */}
          <Card className="rounded-md border-border shadow-sm p-6 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Delivery Assignment
            </h4>
            <div className="text-sm space-y-2">
              <p><span className="text-muted-foreground">Agent:</span>{" "}<span className="font-bold">{ret.deliveryAgent ? agentName(ret.deliveryAgent) : "Not assigned"}</span></p>
              {ret.pickupScheduledAt && <p><span className="text-muted-foreground">Scheduled:</span>{" "}<span className="font-bold">{new Date(ret.pickupScheduledAt).toLocaleDateString()}</span></p>}
              {ret.pickedUpAt && <p><span className="text-muted-foreground">Picked up:</span>{" "}<span className="font-bold">{new Date(ret.pickedUpAt).toLocaleDateString()}</span></p>}
              {ret.warehouseReceivedAt && <p><span className="text-muted-foreground">Received:</span>{" "}<span className="font-bold">{new Date(ret.warehouseReceivedAt).toLocaleDateString()}</span></p>}
            </div>
          </Card>

          {/* Review History */}
          {(ret.reviewedAt || ret.reviewNote || ret.rejectionReason) && (
            <Card className="rounded-md border-border shadow-sm p-6 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Review Decision
              </h4>
              {ret.reviewedAt && (
                <p className="text-xs text-muted-foreground">Reviewed {new Date(ret.reviewedAt).toLocaleDateString()}</p>
              )}
              {ret.reviewNote && (
                <div className="rounded-md border p-3 bg-muted/20 text-sm">
                  <p className="text-xs font-bold text-muted-foreground mb-1">Note</p>
                  <p>{ret.reviewNote}</p>
                </div>
              )}
              {ret.rejectionReason && (
                <div className="rounded-md border border-rose-200 p-3 bg-rose-50 text-sm">
                  <p className="text-xs font-bold text-rose-600 mb-1">Rejection Reason</p>
                  <p className="text-rose-700">{ret.rejectionReason}</p>
                </div>
              )}
            </Card>
          )}

          {/* Appeal Resolution History */}
          {ret.appealResolutionNote && (
            <Card className="rounded-md border-border shadow-sm p-6 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Appeal Resolution</h4>
              <Badge className={cn("text-[10px]", ret.appealStatus === AppealStatus.ACCEPTED ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                {ret.appealStatus}
              </Badge>
              <p className="text-sm text-muted-foreground">{ret.appealResolutionNote}</p>
            </Card>
          )}
        </div>
      </div>

      <DeliveryAgentPickerDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title={`Assign pickup · ${ret.returnNumber}`}
        agents={agentOptions}
        loading={agentsLoading}
        pickedAgentId={ret.deliveryAgentId ?? null}
        picking={assignMut.isPending}
        onPick={(agentId, notes) => assignMut.mutate({ agentId, notes })}
      />
    </div>
  );
}
