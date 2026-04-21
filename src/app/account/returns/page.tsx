"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createReturn, listReturns, appealReturn } from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";

export default function AccountReturnsPage() {
  const [rows, setRows] = useState<ReturnRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [appealId, setAppealId] = useState<string | null>(null);
  const [appeal, setAppeal] = useState("");

  const refresh = async () => setRows(await listReturns());
  useEffect(() => {
    void refresh();
  }, []);

  const rejectedCount = useMemo(
    () => rows.filter((r) => r.status === "Rejected").length,
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading">Returns & Appeals</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">New return</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create return request</DialogTitle></DialogHeader>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await createReturn({
                  orderId: String(fd.get("orderId") || ""),
                  product: String(fd.get("product") || ""),
                  buyer: "Current user",
                  reason: String(fd.get("reason") || ""),
                  amount: Number(fd.get("amount") || 0),
                });
                setOpen(false);
                await refresh();
              }}
            >
              <Label>Order ID</Label><Input name="orderId" required />
              <Label>Product</Label><Input name="product" required />
              <Label>Amount</Label><Input name="amount" type="number" required />
              <Label>Reason</Label><Textarea name="reason" required />
              <Button type="submit" className="w-full">Submit request</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-xs text-muted-foreground">
        Rejected requests available for appeal: {rejectedCount}
      </p>
      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{r.product} ({r.orderId})</span>
                <Badge variant="outline">{r.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>{r.reason}</p>
              {r.adminNote && <p className="text-muted-foreground">Admin: {r.adminNote}</p>}
              {r.appealNote && <p className="text-primary">Appeal: {r.appealNote}</p>}
              {r.status === "Rejected" && (
                <Button size="sm" variant="outline" onClick={() => setAppealId(r.id)}>
                  Appeal decision
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!appealId} onOpenChange={(o) => !o && setAppealId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Appeal return</DialogTitle></DialogHeader>
          <Textarea value={appeal} onChange={(e) => setAppeal(e.target.value)} />
          <Button
            onClick={async () => {
              if (!appealId || !appeal.trim()) return;
              await appealReturn(appealId, appeal.trim());
              setAppeal("");
              setAppealId(null);
              await refresh();
            }}
          >
            Submit appeal
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
