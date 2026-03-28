"use client";

import { useState } from "react";
import {
  Search,
  ArrowUp,
  ArrowDown,
  Layers,
  MoreHorizontal,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  FileText,
  DollarSign,
  Loader2,
  AlertCircle,
  Inbox,
  Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { usePricing } from "@/context/PricingContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders, fetchAdminOrderStats } from "@/lib/api/orders";
import { OrderStatus } from "@/constants/order-status";

const statusStyles: Record<string, string> = {
  [OrderStatus.PENDING]: "bg-slate-100 text-slate-700 border-slate-200",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-700 border-blue-200",
  [OrderStatus.PROCESSING]: "bg-amber-100 text-amber-700 border-amber-200",
  [OrderStatus.SHIPPED]: "bg-green-100 text-green-700 border-green-200",
  [OrderStatus.OUT_FOR_DELIVERY]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  [OrderStatus.DELIVERED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [OrderStatus.CANCELLED]: "bg-rose-100 text-rose-700 border-rose-200",
  [OrderStatus.RETURNED]: "bg-orange-100 text-orange-700 border-orange-200",
  [OrderStatus.REFUNDED]: "bg-purple-100 text-purple-700 border-purple-200",
};

const statusIcons: Record<string, any> = {
  [OrderStatus.PENDING]: Clock,
  [OrderStatus.CONFIRMED]: Layers,
  [OrderStatus.PROCESSING]: Layers,
  [OrderStatus.SHIPPED]: Truck,
  [OrderStatus.OUT_FOR_DELIVERY]: Truck,
  [OrderStatus.DELIVERED]: CheckCircle2,
  [OrderStatus.CANCELLED]: XCircle,
  [OrderStatus.RETURNED]: MoreHorizontal,
  [OrderStatus.REFUNDED]: DollarSign,
};

type SortKey = "user" | "createdAt" | "totalAmount";

// Sorting indicator component
function SortIndicator({ column, sortKey, sortDir }: { column: SortKey, sortKey: string, sortDir: "asc" | "desc" }) {
  if (sortKey !== column)
    return (
      <span className="inline-flex flex-col ml-1 opacity-30">
        <ArrowUp className="h-3 w-3" />
        <ArrowDown className="h-3 w-3 -mt-1" />
      </span>
    );
  return sortDir === "asc" ? (
    <ArrowUp className="h-3 w-3 ml-1 inline" />
  ) : (
    <ArrowDown className="h-3 w-3 ml-1 inline" />
  );
}

export default function AdminOrders() {
  const router = useRouter();
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">(OrderStatus.PENDING);
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const statsQuery = useQuery({
      queryKey: ["admin-order-stats"],
      queryFn: fetchAdminOrderStats,
  });

  const ordersQuery = useQuery({
      queryKey: ["admin-orders", search, statusFilter, sortKey, sortDir, date, currentPage],
      queryFn: () => fetchAdminOrders({
          page: currentPage,
          limit: pageSize,
          search,
          status: statusFilter,
          sort: sortKey,
          order: sortDir,
          startDate: date?.from?.toISOString(),
          endDate: date?.to?.toISOString()
      }),
  });

  const statsData = statsQuery.data;
  const orders = ordersQuery.data?.data || [];
  const pagination = ordersQuery.data?.pagination;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (statsQuery.isLoading || (ordersQuery.isLoading && !ordersQuery.isPlaceholderData && !ordersQuery.data)) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Gathering order records...</p>
      </div>
    );
  }

  const handleExport = () => {
    const query = new URLSearchParams({
        status: statusFilter !== "all" ? statusFilter : "",
        startDate: date?.from?.toISOString() || "",
        endDate: date?.to?.toISOString() || ""
    }).toString();
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/export?${query}`, '_blank');
    toast.success("Export Started", {
        description: "Your CSV export is being downloaded.",
    });
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-heading text-foreground uppercase tracking-tight">
            Orders Management
          </h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
            {pagination?.total || 0} orders found
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 text-[10px] h-10 px-6 font-black uppercase tracking-widest rounded-md border-border/60 shadow-lg shadow-black/5"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" /> Export records
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: statsData?.totalOrders || 0,
            color: "text-foreground",
            icon: FileText,
          },
          {
            label: "Pending",
            value: statsData?.pendingOrders || 0,
            color: "text-amber-600",
            icon: Clock,
          },
          {
            label: "Active status",
            value: statsData?.byStatus?.find((s: any) => s.status === OrderStatus.PROCESSING)?.count || 0,
            color: "text-primary",
            icon: Layers,
          },
          {
            label: "Total Revenue",
            value: formatPrice(statsData?.totalRevenue || 0),
            color: "text-primary",
            icon: DollarSign,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-border/60 rounded-md p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">
                {s.label}
              </p>
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
            <p className={cn("text-2xl font-black font-heading tracking-tight", s.color)}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-md shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none"
            placeholder="Search by ID, name, items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select 
            value={statusFilter} 
            onValueChange={(val) => setStatusFilter(val as OrderStatus | "all")}
        >
          <SelectTrigger className="w-44 h-9 text-xs bg-white border-border/60 shadow-sm rounded-lg">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border/60 shadow-xl overflow-hidden">
            <SelectItem value="all" className="text-xs py-2.5 font-bold cursor-pointer">
              All Statuses
            </SelectItem>
            {Object.values(OrderStatus).map((status) => (
                <SelectItem key={status} value={status} className="text-xs py-2.5 font-bold cursor-pointer capitalize">
                    {status.replace(/_/g, ' ')}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "h-9 w-64 justify-start text-left font-normal text-xs bg-white rounded-lg border-border/60 shadow-sm",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-lg" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>

        {(search ||
          statusFilter !== "all" ||
          date?.from ||
          date?.to) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors rounded-md"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDate({ from: undefined, to: undefined });
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="bg-white border border-border/60 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/40 hover:bg-muted/30">
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground py-4">
                  Ref
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground"
                  onClick={() => toggleSort("user")}
                >
                  Customer <SortIndicator column="user" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground"
                  onClick={() => toggleSort("createdAt")}
                >
                  Date <SortIndicator column="createdAt" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Status
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground"
                  onClick={() => toggleSort("totalAmount")}
                >
                  Amount <SortIndicator column="totalAmount" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                  Payment
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order: any) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/10 transition-colors border-b border-border/40 last:border-0 cursor-pointer"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <TableCell className="py-4 text-[10px] font-black text-muted-foreground font-mono">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <p className="font-black text-foreground text-[11px] mb-0.5">
                          {order.user?.username || `${order.user?.firstName} ${order.user?.lastName}` || "Guest"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">
                          {order.user?.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[11px] font-black text-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight opacity-60">
                          {new Date(order.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            `${statusStyles[order.status]} border text-[9px] py-0.5 px-2.5 font-black uppercase tracking-widest shadow-none rounded-lg`,
                          )}
                        >
                          <StatusIcon className="h-3 w-3 mr-1.5" />
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-foreground text-sm">
                        {formatPrice(order.totalAmount)}
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                          {order.items?.length || 0} items
                        </p>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                         <span className={cn(
                             order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                         )}>
                            {order.paymentStatus}
                         </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted/80 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs p-1.5 rounded-md border-border/60 shadow-xl min-w-[160px]">
                            <DropdownMenuItem
                              className="gap-2 text-[10px] py-2.5 px-3 cursor-pointer font-black uppercase tracking-widest rounded-lg focus:bg-primary/5 focus:text-primary"
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                      <div className="w-16 h-16 rounded-md bg-muted/30 flex items-center justify-center">
                        <Inbox className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-widest">
                          No matching orders found
                        </p>
                        <p className="text-xs font-medium max-w-[200px]">
                          Try adjusting your filters or search query
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-md px-6"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("all");
                          setDate({ from: undefined, to: undefined });
                        }}
                      >
                        Reset all filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {orders.length > 0 && pagination && (
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
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={cn(
                      "h-9 px-3 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest",
                      currentPage === 1 && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.pages }).map((_, index) => {
                  const page = index + 1;
                  if (pagination.pages > 5) {
                    if (page < currentPage - 2 || page > currentPage + 2)
                      return null;
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className={cn(
                          "h-9 w-9 rounded-lg border-border/60 font-black text-[10px]",
                          page === currentPage &&
                            "bg-primary text-white border-primary shadow-lg shadow-primary/20 hover:bg-primary/90 hover:text-white",
                        )}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.pages)
                        setCurrentPage((p) => p + 1);
                    }}
                    className={cn(
                      "h-9 px-3 rounded-lg border-border/60 font-bold text-[10px] uppercase tracking-widest",
                      currentPage === pagination.pages &&
                        "pointer-events-none opacity-50",
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
