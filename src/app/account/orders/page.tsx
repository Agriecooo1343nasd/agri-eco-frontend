"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  Calendar,
  Layers,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { usePricing } from "@/context/PricingContext";
import { Button } from "@/components/ui/button";

// Mock Data
const orders = [
  {
    id: "#AE-2045",
    date: "2024-01-12",
    status: "Delivered",
    total: 45.0,
    items: ["Organic Honey", "Green Tea"],
    recipient: "John Doe",
    email: "john@example.com",
  },
  {
    id: "#AE-2012",
    date: "2023-12-30",
    status: "Delivered",
    total: 28.5,
    items: ["Fresh Spinach", "Organic Carrots"],
    recipient: "John Doe",
    email: "john@example.com",
  },
  {
    id: "#AE-1988",
    date: "2023-12-15",
    status: "Processing",
    total: 120.0,
    items: ["Olive Oil Premium", "Dry Fruits Pack"],
    recipient: "John Doe",
    email: "john@example.com",
  },
  {
    id: "#AE-1950",
    date: "2023-11-28",
    status: "Shipped",
    total: 85.2,
    items: ["Brown Rice", "Lentils"],
    recipient: "John Doe",
    email: "john@example.com",
  },
  {
    id: "#AE-1920",
    date: "2023-11-15",
    status: "Cancelled",
    total: 32.0,
    items: ["Fresh Milk"],
    recipient: "John Doe",
    email: "john@example.com",
  },
  {
    id: "#AE-1890",
    date: "2023-10-20",
    status: "Delivered",
    total: 55.4,
    items: ["Almond Milk", "Chia Seeds"],
    recipient: "John Doe",
    email: "john@example.com",
  },
];

type SortConfig = {
  key: "date" | "total" | null;
  direction: "asc" | "desc" | null;
};

const OrdersPage = () => {
  const { formatPrice } = usePricing();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });

  // Sorting Handler
  const handleSort = (key: "date" | "total") => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((item) => item.toLowerCase().includes(q)) ||
          o.recipient.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q),
      );
    }

    // Status Filter
    if (statusFilter !== "All") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Date Range Filter
    if (dateRange.start) {
      result = result.filter((o) => o.date >= dateRange.start);
    }
    if (dateRange.end) {
      result = result.filter((o) => o.date <= dateRange.end);
    }

    // Sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const valA =
          sortConfig.key === "total" ? a.total : new Date(a.date).getTime();
        const valB =
          sortConfig.key === "total" ? b.total : new Date(b.date).getTime();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, statusFilter, dateRange, sortConfig]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading mb-2">
            My Orders
          </h1>
          <p className="text-muted-foreground font-medium">
            Check and manage all your historical orders.
          </p>
        </div>
        <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
          <p className="text-sm font-bold text-primary">
            Total Orders: {orders.length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search orders, products..."
              className="pl-11 h-12 rounded-xl border-border bg-muted/20 focus:bg-white focus:ring-primary/20 transition-all shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              className="w-full h-12 pl-11 pr-4 bg-muted/20 border border-border rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Date Start */}
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-11 h-12 rounded-xl border-border bg-muted/20 focus:bg-white transition-all shadow-none"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
          </div>

          {/* Date End */}
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-11 h-12 rounded-xl border-border bg-muted/20 focus:bg-white transition-all shadow-none"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery ||
          statusFilter !== "All" ||
          dateRange.start ||
          dateRange.end) && (
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-border mt-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Filters:
            </span>
            {searchQuery && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 flex items-center gap-2">
                Search: {searchQuery}{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </span>
            )}
            {statusFilter !== "All" && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 flex items-center gap-2">
                Status: {statusFilter}{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setStatusFilter("All")}
                />
              </span>
            )}
            {(dateRange.start || dateRange.end) && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 flex items-center gap-2">
                Date Range{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setDateRange({ start: "", end: "" })}
                />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setDateRange({ start: "", end: "" });
              }}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[32px] border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b border-border">
              <tr>
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">
                  <button
                    onClick={() => handleSort("date")}
                    className="flex items-center gap-1 hover:text-primary transition-colors group"
                  >
                    Date Placed
                    <div className="flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 -mb-1 ${sortConfig.key === "date" && sortConfig.direction === "asc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 ${sortConfig.key === "date" && sortConfig.direction === "desc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                    </div>
                  </button>
                </th>
                <th className="px-8 py-5">Items</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">
                  <button
                    onClick={() => handleSort("total")}
                    className="flex items-center gap-1 hover:text-primary transition-colors group"
                  >
                    Total
                    <div className="flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 -mb-1 ${sortConfig.key === "total" && sortConfig.direction === "asc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 ${sortConfig.key === "total" && sortConfig.direction === "desc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                    </div>
                  </button>
                </th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-8 py-6 font-bold text-foreground text-base">
                      {order.id}
                    </td>
                    <td className="px-8 py-6 text-muted-foreground font-medium">
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-foreground font-semibold line-clamp-1">
                          {order.items.join(", ")}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                          Recipient: {order.recipient}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-600"
                            : order.status === "Processing"
                              ? "bg-amber-100 text-amber-600"
                              : order.status === "Shipped"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-primary text-base">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link
                        href={`/account/orders/${order.id.replace("#", "")}`}
                      >
                        <Button
                          variant="ghost"
                          className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">
                          No orders found
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your filters or search keywords.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("All");
                          setDateRange({ start: "", end: "" });
                        }}
                        variant="outline"
                        className="rounded-xl"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
