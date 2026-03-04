"use client";

import { ShoppingBag, ShoppingCart, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const AccountDashboard = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();

  const stats = [
    {
      label: "Total Orders",
      value: "12",
      sub: "+2 this month",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Items in Cart",
      value: cartCount.toString().padStart(2, "0"),
      sub: "Ready for checkout",
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Saved Addresses",
      value: "02",
      sub: "Direct delivery",
      icon: MapPin,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const recentOrders = [
    {
      id: "#AE-2045",
      date: "Jan 12, 2024",
      status: "Delivered",
      total: "$45.00",
    },
    {
      id: "#AE-2012",
      date: "Dec 30, 2023",
      status: "Delivered",
      total: "$28.50",
    },
    {
      id: "#AE-1988",
      date: "Dec 15, 2023",
      status: "Processing",
      total: "$120.00",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="bg-primary overflow-hidden rounded-[40px] text-white p-8 md:p-12 relative shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 font-heading">
            Hello, {user?.name?.split(" ")[0] || "User"}!
          </h2>
          <p className="text-white/80 max-w-md">
            Welcome to your Agri-Eco account. From here you can easily check and
            view your recent orders, manage your shipping and billing addresses,
            and edit your password and account details.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <span className="absolute bottom-4 right-8 text-white/5 font-black text-9xl font-heading -rotate-12 hidden lg:block">
          AGRI
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-foreground">
                {stat.value}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Orders Card */}
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground font-heading">
              Recent Orders
            </h3>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 italic">ID</th>
                    <th className="px-6 py-4 italic">Date</th>
                    <th className="px-6 py-4 italic">Status</th>
                    <th className="px-6 py-4 italic">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order, i) => (
                    <tr
                      key={i}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-bold text-foreground">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {order.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-primary">
                        {order.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Default Address Card */}
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground font-heading">
              Primary Address
            </h3>
            <Link
              href="/account/addresses"
              className="text-xs font-bold text-primary hover:underline"
            >
              Edit
            </Link>
          </div>
          <div className="p-8 flex items-start gap-6">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center shrink-0 border border-border">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-lg mb-2">
                Shipping Address
              </h4>
              <p className="text-muted-foreground leading-relaxed font-medium">
                John Doe <br />
                KN 123 St, Muhima <br />
                Kigali City, Rwanda <br />
                Phone: +250 788 000 000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
