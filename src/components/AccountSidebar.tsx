"use client";

import {
  User,
  MapPin,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  Award,
  Map,
  MessageSquare,
  Handshake,
  RotateCcw,
  Paintbrush,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

interface AccountSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const AccountSidebar = ({ isOpen, onClose }: AccountSidebarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = [
    { id: "dashboard", label: t(translations.accountPage.dashboard), icon: User, href: "/account" },
    {
      id: "profile",
      label: t(translations.accountPage.myProfile),
      icon: User,
      href: "/account/profile",
    },
    {
      id: "orders",
      label: t(translations.accountPage.myOrders),
      icon: ShoppingBag,
      href: "/account/orders",
    },
    {
      id: "bookings",
      label: t(translations.accountPage.myTours),
      icon: Map,
      href: "/account/bookings",
    },
    {
      id: "partner-network",
      label: t(translations.accountPage.partnerNetwork),
      icon: Handshake,
      href: "/account/partner",
    },
    {
      id: "enrollments",
      label: t(translations.accountPage.myEnrollments),
      icon: GraduationCap,
      href: "/account/enrollments",
    },
    {
      id: "certificates",
      label: t(translations.accountPage.myCertificates),
      icon: Award,
      href: "/account/certificates",
    },
    {
      id: "requests",
      label: t(translations.accountPage.myRequests),
      icon: MessageSquare,
      href: "/account/requests",
    },
    {
      id: "returns",
      label: "Returns & Appeals",
      icon: RotateCcw,
      href: "/account/returns",
    },
    {
      id: "artisan",
      label: "Artisan Portal",
      icon: Paintbrush,
      href: "/account/artisan",
    },
    {
      id: "addresses",
      label: t(translations.accountPage.savedAddresses),
      icon: MapPin,
      href: "/account/addresses",
    },
    {
      id: "settings",
      label: t(translations.accountPage.accountSettings),
      icon: Settings,
      href: "/account/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white rounded-md border border-border shadow-sm overflow-hidden transition-all duration-300",
        isOpen ? "block" : "hidden lg:block",
        "w-full lg:w-72 lg:sticky lg:top-6 self-start",
      )}
    >
      <div className="p-8 border-b border-border text-center lg:text-left">
        <div className="w-20 h-20 bg-primary/10 rounded-md flex items-center justify-center mx-auto lg:mx-0 mb-4 ring-4 ring-primary/5">
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
            let isActive = false;

            if (item.id === "dashboard") {
              isActive = pathname === "/account";
            } else {
              // Check for exact route match or sub-routes
              isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
            }

            const isDashboardActive = isActive;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-4 rounded-md text-sm font-medium transition-all group",
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
              className="w-full flex items-center gap-3 px-6 py-4 rounded-md text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {t(translations.accountPage.logout)}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AccountSidebar;
