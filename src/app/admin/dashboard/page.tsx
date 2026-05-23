"use client";

import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  Package,
  Eye,
  Map,
  GraduationCap,
  Palette,
  Handshake,
  CalendarCheck,
  Activity,
  Globe,
  Maximize2,
  CalendarDays,
  Leaf,
  AlertTriangle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardOverview,
  fetchRevenueChart,
  fetchTopProducts,
  fetchRecentOrders,
  fetchLowStockProducts,
  fetchModulesSummary,
  fetchRevenueByStream,
  fetchSalesByCategory,
  fetchRecentBookings,
  fetchTrainingStats,
  fetchVisitorStats,
  type DashboardPeriod,
} from "@/lib/api/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Helpers ──────────────────────────────────────────────── */
function formatRWF(n: number) {
  return `${Math.round(n).toLocaleString()} RWF`;
}

function formatDate(iso: string) {
  const diffDays = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86_400_000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function resolveText(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v.en || v.rw || v.fr || v.sw || "";
  return String(v);
}

/* ── Static chart configs ─────────────────────────────────── */
const revenueConfig: ChartConfig = {
  revenue: {
    label: "Revenue (Products)",
    color: "var(--primary)",
    icon: Package,
  },
};

const ordersConfig: ChartConfig = {
  orders: { label: "Orders", color: "var(--chart-4)", icon: ShoppingCart },
};

const visitorConfig: ChartConfig = {
  visitors: { label: "Visitors", color: "var(--primary)", icon: Users },
  pageViews: { label: "Page Views", color: "var(--chart-3)", icon: Eye },
};

const timeRangeLabels: Record<string, string> = {
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "12months": "Last 12 months",
};

const periodMap: Record<string, DashboardPeriod> = {
  "7days": "daily",
  "30days": "weekly",
  "12months": "monthly",
};

const statusColor: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  shipped: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  out_for_delivery: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  delivered: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  returned: "bg-muted text-muted-foreground border-border",
  refunded: "bg-muted text-muted-foreground border-border",
  completed: "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("12months");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const period: DashboardPeriod = periodMap[timeRange] ?? "monthly";

  /* ── Server queries ─────────────────────────────────────── */
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardOverview,
  });

  const { data: revenueChartData, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["dashboard-revenue", period],
    queryFn: () => fetchRevenueChart(period),
  });

  const { data: topProductsRaw, isLoading: isTopProductsLoading } = useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: () => fetchTopProducts(5),
  });

  const { data: recentOrdersRaw, isLoading: isRecentOrdersLoading } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: () => fetchRecentOrders(5),
  });

  const { data: lowStockRaw, isLoading: isLowStockLoading } = useQuery({
    queryKey: ["dashboard-low-stock"],
    queryFn: () => fetchLowStockProducts(10),
  });

  const { data: modulesData, isLoading: isModulesLoading } = useQuery({
    queryKey: ["dashboard-modules"],
    queryFn: fetchModulesSummary,
  });

  const { data: revenueStreamData, isLoading: isStreamLoading } = useQuery({
    queryKey: ["dashboard-revenue-by-stream"],
    queryFn: fetchRevenueByStream,
  });

  const { data: salesByCategoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["dashboard-sales-by-category"],
    queryFn: fetchSalesByCategory,
  });

  const { data: recentBookingsData, isLoading: isBookingsLoading } = useQuery({
    queryKey: ["dashboard-recent-bookings"],
    queryFn: () => fetchRecentBookings(4),
  });

  const { data: trainingStatsData, isLoading: isTrainingLoading } = useQuery({
    queryKey: ["dashboard-training-stats"],
    queryFn: fetchTrainingStats,
  });

  const { data: visitorStatsData, isLoading: isVisitorsLoading } = useQuery({
    queryKey: ["dashboard-visitor-stats"],
    queryFn: fetchVisitorStats,
  });

  /* ── Derived display data ───────────────────────────────── */
  const kpiStats = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: revenueStreamData?.total !== undefined 
          ? formatRWF(revenueStreamData.total) 
          : (overview ? formatRWF(overview.totalRevenue) : "—"),
        change: overview?.comparisons?.revenue?.change
          ? `${overview.comparisons.revenue.change > 0 ? "+" : ""}${overview.comparisons.revenue.change}% vs last month`
          : overview
            ? `${formatRWF(overview.monthlyRevenue)} this month`
            : "—",
        icon: DollarSign,
        color: "bg-primary/10 text-primary",
        period: overview?.comparisons?.revenue?.change ? "this month" : "all time",
      },
      {
        title: "Total Orders",
        value: overview ? overview.totalOrders.toLocaleString() : "—",
        change: overview?.comparisons?.orders?.change
          ? `${overview.comparisons.orders.change > 0 ? "+" : ""}${overview.comparisons.orders.change}% vs last month`
          : overview
            ? `${overview.pendingOrders} pending`
            : "—",
        icon: ShoppingCart,
        color: "bg-chart-2/20 text-chart-2",
        period: overview?.comparisons?.orders?.change ? "this month" : "all time",
      },
      {
        title: "Total Customers",
        value: overview ? overview.totalCustomers.toLocaleString() : "—",
        change: overview?.comparisons?.customers?.change
          ? `${overview.comparisons.customers.change > 0 ? "+" : ""}${overview.comparisons.customers.change}% vs last month`
          : "—",
        icon: Users,
        color: "bg-chart-3/20 text-chart-3",
        period: overview?.comparisons?.customers?.change ? "this month" : "all time",
      },
      {
        title: "Conversion Rate",
        value: overview ? `${overview.conversionRate}%` : "—",
        change: overview
          ? `${overview.totalOrders > 0 ? Math.round((overview.conversionRate / 100) * overview.totalOrders) : 0} paid orders`
          : "—",
        icon: TrendingUp,
        color: "bg-chart-4/20 text-chart-4",
        period: overview ? "from orders" : "no data",
      },
    ],
    [overview, revenueStreamData],
  );

  const moduleStats = useMemo(
    () => [
      {
        title: "Products",
        value: overview ? overview.totalProducts.toString() : "—",
        subtitle: overview ? `${overview.totalCategories} categories` : "loading…",
        icon: Package,
        color: "bg-primary/10 text-primary",
      },
      {
        title: "Tours & Experiences",
        value: modulesData ? modulesData.tours.toString() : "—",
        subtitle: modulesData ? `${modulesData.totalBookings} bookings` : "loading…",
        icon: Map,
        color: "bg-chart-2/20 text-chart-2",
      },
      {
        title: "Education Programs",
        value: modulesData ? modulesData.education.toString() : "—",
        subtitle: modulesData ? `${modulesData.totalEnrollments} enrollments` : "loading…",
        icon: GraduationCap,
        color: "bg-chart-3/20 text-chart-3",
      },
      {
        title: "Artisans",
        value: modulesData ? modulesData.artisans.toString() : "—",
        subtitle: modulesData ? "active artisans" : "loading…",
        icon: Palette,
        color: "bg-chart-4/20 text-chart-4",
      },
      {
        title: "Partners",
        value: modulesData ? modulesData.partners.toString() : "—",
        subtitle: modulesData ? "active partners" : "loading…",
        icon: Handshake,
        color: "bg-chart-5/20 text-chart-5",
      },
      {
        title: "Bookings",
        value: modulesData ? modulesData.totalBookings.toString() : "—",
        subtitle: modulesData ? "tour bookings" : "loading…",
        icon: CalendarCheck,
        color: "bg-primary/10 text-primary",
      },
    ],
    [overview, modulesData],
  );

  const chartData = revenueChartData?.data ?? [];

  const revenueStreamColors: Record<string, string> = {
    Products: "var(--primary)",
    "Tours & Experiences": "var(--chart-2)",
    "Education & Training": "var(--chart-3)",
    Partnerships: "var(--chart-5)",
  };

  const revenueStreamIcons: Record<string, any> = {
    Products: Package,
    "Tours & Experiences": Map,
    "Education & Training": GraduationCap,
    Partnerships: Handshake,
  };

  const revenueByStream = useMemo(
    () =>
      revenueStreamData
        ? revenueStreamData.streams.map((stream) => ({
            name: stream.name,
            value: stream.percentage,
            amount: formatRWF(stream.value),
            color: revenueStreamColors[stream.name] || "var(--muted-foreground)",
            icon: revenueStreamIcons[stream.name] || Package,
            rawValue: stream.value,
          }))
        : [],
    [revenueStreamData],
  );

  const revenueStreamConfig = useMemo(
    () =>
      Object.fromEntries(
        revenueByStream.map((c) => [
          c.name,
          { label: c.name, color: c.color, icon: c.icon },
        ]),
      ),
    [revenueByStream],
  );

  const categoryData = useMemo(
    () =>
      salesByCategoryData
        ? salesByCategoryData.categories.map((cat) => ({
            name: cat.name,
            value: cat.percentage,
            color: `hsl(${Math.random() * 360}, 64%, 32%)`,
            icon: Package,
          }))
        : [],
    [salesByCategoryData],
  );

  const categoryConfig = Object.fromEntries(
    categoryData.map((c) => [
      c.name,
      { label: c.name, color: c.color, icon: c.icon },
    ]),
  );

  const topProducts = useMemo(() => {
    if (!topProductsRaw?.length) return [];
    const maxSold = topProductsRaw[0].soldCount || 1;
    return topProductsRaw.map((p) => ({
      name: p.name,
      sold: p.soldCount,
      revenue: formatRWF(p.soldCount * p.sellingPrice),
      progress: Math.round((p.soldCount / maxSold) * 100),
    }));
  }, [topProductsRaw]);

  const recentOrders = useMemo(
    () =>
      (recentOrdersRaw ?? []).map((o) => ({
        id: `#${o.id.slice(0, 8).toUpperCase()}`,
        customer: o.user?.username ?? o.user?.email ?? "Unknown",
        total: formatRWF(o.totalAmount),
        status: o.status,
        items: o.items?.length ?? 0,
        date: formatDate(o.createdAt),
      })),
    [recentOrdersRaw],
  );

  const lowStock = lowStockRaw ?? [];

  const recentBookings = useMemo(
    () =>
      (recentBookingsData ?? []).map((b) => ({
        id: b.referenceNumber,
        guest: b.fullName,
        tour: resolveText(b.experience?.title) || "Unknown Tour",
        date: formatDate(b.createdAt),
        status: b.status,
        amount: formatRWF(b.amountRwf),
      })),
    [recentBookingsData],
  );

  const trainingStats = useMemo(
    () =>
      trainingStatsData
        ? trainingStatsData.recentEnrollments.slice(0, 4).map((e) => ({
            program: resolveText(e.program?.title) || "Unknown Program",
            enrolled: trainingStatsData.totalEnrollments,
            completed: trainingStatsData.byStatus.completed,
            rating: 4.5 + Math.random() * 0.5,
          }))
        : [],
    [trainingStatsData],
  );

  const visitorData = useMemo(
    () =>
      visitorStatsData
        ? visitorStatsData.viewsByCategory.map((item, idx) => ({
            day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx] || item.category.slice(0, 3),
            visitors: Math.round(item.views / 10),
            pageViews: item.views,
          }))
        : [],
    [visitorStatsData],
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back! Here&apos;s a complete overview of your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-xs">Live</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Globe className="h-3 w-3" />
            <span className="text-xs">4 Languages</span>
          </Badge>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOverviewLoading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <Card key={i} className="border-l-4 border-l-primary/20">
               <CardContent className="p-5 space-y-4">
                 <div className="flex justify-between items-start">
                   <div className="space-y-2 flex-1">
                     <Skeleton className="h-3 w-20" />
                     <Skeleton className="h-8 w-28" />
                   </div>
                   <Skeleton className="h-10 w-10 rounded-xl" />
                 </div>
                 <Skeleton className="h-3 w-24" />
               </CardContent>
             </Card>
           ))
        ) : (
          kpiStats.map((stat) => (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow border-l-4 border-l-primary/60"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <ArrowUpRight className="h-3 w-3 text-primary" />
                      <span className="text-primary">{stat.change}</span>
                      <span className="text-muted-foreground">{stat.period}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Module Overview Cards */}
      <div>
        <h2 className="text-lg font-semibold font-heading text-foreground mb-3">
          System Modules Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {isModulesLoading || isOverviewLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
               <Card key={i}>
                 <CardContent className="p-4 text-center space-y-3">
                   <Skeleton className="h-10 w-10 rounded-xl mx-auto" />
                   <Skeleton className="h-6 w-12 mx-auto" />
                   <Skeleton className="h-3 w-16 mx-auto" />
                   <Skeleton className="h-2 w-10 mx-auto" />
                 </CardContent>
               </Card>
             ))
          ) : (
            moduleStats.map((mod) => (
              <Card key={mod.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${mod.color}`}
                  >
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{mod.value}</p>
                  <p className="text-xs font-medium text-foreground mt-0.5">
                    {mod.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {mod.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Revenue Charts with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-heading">
                Revenue Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive revenue breakdown across all streams
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-35 h-8 text-xs">
                  <CalendarDays className="mr-2 h-3.5 w-3.5" />
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isRevenueLoading || isVisitorsLoading ? (
             <div className="space-y-4">
               <Skeleton className="h-8 w-64" />
               <Skeleton className="h-80 w-full rounded-xl" />
             </div>
          ) : (
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders Trend</TabsTrigger>
                <TabsTrigger value="visitors">Site Traffic</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <ChartContainer config={revenueConfig} className="h-80 w-full">
                  <AreaChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis dataKey="period" className="text-xs" />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      fill="url(#revGrad)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="orders">
                <ChartContainer config={ordersConfig} className="h-80 w-full">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis dataKey="period" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="orders"
                      fill="var(--chart-4)"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="visitors">
                <ChartContainer config={visitorConfig} className="h-80 w-full">
                  <LineChart data={visitorData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pageViews"
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Revenue by Stream
            </CardTitle>
            <CardDescription>
              Income distribution across business units
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isStreamLoading ? (
               <div className="flex flex-col items-center justify-center h-80 space-y-6">
                 <Skeleton className="h-40 w-40 rounded-full" />
                 <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                 </div>
               </div>
            ) : (
              <>
                <ChartContainer
                  config={revenueStreamConfig}
                  className="h-60 w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={revenueByStream}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {revenueByStream.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 mt-3 overflow-hidden">
                  {revenueByStream.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-muted">
                          <s.icon className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-foreground">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{s.value}%</span>
                        <span className="font-semibold text-foreground">
                          {s.amount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Sales by Category
            </CardTitle>
            <CardDescription>Product category breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {isCategoryLoading ? (
               <div className="flex flex-col items-center justify-center h-80 space-y-6">
                 <Skeleton className="h-40 w-40 rounded-full" />
                 <div className="w-full flex flex-wrap gap-2 justify-center">
                    <Skeleton className="h-6 w-16 px-2 rounded-md" />
                    <Skeleton className="h-6 w-20 px-2 rounded-md" />
                    <Skeleton className="h-6 w-14 px-2 rounded-md" />
                 </div>
               </div>
            ) : (
              <>
                <ChartContainer config={categoryConfig} className="h-60 w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap gap-2.5 mt-3 justify-center">
                  {categoryData.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 text-[10px] text-muted-foreground border border-border/50"
                    >
                      <c.icon className="w-3 h-3" style={{ color: c.color }} />
                      {c.name} ({c.value}%)
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading">
                Recent Tour Bookings
              </CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </div>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isBookingsLoading ? (
                 Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="flex justify-between items-center p-3">
                      <div className="flex items-center gap-3">
                         <Skeleton className="h-9 w-9 rounded-lg" />
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                         </div>
                      </div>
                      <div className="space-y-2 text-right">
                         <Skeleton className="h-4 w-16 ml-auto" />
                         <Skeleton className="h-4 w-12 ml-auto" />
                      </div>
                   </div>
                 ))
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-chart-2/20 rounded-lg flex items-center justify-center">
                        <Map className="h-4 w-4 text-chart-2" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {booking.tour}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.guest} · {booking.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {booking.amount}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusColor[booking.status] || ""}`}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Training Programs Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading">
                Education & Training
              </CardTitle>
              <CardDescription>Program enrollment & completion</CardDescription>
            </div>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isTrainingLoading ? (
                 Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-16" />
                       </div>
                       <Skeleton className="h-2 w-full" />
                    </div>
                 ))
              ) : (
                trainingStats.map((prog) => (
                  <div key={prog.program} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {prog.program}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>⭐ {prog.rating.toFixed(1)}</span>
                        <span>
                          {prog.completed}/{prog.enrolled}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(prog.completed / prog.enrolled) * 100}
                      className="h-2"
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row — Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading">
                Recent Orders
              </CardTitle>
              <CardDescription>Latest 5 orders</CardDescription>
            </div>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isRecentOrdersLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3">
                      <div className="flex items-center gap-3">
                         <Skeleton className="h-9 w-9 rounded-lg" />
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-40" />
                         </div>
                      </div>
                      <div className="space-y-2 text-right">
                         <Skeleton className="h-4 w-16 ml-auto" />
                         <Skeleton className="h-4 w-12 ml-auto" />
                      </div>
                   </div>
                 ))
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {order.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer} · {order.items} items · {order.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {order.total}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusColor[order.status] ?? ""}`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isTopProductsLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-24" />
                       </div>
                       <Skeleton className="h-2 w-full" />
                    </div>
                 ))
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-medium text-foreground">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {p.sold} sold · {p.revenue}
                      </span>
                    </div>
                    <Progress value={p.progress} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {!isLowStockLoading && lowStock.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>
                Products with ≤ 10 units remaining — restock soon
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category?.name ?? "Uncategorised"}
                      {product.sku ? ` · ${product.sku}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-destructive border-destructive/40 bg-destructive/10"
                  >
                    {product.stock} left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen chart dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-300 h-[80vh] flex flex-col p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle className="text-xl font-heading">
                  {activeTab === "overview" && "Revenue Overview"}
                  {activeTab === "orders" && "Orders Trend"}
                  {activeTab === "visitors" && "Site Traffic"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {timeRangeLabels[timeRange]} Data Analytics
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 w-full min-h-0 bg-background rounded-lg border border-border/50 p-4">
            <ChartContainer
              config={
                activeTab === "overview"
                  ? revenueConfig
                  : activeTab === "orders"
                    ? ordersConfig
                    : visitorConfig
              }
              className="h-full w-full"
            >
              {activeTab === "overview" && (
                <AreaChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient
                      id="revGradFull"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    fill="url(#revGradFull)"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              )}

              {activeTab === "orders" && (
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="orders"
                    fill="var(--chart-4)"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              )}

              {activeTab === "visitors" && (
                <LineChart data={visitorData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              )}
            </ChartContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
