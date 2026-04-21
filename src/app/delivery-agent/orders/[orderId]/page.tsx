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
  addDeliveryOrderNote,
  addDeliveryOrderProofImage,
  getDeliveryOrderById,
  removeDeliveryOrderProofImage,
  updateDeliveryOrderStatus,
  verifyDeliveryByQr,
} from "@/lib/api/operations";
import type { DeliveryOrder } from "@/data/operations-mock";
import { QrScannerDialog } from "@/components/delivery-agent/QrScannerDialog";

export default function DeliveryOrderDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [row, setRow] = useState<DeliveryOrder | null>(null);
  const [note, setNote] = useState("");
  const [scanOpen, setScanOpen] = useState(false);

  const refresh = async () => setRow(await getDeliveryOrderById(orderId));
  useEffect(() => { void refresh(); }, [orderId]);
  if (!row) return <p className="text-xs text-muted-foreground">Order not found.</p>;

  return (
    <div className="space-y-4 text-xs max-w-6xl">
      <h1 className="text-xl font-bold font-heading">{row.orderId} Details</h1>
      <Card className="shadow-none">
        <CardHeader className="py-3"><CardTitle className="text-sm">{row.customer} · {row.status}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p>{row.address}</p>
          <p>{row.items} · ${row.amount}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(row.products ?? []).map((p, i) => (
              <div key={`${p.name}-${i}`} className="rounded border p-2 flex items-center gap-3">
                <div className="h-14 w-14 rounded overflow-hidden bg-muted shrink-0">
                  <Image
                    src={p.image || "/assets/products/placeholder.jpg"}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-muted-foreground">Qty: {p.qty} · ${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="py-3"><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {row.status === "Assigned" && <Button size="sm" onClick={async () => { await updateDeliveryOrderStatus(row.id, "Picked up"); await refresh(); }}>Mark picked up</Button>}
            {row.status === "Picked up" && <Button size="sm" onClick={async () => { await updateDeliveryOrderStatus(row.id, "In transit"); await refresh(); }}>Mark in transit</Button>}
            {row.status !== "Delivered" && row.status !== "Failed" && <Button size="sm" variant="outline" onClick={() => setScanOpen(true)}>Scan QR to confirm delivery</Button>}
            {row.status !== "Delivered" && <Button size="sm" variant="destructive" onClick={async () => { await updateDeliveryOrderStatus(row.id, "Failed"); await refresh(); }}>Mark failed</Button>}
          </div>
          <div className="space-y-2">
            <Label>Add note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <Button size="sm" onClick={async () => {
              if (!note.trim()) {
                toast.warning("Please enter a note before submitting.");
                return;
              }
              await addDeliveryOrderNote(row.id, note.trim());
              setNote("");
              await refresh();
            }}>Save note</Button>
          </div>
          <div className="space-y-2">
            <Label>Proof images (camera/upload)</Label>
            <Input type="file" accept="image/*" capture="environment" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) {
                toast.warning("Please pick an image first.");
                return;
              }
              await addDeliveryOrderProofImage(row.id, file);
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
                    <Button size="sm" variant="ghost" onClick={async () => { await removeDeliveryOrderProofImage(row.id, img.name); await refresh(); }}>Delete</Button>
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
        title="Scan order QR to verify delivery"
        onDetected={async (value) => {
          const ok = await verifyDeliveryByQr(row.id, value);
          if (!ok) {
            toast.error("Invalid QR code for this order.");
            return;
          }
          toast.success("Delivery QR verified successfully.");
          await refresh();
        }}
      />
    </div>
  );
}
