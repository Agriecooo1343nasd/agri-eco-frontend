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

// TODO(backend): visitor/traffic analytics not yet available.
// Needs: GET /dashboard/visitor-stats returning [{day, visitors, pageViews}]
// (or a third-party analytics integration)
const visitorConfig: ChartConfig = {
  visitors: { label: "Visitors", color: "var(--primary)", icon: Users },
  pageViews: { label: "Page Views", color: "var(--chart-3)", icon: Eye },
};

// TODO(backend): category sales breakdown not available from dashboard endpoints.
// Needs: GET /dashboard/sales-by-category returning [{category, revenue, percentage}]
const categoryData = [
  { name: "Fruits", value: 28, color: "hsl(142, 64%, 32%)", icon: Leaf },
  { name: "Vegetables", value: 24, color: "hsl(45, 100%, 51%)", icon: Leaf },
  { name: "Dairy", value: 14, color: "hsl(142, 40%, 60%)", icon: ShoppingCart },
  {
    name: "Honey & Bee Products",
    value: 18,
    color: "hsl(30, 80%, 55%)",
    icon: Activity,
  },
  {
    name: "Artisan Crafts",
    value: 10,
    color: "hsl(280, 50%, 55%)",
    icon: Palette,
  },
  { name: "Others", value: 6, color: "hsl(200, 40%, 60%)", icon: Package },
];

const categoryConfig: ChartConfig = Object.fromEntries(
  categoryData.map((c) => [
    c.name,
    { label: c.name, color: c.color, icon: c.icon },
  ]),
);

// TODO(backend): revenue stream breakdown not available from any dashboard endpoint.
// Needs: GET /dashboard/revenue-by-stream returning [{stream, revenue, percentage}]
// covering product / tour / education / partnership splits
const revenueByStream = [
  {
    name: "Product Sales",
    value: 62,
    amount: "77,364,000 RWF",
    color: "var(--primary)",
    icon: Package,
  },
  {
    name: "Tour Bookings",
    value: 22,
    amount: "27,452,000 RWF",
    color: "var(--chart-2)",
    icon: Map,
  },
  {
    name: "Education",
    value: 11,
    amount: "13,726,000 RWF",
    color: "var(--chart-3)",
    icon: GraduationCap,
  },
  {
    name: "Partnerships",
    value: 5,
    amount: "6,238,000 RWF",
    color: "var(--chart-5)",
    icon: Handshake,
  },
];

const revenueStreamConfig: ChartConfig = Object.fromEntries(
  revenueByStream.map((c) => [
    c.name,
    { label: c.name, color: c.color, icon: c.icon },
  ]),
);

// TODO(backend): tour bookings not available from dashboard endpoints.
// Needs: GET /dashboard/recent-bookings returning [{id, tour, guest, date, status, amount}]
const recentBookings = [
  {
    id: "#BK-301",
    guest: "Marie L.",
    tour: "Farm Experience Tour",
    date: "Mar 15",
    status: "Confirmed",
    amount: "85,000 RWF",
  },
  {
    id: "#BK-300",
    guest: "Jean P.",
    tour: "Beekeeping Workshop",
    date: "Mar 14",
    status: "Pending",
    amount: "65,000 RWF",
  },
  {
    id: "#BK-299",
    guest: "Aline K.",
    tour: "Harvest Season Special",
    date: "Mar 12",
    status: "Confirmed",
    amount: "120,000 RWF",
  },
  {
    id: "#BK-298",
    guest: "Claude M.",
    tour: "Cultural Farm Visit",
    date: "Mar 10",
    status: "Completed",
    amount: "95,000 RWF",
  },
];

// TODO(backend): education / training stats not available from dashboard endpoints.
// Needs: GET /dashboard/training-stats returning [{program, enrolled, completed, rating}]
const trainingStats = [
  {
    program: "Organic Farming Basics",
    enrolled: 124,
    completed: 89,
    rating: 4.8,
  },
  { program: "Beekeeping Mastery", enrolled: 87, completed: 62, rating: 4.9 },
  {
    program: "Sustainable Agriculture",
    enrolled: 156,
    completed: 98,
    rating: 4.7,
  },
  {
    program: "Food Safety & Hygiene",
    enrolled: 203,
    completed: 178,
    rating: 4.6,
  },
];

