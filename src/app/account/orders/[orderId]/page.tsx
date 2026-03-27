"use client";

import { use, useEffect, useState } from "react";
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  CreditCard,
  Download,
  HelpCircle,
  Package,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchOrderById, fetchOrderByNumber, type Order } from "@/lib/api/orders";
import { toast } from "sonner";
import { format } from "date-fns";
import { OrderStatus, PaymentStatus } from "@/constants/order-status";

// Mock Data for a single order
const orderData = {
  id: "#AE-2045",
  date: "Jan 12, 2024 10:45 AM",
  status: "Delivered",
  total: 45.0,
  subtotal: 38.5,
  shipping: 5.0,
  tax: 1.5,
  paymentMethod: "Visa ending in 4242",
  items: [
    {
      id: "p1",
      name: "Pure Organic Honey",
      price: 15.5,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1587049352846-4a222e783134?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      sku: "ORG-HNY-01",
    },
    {
      id: "p2",
      name: "Organic Green Tea",
      price: 7.5,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      sku: "TEA-GRN-05",
    },
  ],
  shippingAddress: {
    name: "John Doe",
    address: "KN 123 St, Muhima",
    city: "Kigali City",
    country: "Rwanda",
    phone: "+250 788 000 000",
  },
  timeline: [
    { status: "Order Placed", date: "Jan 12, 10:45 AM", completed: true },
    { status: "Processing", date: "Jan 12, 01:20 PM", completed: true },
    { status: "Shipped", date: "Jan 13, 09:00 AM", completed: true },
    { status: "Out for delivery", date: "Jan 14, 02:30 PM", completed: true },
    { status: "Delivered", date: "Jan 14, 04:15 PM", completed: true },
  ],
};

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        // Try fetching as UUID first, then as Order Number
        let data: Order | null = null;
        
        // Simple regex to check if it's a UUID
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(orderId);
        
        if (isUuid) {
          data = await fetchOrderById(orderId);
        } else {
          data = await fetchOrderByNumber(orderId);
        }

        if (!data) {
          setError("Order not found");
        } else {
          setOrder(data);
        }
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Error Loading Order</h2>
          <p className="text-muted-foreground mt-2">{error || "The order you are looking for could not be found."}</p>
        </div>
        <Link href="/account/orders">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  // Helper to map backend status to UI color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-600 ring-green-50";
      case "pending": return "bg-amber-100 text-amber-600 ring-amber-50";
      case "processing": return "bg-blue-100 text-blue-600 ring-blue-50";
      case "cancelled": return "bg-red-100 text-red-600 ring-red-50";
      default: return "bg-slate-100 text-slate-600 ring-slate-50";
    }
  };
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Back button and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <Link
            href="/account/orders"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-2 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-black text-foreground font-heading">
            Order #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground font-medium">
            Placed on {format(new Date(order.createdAt), "MMM dd, yyyy p")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-5 py-2 rounded-full text-sm font-medium uppercase ring-4 ${getStatusColor(order.status as string)}`}>
            {order.status}
          </span>
          <Button
            variant="outline"
            className="rounded-xl font-medium bg-white h-11"
            onClick={() => toast.info("Download Invoice coming soon")}
          >
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Order Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-border shadow-soft flex gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              Customer
            </h4>
            <p className="text-sm font-medium text-foreground">
              {order.shippingAddress.fullName}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-border shadow-soft flex gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              Shipping
            </h4>
            <p className="text-sm font-medium text-foreground">
              Standard Delivery
            </p>
            <p className="text-sm text-muted-foreground italic">
              Tracking available after dispatch
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-border shadow-soft flex gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              Payment
            </h4>
            <p className="text-sm font-medium text-foreground capitalize">
              {order.paymentMethod}
            </p>
            <p className="text-sm text-muted-foreground">Status: <span className="capitalize">{order.paymentStatus}</span></p>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-medium text-foreground font-heading flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Items Ordered ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex items-center gap-6 group"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1587049352846-4a222e783134?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-base font-black text-foreground">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-[32px] border border-border p-8 shadow-sm">
            <h3 className="text-lg font-medium text-foreground font-heading mb-8">
              Order Timeline
            </h3>
            <div className="relative space-y-8">
              {/* Connector Line */}
              <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-muted" />

              {(order as any).timeline?.map((event: any, i: number) => (
                <div key={i} className="relative flex items-center gap-6">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center z-10 bg-primary text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground capitalize">
                      {event.status.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {format(new Date(event.timestamp), "MMM dd, p")} - {event.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          {/* Address Card */}
          <div className="bg-white rounded-[32px] border border-border p-8 shadow-sm">
            <h3 className="text-lg font-medium text-foreground font-heading mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Address
            </h3>
            <div className="space-y-1 text-sm font-medium text-muted-foreground leading-relaxed">
              <p className="text-foreground font-medium text-base mb-2">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.country} {order.shippingAddress.postalCode}</p>
              <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="rounded-[32px] border border-border p-8 shadow-sm bg-primary/5 border-primary/10">
            <h3 className="text-lg font-medium text-foreground font-heading mb-6">
              Order Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">
                  ${order.shippingCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Tax</span>
                <span className="text-foreground">
                  ${order.tax.toFixed(2)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-foreground">
                  Total
                </span>
                <span className="text-2xl font-black text-primary">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <Button className="w-full mt-8 rounded-xl h-12 font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Need Help?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
