"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listDeliveryOrdersPaginated } from "@/lib/api/operations";
import type { DeliveryOrder, DeliveryStatus } from "@/data/operations-mock";

const agent = "Agent Thierry";

export default function DeliveryOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DeliveryStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<DeliveryOrder[]>([]);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    void (async () => {
      const res = await listDeliveryOrdersPaginated({
        agent,
        search,
        status,
        page,
        limit: 8,
      });
      setRows(res.data);
      setPages(res.pagination.pages);
    })();
  }, [search, status, page]);

  return (
    <div className="space-y-4 text-xs">
      <h1 className="text-xl font-bold font-heading">Assigned Orders</h1>
      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Search order/customer/address..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="max-w-sm" />
        <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v as DeliveryStatus | "all"); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="Picked up">Picked up</SelectItem>
            <SelectItem value="In transit">In transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {rows.map((o) => (
          <Card key={o.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex justify-between">
                <span>{o.orderId} · {o.customer}</span>
                <span>{o.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <p className="text-muted-foreground">{o.address}</p>
              <Button size="sm" asChild>
                <Link href={`/delivery-agent/orders/${o.id}`}>Open</Link>
              </Button>
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
