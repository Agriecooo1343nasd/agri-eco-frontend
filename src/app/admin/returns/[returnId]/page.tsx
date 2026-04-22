"use client";

import { useMemo, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignReturnToAgent,
  deliveryAgents,
  getReturnById,
  listDeliveryOrders,
  listReturns,
  reviewReturn,
} from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";
import { DeliveryAgentPickerDialog } from "@/components/admin/DeliveryAgentPickerDialog";

export default function AdminReturnDetailsPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [adminNote, setAdminNote] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [agentsForDialog, setAgentsForDialog] = useState<Array<{ agent: string; assignments: number }>>(
    deliveryAgents.map((a) => ({ agent: a, assignments: 0 })),
  );

  const { data: row, isLoading, isError } = useQuery({
    queryKey: ["admin-return", returnId],
    queryFn: () => getReturnById(returnId),
  });

  const approveRejectMutation = useMutation({
    mutationFn: async (next: "Approved" | "Rejected") => {
      await reviewReturn({
        id: returnId,
        status: next,
        adminNote: adminNote.trim() ? adminNote.trim() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-return", returnId] });
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      toast.success("Updated", { description: "Return decision saved." });
    },
    onError: (e: any) => toast.error("Failed", { description: e?.message || "Unable to update return." }),
  });

  const loadAgentStats = useMutation({
    mutationFn: async () => {
      // Compute "assignment load" from both deliveries + currently assigned returns
      const [deliveries, returns] = await Promise.all([listDeliveryOrders(), listReturns()]);
      const counts = new Map<string, number>();
      for (const a of deliveryAgents) counts.set(a, 0);
      for (const d of deliveries) counts.set(d.assignedAgent, (counts.get(d.assignedAgent) ?? 0) + 1);
      for (const r of returns) {
        if (r.assignedAgent) counts.set(r.assignedAgent, (counts.get(r.assignedAgent) ?? 0) + 1);
      }
      return deliveryAgents.map((a) => ({ agent: a, assignments: counts.get(a) ?? 0 }));
    },
    onSuccess: (data) => setAgentsForDialog(data),
  });

  const assignMutation = useMutation({
    mutationFn: async (agent: string) => assignReturnToAgent(returnId, agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-return", returnId] });
      toast.success("Assigned", { description: "Return assigned to delivery agent." });
      setAssignOpen(false);
    },
    onError: (e: any) =>
      toast.error("Failed to assign", { description: e?.message || "Unable to assign this return." }),
  });

  const items = useMemo(() => {
    const r = row as ReturnRequest | null;
    if (!r) return [];
    if (r.items?.length) return r.items;
    return [{ id: "fallback", name: r.product, qty: 1, image: "/assets/products/placeholder.jpg" }];
  }, [row]);

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading return…</div>;
  }

  if (isError || !row) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold">Return not found</p>
        <Button variant="outline" onClick={() => router.push("/admin/returns")}>
          Back to returns
        </Button>
      </div>
    );
  }

  const canDecide = row.status === "Pending" || row.status === "Appealed";
  const canAssign = row.status === "Approved";

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold font-heading">{row.id}</h1>
            <Badge variant="outline">{row.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Order:{" "}
            <Link className="text-primary hover:underline font-medium" href={`/admin/orders/${row.orderId}`}>
              {row.orderId}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canAssign && (
            <Button
              variant="outline"
              onClick={() => {
                setAssignOpen(true);
                loadAgentStats.mutate();
              }}
            >
              <Truck className="h-4 w-4 mr-2" />
              {row.assignedAgent ? "Reassign pickup" : "Assign pickup"}
            </Button>
          )}

          {canDecide && (
            <>
              <Button
                onClick={() => approveRejectMutation.mutate("Approved")}
                disabled={approveRejectMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => approveRejectMutation.mutate("Rejected")}
                disabled={approveRejectMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Return items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 border rounded-md p-3">
                  <div className="w-14 h-14 rounded-md overflow-hidden border bg-muted shrink-0">
                    <img src={it.image || "/assets/products/placeholder.jpg"} alt={it.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: <span className="font-medium text-foreground">{it.qty}</span>
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Reason & notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md border p-3 bg-muted/20">
                <p className="font-medium">{row.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Buyer: <span className="font-medium text-foreground">{row.buyer}</span> · Amount:{" "}
                  <span className="font-medium text-foreground">{row.amount}</span>
                </p>
              </div>
              {row.appealNote && (
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold text-primary">Appeal</p>
                  <p className="text-sm text-muted-foreground">{row.appealNote}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Admin note</p>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Optional note (sent with approve/reject)…"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <span className="text-muted-foreground">Agent:</span>{" "}
                <span className="font-medium">{row.assignedAgent ?? "Not assigned"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Pickup status:</span>{" "}
                <span className="font-medium">{row.agentStatus ?? "—"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">QR verified:</span>{" "}
                <span className="font-medium">{row.qrVerified ? "Yes" : "No"}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeliveryAgentPickerDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title={`Assign pickup agent · ${row.id}`}
        agents={agentsForDialog}
        pickedAgent={row.assignedAgent ?? null}
        picking={assignMutation.isPending}
        onPick={(agent) => assignMutation.mutate(agent)}
      />
    </div>
  );
}

