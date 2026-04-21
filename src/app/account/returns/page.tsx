"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function AccountReturnsPage() {
  const [rows, setRows] = useState<ReturnRequest[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const refresh = async () => setRows(await listReturns());
  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (!q) return true;
      const hay = `${r.id} ${r.orderId} ${r.product} ${r.status}`.toLowerCase();
      return hay.includes(q);
    });
    return [...out].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [rows, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading mb-1">Returns</h1>
          <p className="text-muted-foreground font-medium">
            Track your return requests, appeals, and statuses.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/account/orders">View orders</Link>
        </Button>
      </div>

      <Card className="rounded-md border-border shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black">My returns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by return ID, order ID, product, status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="min-w-[220px]">
                        <p className="font-semibold">{r.id}</p>
                        <p className="text-muted-foreground">{r.product}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{r.orderId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.status}</Badge>
                      {!!r.appeals?.length && (
                        <p className="text-[10px] text-primary mt-1 font-medium">
                          Appeals: {r.appeals.filter((a) => a.status === "Submitted").length}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {(r.items ?? []).reduce((sum, it) => sum + (it.qty || 0), 0) || (r.items?.length ?? 0)} items
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/return/${r.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {!pageRows.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No returns yet. Start from an order to request a return.
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
