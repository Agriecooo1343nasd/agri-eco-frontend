"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Search,
  Loader2,
  Inbox,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchDeliveryAssignments,
  fetchDeliveryAssignmentStats,
  cancelDeliveryAssignment,
  DeliveryAssignmentStatus,
  DeliveryAssignmentTargetType,
  type DeliveryAssignmentRecord,
} from "@/lib/api/returns";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  [DeliveryAssignmentStatus.ASSIGNED]: "bg-amber-100 text-amber-700 border-amber-200",
  [DeliveryAssignmentStatus.PICKED_UP]: "bg-blue-100 text-blue-700 border-blue-200",
  [DeliveryAssignmentStatus.IN_TRANSIT]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  [DeliveryAssignmentStatus.DELIVERED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [DeliveryAssignmentStatus.RETURNED_TO_WAREHOUSE]: "bg-teal-100 text-teal-700 border-teal-200",
  [DeliveryAssignmentStatus.CANCELLED]: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusIcons: Record<string, any> = {
  [DeliveryAssignmentStatus.ASSIGNED]: Clock,
  [DeliveryAssignmentStatus.PICKED_UP]: Package,
  [DeliveryAssignmentStatus.IN_TRANSIT]: Truck,
  [DeliveryAssignmentStatus.DELIVERED]: CheckCircle2,
  [DeliveryAssignmentStatus.RETURNED_TO_WAREHOUSE]: RotateCcw,
  [DeliveryAssignmentStatus.CANCELLED]: XCircle,
};

function getAgentName(a: DeliveryAssignmentRecord) {
  if (!a.agent) return "Not Assigned";
  return [a.agent.firstName, a.agent.lastName].filter(Boolean).join(" ") || a.agent.username || a.agent.email || "Agent";
}

export default function AdminDeliveryOpsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: assignmentsData, isLoading, isError } = useQuery({
    queryKey: ["admin-delivery-assignments", statusFilter, typeFilter, page],
    queryFn: () =>
      fetchDeliveryAssignments({
        page,
        limit,
        status: statusFilter,
        targetType: typeFilter,
      }),
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-delivery-stats"],
    queryFn: fetchDeliveryAssignmentStats,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelDeliveryAssignment(id, "Cancelled by Admin"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-delivery-assignments"] });
      qc.invalidateQueries({ queryKey: ["admin-delivery-stats"] });
      toast.success("Assignment Cancelled");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to cancel"),
  });

  const assignments = assignmentsData?.data ?? [];
  const pagination = assignmentsData?.pagination;
  const pages = pagination?.pages ?? 1;

  if (isLoading && !assignmentsData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Loading operations…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-heading text-foreground uppercase tracking-tight">
            Delivery Operations
          </h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
            {pagination?.total || 0} active assignments · {statsData?.totalActive || 0} in progress
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Orders", count: statsData?.byTargetType?.order?.assigned || 0, icon: Package, color: "text-blue-600" },
          { label: "Active Returns", count: statsData?.byTargetType?.return?.assigned || 0, icon: RotateCcw, color: "text-amber-600" },
          { label: "In Transit", count: statsData?.totalActive || 0, icon: Truck, color: "text-indigo-600" },
          { label: "Delivered (Today)", count: statsData?.byTargetType?.order?.delivered || 0, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
                <p className="text-xl font-black mt-1">{stat.count}</p>
              </div>
              <div className={cn("p-2 rounded-lg bg-muted/50", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-md shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none"
            placeholder="Search reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 h-9 text-xs bg-white border-border/60 shadow-sm rounded-lg">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(DeliveryAssignmentStatus).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 h-9 text-xs bg-white border-border/60 shadow-sm rounded-lg">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="order">Orders</SelectItem>
            <SelectItem value="return">Returns</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter !== "all" || typeFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-destructive"
            onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setPage(1); }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-border/60 rounded-md overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/40 hover:bg-muted/30">
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-4 pl-6">Type</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Reference</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Status</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Agent</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Assigned At</TableHead>
              <TableHead className="w-12 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length > 0 ? (
              assignments.map((a) => {
                const StatusIcon = statusIcons[a.status] || Clock;
                const isOrder = a.targetType === DeliveryAssignmentTargetType.ORDER;
                const detailLink = isOrder ? `/admin/orders/${a.targetId}` : `/admin/returns/${a.targetId}`;

                return (
                  <TableRow key={a.id} className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0">
                    <TableCell className="py-4 pl-6">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black uppercase tracking-widest py-0.5 px-2 rounded-lg border-none shadow-none",
                        isOrder ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {a.targetType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={detailLink}
                        className="font-black text-[11px] text-foreground hover:underline decoration-primary underline-offset-4"
                      >
                        {a.targetReference}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest py-0.5 px-2.5 rounded-lg border shadow-none",
                        statusStyles[a.status] || "bg-muted text-muted-foreground"
                      )}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {a.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px]">{getAgentName(a)}</span>
                        {a.agent?.email && <span className="text-[9px] text-muted-foreground">{a.agent.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-[11px] text-muted-foreground">
                      {new Date(a.assignedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-border">
                          <DropdownMenuItem asChild>
                            <Link href={detailLink} className="cursor-pointer">View Target Details</Link>
                          </DropdownMenuItem>
                          {a.status !== DeliveryAssignmentStatus.CANCELLED && (
                            <DropdownMenuItem
                              onClick={() => cancelMutation.mutate(a.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                              disabled={cancelMutation.isPending}
                            >
                              Cancel Assignment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                    <Inbox className="h-10 w-10" />
                    <p className="text-[11px] font-black uppercase tracking-widest">No operations found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {assignments.length > 0 && pagination && (
          <div className="border-t border-border/40 px-6 py-4 flex items-center justify-between bg-muted/5">
            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">
              Page {pagination.page} of {pagination.pages}
            </p>
            <Pagination className="justify-end mx-0 w-auto">
              <PaginationContent className="gap-1.5">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page > 1) setPage(p => p - 1); }}
                    className={cn("h-9 px-3 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest", page <= 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page < pages) setPage(p => p + 1); }}
                    className={cn("h-9 px-3 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest", page >= pages && "pointer-events-none opacity-50")}
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
