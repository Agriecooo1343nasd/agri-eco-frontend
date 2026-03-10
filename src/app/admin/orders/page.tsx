"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
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
} from "lucide-react";
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

const allOrders = [
  {
    id: "ORD-9284",
    date: "2024-03-02T14:30:00Z",
    customer: {
      name: "Marcus Holloway",
      email: "marcus.h@example.com",
      avatar: "MH",
    },
    total: 124.5,
    status: "Processing",
    payment: "Paid",
    items: 4,
    itemsList: ["Organic Honey", "Green Tea", "Almonds", "Chia Seeds"],
  },
  {
    id: "ORD-9283",
    date: "2024-03-02T10:15:00Z",
    customer: {
      name: "Sarah Jenkins",
      email: "sarah.j@gmail.com",
      avatar: "SJ",
    },
    total: 89.2,
    status: "Delivered",
    payment: "Paid",
    items: 2,
    itemsList: ["Olive Oil Premium", "Fresh Spinach"],
  },
  {
    id: "ORD-9282",
    date: "2024-03-01T16:45:00Z",
    customer: { name: "David Chen", email: "d.chen@outlook.com", avatar: "DC" },
    total: 210.0,
    status: "Shipped",
    payment: "Paid",
    items: 5,
    itemsList: ["Bulk Rice", "Lentils", "Spices Box", "Ghee", "Brown Sugar"],
  },
  {
    id: "ORD-9281",
    date: "2024-03-01T09:20:00Z",
    customer: {
      name: "Elena Rodriguez",
      email: "elena.rod@example.com",
      avatar: "ER",
    },
    total: 45.0,
    status: "Pending",
    payment: "Unpaid",
    items: 1,
    itemsList: ["Organic Honey"],
  },
  {
    id: "ORD-9280",
    date: "2024-02-28T11:05:00Z",
    customer: {
      name: "James Wilson",
      email: "james.w88@gmail.com",
      avatar: "JW",
    },
    total: 32.5,
    status: "Cancelled",
    payment: "Refunded",
    items: 2,
    itemsList: ["Fresh Milk", "Whole Wheat Bread"],
  },
  {
    id: "ORD-9279",
    date: "2024-02-27T15:40:00Z",
    customer: {
      name: "Linda Thompson",
      email: "linda.t@example.com",
      avatar: "LT",
    },
    total: 67.8,
    status: "Delivered",
    payment: "Paid",
    items: 3,
    itemsList: ["Apples", "Bananas", "Oranges"],
  },
  {
    id: "ORD-9278",
    date: "2024-02-26T20:10:00Z",
    customer: {
      name: "Robert Miller",
      email: "robert.m@company.com",
      avatar: "RM",
    },
    total: 155.0,
    status: "Shipped",
    payment: "Paid",
    items: 6,
    itemsList: [
      "Premium Coffee",
      "Green Tea",
      "Honey",
      "Nuts Mix",
      "Dry Fruit",
      "Tea Pot",
    ],
  },
  {
    id: "ORD-9277",
    date: "2024-02-25T13:25:00Z",
    customer: {
      name: "Anita Desai",
      email: "anita.d@example.com",
      avatar: "AD",
    },
    total: 54.2,
    status: "Processing",
    payment: "Paid",
    items: 3,
    itemsList: ["Tomatoes", "Onions", "Potatoes"],
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Processing: "bg-amber-100 text-amber-700 border-amber-200",
  Shipped: "bg-green-100 text-green-700 border-green-200",
  "Out for Delivery": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusIcons: Record<string, any> = {
  Pending: Clock,
  Processing: Layers,
  Shipped: Truck,
  "Out for Delivery": Truck,
  Delivered: CheckCircle2,
  Cancelled: XCircle,
};

type SortKey = "date" | "total" | "customer";
type SortDir = "asc" | "desc";

export default function AdminOrders() {
  const router = useRouter();
  const { formatPrice } = usePricing();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let list = [...allOrders];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.itemsList.some((item) => item.toLowerCase().includes(q)),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (dateRange.start) {
      list = list.filter((o) => o.date >= dateRange.start);
    }
    if (dateRange.end) {
      list = list.filter((o) => o.date <= dateRange.end + "T23:59:59Z");
    }
    return list;
  }, [search, statusFilter, dateRange]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "total") cmp = a.total - b.total;
      else if (sortKey === "customer")
        cmp = a.customer.name.localeCompare(b.customer.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateRange.start, dateRange.end, sortKey, sortDir]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIndicator({ column }: { column: SortKey }) {
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

  const handleAction = (action: string, order: (typeof allOrders)[0]) => {
    if (action === "View") {
      router.push(`/admin/orders/${order.id}`);
    } else {
      toast.info("Order Action", {
        description: `${action} applied to ${order.id}. This is a demo.`,
      });
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Orders Management
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {sorted.length} orders total
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 text-xs h-9 px-4"
          onClick={() =>
            toast.success("Export Started", {
              description: "CSV export is being generated.",
            })
          }
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: allOrders.length,
            color: "text-foreground",
            icon: FileText,
          },
          {
            label: "Pending",
            value: allOrders.filter((o) => o.status === "Pending").length,
            color: "text-amber-600",
            icon: Clock,
          },
          {
            label: "On Shipment",
            value: allOrders.filter((o) => o.status === "Shipped").length,
            color: "text-primary",
            icon: Truck,
          },
          {
            label: "Revenue",
            value: `${Math.round(allOrders.reduce((s, o) => s + o.total, 0))} RWF`,
            color: "text-primary",
            icon: DollarSign,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                {s.label}
              </p>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={cn("text-2xl font-bold font-heading", s.color)}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 bg-card border border-border p-3 rounded-xl shadow-sm">
        <div className="flex items-center border border-border rounded-lg bg-background flex-1 max-w-xs focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-4 w-4 ml-3 text-muted-foreground" />
          <input
            className="flex-1 px-3 py-2 text-xs bg-transparent outline-none"
            placeholder="Search by ID, name, items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 h-9 text-xs bg-background border-border shadow-none">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Statuses
            </SelectItem>
            <SelectItem value="Pending" className="text-xs">
              Pending
            </SelectItem>
            <SelectItem value="Processing" className="text-xs">
              Processing
            </SelectItem>
            <SelectItem value="Shipped" className="text-xs">
              Shipped
            </SelectItem>
            <SelectItem value="Delivered" className="text-xs">
              Delivered
            </SelectItem>
            <SelectItem value="Cancelled" className="text-xs">
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="h-9 w-44 text-xs"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange({ ...dateRange, start: e.target.value })
          }
        />
        <Input
          type="date"
          className="h-9 w-44 text-xs"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
        />

        {(search ||
          statusFilter !== "all" ||
          dateRange.start ||
          dateRange.end) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs font-semibold text-destructive hover:bg-destructive/10"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDateRange({ start: "", end: "" });
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Ref
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] uppercase font-bold tracking-wider"
                  onClick={() => toggleSort("customer")}
                >
                  Customer <SortIndicator column="customer" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] uppercase font-bold tracking-wider"
                  onClick={() => toggleSort("date")}
                >
                  Date <SortIndicator column="date" />
                </TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Status
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-[10px] uppercase font-bold tracking-wider"
                  onClick={() => toggleSort("total")}
                >
                  Amount <SortIndicator column="total" />
                </TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-wider">
                  Payment
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="text-[10px] font-mono text-muted-foreground font-bold">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-foreground text-[11px] mb-0.5">
                          {order.customer.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {order.customer.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-[11px] font-bold text-foreground">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {new Date(order.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            `${statusStyles[order.status]} border text-[10px] py-0 px-2 font-bold capitalize shadow-none`,
                          )}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-foreground text-sm">
                        {formatPrice(order.total)}
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {order.items} items
                        </p>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                        {order.payment}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-muted"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              className="gap-2 text-xs py-2 cursor-pointer"
                              onClick={() => handleAction("View", order)}
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
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Search className="h-8 w-8" />
                      <p className="text-sm font-semibold">
                        No matching orders found
                      </p>
                      <Button
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("all");
                          setDateRange({ start: "", end: "" });
                        }}
                      >
                        Reset filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {sorted.length > 0 && (
          <div className="border-t border-border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[11px] text-muted-foreground font-medium">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, sorted.length)} of{" "}
              {sorted.length} orders
            </p>

            <Pagination className="justify-end mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={cn(
                      currentPage === 1 && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        size="icon"
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
                      if (currentPage < totalPages)
                        setCurrentPage((p) => p + 1);
                    }}
                    className={cn(
                      currentPage === totalPages &&
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
