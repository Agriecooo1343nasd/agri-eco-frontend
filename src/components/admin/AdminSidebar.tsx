"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FolderTree,
  Users,
  Settings,
  LogOut,
  MapPin,
  Calendar,
  GraduationCap,
  Handshake,
  Palette,
  Newspaper,
  MessageCircle,
  Mail,
  ExternalLink,
  Home,
  Leaf,
  Truck,
  Logs,
  Star,
  RotateCcw,
  Bike,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mockPendingCounts: Record<string, number> = {
  bookings: 4,
  education: 12,
  artisans: 3,
  partners: 5,
  orders: 8,
  returns: 2,
  reviews: 7,
  contacts: 9,
  feedback: 1,
};

const sidebarGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/admin/products", icon: Package },
      { title: "Discounts", url: "/admin/discounts", icon: Tag },
      { title: "Categories", url: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    label: "Travel & Stays",
    items: [
      { title: "Tours", url: "/admin/tours", icon: MapPin },
      { title: "Bookings", url: "/admin/bookings", icon: Calendar, badgeKey: "bookings", badgeHover: "pending bookings" },
      { title: "Accommodations", url: "/admin/accommodations", icon: Home },
    ],
  },
  {
    label: "Education",
    items: [
      { title: "Education", url: "/admin/education", icon: GraduationCap, badgeKey: "education", badgeHover: "pending education enrollments" },
    ],
  },
  {
    label: "Community",
    items: [
      { title: "Artisans", url: "/admin/artisans", icon: Palette, badgeKey: "artisans", badgeHover: "pending artisan applications" },
      { title: "Partners", url: "/admin/partners", icon: Handshake, badgeKey: "partners", badgeHover: "pending partner applications" },
    ],
  },
  {
    label: "Commerce & Logistics",
    items: [
      { title: "Orders", url: "/admin/orders", icon: ShoppingCart, badgeKey: "orders", badgeHover: "pending orders" },
      { title: "Logs", url: "/admin/logs", icon: Logs },
      { title: "Returns", url: "/admin/returns", icon: RotateCcw, badgeKey: "returns", badgeHover: "pending returns" },
      { title: "Delivery Ops", url: "/admin/delivery", icon: Bike },
      { title: "Delivery Zones", url: "/admin/delivery-zones", icon: Truck },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "Reviews", url: "/admin/reviews", icon: Star, badgeKey: "reviews", badgeHover: "pending reviews" },
      { title: "Contacts", url: "/admin/contacts", icon: Mail, badgeKey: "contacts", badgeHover: "pending contact requests" },
      { title: "Feedback", url: "/admin/feedback", icon: MessageCircle, badgeKey: "feedback", badgeHover: "pending feedback items" },
      { title: "Blog", url: "/admin/blog", icon: Newspaper },
    ],
  },
  {
    label: "Users",
    items: [
      { title: "Members", url: "/admin/members", icon: Users },
      { title: "About Page", url: "/admin/about", icon: Leaf },
    ],
  },
  {
    label: "Legal",
    items: [
      { title: "Privacy Policy", url: "/admin/privacy-policy", icon: ShieldCheck },
      { title: "Terms of Service", url: "/admin/terms-of-service", icon: ScrollText },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();

  const isActive = (url: string) =>
    url === "/admin/dashboard"
      ? pathname === "/admin/dashboard" || pathname === "/admin"
      : pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <img
            src="/assets/logo/logo.png"
            alt="Agri-Eco Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sidebarGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link href={item.url} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </div>
                        {!collapsed && (item as any).badgeKey && mockPendingCounts[(item as any).badgeKey] > 0 && (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full text-[10px]">
                                  {mockPendingCounts[(item as any).badgeKey]}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{mockPendingCounts[(item as any).badgeKey]} {(item as any).badgeHover}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="text-foreground hover:bg-sidebar-accent">
                <ExternalLink className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Go to Site</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/login" className="text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Logout</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}