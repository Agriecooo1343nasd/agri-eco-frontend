"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  fetchAgentDashboard, 
  fetchAgentWeeklyPerformance, 
  fetchAgentStatusBreakdown 
} from "@/lib/api/agent";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Truck, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeliveryAgentHome() {
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["agent-dashboard"],
    queryFn: fetchAgentDashboard,
    refetchInterval: 60000,
  });

  const { data: weeklyPerformance, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["agent-weekly-performance"],
    queryFn: fetchAgentWeeklyPerformance,
  });

  const { data: statusBreakdown, isLoading: isLoadingBreakdown } = useQuery({
    queryKey: ["agent-status-breakdown"],
    queryFn: fetchAgentStatusBreakdown,
  });

  const stats = dashboardData?.stats;
  const recentOrders = dashboardData?.recentOrders || [];
  const recentReturns = dashboardData?.recentReturns || [];

  const kpis = [
    { label: "Active Assignments", value: stats?.totalAssigned ?? 0, icon: Package, color: "text-blue-600" },
    { label: "In Transit", value: stats?.inTransit ?? 0, icon: Truck, color: "text-amber-600" },
    { label: "Delivered Today", value: stats?.deliveredToday ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Pending Returns", value: stats?.pendingPickups ?? 0, icon: RotateCcw, color: "text-purple-600" },
  ];

  const statusData = (statusBreakdown?.breakdown || []).map((b) => ({
    status: b.status.replace(/_/g, ' '),
    count: b.count,
    fill: 
      b.status === "delivered" ? "#10b981" : 
      b.status === "cancelled" ? "#ef4444" :
      b.status === "out_for_delivery" ? "#f59e0b" :
      b.status === "processing" ? "#3b82f6" : "#6b7280"
  }));

  const weekly = (weeklyPerformance?.series || []).map((s) => ({
    day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
    deliveries: s.deliveries,
    pickups: s.pickups,
  }));

  const isLoading = isLoadingDashboard || isLoadingWeekly || isLoadingBreakdown;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-heading tracking-tight uppercase">Agent Dashboard</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Real-time delivery performance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm border-border/60 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <Badge variant="outline" className="text-[9px] font-black tracking-tighter uppercase opacity-50">Today</Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black">{kpi.value}</p>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Performance Chart */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-muted/20 py-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                deliveries: { label: "Deliveries", color: "#10b981" },
                pickups: { label: "Return pickups", color: "#f59e0b" },
              }}
            >
              <BarChart data={weekly}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deliveries" fill="var(--color-deliveries)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pickups" fill="var(--color-pickups)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown Chart */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-muted/20 py-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <PieChart className="h-4 w-4" /> Order Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                assigned: { label: "Assigned", color: "#3b82f6" },
                transit: { label: "In Transit", color: "#f59e0b" },
                delivered: { label: "Delivered", color: "#10b981" },
                failed: { label: "Failed", color: "#ef4444" },
              }}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie 
                  data={statusData} 
                  dataKey="count" 
                  nameKey="status" 
                  innerRadius={60} 
                  outerRadius={90} 
                  strokeWidth={5}
                  stroke="var(--background)"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Deliveries Catchup */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-muted/20 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" /> Pending Deliveries Catchup
            </CardTitle>
            <Button asChild size="sm" variant="ghost" className="h-7 text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link href="/delivery-agent/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {recentOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").slice(0, 5).map((o) => (
              <div key={o.id} className="group rounded-xl border border-border/50 p-3 hover:border-blue-500/30 hover:bg-blue-50/20 transition-all flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm">{o.orderNumber}</p>
                    <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-1.5 h-4">{o.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide truncate max-w-[200px]">
                    {o.user?.firstName} {o.user?.lastName} · {o.shippingAddress?.addressLine1}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                  <Link href={`/delivery-agent/orders/${o.id}`}>
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </Link>
                </Button>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                No pending deliveries
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Returns Catchup */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="border-b border-border/40 bg-muted/20 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-purple-600" /> Pending Returns Catchup
            </CardTitle>
            <Button asChild size="sm" variant="ghost" className="h-7 text-[10px] font-black uppercase tracking-wider text-purple-600 hover:text-purple-700 hover:bg-purple-50">
              <Link href="/delivery-agent/returns">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {recentReturns.slice(0, 5).map((r) => (
              <div key={r.id} className="group rounded-xl border border-border/50 p-3 hover:border-purple-500/30 hover:bg-purple-50/20 transition-all flex items-center justify-between">
                <div className="space-y-1">
                   <div className="flex items-center gap-2">
                    <p className="font-black text-sm">RTN-{r.id.slice(0, 8).toUpperCase()}</p>
                    <Badge variant="outline" className="text-[8px] uppercase tracking-tighter px-1.5 h-4">{r.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                    {r.user?.firstName} {r.user?.lastName} · {r.order?.orderNumber}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                  <Link href={`/delivery-agent/returns/${r.id}`}>
                    <RotateCcw className="h-4 w-4 text-purple-600" />
                  </Link>
                </Button>
              </div>
            ))}
            {recentReturns.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                No pending returns
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
