"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignReturnToAgent, deliveryAgents, listReturns, reviewReturn } from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";

export default function AdminReturnsPage() {
  const [rows, setRows] = useState<ReturnRequest[]>([]);
  const refresh = async () => setRows(await listReturns());
  useEffect(() => {
    void refresh();
  }, []);

  const appeals = useMemo(() => rows.filter((r) => r.status === "Appealed"), [rows]);

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-2xl font-bold font-heading">Returns & Appeals Management</h1>
      <p className="text-muted-foreground">Appeals requiring action: {appeals.length}</p>
      <div className="space-y-4">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{r.id} · {r.product} · {r.orderId}</span>
                <Badge variant="outline">{r.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{r.reason}</p>
              {r.appealNote && <p className="text-primary">Appeal: {r.appealNote}</p>}
              {r.assignedAgent && (
                <p className="text-muted-foreground">Assigned: {r.assignedAgent} ({r.agentStatus || "Pending pickup"})</p>
              )}
              <div className="flex flex-wrap gap-2">
                {(r.status === "Pending" || r.status === "Appealed") && (
                  <>
                    <Button size="sm" onClick={async () => { await reviewReturn({ id: r.id, status: "Approved" }); await refresh(); }}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={async () => { await reviewReturn({ id: r.id, status: "Rejected", adminNote: "Reviewed by admin." }); await refresh(); }}>Reject</Button>
                  </>
                )}
                {r.status === "Approved" && !r.assignedAgent && (
                  <Select onValueChange={async (agent) => { await assignReturnToAgent(r.id, agent); await refresh(); }}>
                    <SelectTrigger className="w-[220px] h-8">
                      <SelectValue placeholder="Assign delivery agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryAgents.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
