"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Search, Inbox, Loader2, RotateCcw, Clock, CheckCircle2, XCircle, Truck, Package, Banknote } from "lucide-react";
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
import { fetchMyReturns, ReturnStatus, type ReturnRecord } from "@/lib/api/returns";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const statusStyles: Record<string, string> = {
  [ReturnStatus.PENDING_REVIEW]: "bg-amber-100 text-amber-700 border-amber-200",
  [ReturnStatus.APPROVED]: "bg-blue-100 text-blue-700 border-blue-200",
  [ReturnStatus.REJECTED]: "bg-rose-100 text-rose-700 border-rose-200",
  [ReturnStatus.PENDING_PICKUP]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  [ReturnStatus.PICKED_UP]: "bg-violet-100 text-violet-700 border-violet-200",
  [ReturnStatus.RETURNED_TO_WAREHOUSE]: "bg-teal-100 text-teal-700 border-teal-200",
  [ReturnStatus.REFUNDED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [ReturnStatus.CLOSED]: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusIcons: Record<string, any> = {
  [ReturnStatus.PENDING_REVIEW]: Clock,
  [ReturnStatus.APPROVED]: CheckCircle2,
  [ReturnStatus.REJECTED]: XCircle,
  [ReturnStatus.PENDING_PICKUP]: Package,
  [ReturnStatus.PICKED_UP]: Truck,
  [ReturnStatus.RETURNED_TO_WAREHOUSE]: RotateCcw,
  [ReturnStatus.REFUNDED]: Banknote,
  [ReturnStatus.CLOSED]: XCircle,
};

import { notFound } from "next/navigation";
import { useFeatures } from "@/context/FeatureContext";

export default function AccountReturnsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const { isFeatureEnabled } = useFeatures();

  if (!isFeatureEnabled("shopping")) {
    notFound();
  }

  const { data, isLoading } = useQuery({
    queryKey: ["my-returns", page, search],
    queryFn: () => fetchMyReturns({ page, limit }),
  });

  const returns = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading mb-1 uppercase tracking-tight">Returns & Appeals</h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
            Track your return requests, appeals, and statuses.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 px-6 rounded-lg font-bold text-xs uppercase tracking-widest border-border/60">
          <Link href="/account/orders">View orders</Link>
        </Button>
      </div>

      <Card className="rounded-xl border-border/40 shadow-soft bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">My return requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/40">
            <div className="relative group max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-9 h-11 text-xs border-border/60 bg-muted/20 focus:bg-white transition-all rounded-lg"
                placeholder="Search by return number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/40">
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4 pl-6">Return #</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Order</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Items</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Requested At</TableHead>
                  <TableHead className="w-24 pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                   Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="py-4 px-6">
                        <div className="h-8 bg-muted animate-pulse rounded-lg w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : returns.length > 0 ? (
                  returns.map((r) => {
                    const StatusIcon = statusIcons[r.status] || Clock;
                    return (
                      <TableRow key={r.id} className="hover:bg-muted/10 transition-colors border-b border-border/40 last:border-0">
                        <TableCell className="font-black text-[11px] py-4 pl-6 text-foreground">
                          {r.returnNumber}
                        </TableCell>
                        <TableCell className="font-bold text-[11px] text-muted-foreground">
                          {r.order?.orderNumber || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest py-0.5 px-2.5 rounded-lg border shadow-none",
                              statusStyles[r.status] || "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {r.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] font-bold text-foreground">
                          {r.items.reduce((sum, it) => sum + it.quantity, 0)} items
                        </TableCell>
                        <TableCell className="text-[11px] font-bold text-muted-foreground">
                          {format(new Date(r.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button asChild size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                            <Link href={`/account/returns/${r.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                         <Inbox className="h-12 w-12" />
                         <p className="text-xs font-black uppercase tracking-widest">No returns found</p>
                         <Button asChild variant="link" className="text-primary font-bold uppercase text-[10px]">
                           <Link href="/account/orders">Request a return from your orders</Link>
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {returns.length > 0 && pagination && (
            <div className="flex items-center justify-between gap-3 p-4 border-t border-border/40 bg-muted/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Pagination className="justify-end mx-0 w-auto">
                <PaginationContent className="gap-1.5">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage((p) => p - 1);
                      }}
                      className={cn(
                        "h-9 px-3 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest",
                        page <= 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage((p) => p + 1);
                      }}
                      className={cn(
                        "h-9 px-3 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest",
                        page >= totalPages && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

