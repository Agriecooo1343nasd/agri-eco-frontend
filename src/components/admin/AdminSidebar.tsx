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
  ExternalLink,
  Home,
  Leaf,
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
const mainItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Tours", url: "/admin/tours", icon: MapPin },
  { title: "Accommodations", url: "/admin/accommodations", icon: Home },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar },
  { title: "Education", url: "/admin/education", icon: GraduationCap },
  { title: "Artisans", url: "/admin/artisans", icon: Palette },
  { title: "Partners", url: "/admin/partners", icon: Handshake },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Blog", url: "/admin/blog", icon: Newspaper },
  { title: "Feedback", url: "/admin/feedback", icon: MessageCircle },
  { title: "Discounts", url: "/admin/discounts", icon: Tag },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "About Page", url: "/admin/about", icon: Leaf },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();

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
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isActive =
                  item.url === "/admin/dashboard"
                    ? pathname === "/admin/dashboard" || pathname === "/admin"
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/"
                className="text-foreground hover:bg-sidebar-accent"
              >
                <ExternalLink className="h-4 w-4" />
                {!collapsed && <span>Go to Site</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/login"
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
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
