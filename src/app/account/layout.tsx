"use client";

import { useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { cn } from "@/lib/utils";
import { UserAccessGuard } from "@/components/auth/UserAccessGuard";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      { label: t(translations.common.home), href: "/" },
      { label: t(translations.accountPage.dashboard), href: "/account" },
    ];

    if (paths.includes("orders")) {
      breadcrumbs.push({ label: t(translations.accountPage.myOrders), href: "/account/orders" });
      if (paths.length > 2) {
        breadcrumbs.push({
          label: `#${paths[2].toUpperCase()}`,
          href: pathname,
        });
      }
    } else if (paths.includes("profile")) {
      breadcrumbs.push({
        label: t(translations.accountPage.myProfile),
        href: "/account/profile",
      });
    } else if (paths.includes("enrollments")) {
      breadcrumbs.push({
        label: t(translations.accountPage.myEnrollments),
        href: "/account/enrollments",
      });
    } else if (paths.includes("certificates")) {
      breadcrumbs.push({
        label: t(translations.accountPage.myCertificates),
        href: "/account/certificates",
      });
    } else if (paths.includes("bookings")) {
      breadcrumbs.push({
        label: t(translations.accountPage.myTours),
        href: "/account/bookings",
      });
    } else if (paths.includes("partner")) {
      breadcrumbs.push({
        label: t(translations.accountPage.partnerNetwork),
        href: "/account/partner",
      });
    } else if (paths.includes("requests")) {
      breadcrumbs.push({
        label: t(translations.accountPage.myRequests),
        href: "/account/requests",
      });
    } else if (paths.includes("addresses")) {
      breadcrumbs.push({
        label: t(translations.accountPage.savedAddresses),
        href: "/account/addresses",
      });
    } else if (paths.includes("settings")) {
      breadcrumbs.push({
        label: t(translations.accountPage.accountSettings),
        href: "/account/settings",
      });
    }

    // Remove duplicates if any (e.g. if we are on /account)
    return breadcrumbs.filter(
      (bc, idx, self) => idx === self.findIndex((b) => b.label === bc.label),
    );
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col font-sans">
      <Header />

      {/* Breadcrumbs Banner */}
      <div className="bg-white border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <nav className="flex items-center text-sm text-muted-foreground font-medium">
            {breadcrumbs.map((bc, i) => (
              <div key={bc.href} className="flex items-center">
                {i > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-foreground">{bc.label}</span>
                ) : (
                  <Link
                    href={bc.href}
                    className="hover:text-primary transition-colors"
                  >
                    {bc.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors border border-border"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <UserAccessGuard>
          <div className="flex flex-col lg:flex-row gap-8 relative">
            <AccountSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </UserAccessGuard>
      </main>

      <Footer />
    </div>
  );
}