// TODO(backend): visitor / traffic data not yet available.
// Needs: GET /dashboard/visitor-stats or a third-party analytics integration
const visitorData = [
  { day: "Mon", visitors: 1240, pageViews: 4200 },
  { day: "Tue", visitors: 1380, pageViews: 4800 },
  { day: "Wed", visitors: 1520, pageViews: 5100 },
  { day: "Thu", visitors: 1290, pageViews: 4400 },
  { day: "Fri", visitors: 1680, pageViews: 5800 },
  { day: "Sat", visitors: 2100, pageViews: 7200 },
  { day: "Sun", visitors: 1890, pageViews: 6400 },
];

const timeRangeLabels: Record<string, string> = {
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "12months": "Last 12 months",
};

// Maps the frontend time-range selector to the backend period query param
const periodMap: Record<string, DashboardPeriod> = {
  "7days": "daily",
  "30days": "weekly",
  "12months": "monthly",
};

// Covers both backend lowercase statuses and legacy mocked capitalised ones
const statusColor: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  Pending: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Processing: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  shipped: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Shipped: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  out_for_delivery: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  delivered: "bg-primary/10 text-primary border-primary/20",
  Delivered: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  returned: "bg-muted text-muted-foreground border-border",
  refunded: "bg-muted text-muted-foreground border-border",
  completed: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Completed: "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("12months");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const period: DashboardPeriod = periodMap[timeRange] ?? "monthly";

  /* ── Server queries ─────────────────────────────────────── */
  const { data: overview } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardOverview,
  });

  const { data: revenueChartData } = useQuery({
    queryKey: ["dashboard-revenue", period],
    queryFn: () => fetchRevenueChart(period),
  });

  const { data: topProductsRaw } = useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: () => fetchTopProducts(5),
  });

  const { data: recentOrdersRaw } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: () => fetchRecentOrders(5),
  });

  const { data: lowStockRaw } = useQuery({
    queryKey: ["dashboard-low-stock"],
    queryFn: () => fetchLowStockProducts(10),
  });

  /* ── Derived display data ───────────────────────────────── */

  // TODO(backend): the overview endpoint has no period-over-period comparison values,
  // so % change figures like "+12.5% vs last month" are unavailable.
  // Add a `comparison` object to GET /dashboard/overview, or a separate
  // GET /dashboard/overview?compare=prev_month endpoint.
  const kpiStats = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: overview ? formatRWF(overview.totalRevenue) : "—",
        change: overview
          ? `${formatRWF(overview.monthlyRevenue)} this month`
          : "—",
        icon: DollarSign,
        color: "bg-primary/10 text-primary",
        period: "all time",
      },
      {
        title: "Total Orders",
        value: overview ? overview.totalOrders.toLocaleString() : "—",
        change: overview ? `${overview.pendingOrders} pending` : "—",
        icon: ShoppingCart,
        color: "bg-chart-2/20 text-chart-2",
        period: "all time",
      },
      {
        title: "Total Customers",
        value: overview ? overview.totalCustomers.toLocaleString() : "—",
        // TODO(backend): no growth % without comparison period in overview response
        change: "—",
        icon: Users,
        color: "bg-chart-3/20 text-chart-3",
        period: "all time",
      },
      // TODO(backend): Conversion Rate is not derivable from current backend metrics
      {
        title: "Conversion Rate",
        value: "—",
        change: "—",
        icon: TrendingUp,
        color: "bg-chart-4/20 text-chart-4",
        period: "no data",
      },
    ],
    [overview],
  );

  // Module stats — only the Products card is integrable from the overview endpoint.
  // TODO(backend): add tours, education, artisan, partner and booking aggregate counts to
  // GET /dashboard/overview (or expose a new GET /dashboard/modules-summary endpoint)
  const moduleStats = useMemo(
    () => [
      {
        title: "Products",
        value: overview ? overview.totalProducts.toString() : "—",
        subtitle: overview
          ? `${overview.totalCategories} categories`
          : "loading…",
        icon: Package,
        color: "bg-primary/10 text-primary",
      },
      {
        title: "Tours & Experiences",
        value: "—",
        subtitle: "not in API",
        icon: Map,
        color: "bg-chart-2/20 text-chart-2",
      },
      {
        title: "Education Programs",
        value: "—",
        subtitle: "not in API",
        icon: GraduationCap,
        color: "bg-chart-3/20 text-chart-3",
      },
      {
        title: "Artisans",
        value: "—",
        subtitle: "not in API",
        icon: Palette,
        color: "bg-chart-4/20 text-chart-4",
      },
      {
        title: "Partners",
        value: "—",
        subtitle: "not in API",
        icon: Handshake,
        color: "bg-chart-5/20 text-chart-5",
      },
      {
        title: "Bookings",
        value: overview ? overview.pendingOrders.toString() : "—",
        subtitle: "pending orders",
        icon: CalendarCheck,
        color: "bg-primary/10 text-primary",
      },
    ],
    [overview],
  );

  // Revenue / orders chart — live from GET /dashboard/revenue-chart
  const chartData = revenueChartData?.data ?? [];

  // Top products — live from GET /dashboard/top-products
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

  // Recent orders — live from GET /dashboard/recent-orders
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

  // Low stock — live from GET /dashboard/low-stock
  const lowStock = lowStockRaw ?? [];

  // Visitor data is still mocked — no analytics endpoint yet
  const filteredVisitorData =
    timeRange === "7days"
      ? visitorData.slice(-3)
      : timeRange === "30days"
        ? visitorData.slice(-5)
        : visitorData;

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

      {/* KPI Stats cards — live from GET /dashboard/overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((stat) => (
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
        ))}
      </div>

      {/* Module Overview Cards — Products live; others TODO(backend) */}
      <div>
        <h2 className="text-lg font-semibold font-heading text-foreground mb-3">
          System Modules Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moduleStats.map((mod) => (
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
          ))}
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

            {/* Revenue — live from GET /dashboard/revenue-chart */}
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
                  {/* TODO(backend): tours & education revenue series were removed —
                      the revenue-chart endpoint only returns product-orders revenue.
                      Add `tours` and `education` numeric fields to the
                      GET /dashboard/revenue-chart response to restore those lines. */}
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </TabsContent>

            {/* Orders — live from GET /dashboard/revenue-chart (orders field) */}
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

            {/* Site Traffic — TODO(backend): mocked until analytics endpoint available */}
            <TabsContent value="visitors">
              <ChartContainer config={visitorConfig} className="h-80 w-full">
                <LineChart data={filteredVisitorData}>
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
        </CardContent>
      </Card>

      {/* TODO(backend): Both Revenue Streams and Sales by Category are mocked.
          Required new endpoints:
            • GET /dashboard/revenue-by-stream  → [{stream, revenue, percentage}]
            • GET /dashboard/sales-by-category  → [{category, revenue, percentage}] */}
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
          </CardContent>
        </Card>
      </div>

      {/* TODO(backend): Tours & Education rows are fully mocked.
          Required new endpoints:
            • GET /dashboard/recent-bookings  → [{id, tour, guest, date, status, amount}]
            • GET /dashboard/training-stats   → [{program, enrolled, completed, rating}] */}
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
              {recentBookings.map((booking) => (
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
              ))}
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
              {trainingStats.map((prog) => (
                <div key={prog.program} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {prog.program}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>⭐ {prog.rating}</span>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row — Recent Orders & Top Products (live from backend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders — live from GET /dashboard/recent-orders */}
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
              {recentOrders.map((order) => (
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top products — live from GET /dashboard/top-products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((p, i) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert — live from GET /dashboard/low-stock */}
      {lowStock.length > 0 && (
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
                  {/* TODO(backend): tours & education series not in revenue-chart endpoint */}
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
                <LineChart data={filteredVisitorData}>
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
