"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  MapPin,
  User,
  CreditCard,
  Package,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Plus,
  Trash2,
  FileText,
  History,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { usePricing } from "@/context/PricingContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const allOrdersRaw = [
  {
    id: "ORD-9284",
    date: "March 02, 2024 02:30 PM",
    status: "Processing",
    paymentStatus: "Paid",
    total: 124.5,
    subtotal: 110.0,
    discount: 15.0,
    shipping: 25.0,
    tax: 4.5,
    discountCode: "WELCOME2024",
    paymentMethod: "Visa ending in 4242",
    customer: {
      name: "Marcus Holloway",
      email: "marcus.h@example.com",
      phone: "+250 788 000 001",
      totalOrders: 12,
      joinDate: "Jan 15, 2023",
    },
    shippingAddress: {
      recipientName: "Marcus Holloway",
      address: "KN 456 St, Kiyovu",
      city: "Kigali City",
      country: "Rwanda",
      zip: "00000",
      phone: "+250 788 000 001",
      deliveryNote: "Leave at the gate if no one answers.",
    },
    items: [
      {
        id: "p1",
        name: "Pure Organic Honey",
        sku: "ORG-HNY-01",
        price: 31.12,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1587049352846-4a222e783134?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      },
      {
        id: "p2",
        name: "Premium Green Tea",
        sku: "TEA-GRN-05",
        price: 22.26,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      },
    ],
    timeline: [
      {
        status: "Order Placed",
        date: "March 02, 02:30 PM",
        note: "Customer placed order via Mobile App",
        actor: "System",
      },
      {
        status: "Payment Confirmed",
        date: "March 02, 02:35 PM",
        note: "Automatic verification successful",
        actor: "System",
      },
    ],
    internalNotes: [
      {
        id: 1,
        text: "Customer requested eco-friendly packaging if possible.",
        date: "March 02, 02:32 PM",
        author: "Support Bot",
      },
    ],
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Processing: "bg-amber-100 text-amber-700 border-amber-200",
  Shipped: "bg-green-100 text-green-700 border-green-200",
  "Out for Delivery": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function AdminOrderDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const { formatPrice } = usePricing();

  const order = allOrdersRaw[0];

  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [timeline, setTimeline] = useState(order.timeline);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes);
  const [noteInput, setNoteInput] = useState("");

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    const description =
      newStatus === "Cancelled"
        ? "Order has been cancelled and refund process initiated."
        : `Order status changed to ${newStatus}. Notification sent to customer.`;

    // Add to timeline
    const newEvent = {
      status: newStatus,
      date: "Just now",
      note:
        newStatus === "Cancelled"
          ? "Order cancelled and refunded."
          : `Status manually updated to ${newStatus}`,
      actor: "Admin",
    };
    setTimeline([newEvent, ...timeline]);

    toast.success(
      newStatus === "Cancelled" ? "Order Cancelled" : "Status Updated",
      {
        description,
      },
    );
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    const newNote = {
      id: internalNotes.length + 1,
      text: noteInput,
      date: "Just now",
      author: "Admin",
    };
    setInternalNotes([newNote, ...internalNotes]);
    setNoteInput("");
    toast.success("Note Added", {
      description: "Internal note has been saved.",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/orders")}
            className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary flex items-center gap-2 group mb-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Orders
          </Button>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight">
              Order #{orderId || order.id.split("-")[1]}
            </h1>
            <Badge
              className={cn(
                "rounded-lg py-1 px-3 text-xs font-black uppercase tracking-wider",
                statusStyles[currentStatus],
              )}
            >
              {currentStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Placed on {order.date}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentStatus !== "Delivered" && currentStatus !== "Cancelled" && (
            <Button
              variant="outline"
              className="rounded-xl h-12 px-6 font-bold shadow-sm border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => handleStatusChange("Cancelled")}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Refund & Cancel
            </Button>
          )}

          {(currentStatus === "Shipped" ||
            currentStatus === "Out for Delivery") && (
            <Button
              className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handleStatusChange("Delivered")}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Delivery
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 bg-primary text-white">
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[200px] rounded-2xl p-2 border-border shadow-soft"
            >
              <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-3 py-2">
                Set New Status
              </DropdownMenuLabel>
              {[
                "Pending",
                "Processing",
                "Shipped",
                "Out for Delivery",
                "Delivered",
              ]
                .filter((st) => st !== currentStatus)
                .map((st) => (
                  <DropdownMenuItem
                    key={st}
                    className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary font-bold"
                    onClick={() => handleStatusChange(st)}
                  >
                    {st}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left */}
        <div className="xl:col-span-2 space-y-8">
          {/* Order Items */}
          <Card className="rounded-[32px] border-border shadow-soft overflow-hidden">
            <CardHeader className="p-8 border-b bg-muted/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">
                    Ordered Items
                  </CardTitle>
                  <CardDescription className="font-medium">
                    Summary of products in this transaction.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full bg-white border-primary/20 text-primary font-black py-1 px-4"
                >
                  {order.items.length} Items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-b">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-8 flex items-center gap-8 group"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Link
                        href={`/admin/products/1/view`}
                        className="text-lg font-black hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        SKU: {item.sku}
                      </p>
                      <div className="pt-2 flex items-center gap-4">
                        <p className="text-sm font-bold text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-muted-foreground">
                          Price: {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-[10px] font-bold text-green-600 uppercase">
                        Stock: In Hand
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-muted/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Payment Details
                  </h4>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 shadow-sm">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{order.paymentMethod}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        Transaction ID: TXN_829402948
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-bold text-foreground">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-rose-600">
                      <span className="font-bold flex items-center gap-1.5">
                        Discount ({order.discountCode})
                      </span>
                      <span className="font-black">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">
                      Shipping Fee
                    </span>
                    <span className="font-bold text-foreground">
                      {formatPrice(order.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">
                      Estimated Tax
                    </span>
                    <span className="font-bold text-foreground">
                      {formatPrice(order.tax)}
                    </span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-foreground uppercase tracking-tighter">
                      Total Amount
                    </span>
                    <span className="text-3xl font-black text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="rounded-[32px] border-border shadow-soft p-10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Order Journey
            </h3>
            <div className="space-y-10 relative">
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-muted" />
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-10 relative">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white z-10 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-foreground uppercase text-sm tracking-wide">
                        {event.status}
                      </h4>
                      <span className="text-xs font-black text-muted-foreground">
                        {event.date}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">
                      &quot;{event.note}&quot; —{" "}
                      <span className="font-bold text-foreground not-italic">
                        {event.actor}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-8">
          {/* Customer Profile */}
          <Card className="rounded-[32px] border-border shadow-soft overflow-hidden bg-muted/20 text-foreground p-8 space-y-8 relative border-dashed">
            <div className="absolute top-0 right-0 p-4 opacity-15">
              <User className="w-24 h-24 text-muted-foreground" />
            </div>
            <div className="space-y-4 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Customer Profile
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-white border border-border text-primary flex items-center justify-center text-2xl font-black shadow-sm">
                  {order.customer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black leading-tight text-foreground">
                    {order.customer.name}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    Customer Hash:{" "}
                    {order.customer.email.split("@")[0].toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border/60 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="font-bold text-foreground">
                    {order.customer.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
                    Phone Number
                  </p>
                  <p className="font-bold text-foreground">
                    {order.customer.phone}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="rounded-[32px] border-border shadow-soft p-8">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Delivery Details
            </h4>
            <div className="space-y-4">
              <div className="space-y-1 text-sm font-bold text-foreground">
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">
                  Recipient
                </p>
                <p className="text-base font-black">
                  {order.shippingAddress.recipientName}
                </p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-3 w-3" /> {order.shippingAddress.phone}
                </p>
              </div>
              <div className="space-y-1 text-sm font-bold text-foreground">
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">
                  Address
                </p>
                <p className="font-bold">{order.shippingAddress.address}</p>
                <p className="text-muted-foreground font-medium uppercase text-[11px] tracking-wider">
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </p>
              </div>
              {order.shippingAddress.deliveryNote && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 italic text-xs font-medium text-amber-900">
                  <p className="font-black not-italic text-[10px] uppercase mb-1">
                    Checkout Instruction:
                  </p>
                  &quot;{order.shippingAddress.deliveryNote}&quot;
                </div>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <div className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Express Delivery
              </div>
              <Badge className="bg-primary/10 text-primary border-transparent h-7 px-3">
                Tracking Active
              </Badge>
            </div>
          </Card>

          {/* Internal Notes */}
          <Card className="rounded-[32px] border-border shadow-soft p-8 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Administrative Notes
            </h4>
            <div className="space-y-4">
              {internalNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-2"
                >
                  <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">
                    &quot;{note.text}&quot;
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/20">
                    <span className="text-[10px] font-black uppercase text-primary">
                      {note.author}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {note.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <textarea
                className="w-full h-24 p-4 rounded-2xl bg-muted/10 border border-border focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium italic"
                placeholder="Write an internal note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button
                className="w-full rounded-xl h-11 font-bold"
                onClick={addNote}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Internal Note
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
