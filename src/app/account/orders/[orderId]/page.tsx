"use client";

import { use, useEffect, useMemo, useState } from "react";
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
  QrCode,
} from "lucide-react";
import QRCode from "qrcode";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchOrderById, fetchOrderByNumber, type Order } from "@/lib/api/orders";
import { toast } from "sonner";
import { format } from "date-fns";
import { OrderStatus, PaymentStatus } from "@/constants/order-status";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { usePricing } from "@/context/PricingContext";
import { createReturn, listReturns } from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";

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
  const { t } = useLanguage();
  const { formatPrice } = usePricing();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnRows, setReturnRows] = useState<ReturnRequest[]>([]);
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [selected, setSelected] = useState<
    Record<string, { checked: boolean; qty: number; reason: string }>
  >({});
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

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
          setError(t(translations.orderDetailsPage.orderNotFound));
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
  }, [orderId, t]);

  useEffect(() => {
    if (!order) return;
    
    // Generate QR code for the order (could be a receipt URL or just order details)
    const orderUrl = `https://agri-eco-three.vercel.app/account/orders/${order.orderNumber}`;
    QRCode.toDataURL(orderUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#10b981", // primary color
        light: "#ffffff"
      }
    }).then(setQrCodeUrl).catch(console.error);
  }, [order]);

  useEffect(() => {
    async function loadReturnsForOrder() {
      const all = await listReturns();
      setReturnRows(all.filter((r) => r.orderId === orderId));
    }
    void loadReturnsForOrder();
  }, [orderId]);

  const orderReturns = returnRows;

  const daysLeftByItemId = useMemo(() => {
    if (!order) return {};
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    const now = new Date();
    const daysSince = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const m: Record<string, number> = {};
    for (const it of (order.items as any[]) ?? []) {
      const maxReturnDays = Number(it.product?.maxReturnDays ?? 14);
      const remaining = Math.max(0, maxReturnDays - daysSince);
      m[String(it.id)] = remaining;
    }
    return m;
  }, [order]);

  const openReturnDialog = () => {
    if (!order) return;
    const base: Record<string, { checked: boolean; qty: number; reason: string }> =
      {};
    for (const it of (order.items as any[]) ?? []) {
      const maxQty = Number(it.quantity || 1);
      base[String(it.id)] = { checked: false, qty: Math.min(1, maxQty), reason: "" };
    }
    setSelected(base);
    setReturnImages([]);
    setReturnOpen(true);
  };

  const submitReturn = async () => {
    if (!order) return;
    const items = ((order.items as any[]) ?? [])
      .filter((it) => selected[String(it.id)]?.checked)
      .map((it) => {
        const sel = selected[String(it.id)];
        return {
          id: String(it.id),
          name: String(it.name || "Product"),
          qty: Math.max(
            1,
            Math.min(Number(it.quantity || 1), Number(sel?.qty || 1)),
          ),
          image: String(
            it.image ||
              it.product?.images?.find?.((img: any) => img.isPrimary)?.url ||
              it.product?.images?.[0]?.url ||
              "/assets/products/placeholder.jpg",
          ),
          price: Number(it.unitPrice || it.price || 0),
          reason: String(sel?.reason || ""),
        };
      })
      .filter((it) => it.reason.trim());

    if (!items.length) {
      toast.warning("Select products and add reasons for each.");
      return;
    }

    await createReturn({
      orderId,
      buyer: order.shippingAddress?.fullName || "Current user",
      items,
      requestImages: returnImages,
    });
    setReturnOpen(false);
    const all = await listReturns();
    setReturnRows(all.filter((r) => r.orderId === orderId));
    toast.success("Return request submitted");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">{t(translations.orderDetailsPage.retrievingDetails)}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-md flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t(translations.common.errorLoading)}
          </h2>
          <p className="text-muted-foreground mt-2">
            {error || t(translations.orderDetailsPage.orderNotFound)}
          </p>
        </div>
        <Link href="/account/orders">
          <Button variant="outline" className="rounded-md">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t(translations.orderDetailsPage.backToOrders)}
          </Button>
        </Link>
      </div>
    );
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `order-qr-${order.orderNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code Downloaded", {
      description: "You can use this QR code at our collection points."
    });
  };

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
            {t(translations.orderDetailsPage.backToOrders)}
          </Link>
          <h1 className="text-3xl font-black text-foreground font-heading">
            {t(translations.ordersPage.orderNumberShort)}{order.orderNumber}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t(translations.orderDetailsPage.placedOn)} {format(new Date(order.createdAt), "MMM dd, yyyy p")}
          </p>
          {!!orderReturns.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {orderReturns.map((r) => (
                <Button key={r.id} asChild size="sm" variant="outline">
                  <Link href={`/return/${r.id}`}>
                    Return {r.id} · {r.status}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-5 py-2 rounded-md text-sm font-medium uppercase ring-4 ${getStatusColor(order.status as string)}`}>
            {t((translations.statuses as any)[(order.status as string).toLowerCase()] || order.status)}
          </span>
          <Button
            variant="outline"
            className="rounded-md font-medium bg-white h-11"
            onClick={() => toast.info("Download Invoice coming soon")}
          >
            <Download className="h-4 w-4 mr-2" />
            {t(translations.orderDetailsPage.downloadInvoice)}
          </Button>
          <Button className="rounded-md h-11" onClick={openReturnDialog}>
            Request return
          </Button>
        </div>
      </div>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request a return</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select products, adjust quantities, and provide a reason for each. You can attach images to support your request.
            </p>

            <div className="space-y-2 max-h-[45vh] overflow-auto pr-1">
              {((order.items as any[]) ?? []).map((it) => {
                const key = String(it.id);
                const sel = selected[key] ?? { checked: false, qty: 1, reason: "" };
                const maxQty = Number(it.quantity || 1);
                const remainingDays = daysLeftByItemId[key] ?? 0;
                const disabled = remainingDays <= 0;
                const productImg =
                  it.image ||
                  it.product?.images?.find?.((img: any) => img.isPrimary)?.url ||
                  it.product?.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1587049352846-4a222e783134?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80";

                return (
                  <div key={key} className="border rounded-md p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={!!sel.checked}
                          onChange={(e) =>
                            setSelected((prev) => ({
                              ...prev,
                              [key]: { ...sel, checked: e.target.checked },
                            }))
                          }
                          disabled={disabled}
                        />
                        <div className="w-12 h-12 rounded-md overflow-hidden border bg-muted shrink-0">
                          <img src={productImg} alt={it.name || "Product"} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{it.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Remaining return window:{" "}
                            <span className={disabled ? "text-destructive font-medium" : "text-foreground font-medium"}>
                              {remainingDays} day(s) left
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Qty</span>
                        <Input
                          type="number"
                          className="w-[90px]"
                          min={1}
                          max={maxQty}
                          value={sel.qty}
                          onChange={(e) =>
                            setSelected((prev) => ({
                              ...prev,
                              [key]: {
                                ...sel,
                                qty: Math.min(maxQty, Math.max(1, Number(e.target.value || 1))),
                              },
                            }))
                          }
                          disabled={!sel.checked || disabled}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Reason</p>
                      <Textarea
                        value={sel.reason}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [key]: { ...sel, reason: e.target.value },
                          }))
                        }
                        placeholder="Explain why you want to return this product…"
                        disabled={!sel.checked || disabled}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Attach images (optional)</p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setReturnImages(Array.from(e.target.files ?? []))}
              />
              {!!returnImages.length && (
                <p className="text-xs text-muted-foreground">{returnImages.length} file(s) selected</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setReturnOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReturn}>Submit return request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-md border border-border shadow-soft flex gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              {t(translations.orderDetailsPage.customer)}
            </h4>
            <p className="text-sm font-medium text-foreground">
              {order.shippingAddress.fullName}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-border shadow-soft flex gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-md flex items-center justify-center shrink-0">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              {t(translations.orderDetailsPage.shipping)}
            </h4>
            <p className="text-sm font-medium text-foreground">
              {t(translations.orderDetailsPage.standardDelivery)}
            </p>
            <p className="text-sm text-muted-foreground italic">
              {t(translations.orderDetailsPage.trackingAvailable)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-border shadow-soft flex gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-md flex items-center justify-center shrink-0">
            <CreditCard className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              {t(translations.orderDetailsPage.payment)}
            </h4>
            <p className="text-sm font-medium text-foreground capitalize">
              {order.paymentMethod}
            </p>
            <p className="text-sm text-muted-foreground">{t(translations.bookingsPage.paymentStatus)}: <span className="capitalize">{t((translations.statuses as any)[(order.paymentStatus as string).toLowerCase()] || order.paymentStatus)}</span></p>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-md border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-medium text-foreground font-heading flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {t(translations.orderDetailsPage.itemsOrdered)} ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex items-center gap-6 group"
                >
                  <div className="w-20 h-20 rounded-md overflow-hidden border border-border shrink-0 group-hover:scale-105 transition-transform duration-300">
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
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-md border border-border p-8 shadow-sm">
            <h3 className="text-lg font-medium text-foreground font-heading mb-8">
              {t(translations.orderDetailsPage.orderTimeline)}
            </h3>
            <div className="relative space-y-8">
              {/* Connector Line */}
              <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-muted" />

              {(order as any).timeline?.map((event: any, i: number) => (
                <div key={i} className="relative flex items-center gap-6">
                  <div className="w-11 h-11 rounded-md flex items-center justify-center z-10 bg-primary text-white">
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
          <div className="bg-white rounded-md border border-border p-8 shadow-sm">
            <h3 className="text-lg font-medium text-foreground font-heading mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t(translations.orderDetailsPage.shippingAddress)}
            </h3>
            <div className="space-y-1 text-sm font-medium text-muted-foreground leading-relaxed">
              <p className="text-foreground font-medium text-base mb-2">
                {order.shippingAddress.fullName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.country} {order.shippingAddress.postalCode}</p>
              <p className="pt-2">{t(translations.checkoutPage.phone)}: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* QR Code Receipt Card */}
          <div className="bg-white rounded-md border border-border p-8 shadow-sm text-center">
            <h3 className="text-lg font-medium text-foreground font-heading mb-4 flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Digital Receipt
            </h3>
            <p className="text-xs text-muted-foreground mb-6 font-medium">
              Scan this code at pick-up points or for delivery verification.
            </p>
            <div className="relative group mx-auto w-48 h-48 mb-6 rounded-xl border-4 border-muted p-2 overflow-hidden bg-white">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Order QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-muted animate-pulse rounded-md" />
              )}
              <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <QrCode className="h-12 w-12 text-white animate-pulse" />
              </div>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full h-11 font-black uppercase tracking-widest text-[10px] gap-2 rounded-lg"
                onClick={downloadQRCode}
                disabled={!qrCodeUrl}
            >
              <Download className="h-3.5 w-3.5" />
              Download PNG
            </Button>
          </div>

          {/* Order Summary Card */}
          <div className="rounded-md border border-border p-8 shadow-sm bg-primary/5 border-primary/10">
            <h3 className="text-lg font-medium text-foreground font-heading mb-6">
              {t(translations.orderDetailsPage.orderSummary)}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>{t(translations.orderDetailsPage.subtotal)}</span>
                <span className="text-foreground">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>{t(translations.orderDetailsPage.shipping)}</span>
                <span className="text-foreground">
                  {formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>{t(translations.orderDetailsPage.tax)}</span>
                <span className="text-foreground">
                  {formatPrice(order.tax)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>{t(translations.orderDetailsPage.discount)}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-foreground">
                  {t(translations.orderDetailsPage.total)}
                </span>
                <span className="text-2xl font-black text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
            <Button className="w-full mt-8 rounded-md h-12 font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              {t(translations.orderDetailsPage.needHelp)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
