"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAssignedReturnsForAgent, listDeliveryOrders } from "@/lib/api/operations";
import type { DeliveryOrder, ReturnRequest } from "@/data/operations-mock";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const agent = "Agent Thierry";

export default function DeliveryAgentHome() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  useEffect(() => {
    void (async () => {
      setOrders(await listDeliveryOrders(agent));
      setReturns((await listAssignedReturnsForAgent(agent)).data);
    })();
  }, []);

  const stats = useMemo(
    () => ({
      assigned: orders.filter((o) => o.status === "Assigned").length,
      inTransit: orders.filter((o) => o.status === "In transit" || o.status === "Picked up").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      returns: returns.length,
    }),
    [orders, returns],
  );

  const statusData = useMemo(
    () => [
      { status: "Assigned", count: orders.filter((o) => o.status === "Assigned").length, fill: "var(--color-assigned)" },
      { status: "Transit", count: orders.filter((o) => o.status === "In transit" || o.status === "Picked up").length, fill: "var(--color-transit)" },
      { status: "Delivered", count: orders.filter((o) => o.status === "Delivered").length, fill: "var(--color-delivered)" },
      { status: "Failed", count: orders.filter((o) => o.status === "Failed").length, fill: "var(--color-failed)" },
    ],
    [orders],
  );

  const weekly = [
    { day: "Mon", deliveries: 4, pickups: 1 },
    { day: "Tue", deliveries: 5, pickups: 2 },
    { day: "Wed", deliveries: 3, pickups: 1 },
    { day: "Thu", deliveries: 6, pickups: 2 },
    { day: "Fri", deliveries: 5, pickups: 3 },
    { day: "Sat", deliveries: 2, pickups: 1 },
    { day: "Sun", deliveries: 1, pickups: 0 },
  ];

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-2xl font-bold font-heading">Delivery Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([k, v]) => (
          <Card key={k} className="shadow-none">
            <CardHeader className="py-3"><CardTitle className="text-xs capitalize">{k}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{v}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-sm">Weekly Performance</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                deliveries: { label: "Deliveries", color: "#16a34a" },
                pickups: { label: "Return pickups", color: "#f59e0b" },
              }}
            >
              <BarChart data={weekly}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deliveries" fill="var(--color-deliveries)" radius={4} />
                <Bar dataKey="pickups" fill="var(--color-pickups)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-sm">Order Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[260px] w-full"
              config={{
                assigned: { label: "Assigned", color: "#64748b" },
                transit: { label: "In Transit", color: "#0ea5e9" },
                delivered: { label: "Delivered", color: "#22c55e" },
                failed: { label: "Failed", color: "#ef4444" },
              }}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={50} outerRadius={90} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Pending Deliveries Catchup</CardTitle>
            <Button asChild size="sm" variant="outline"><Link href="/delivery-agent/orders">View all</Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.filter((o) => o.status !== "Delivered" && o.status !== "Failed").slice(0, 5).map((o) => (
              <div key={o.id} className="rounded border p-2 flex items-center justify-between">
                <div>
                  <p className="font-medium">{o.orderId} · {o.customer}</p>
                  <p className="text-muted-foreground">{o.address}</p>
                </div>
                <span>{o.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Pending Returns Catchup</CardTitle>
            <Button asChild size="sm" variant="outline"><Link href="/delivery-agent/returns">View all</Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {returns.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded border p-2 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.id} · {r.product}</p>
                  <p className="text-muted-foreground">{r.orderId}</p>
                </div>
                <span>{r.agentStatus || "Pending pickup"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
