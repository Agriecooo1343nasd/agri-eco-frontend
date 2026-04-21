"use client";

import { useMemo, useState, use } from "react";
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
  FileText,
  History,
  MessageSquare,
  Layers,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    fetchAdminOrderById, 
    updateOrderStatusAdmin, 
    updateOrderPaymentStatusAdmin, 
} from "@/lib/api/orders";
import { OrderStatus, PaymentStatus } from "@/constants/order-status";
import { Loader2, AlertCircle } from "lucide-react";
import {
  assignOrderToDeliveryAgent,
  deliveryAgents,
  listDeliveryOrders,
} from "@/lib/api/operations";
import { DeliveryAgentPickerDialog } from "@/components/admin/DeliveryAgentPickerDialog";

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
  [OrderStatus.PENDING]: "bg-slate-100 text-slate-700 border-slate-200",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-700 border-blue-200",
  [OrderStatus.PROCESSING]: "bg-amber-100 text-amber-700 border-amber-200",
  [OrderStatus.SHIPPED]: "bg-green-100 text-green-700 border-green-200",
  [OrderStatus.OUT_FOR_DELIVERY]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  [OrderStatus.DELIVERED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [OrderStatus.CANCELLED]: "bg-rose-100 text-rose-700 border-rose-200",
  [OrderStatus.RETURNED]: "bg-orange-100 text-orange-700 border-orange-200",
  [OrderStatus.REFUNDED]: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function AdminOrderDetails({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const { formatPrice } = usePricing();
  const queryClient = useQueryClient();

  const [noteInput, setNoteInput] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
      queryKey: ["admin-order", orderId],
      queryFn: () => fetchAdminOrderById(orderId),
  });

  const { data: deliveryAssignment } = useQuery({
    queryKey: ["admin-delivery-assignment", orderId],
    queryFn: async () => {
      const deliveries = await listDeliveryOrders();
      return deliveries.find((d) => d.orderId === orderId) ?? null;
    },
  });

  const [agentsForDialog, setAgentsForDialog] = useState<Array<{ agent: string; assignments: number }>>(
    deliveryAgents.map((a) => ({ agent: a, assignments: 0 })),
  );

  const loadAgentStats = useMutation({
    mutationFn: async () => {
      const deliveries = await listDeliveryOrders();
      const counts = new Map<string, number>();
      for (const a of deliveryAgents) counts.set(a, 0);
      for (const d of deliveries) {
        counts.set(d.assignedAgent, (counts.get(d.assignedAgent) ?? 0) + 1);
      }
      return deliveryAgents.map((a) => ({ agent: a, assignments: counts.get(a) ?? 0 }));
    },
    onSuccess: (data) => setAgentsForDialog(data),
  });

  const updateStatusMutation = useMutation({
      mutationFn: ({ status, adminNote }: { status: OrderStatus, adminNote?: string }) => 
           updateOrderStatusAdmin(orderId, { status, adminNote }),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
          toast.success("Status Updated", {
              description: "The order status has been successfully updated.",
          });
      },
      onError: (error: any) => {
          toast.error("Failed to update status", {
              description: error.message || "An error occurred while updating the order status.",
          });
      }
  });

  const updatePaymentMutation = useMutation({
      mutationFn: (status: PaymentStatus) => updateOrderPaymentStatusAdmin(orderId, { paymentStatus: status }),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
          toast.success("Payment Status Updated");
      }
  });

  const assignDeliveryMutation = useMutation({
    mutationFn: async (agent: string) => {
      if (!order) throw new Error("Order not loaded yet.");
      await assignOrderToDeliveryAgent({
        orderId,
        customer:
          order.user?.username ||
          (order.user?.firstName || order.user?.lastName
            ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim()
            : "") ||
          order.shippingAddress?.fullName ||
          "Customer",
        address: [
          order.shippingAddress?.street,
          order.shippingAddress?.city,
          order.shippingAddress?.state,
          order.shippingAddress?.country,
        ]
          .filter(Boolean)
          .join(", "),
        phone: order.shippingAddress?.phone || order.user?.phone || "N/A",
        amount: Number(order.totalAmount || 0),
        items: `${order.items?.length ?? 0} items`,
        agent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-assignment", orderId] });
      toast.success("Assigned", { description: "Order assigned to delivery agent." });
      setAssignOpen(false);
    },
    onError: (error: any) => {
      toast.error("Failed to assign", {
        description: error?.message || "Unable to assign this order.",
      });
    },
  });

  if (isLoading) {
    return (
        <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading order details...</p>
        </div>
      );
  }

  if (isError || !order) {
    return (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive opacity-20" />
          <h3 className="text-lg font-bold">Order Not Found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">We couldn&apos;t find an order with this ID or there was an error loading it.</p>
          <Button onClick={() => router.push("/admin/orders")} variant="outline" size="sm">Back to Orders</Button>
        </div>
      );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
      updateStatusMutation.mutate({ status: newStatus });
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    updateStatusMutation.mutate({ status: order.status as OrderStatus, adminNote: noteInput }, {
        onSuccess: () => {
            setNoteInput("");
        }
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
              Order</h1>
            <Badge
              className={cn(
                "rounded-lg py-1 px-3 text-xs font-black uppercase tracking-wider",
                statusStyles[order.status],
              )}
            >
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setAssignOpen(true);
              loadAgentStats.mutate();
            }}
          >
            <Truck className="h-4 w-4 mr-2" />
            {deliveryAssignment?.assignedAgent ? "Reassign delivery" : "Assign delivery"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={order.status === OrderStatus.CONFIRMED || updateStatusMutation.isPending}>
                Update Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[200px] rounded-md p-2 border-border shadow-soft"
            >
              <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-3 py-2">
                Allowed status
              </DropdownMenuLabel>
              {order.status !== OrderStatus.CONFIRMED && (
                <DropdownMenuItem
                  className="rounded-md px-3 py-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary font-bold capitalize"
                  onClick={() => handleStatusChange(OrderStatus.CONFIRMED)}
                >
                  Confirmed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DeliveryAgentPickerDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        title={`Assign delivery agent · ${orderId}`}
        agents={agentsForDialog}
        pickedAgent={deliveryAssignment?.assignedAgent ?? null}
        picking={assignDeliveryMutation.isPending}
        onPick={(agent) => assignDeliveryMutation.mutate(agent)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left */}
        <div className="xl:col-span-2 space-y-8">
          {/* Order Items */}
          <Card className="rounded-md border-border shadow-soft overflow-hidden">
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
                {order.items.map((item: any) => {
                  const productImg = item.image || item.product?.images?.find((img: any) => img.isPrimary)?.url || item.product?.images?.[0]?.url || "/placeholder.png";
                  return (
                    <div
                      key={item.id}
                      className="p-8 flex items-center gap-8 group"
                    >
                      <div className="w-24 h-24 rounded-md overflow-hidden border border-border shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={productImg}
                          alt={item.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Link
                          href={`/admin/products/${item.productId}/view`}
                          className="text-lg font-black hover:text-primary transition-colors"
                        >
                          {item.name || "Unknown Product"}
                        </Link>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                          Ref: {item.id.split('-')[0].toUpperCase()}
                        </p>
                        <div className="pt-2 flex items-center gap-4">
                          <p className="text-sm font-bold text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-muted-foreground">
                            Price: {formatPrice(item.unitPrice || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-foreground">
                          {formatPrice((item.unitPrice || 0) * item.quantity)}
                        </p>
                        <p className={cn(
                            "text-[10px] font-bold uppercase",
                            "text-green-600"
                        )}>
                          Active
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-8 bg-muted/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Payment Details
                  </h4>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-md border border-border flex items-center justify-center shrink-0 shadow-sm">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize">{order.paymentMethod?.replace(/_/g, ' ') || 'Credit Card'}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        Status: <span className={cn(
                            "font-black uppercase tracking-widest",
                            order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                        )}>{order.paymentStatus}</span>
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
                        Discount
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
                      {formatPrice(order.shippingCost || 0)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-rose-600">
                      <span className="font-bold flex items-center gap-1.5">
                        <Layers className="h-3 w-3" /> Applied Discount
                      </span>
                      <span className="font-black">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-muted-foreground">
                      Estimated Tax
                    </span>
                    <span className="font-bold text-foreground">
                      {formatPrice(order.tax || 0)}
                    </span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-foreground uppercase tracking-tighter">
                      Total Amount
                    </span>
                    <span className="text-3xl font-black text-primary">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="rounded-md border-border shadow-soft p-10">
            <h3 className="text-xl font-black mb-10 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Order Journey
            </h3>
            <div className="space-y-10 relative">
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-muted" />
              {order.timeline?.map((event: any, i: number) => (
                <div key={i} className="flex gap-10 relative">
                  <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-white z-10 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-foreground uppercase text-sm tracking-wide">
                        {event.status.replace(/_/g, ' ')}
                      </h4>
                      <span className="text-xs font-black text-muted-foreground">
                        {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">
                      &quot;{event.note || 'Status updated'}&quot; —{" "}
                      <span className="font-bold text-foreground not-italic capitalize">
                        {event.actor || 'System'}
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
          <Card className="rounded-md border-border shadow-soft overflow-hidden bg-muted/20 text-foreground p-8 space-y-8 relative border-dashed">
            <div className="absolute top-0 right-0 p-4 opacity-15">
              <User className="w-24 h-24 text-muted-foreground" />
            </div>
            <div className="space-y-4 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Customer Profile
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[24px] bg-white border border-border text-primary flex items-center justify-center text-2xl font-black shadow-sm">
                  {order.user?.username?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-xl font-black leading-tight text-foreground">
                    {order.user?.username || 
                     (order.user?.firstName || order.user?.lastName ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() : null) ||
                     order.shippingAddress?.fullName || 
                     "Guest"}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    Email: {order.user?.email || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-border/60 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-white border border-border flex items-center justify-center shadow-sm">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="font-bold text-foreground">
                    {order.user?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-white border border-border flex items-center justify-center shadow-sm">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">
                    Phone Number
                  </p>
                  <p className="font-bold text-foreground">
                    {order.shippingAddress?.phone || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="rounded-md border-border shadow-soft p-8">
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
                  {order.shippingAddress?.fullName || `${order.user?.firstName} ${order.user?.lastName}`}
                </p>
                <p className="font-medium flex items-center gap-2 text-primary">
                  <Phone className="h-3.5 w-3.5" /> {order.shippingAddress?.phone || order.user?.phone || 'N/A'}
                </p>
              </div>
              <div className="space-y-1 text-sm font-bold text-foreground">
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">
                  Address
                </p>
                <p className="font-bold">{order.shippingAddress?.street}</p>
                <p className="text-muted-foreground font-medium uppercase text-[11px] tracking-wider">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country} {order.shippingAddress?.zipCode}
                </p>
              </div>
              {(order.customerNote || order.adminNote) && (
                <div className="p-4 rounded-md bg-amber-50 border border-amber-100 italic text-xs font-medium text-amber-900 space-y-2">
                  {order.customerNote && (
                      <div>
                        <p className="font-black not-italic text-[10px] uppercase mb-1 flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3" /> Customer Instruction:
                        </p>
                        &quot;{order.customerNote}&quot;
                      </div>
                  )}
                  {order.adminNote && (
                      <div>
                        <p className="font-black not-italic text-[10px] uppercase mb-1 flex items-center gap-1.5">
                            <FileText className="h-3 w-3" /> Internal Note:
                        </p>
                        &quot;{order.adminNote}&quot;
                      </div>
                  )}
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
          <Card className="rounded-md border-border shadow-soft p-8 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Administrative Notes
            </h4>
            <div className="space-y-4">
              {order.adminNote ? (
                <div
                  className="p-4 rounded-md bg-muted/20 border border-border/40 space-y-2"
                >
                  <p className="text-xs font-medium text-muted-foreground italic leading-relaxed">
                    &quot;{order.adminNote}&quot;
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/20">
                    <span className="text-[10px] font-black uppercase text-primary">
                      Admin
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground">
                      Latest note
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No internal notes yet.</p>
              )}
            </div>
            <div className="space-y-3">
              <textarea
                className="w-full h-24 p-4 rounded-md bg-muted/10 border border-border focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium italic"
                placeholder="Write an internal note..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <Button
                className="w-full rounded-md h-11 font-bold"
                onClick={addNote}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Save Internal Note
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
