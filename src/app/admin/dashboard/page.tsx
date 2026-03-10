"use client";

import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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
  Filter,
  CalendarDays,
  Leaf,
} from "lucide-react";
import { useState } from "react";
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

/* ---- Mock data ---- */
const stats = [
  {
    title: "Total Revenue",
    value: "124,780,00 RWF",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
    period: "vs last month",
  },
  {
    title: "Total Orders",
    value: "3,248",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
    color: "bg-chart-2/20 text-chart-2",
    period: "vs last month",
  },
  {
    title: "Active Members",
    value: "5,642",
    change: "+15.1%",
    up: true,
    icon: Users,
    color: "bg-chart-3/20 text-chart-3",
    period: "vs last month",
  },
  {
    title: "Conversion Rate",
    value: "4.24%",
    change: "+0.8%",
    up: true,
    icon: TrendingUp,
    color: "bg-chart-4/20 text-chart-4",
    period: "vs last month",
  },
];

const moduleStats = [
  {
    title: "Products",
    value: "248",
    subtitle: "12 categories",
    icon: Package,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Tours & Experiences",
    value: "18",
    subtitle: "6 active bookings",
    icon: Map,
    color: "bg-chart-2/20 text-chart-2",
  },
  {
    title: "Education Programs",
    value: "12",
    subtitle: "342 enrollments",
    icon: GraduationCap,
    color: "bg-chart-3/20 text-chart-3",
  },
  {
    title: "Artisans",
    value: "34",
    subtitle: "156 products",
    icon: Palette,
    color: "bg-chart-4/20 text-chart-4",
  },
  {
    title: "Partners",
    value: "22",
    subtitle: "12.4M RWF commissions",
    icon: Handshake,
    color: "bg-chart-5/20 text-chart-5",
  },
  {
    title: "Bookings",
    value: "89",
    subtitle: "24 pending",
    icon: CalendarCheck,
    color: "bg-primary/10 text-primary",
  },
];

const revenueData = [
  { month: "Jan", revenue: 12200, orders: 280, tours: 3400, education: 1200 },
  { month: "Feb", revenue: 14100, orders: 320, tours: 4100, education: 1800 },
  { month: "Mar", revenue: 13800, orders: 300, tours: 3800, education: 2200 },
  { month: "Apr", revenue: 18200, orders: 410, tours: 5200, education: 2800 },
  { month: "May", revenue: 16900, orders: 380, tours: 4900, education: 3100 },
  { month: "Jun", revenue: 21100, orders: 460, tours: 6100, education: 3400 },
  { month: "Jul", revenue: 19800, orders: 440, tours: 5800, education: 3800 },
  { month: "Aug", revenue: 22400, orders: 490, tours: 6400, education: 4200 },
  { month: "Sep", revenue: 20600, orders: 450, tours: 5600, education: 3600 },
  { month: "Oct", revenue: 24100, orders: 520, tours: 7200, education: 4800 },
  { month: "Nov", revenue: 26800, orders: 580, tours: 8100, education: 5200 },
  { month: "Dec", revenue: 28400, orders: 620, tours: 9000, education: 5600 },
];

const revenueConfig: ChartConfig = {
  revenue: { label: "Products", color: "var(--primary)", icon: Package },
  tours: { label: "Tours", color: "var(--chart-2)", icon: Map },
  education: {
    label: "Education",
    color: "var(--chart-3)",
    icon: GraduationCap,
  },
};

const ordersConfig: ChartConfig = {
  orders: { label: "Orders", color: "var(--chart-4)", icon: ShoppingCart },
};

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

const recentOrders = [
  {
    id: "#ORD-2401",
    customer: "Alice M.",
    total: "67,500 RWF",
    status: "Delivered",
    items: 5,
    date: "Today",
  },
  {
    id: "#ORD-2400",
    customer: "Bob K.",
    total: "124,000 RWF",
    status: "Processing",
    items: 8,
    date: "Today",
  },
  {
    id: "#ORD-2399",
    customer: "Clara N.",
    total: "42,300 RWF",
    status: "Shipped",
    items: 3,
    date: "Yesterday",
  },
  {
    id: "#ORD-2398",
    customer: "David O.",
    total: "89,900 RWF",
    status: "Pending",
    items: 6,
    date: "Yesterday",
  },
  {
    id: "#ORD-2397",
    customer: "Eva P.",
    total: "156,200 RWF",
    status: "Delivered",
    items: 10,
    date: "2 days ago",
  },
];

