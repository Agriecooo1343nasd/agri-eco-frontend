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
import { usePricing } from "@/context/PricingContext";

/* ---- Mock data ---- */
const revenueData = [
  { month: "Jan", revenue: 3200, orders: 180 },
  { month: "Feb", revenue: 4100, orders: 220 },
  { month: "Mar", revenue: 3800, orders: 200 },
  { month: "Apr", revenue: 5200, orders: 310 },
  { month: "May", revenue: 4900, orders: 280 },
  { month: "Jun", revenue: 6100, orders: 360 },
  { month: "Jul", revenue: 5800, orders: 340 },
];

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
};

const categoryData = [
  { name: "Fruits", value: 35, color: "var(--chart-1)" },
  { name: "Vegetables", value: 30, color: "var(--chart-2)" },
  { name: "Dairy", value: 15, color: "var(--chart-3)" },
  { name: "Honey", value: 12, color: "var(--chart-4)" },
  { name: "Others", value: 8, color: "var(--chart-5)" },
];

const categoryConfig: ChartConfig = {
  Fruits: { label: "Fruits", color: "var(--chart-1)" },
  Vegetables: { label: "Vegetables", color: "var(--chart-2)" },
  Dairy: { label: "Dairy", color: "var(--chart-3)" },
  Honey: { label: "Honey", color: "var(--chart-4)" },
  Others: { label: "Others", color: "var(--chart-5)" },
};

const recentOrders = [
  {
    id: "#ORD-2401",
    customer: "Alice M.",
    total: 67.5,
    status: "Delivered",
    items: 5,
  },
  {
    id: "#ORD-2400",
    customer: "Bob K.",
    total: 124.0,
    status: "Processing",
    items: 8,
  },
  {
    id: "#ORD-2399",
    customer: "Clara N.",
    total: 42.3,
    status: "Shipped",
    items: 3,
  },
  {
    id: "#ORD-2398",
    customer: "David O.",
    total: 89.9,
    status: "Pending",
    items: 6,
  },
  {
    id: "#ORD-2397",
    customer: "Eva P.",
    total: 156.2,
    status: "Delivered",
    items: 10,
  },
];

const topProducts = [
  { name: "Organic Strawberries", sold: 342, revenue: 2732, progress: 90 },
  { name: "Fresh Organic Apples", sold: 287, revenue: 1432, progress: 75 },
  { name: "Raw Organic Honey", sold: 198, revenue: 2572, progress: 65 },
  { name: "Baby Spinach Leaves", sold: 176, revenue: 702, progress: 58 },
  { name: "Farm Fresh Carrots", sold: 154, revenue: 461, progress: 50 },
];

const statusColor: Record<string, string> = {
  Delivered: "bg-primary/10 text-primary border-primary/20",
  Processing: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  Shipped: "bg-accent text-accent-foreground border-accent-foreground/20",
  Pending: "bg-muted text-muted-foreground border-border",
};

export default function Dashboard() {
  const { formatPrice } = usePricing();

  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(24780),
      change: "+12.5%",
      up: true,
      icon: DollarSign,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Total Orders",
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
      title: "Conversion Rate",
      value: "3.24%",
      change: "-0.4%",
      up: false,
      icon: TrendingUp,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
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
                    <span className="text-muted-foreground">vs last month</span>
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[300px] w-full">
              <AreaChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                />
                <Bar
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </AreaChart>
            </ChartContainer>
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
              className="h-[260px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {categoryData.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
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
                        {order.customer} · {order.items} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPrice(order.total)}
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
              {topProducts.map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {p.name}
                    </span>
                    <span className="text-muted-foreground">
                      {p.sold} sold · {formatPrice(p.revenue)}
                    </span>
                  </div>
                  <Progress value={p.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
