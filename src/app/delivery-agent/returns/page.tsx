"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAssignedReturnsForAgent } from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";

const agent = "Agent Thierry";

export default function DeliveryReturnsPage() {
  const [rows, setRows] = useState<ReturnRequest[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  useEffect(() => {
    void (async () => {
      const res = await listAssignedReturnsForAgent(agent, { search, page, limit: 8 });
      setRows(res.data);
      setPages(res.pagination.pages);
    })();
  }, [search, page]);

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-bold font-heading">Assigned Returns</h1>
      <Input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search return/order/product..." className="max-w-sm" />
      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader className="py-3"><CardTitle className="text-sm">{r.id} · {r.product}</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-muted-foreground">{r.orderId} · {r.agentStatus || "Pending pickup"}</p>
              <Button size="sm" asChild><Link href={`/delivery-agent/returns/${r.id}`}>Open</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <p className="text-xs text-muted-foreground py-2">Page {page} / {pages}</p>
        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
