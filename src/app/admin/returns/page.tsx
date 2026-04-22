"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { listReturns } from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";

type SortKey = "date" | "status" | "buyer";

export default function AdminReturnsPage() {
  const [rows, setRows] = useState<ReturnRequest[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReturnRequest["status"] | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 10;

  const refresh = async () => setRows(await listReturns());
  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = rows.filter((r) => {
      const statusOk = status === "all" || r.status === status;
      if (!statusOk) return false;
      if (!q) return true;
      return (
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.buyer.toLowerCase().includes(q)
      );
    });

    out = [...out].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "date") return dir * String(a.date).localeCompare(String(b.date));
      if (sortKey === "status") return dir * String(a.status).localeCompare(String(b.status));
      return dir * String(a.buyer).localeCompare(String(b.buyer));
    });

    return out;
  }, [rows, search, sortDir, sortKey, status]);

  const appeals = useMemo(
    () => rows.filter((r) => r.status === "Appealed"),
    [rows],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status, sortKey, sortDir]);

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-2xl font-bold font-heading">Returns & Appeals Management</h1>
      <p className="text-muted-foreground">Appeals requiring action: {appeals.length}</p>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Browse returns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by return ID, order ID, buyer, product…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Appealed">Appealed</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 gap-2">
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
                <SelectTrigger>
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <div className="min-w-[220px]">
                        <p className="font-semibold">{r.id}</p>
                        <p className="text-muted-foreground">{r.product}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{r.orderId}</TableCell>
                    <TableCell>{r.buyer}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.status}</Badge>
                      {r.status === "Appealed" && (
                        <p className="text-[10px] text-primary mt-1 font-medium">Appeal</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.assignedAgent ? (
                        <div>
                          <p className="font-medium">{r.assignedAgent}</p>
                          <p className="text-[10px] text-muted-foreground">{r.agentStatus ?? "Pending pickup"}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/returns/${r.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {!pageRows.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No returns found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{pageRows.length}</span> of{" "}
              <span className="font-medium text-foreground">{filtered.length}</span>
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
