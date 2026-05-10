"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Search,
  Loader2,
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
  RotateCcw,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminReturns,
  ReturnStatus,
  AppealStatus,
  type ReturnRecord,
} from "@/lib/api/returns";
import { usePricing } from "@/context/PricingContext";

const statusStyles: Record<string, string> = {
  [ReturnStatus.PENDING_REVIEW]: "bg-amber-100 text-amber-700 border-amber-200",
  [ReturnStatus.APPROVED]: "bg-blue-100 text-blue-700 border-blue-200",
  [ReturnStatus.REJECTED]: "bg-rose-100 text-rose-700 border-rose-200",
  [ReturnStatus.PENDING_PICKUP]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  [ReturnStatus.PICKED_UP]: "bg-cyan-100 text-cyan-700 border-cyan-200",
  [ReturnStatus.RETURNED_TO_WAREHOUSE]: "bg-teal-100 text-teal-700 border-teal-200",
  [ReturnStatus.REFUNDED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [ReturnStatus.CLOSED]: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusIcons: Record<string, any> = {
  [ReturnStatus.PENDING_REVIEW]: Clock,
  [ReturnStatus.APPROVED]: CheckCircle2,
  [ReturnStatus.REJECTED]: XCircle,
  [ReturnStatus.PENDING_PICKUP]: Truck,
  [ReturnStatus.PICKED_UP]: Truck,
  [ReturnStatus.RETURNED_TO_WAREHOUSE]: RotateCcw,
  [ReturnStatus.REFUNDED]: DollarSign,
  [ReturnStatus.CLOSED]: CheckCircle2,
};

function getUserName(r: ReturnRecord) {
  if (r.user?.username) return r.user.username;
  if (r.user?.firstName || r.user?.lastName)
    return `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim();
  return "Unknown";
}

function getAgentName(r: ReturnRecord) {
  if (!r.deliveryAgent) return null;
  if (r.deliveryAgent.firstName || r.deliveryAgent.lastName)
    return `${r.deliveryAgent.firstName || ""} ${r.deliveryAgent.lastName || ""}`.trim();
  return r.deliveryAgent.username || r.deliveryAgent.email || "Agent";
}

export default function AdminReturnsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { formatPrice } = usePricing();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-returns", search, statusFilter, sortKey, sortDir, page],
    queryFn: () =>
      fetchAdminReturns({
        page,
        limit,
        status: statusFilter,
        search: search.trim() || undefined,
        sort: sortKey,
        order: sortDir,
      }),
  });

  const returns = data?.data ?? [];
  const pagination = data?.pagination;
  const pages = pagination?.pages ?? 1;

  const appealsCount = returns.filter(
    (r) => r.appealStatus === AppealStatus.PENDING
  ).length;

  if (isLoading && !data) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading returns…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-heading text-foreground uppercase tracking-tight">
            Returns & Appeals
          </h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
            {pagination?.total || 0} returns
            {appealsCount > 0 && (
              <span className="text-primary ml-2">
                · {appealsCount} pending appeal{appealsCount > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-md shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none"
            placeholder="Search by return #, order #, user…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48 h-9 text-xs bg-white border-border/60 shadow-sm rounded-lg">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border/60 shadow-xl">
            <SelectItem value="all" className="text-xs py-2.5 font-bold cursor-pointer">
              All Statuses
            </SelectItem>
            {Object.values(ReturnStatus).map((s) => (
              <SelectItem key={s} value={s} className="text-xs py-2.5 font-bold cursor-pointer capitalize">
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortDir}
          onValueChange={(v) => {
            setSortDir(v as "asc" | "desc");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32 h-9 text-xs bg-white border-border/60 shadow-sm rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        {(search || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-border/60 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/40 hover:bg-muted/30">
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground py-4">
                  Return
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Order
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Agent
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Refund
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length > 0 ? (
                returns.map((r) => {
                  const StatusIcon = statusIcons[r.status] || Clock;
                  return (
                    <TableRow
                      key={r.id}
                      className="hover:bg-muted/10 transition-colors border-b border-border/40 last:border-0"
                    >
                      <TableCell className="py-4">
                        <p className="font-black text-[11px] text-foreground font-mono">
                          {r.returnNumber}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {r.reason.replace(/_/g, " ")}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${r.orderId}`}
                          className="text-primary hover:underline font-bold text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {r.order?.orderNumber || r.orderId.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-[11px]">{getUserName(r)}</p>
                        {r.user?.email && (
                          <p className="text-[10px] text-muted-foreground">{r.user.email}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "border text-[9px] py-0.5 px-2 font-black uppercase tracking-widest shadow-none rounded-lg",
                            statusStyles[r.status] || "bg-muted text-muted-foreground"
                          )}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {r.status.replace(/_/g, " ")}
                        </Badge>
                        {r.appealStatus === AppealStatus.PENDING && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-600">Appeal pending</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {r.deliveryAgent ? (
                          <div>
                            <p className="font-bold text-[11px]">{getAgentName(r)}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-[11px]">
                          {r.refundAmount != null ? formatPrice(r.refundAmount) : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-[11px] font-bold">
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline" className="rounded-lg">
                          <Link href={`/admin/returns/${r.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                      <div className="w-16 h-16 rounded-md bg-muted/30 flex items-center justify-center">
                        <Inbox className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-widest">
                          No returns found
                        </p>
                        <p className="text-xs font-medium max-w-[200px]">
                          Adjust your filters or wait for new return requests.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {returns.length > 0 && pagination && (
          <div className="border-t border-border/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/5">
            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">
              Page {pagination.page} of {pagination.pages}
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
                {Array.from({ length: pages }).map((_, i) => {
                  const pg = i + 1;
                  if (pages > 5 && (pg < page - 2 || pg > page + 2)) return null;
                  return (
                    <PaginationItem key={pg}>
                      <PaginationLink
                        href="#"
                        isActive={pg === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pg);
                        }}
                        className={cn(
                          "h-9 w-9 rounded-lg border-border/60 font-black text-[10px]",
                          pg === page &&
                            "bg-primary text-white border-primary shadow-lg shadow-primary/20 hover:bg-primary/90 hover:text-white"
                        )}
                      >
                        {pg}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < pages) setPage((p) => p + 1);
                    }}
                    className={cn(
                      "h-9 px-3 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest",
                      page >= pages && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
