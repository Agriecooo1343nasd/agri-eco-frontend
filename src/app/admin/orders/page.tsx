"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Calendar,
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
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
  Shipped: "bg-blue-100 text-blue-700 border-blue-200",
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

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIndicator({ column }: { column: SortKey }) {
    const isActive = sortKey === column;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-1">
        <ChevronUp
          className={cn(
            "h-3 w-3",
            isActive && sortDir === "asc"
              ? "text-primary"
              : "text-muted-foreground/30",
          )}
        />
        <ChevronDown
          className={cn(
            "h-3 w-3",
            isActive && sortDir === "desc"
              ? "text-primary"
              : "text-muted-foreground/30",
          )}
        />
      </span>
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
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading text-foreground tracking-tight">
            Orders Management
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Monitor and process customer orders from all regions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl h-11 px-5 font-bold gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics Brief */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Orders",
            value: allOrders.length,
            icon: FileText,
          },
          {
            label: "Pending",
            value: allOrders.filter((o) => o.status === "Pending").length,
            icon: Clock,
          },
          {
            label: "On Shipment",
            value: allOrders.filter((o) => o.status === "Shipped").length,
            icon: Truck,
          },
          {
            label: "Total Revenue",
            value: "2.4M RWF",
            icon: DollarSign,
          },
        ].map((item, i) => (
          <Card
            key={i}
            className="rounded-[32px] border-border shadow-soft group hover:scale-[1.02] transition-all cursor-default"
          >
            <CardContent className="p-8 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  {item.label}
                </p>
                <p className="text-2xl font-black text-foreground">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Card */}
      <Card className="rounded-[32px] border-border overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group lg:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by ID, name, items..."
                className="pl-11 h-12 rounded-xl border-border bg-muted/20 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                className="w-full h-12 pl-11 pr-4 bg-muted/20 border border-border rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={dateRange.start ? "date" : "text"}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => !dateRange.start && (e.target.type = "text")}
                placeholder="FROM DATE"
                className="pl-11 h-12 rounded-xl border-border bg-muted/20 focus:bg-white transition-all font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={dateRange.end ? "date" : "text"}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => !dateRange.end && (e.target.type = "text")}
                placeholder="TO DATE"
                className="pl-11 h-12 rounded-xl border-border bg-muted/20 focus:bg-white transition-all font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
          </div>

          {(search ||
            statusFilter !== "all" ||
            dateRange.start ||
            dateRange.end) && (
            <div className="flex items-center gap-3 pt-4 border-t border-border flex-wrap">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Active Filters:
              </span>
              {search && (
                <Badge variant="secondary" className="rounded-lg py-1 px-3">
                  Search: {search}
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="rounded-lg py-1 px-3">
                  Status: {statusFilter}
                </Badge>
              )}
              {(dateRange.start || dateRange.end) && (
                <Badge variant="secondary" className="rounded-lg py-1 px-3">
                  Date Range
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-bold text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setDateRange({ start: "", end: "" });
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-[32px] border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Order ID
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group"
                  onClick={() => toggleSort("customer")}
                >
                  Customer <SortIndicator column="customer" />
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group"
                  onClick={() => toggleSort("date")}
                >
                  Date & Time <SortIndicator column="date" />
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Total Status
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer group"
                  onClick={() => toggleSort("total")}
                >
                  Amount <SortIndicator column="total" />
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Payment
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.length > 0 ? (
                sorted.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/10 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <span className="font-black text-foreground">
                          #{order.id.split("-")[1]}
                        </span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          {order.id}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                            {order.customer.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-foreground leading-none">
                              {order.customer.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {order.customer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-foreground text-sm">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <Badge
                          className={cn(
                            "rounded-lg px-3 py-1 text-[10px] font-black uppercase flex items-center gap-1.5 w-fit",
                            statusStyles[order.status],
                          )}
                          variant="outline"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-foreground text-lg">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {order.items} items
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              order.payment === "Paid"
                                ? "bg-emerald-500"
                                : order.payment === "Unpaid"
                                  ? "bg-amber-500"
                                  : "bg-slate-400",
                            )}
                          ></div>
                          <span className="text-sm font-bold text-foreground">
                            {order.payment}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl hover:bg-muted"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[180px] rounded-2xl p-2 border-border"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
                              Order Options
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              className="rounded-xl px-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer group"
                              onClick={() => handleAction("View", order)}
                            >
                              <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              <span className="font-bold">View Details</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                      <Search className="h-12 w-12" />
                      <div className="space-y-1">
                        <p className="text-xl font-black italic">
                          No matching orders found
                        </p>
                        <p className="text-sm font-medium">
                          Try broadening your search or adjusting the filters.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-xl px-6 font-bold"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("all");
                          setDateRange({ start: "", end: "" });
                        }}
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