const topProducts = [
  {
    name: "Organic Strawberries",
    sold: 342,
    revenue: "2,732,000 RWF",
    progress: 90,
  },
  {
    name: "Fresh Organic Apples",
    sold: 287,
    revenue: "1,432,000 RWF",
    progress: 75,
  },
  {
    name: "Raw Organic Honey",
    sold: 198,
    revenue: "2,572,000 RWF",
    progress: 65,
  },
  {
    name: "Baby Spinach Leaves",
    sold: 176,
    revenue: "702,000 RWF",
    progress: 58,
  },
  {
    name: "Farm Fresh Carrots",
    sold: 154,
    revenue: "461,000 RWF",
    progress: 50,
  },
];

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

const visitorConfig: ChartConfig = {
  visitors: { label: "Visitors", color: "var(--primary)", icon: Users },
  pageViews: { label: "Page Views", color: "var(--chart-3)", icon: Eye },
};

const statusColor: Record<string, string> = {
  Delivered: "bg-primary/10 text-primary border-primary/20",
  Processing: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Shipped: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Pending: "bg-muted text-muted-foreground border-border",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  Completed: "bg-chart-3/20 text-chart-3 border-chart-3/30",
};

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("12months");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const filteredRevenueData =
    timeRange === "7days"
      ? revenueData.slice(-3)
      : timeRange === "30days"
        ? revenueData.slice(-6)
        : revenueData;

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
            Welcome back! Here's a complete overview of your platform.
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
        {stats.map((stat) => (
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
                    {stat.up ? (
                      <ArrowUpRight className="h-3 w-3 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                    )}
                    <span
                      className={stat.up ? "text-primary" : "text-destructive"}
                    >
                      {stat.change}
                    </span>
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

      {/* Module Overview Cards */}
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
                <SelectTrigger className="w-[140px] h-8 text-xs">
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

            <TabsContent value="overview">
              <ChartContainer
                config={revenueConfig}
                className="h-[320px] w-full"
              >
                <AreaChart data={filteredRevenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="month" className="text-xs" />
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
                    <linearGradient id="tourGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--chart-2)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-2)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="eduGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--chart-3)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-3)"
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
                    name="Products"
                  />
                  <Area
                    type="monotone"
                    dataKey="tours"
                    stroke="var(--chart-2)"
                    fill="url(#tourGrad)"
                    strokeWidth={2}
                    name="Tours"
                  />
                  <Area
                    type="monotone"
                    dataKey="education"
                    stroke="var(--chart-3)"
                    fill="url(#eduGrad)"
                    strokeWidth={2}
                    name="Education"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="orders">
              <ChartContainer
                config={ordersConfig}
                className="h-[320px] w-full"
              >
                <BarChart data={filteredRevenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="month" className="text-xs" />
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
              <ChartContainer
                config={visitorConfig}
                className="h-[320px] w-full"
              >
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

      {/* Revenue Streams + Category Breakdown */}
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
              className="h-[240px] w-full"
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

        {/* Categories Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Sales by Category
            </CardTitle>
            <CardDescription>Product category breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={categoryConfig}
              className="h-[240px] w-full"
            >
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

      {/* Tours & Education Stats */}
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

      {/* Bottom row - Orders & Top Products */}
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
                      className={`text-[10px] ${statusColor[order.status]}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
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

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[80vh] flex flex-col p-6">
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
                <AreaChart data={filteredRevenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="month" className="text-xs" />
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
                    <linearGradient
                      id="tourGradFull"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--chart-2)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-2)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="eduGradFull"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--chart-3)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-3)"
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
                    name="Products"
                  />
                  <Area
                    type="monotone"
                    dataKey="tours"
                    stroke="var(--chart-2)"
                    fill="url(#tourGradFull)"
                    strokeWidth={2}
                    name="Tours"
                  />
                  <Area
                    type="monotone"
                    dataKey="education"
                    stroke="var(--chart-3)"
                    fill="url(#eduGradFull)"
                    strokeWidth={2}
                    name="Education"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              )}

              {activeTab === "orders" && (
                <BarChart data={filteredRevenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis dataKey="month" className="text-xs" />
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
