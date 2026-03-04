"use client";

import {
  User,
  MapPin,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: User, href: "/account" },
  {
    id: "orders",
    label: "My Orders",
    icon: ShoppingBag,
    href: "/account/orders",
  },
  {
    id: "addresses",
    label: "Saved Addresses",
    icon: MapPin,
    href: "/account/addresses",
  },
  {
    id: "settings",
    label: "Account Settings",
    icon: Settings,
    href: "/account/settings",
  },
];

interface AccountSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const AccountSidebar = ({ isOpen, onClose }: AccountSidebarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "lg:w-72 bg-white rounded-3xl border border-border shadow-soft overflow-hidden transition-all duration-300",
        isOpen ? "block" : "hidden lg:block",
        "absolute lg:relative z-40 w-full lg:w-auto top-0 lg:top-auto",
      )}
    >
      <div className="p-8 border-b border-border text-center lg:text-left">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4 ring-4 ring-primary/5">
          <span className="text-3xl font-black text-primary">
            {user?.name?.charAt(0)}
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground font-heading truncate">
          {user?.name}
        </h2>
        <p className="text-xs text-muted-foreground font-medium truncate">
          {user?.email}
        </p>
      </div>
      <nav className="p-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.id === "orders" && pathname.startsWith("/account/orders"));

            // Special case for dashboard to avoid matching all sub-routes if we just check startsWith
            const isDashboardActive =
              item.id === "dashboard" ? pathname === "/account" : isActive;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-medium transition-all group",
                    isDashboardActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-primary",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isDashboardActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                  {item.label}
                  {isDashboardActive && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Link>
              </li>
            );
          })}
          <li className="pt-4 mt-4 border-t border-border px-2">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout Account
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AccountSidebar;
