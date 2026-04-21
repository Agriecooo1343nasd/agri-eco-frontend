"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  addReturnAgentNote,
  addReturnProofImage,
  getReturnById,
  removeReturnProofImage,
  updateAgentReturnStatus,
  verifyReturnByQr,
} from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";
import { QrScannerDialog } from "@/components/delivery-agent/QrScannerDialog";

export default function DeliveryReturnDetails({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = use(params);
  const [row, setRow] = useState<ReturnRequest | null>(null);
  const [note, setNote] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const refresh = async () => setRow(await getReturnById(returnId));
  useEffect(() => { void refresh(); }, [returnId]);
  if (!row) return <p className="text-xs text-muted-foreground">Return not found.</p>;

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-bold font-heading">{row.id} Return Pickup</h1>
      <Card className="shadow-none">
        <CardHeader className="py-3"><CardTitle className="text-sm">{row.product} · {row.orderId}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p>{row.reason}</p>
          <p className="text-muted-foreground">Agent status: {row.agentStatus || "Pending pickup"}</p>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="py-3"><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(!row.agentStatus || row.agentStatus === "Pending pickup") && <Button size="sm" onClick={async () => { await updateAgentReturnStatus(row.id, "Picked up"); await refresh(); }}>Mark picked up</Button>}
            {row.agentStatus === "Picked up" && <Button size="sm" onClick={async () => { await updateAgentReturnStatus(row.id, "Returned to warehouse"); await refresh(); }}>Mark returned to warehouse</Button>}
            {!row.qrVerified && <Button size="sm" variant="outline" onClick={() => setScanOpen(true)}>Scan QR proof</Button>}
          </div>
          <div className="space-y-2">
            <Label>Add note for customer tracking</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <Button size="sm" onClick={async () => {
              if (!note.trim()) {
                toast.warning("Please enter a note before submitting.");
                return;
              }
              await addReturnAgentNote(row.id, note.trim());
              setNote("");
              await refresh();
            }}>Save note</Button>
          </div>
          <div className="space-y-2">
            <Label>Return proof images (camera/upload)</Label>
            <Input type="file" accept="image/*" capture="environment" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) {
                toast.warning("Please pick an image first.");
                return;
              }
              await addReturnProofImage(row.id, file);
              await refresh();
            }} />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(row.proofImages ?? []).map((img) => (
                <div key={img.name} className="border rounded p-2 space-y-2">
                  <div className="h-28 w-full rounded overflow-hidden bg-muted">
                    <Image src={img.dataUrl} alt={img.name} width={400} height={200} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{img.name}</span>
                    <Button size="sm" variant="ghost" onClick={async () => { await removeReturnProofImage(row.id, img.name); await refresh(); }}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <QrScannerDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        title="Scan return QR to verify pickup"
        onDetected={async (value) => {
          const ok = await verifyReturnByQr(row.id, value);
          if (!ok) {
            toast.error("Invalid QR code for this return.");
            return;
          }
          toast.success("Return QR verified successfully.");
          await refresh();
        }}
      />
    </div>
  );
}
