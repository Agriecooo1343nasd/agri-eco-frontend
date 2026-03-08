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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
} from "recharts";
import { Progress } from "@/components/ui/progress";

/* ---- Mock data ---- */
const stats = [
  {
    title: "Total Revenue",
    value: "24,780,000 RWF",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Total Bookings",
    value: "1,248",
    change: "+8.2%",
    up: true,
    icon: ShoppingCart,
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    title: "Active Members",
    value: "3,642",
    change: "+5.1%",
    up: true,
    icon: Users,
    color: "bg-accent text-accent-foreground",
  },
  {
    title: "Engagement Rate",
    value: "3.24%",
    change: "-0.4%",
    up: false,
    icon: TrendingUp,
    color: "bg-destructive/10 text-destructive",
  },
];

const revenueData = [
  { month: "Jan", revenue: 3200000, bookings: 180 },
  { month: "Feb", revenue: 4100000, bookings: 220 },
  { month: "Mar", revenue: 3800000, bookings: 200 },
  { month: "Apr", revenue: 5200000, bookings: 310 },
  { month: "May", revenue: 4900000, bookings: 280 },
  { month: "Jun", revenue: 6100000, bookings: 360 },
  { month: "Jul", revenue: 5800000, bookings: 340 },
];

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  bookings: { label: "Bookings", color: "hsl(var(--secondary))" },
};

const categoryData = [
  { name: "Tours", value: 45, color: "hsl(142, 64%, 32%)" },
  { name: "Education", value: 25, color: "hsl(45, 100%, 51%)" },
  { name: "Beekeeping", value: 20, color: "hsl(142, 40%, 60%)" },
  { name: "Community", value: 10, color: "hsl(30, 80%, 55%)" },
];

const categoryConfig: ChartConfig = {
  Tours: { label: "Tours", color: "hsl(142, 64%, 32%)" },
  Education: { label: "Education", color: "hsl(45, 100%, 51%)" },
  Beekeeping: { label: "Beekeeping", color: "hsl(142, 40%, 60%)" },
  Community: { label: "Community", color: "hsl(30, 80%, 55%)" },
};

const recentBookings = [
  {
    id: "#BK-2401",
    customer: "Alice M.",
    total: "15,000 RWF",
    status: "Confirmed",
    items: "Farm Tour",
  },
  {
    id: "#BK-2400",
    customer: "Bob K.",
    total: "24,000 RWF",
    status: "Pending",
    items: "Beekeeping",
  },
  {
    id: "#BK-2399",
    customer: "Clara N.",
    total: "42,000 RWF",
    status: "Completed",
    items: "Wax Workshop",
  },
  {
    id: "#BK-2398",
    customer: "David O.",
    total: "8,000 RWF",
    status: "Waitlisted",
    items: "Education",
  },
  {
    id: "#BK-2397",
    customer: "Eva P.",
    total: "15,000 RWF",
    status: "Confirmed",
    items: "Farm Tour",
  },
];

const topExperiences = [
  {
    name: "Beekeeping Discovery",
    sold: 342,
    revenue: "8,550,000 RWF",
    progress: 90,
  },
  {
    name: "Educational Farm Tour",
    sold: 287,
    revenue: "1,435,000 RWF",
    progress: 75,
  },
  {
    name: "Beeswax Workshop",
    sold: 198,
    revenue: "5,940,000 RWF",
    progress: 65,
  },
  {
    name: "Traditional Crafting",
    sold: 176,
    revenue: "880,000 RWF",
    progress: 58,
  },
  {
    name: "Sustainable Farming 101",
    sold: 154,
    revenue: "3,080,000 RWF",
    progress: 50,
  },
];

const statusColor: Record<string, string> = {
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Completed: "bg-accent text-accent-foreground border-accent-foreground/20",
  Waitlisted: "bg-muted text-muted-foreground border-border",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 text-xs">
      {/* Page header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Welcome back! Here's an overview of your agritourism operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="text-[10px] font-bold py-1 px-3 bg-card border-border uppercase tracking-widest"
          >
            Last updated: 5 mins ago
          </Badge>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-md transition-all hover:-translate-y-0.5 border-border shadow-sm"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-foreground font-heading">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold">
                    {stat.up ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span
                      className={stat.up ? "text-primary" : "text-destructive"}
                    >
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground/60">
                      vs last month
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl border border-current/10 ${stat.color} shadow-sm`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Revenue Overview
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              Monthly revenue and booking trends across all sectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[300px] w-full">
              <AreaChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                />
                <XAxis dataKey="month" className="text-[10px] font-bold" />
                <YAxis className="text-[10px] font-bold" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#revGrad)"
                  strokeWidth={3}
                />
                <Bar
                  dataKey="bookings"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]}
                  barSize={25}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Categories Pie */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Sales by Sector
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              Breakdown of bookings by experience category
            </CardDescription>
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
                  outerRadius={85}
                  strokeWidth={4}
                  stroke="hsl(var(--card))"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
              {categoryData.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-current/20 shadow-sm"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name} ({c.value}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading font-bold text-foreground">
                Recent Bookings
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                Latest experience reservations
              </CardDescription>
            </div>
            <div className="bg-primary/5 p-2 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <span className="text-[10px] font-bold text-primary">
                        BK
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">
                        {order.customer}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                        {order.items} · {order.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {order.total}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold uppercase py-0 px-2 mt-1 shadow-none ${statusColor[order.status]}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-[11px] font-bold uppercase tracking-widest h-9 text-muted-foreground hover:text-primary"
            >
              View All Bookings <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Top Experiences
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              Best performing agritourism services this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {topExperiences.map((p) => (
                <div key={p.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-foreground">
                        {p.name}
                      </span>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">
                        {p.revenue}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 py-0.5 px-2 rounded-lg">
                      {p.sold} booked
                    </span>
                  </div>
                  <Progress value={p.progress} className="h-1.5 bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
