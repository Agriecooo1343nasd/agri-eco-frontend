"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { deliveryAgents, listDeliveryOrders, listReturns } from "@/lib/api/operations";
import type { DeliveryOrder, ReturnRequest } from "@/data/operations-mock";

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [type, setType] = useState<"all" | "orders" | "returns">("all");
  const [agent, setAgent] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const refresh = async () => {
    const [o, r] = await Promise.all([listDeliveryOrders(), listReturns()]);
    setOrders(o);
    setReturns(r);
  };
  useEffect(() => {
    void refresh();
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const unified: Array<
      | {
          kind: "order";
          id: string;
          ref: string;
          customer: string;
          agent: string;
          status: string;
          secondary?: string;
        }
      | {
          kind: "return";
          id: string;
          ref: string;
          customer: string;
          agent: string | undefined;
          status: string;
          secondary?: string;
        }
    > = [
      ...orders.map((o) => ({
        kind: "order" as const,
        id: o.id,
        ref: o.orderId,
        customer: o.customer,
        agent: o.assignedAgent,
        status: o.status,
        secondary: o.address,
      })),
      ...returns
        .filter((r) => !!r.assignedAgent)
        .map((r) => ({
          kind: "return" as const,
          id: r.id,
          ref: r.orderId,
          customer: r.buyer,
          agent: r.assignedAgent,
          status: r.agentStatus ?? "Pending pickup",
          secondary: r.product,
        })),
    ];

    let out = unified;
    if (type !== "all") out = out.filter((r) => (type === "orders" ? r.kind === "order" : r.kind === "return"));
    if (agent !== "all") out = out.filter((r) => r.agent === agent);
    if (status !== "all") out = out.filter((r) => r.status === status);
    if (q) {
      out = out.filter((r) => {
        const hay = `${r.id} ${r.ref} ${r.customer} ${r.agent ?? ""} ${r.secondary ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // Stable-ish ordering: orders first, then returns; within each, by ref desc.
    return [...out].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "order" ? -1 : 1;
      return String(b.ref).localeCompare(String(a.ref));
    });
  }, [agent, orders, returns, search, status, type]);

  const pages = Math.max(1, Math.ceil(rows.length / limit));
  const pageRows = useMemo(() => {
    const start = (page - 1) * limit;
    return rows.slice(start, start + limit);
  }, [page, rows]);

  const statusOptions = useMemo(() => {
    const base =
      type === "returns"
        ? ["Pending pickup", "Picked up", "Returned to warehouse"]
        : type === "orders"
          ? ["Assigned", "Picked up", "In transit", "Delivered", "Failed"]
          : ["Assigned", "Picked up", "In transit", "Delivered", "Failed", "Pending pickup", "Returned to warehouse"];
    return Array.from(new Set(base));
  }, [type]);

  useEffect(() => {
    setPage(1);
  }, [type, agent, status, search]);

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-2xl font-bold font-heading">Delivery Ops</h1>
      <p className="text-muted-foreground">
        Track assigned deliveries and approved return pickups. Assignment happens inside the order / return details pages.
      </p>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tracking dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <Input
                placeholder="Search by ID, order, customer, agent, product, address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="returns">Returns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select value={agent} onValueChange={setAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All agents</SelectItem>
                  {deliveryAgents.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r) => (
                  <TableRow key={`${r.kind}-${r.id}`}>
                    <TableCell>
                      <Badge variant="outline">{r.kind === "order" ? "Order" : "Return"}</Badge>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{r.id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{r.ref}</TableCell>
                    <TableCell className="min-w-[180px]">{r.customer}</TableCell>
                    <TableCell className="min-w-[140px]">{r.agent ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground min-w-[220px]">{r.secondary ?? "—"}</TableCell>
                  </TableRow>
                ))}

                {!pageRows.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No assignments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{pageRows.length}</span> of{" "}
              <span className="font-medium text-foreground">{rows.length}</span>
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                    {page} / {pages}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(pages, p + 1));
                    }}
                    aria-disabled={page >= pages}
                    className={page >= pages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
