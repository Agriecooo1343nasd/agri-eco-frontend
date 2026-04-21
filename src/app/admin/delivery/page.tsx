"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignOrderToDeliveryAgent, deliveryAgents, listDeliveryOrders } from "@/lib/api/operations";
import type { DeliveryOrder } from "@/data/operations-mock";

export default function AdminDeliveryPage() {
  const [rows, setRows] = useState<DeliveryOrder[]>([]);
  const [agent, setAgent] = useState(deliveryAgents[0]);
  const [orderId, setOrderId] = useState("");
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState("");

  const refresh = async () => setRows(await listDeliveryOrders());
  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-6 text-xs">
      <h1 className="text-2xl font-bold font-heading">Delivery Assignment Dashboard</h1>
      <Card>
        <CardHeader><CardTitle className="text-sm">Assign order to delivery agent</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div><Label>Order ID</Label><Input value={orderId} onChange={(e) => setOrderId(e.target.value)} /></div>
          <div><Label>Customer</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>Amount</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><Label>Items summary</Label><Input value={items} onChange={(e) => setItems(e.target.value)} /></div>
          <div>
            <Label>Agent</Label>
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {deliveryAgents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Button
              onClick={async () => {
                await assignOrderToDeliveryAgent({
                  orderId,
                  customer,
                  address,
                  phone,
                  amount: Number(amount || 0),
                  items,
                  agent,
                });
                setOrderId("");
                setCustomer("");
                setAddress("");
                setPhone("");
                setAmount("");
                setItems("");
                await refresh();
              }}
            >
              Assign order
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rows.map((o) => (
          <Card key={o.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{o.orderId} · {o.customer}</span>
                <Badge variant="outline">{o.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>{o.address}</p>
              <p>{o.phone}</p>
              <p>Assigned agent: {o.assignedAgent}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
