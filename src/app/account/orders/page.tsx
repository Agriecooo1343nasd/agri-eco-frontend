"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  Calendar as CalendarIcon,
  Layers,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { usePricing } from "@/context/PricingContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { fetchMyOrders, type Order, type FetchOrdersParams } from "@/lib/api/orders";
import { ApiPagination } from "@/lib/api/types";
import { format, startOfToday, endOfToday, subDays } from "date-fns";
import { OrderStatus } from "@/constants/order-status";
import { type DateRange } from "react-day-picker";

type SortConfig = {
  key: string | null;
  direction: "asc" | "desc" | null;
};

const OrdersPage = () => {
  const { formatPrice } = usePricing();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: FetchOrdersParams = {
        page: currentPage,
        limit: 10,
        search: debouncedSearch,
        status: statusFilter,
        sort: sortConfig.key || undefined,
        order: sortConfig.direction || undefined,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      };

      const result = await fetchMyOrders(params);
      setOrders(result.data);
      setPagination(result.pagination);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, dateRange, sortConfig]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Sorting Handler
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

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
            Total Orders: {pagination?.total || 0}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-sm border border-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search orders, products..."
              className="pl-11 h-12 rounded-md border-border bg-muted/20 focus:bg-white focus:ring-primary/20 transition-all shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 w-full rounded-md border-border bg-muted/20 pl-11 focus:ring-primary/20 transition-all font-medium">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker */}
          <div className="md:col-span-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-medium rounded-xl border-border bg-muted/20 pl-11 hover:bg-muted/30 focus:ring-primary/20",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by date range...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-border shadow-xl" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="rounded-2xl"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery ||
          statusFilter !== "All" ||
          dateRange?.from ||
          dateRange?.to) && (
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
            {(dateRange?.from || dateRange?.to) && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 flex items-center gap-2">
                Date Range{" "}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setDateRange(undefined)}
                />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setDateRange(undefined);
              }}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-md border border-border overflow-hidden shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b border-border">
              <tr>
                <th className="px-8 py-5">Order #</th>
                <th className="px-8 py-5">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1 hover:text-primary transition-colors group"
                  >
                    Date Placed
                    <div className="flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 -mb-1 ${sortConfig.key === "createdAt" && sortConfig.direction === "asc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 ${sortConfig.key === "createdAt" && sortConfig.direction === "desc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                    </div>
                  </button>
                </th>
                <th className="px-8 py-5">Items</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">
                  <button
                    onClick={() => handleSort("totalAmount")}
                    className="flex items-center gap-1 hover:text-primary transition-colors group"
                  >
                    Total
                    <div className="flex flex-col">
                      <ChevronUp
                        className={`h-3 w-3 -mb-1 ${sortConfig.key === "totalAmount" && sortConfig.direction === "asc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                      <ChevronDown
                        className={`h-3 w-3 -mt-1 ${sortConfig.key === "totalAmount" && sortConfig.direction === "desc" ? "text-primary" : "text-muted-foreground/30"}`}
                      />
                    </div>
                  </button>
                </th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-8 py-6 font-bold text-foreground text-base">
                      {order.orderNumber}
                    </td>
                    <td className="px-8 py-6 text-muted-foreground font-medium">
                      {format(new Date(order.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-foreground font-semibold line-clamp-1">
                          {order.items.map(i => i.name).join(", ")}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                          Recipient: {order.shippingAddress.fullName}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-600"
                            : order.status === "PENDING"
                              ? "bg-amber-100 text-amber-600"
                              : order.status === "CANCELLED"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-primary text-base">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
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
              ) : !loading && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                        {error ? (
                          <AlertCircle className="h-8 w-8 text-destructive" />
                        ) : (
                          <Search className="h-8 w-8 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">
                          {error ? "Error loading orders" : "No orders found"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {error || "Try adjusting your filters or search keywords."}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("All");
                          setDateRange(undefined);
                          if (error) loadOrders();
                        }}
                        variant="outline"
                        className="rounded-xl"
                      >
                        {error ? "Retry" : "Clear All Filters"}
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-8 py-6 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              Showing <span className="text-foreground font-bold">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="text-foreground font-bold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-foreground font-bold">{pagination.total}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-10 w-10 p-0 rounded-xl"
                disabled={!pagination.hasPrev}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  className={`h-10 w-10 p-0 rounded-xl ${pagination.page === page ? "shadow-md shadow-primary/20" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-10 w-10 p-0 rounded-xl"
                disabled={!pagination.hasNext}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
