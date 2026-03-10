"use client";

import { use } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
            Order #{orderId.toUpperCase()}
          </h1>
          <p className="text-muted-foreground font-medium">
            Placed on {orderData.date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-5 py-2 rounded-full bg-green-100 text-green-600 text-sm font-medium uppercase ring-4 ring-green-50">
            {orderData.status}
          </span>
          <Button
            variant="outline"
            className="rounded-xl font-medium bg-white h-11"
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
              {orderData.shippingAddress.name}
            </p>
            <p className="text-sm text-muted-foreground">john@example.com</p>
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
            <p className="text-sm text-muted-foreground">
              Tracking: AE-TRK-7890
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
            <p className="text-sm font-medium text-foreground">
              {orderData.paymentMethod}
            </p>
            <p className="text-sm text-muted-foreground">Status: Paid</p>
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
                Items Ordered ({orderData.items.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {orderData.items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex items-center gap-6 group"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground uppercase font-medium mt-1">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-base font-black text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
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

              {orderData.timeline.map((event, i) => (
                <div key={i} className="relative flex items-center gap-6">
                  <div
                    className={`
                    w-11 h-11 rounded-full flex items-center justify-center z-10 
                    ${event.completed ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
                  `}
                  >
                    {event.completed ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Clock className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${event.completed ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {event.status}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {event.date}
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
                {orderData.shippingAddress.name}
              </p>
              <p>{orderData.shippingAddress.address}</p>
              <p>{orderData.shippingAddress.city}</p>
              <p>{orderData.shippingAddress.country}</p>
              <p className="pt-2">Phone: {orderData.shippingAddress.phone}</p>
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
                  ${orderData.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground">
                  ${orderData.shipping.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Tax</span>
                <span className="text-foreground">
                  ${orderData.tax.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-foreground">
                  Total
                </span>
                <span className="text-2xl font-black text-primary">
                  ${orderData.total.toFixed(2)}
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
