"use client";

import {
  ShoppingBag,
  ShoppingCart,
  MapPin,
  GraduationCap,
  Award,
  Map,
  Loader2,
  AlertCircle,
  Inbox,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePricing } from "@/context/PricingContext";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDashboard } from "@/lib/api/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AccountDashboard = () => {
  const { user } = useAuth();
  const { formatPrice } = usePricing();

  const dashboardQuery = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: fetchCustomerDashboard,
  });

  const statsData = dashboardQuery.data;

  const stats = [
    {
      label: "Total Orders",
      value: statsData?.totalOrders.toString().padStart(2, "0") || "00",
      sub: `+${statsData?.monthlyOrders || 0} this month`,
      icon: ShoppingBag,
      color: "bg-green-50 text-green-600",
      href: "/account/orders",
    },
    {
      label: "Items in Cart",
      value: statsData?.cartItems.toString().padStart(2, "0") || "00",
      sub: "Ready for checkout",
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
      href: "/cart",
    },
    {
      label: "Saved Addresses",
      value: statsData?.addressCount.toString().padStart(2, "0") || "00",
      sub: "Direct delivery",
      icon: MapPin,
      color: "bg-amber-50 text-amber-600",
      href: "/account/addresses",
    },
    {
      label: "My Enrollments",
      value: statsData?.totalEnrollments.toString().padStart(2, "0") || "00",
      sub: `${statsData?.inProgressEnrollments || 0} in progress`,
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600",
      href: "/account/enrollments",
    },
    {
      label: "My Certificates",
      value: statsData?.certificateCount.toString().padStart(2, "0") || "00",
      sub: "View all",
      icon: Award,
      color: "bg-indigo-50 text-indigo-600",
      href: "/account/certificates",
    },
    {
      label: "My Tours",
      value: statsData?.upcomingTours.toString().padStart(2, "0") || "00",
      sub: "Upcoming activities",
      icon: Map,
      color: "bg-teal-50 text-teal-600",
      href: "/account/bookings",
    },
  ];

  const recentOrders = statsData?.recentOrders || [];

  if (dashboardQuery.isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Gathering your dashboard data...</p>
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive opacity-20" />
        <h3 className="text-lg font-bold">Failed to load dashboard</h3>
        <p className="text-sm text-muted-foreground max-w-xs">We couldn&apos;t retrieve your account data. Please refresh or try again later.</p>
        <Button onClick={() => dashboardQuery.refetch()} variant="outline" size="sm">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="bg-primary overflow-hidden rounded-[20px] text-white p-8 md:p-12 relative shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 font-heading">
            Hello, {user?.username || "Explorer"}!
          </h2>
          <p className="text-white/80 max-w-md text-sm leading-relaxed">
            Welcome to your Agri-Eco account. Track your sustainable orders, manage your travel bookings, and continue your educational journey in organic farming.
          </p>
          <div className="mt-6 flex gap-3">
             <Link href="/account/profile">
                <Button variant="secondary" size="sm" className="h-9 px-6 font-bold text-xs bg-white text-primary hover:bg-white/90">
                    Edit Profile
                </Button>
             </Link>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl text-xs" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <span className="absolute bottom-4 right-8 text-white/5 font-black text-9xl font-heading -rotate-12 hidden lg:block select-none pointer-events-none">
          AGRI
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link href={stat.href} key={i}>
            <div
              className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-foreground font-heading">
                  {stat.value}
                </h4>
                <p className="text-[11px] text-muted-foreground font-bold mt-1 uppercase tracking-tight flex items-center gap-1">
                  {stat.sub}
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Orders Card */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between bg-card/10">
            <h3 className="text-sm font-black text-foreground font-heading uppercase tracking-wider">
              Recent Orders
            </h3>
            <Link
              href="/account/orders"
              className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
            >
              View Full History
            </Link>
          </div>
          <div className="flex-1">
            {recentOrders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground/30">
                    <Inbox className="h-10 w-10" />
                    <p className="text-xs font-bold uppercase tracking-widest">No orders yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/30 text-muted-foreground uppercase text-[9px] font-extrabold tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Amount</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                        {recentOrders.map((order, i) => (
                            <tr
                            key={i}
                            className="hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/account/orders/${order.id}`}
                            >
                            <td className="px-6 py-4 font-bold text-foreground">
                                {order.orderNumber}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground font-medium">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <Badge
                                className={`text-[9px] font-bold uppercase py-0 px-2.5 ${
                                    order.status === "delivered" || order.status === "completed"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-amber-100 text-amber-700 border-amber-200"
                                }`}
                                variant="outline"
                                >
                                {order.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 font-black text-primary text-sm">
                                {formatPrice(order.totalAmount)}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>

        {/* Support & Community Card */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-border bg-card/10">
            <h3 className="text-sm font-black text-foreground font-heading uppercase tracking-wider">
              Quick Resources
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {[
                { title: "Track Request Status", desc: "Check school visits or partnership status", href: "/account/requests", icon: AlertCircle },
                { title: "Continue Learning", desc: "Pick up where you left off in your courses", href: "/account/enrollments", icon: GraduationCap },
                { title: "Delivery Addresses", desc: "Manage your saved shipping locations", href: "/account/addresses", icon: MapPin },
                { title: "Help & Support", desc: "Need assistance? Contact our team", href: "/contact", icon: AlertCircle },
            ].map((link, i) => (
                <Link
                key={i}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {link.desc}
                    </p>
                </div>
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
