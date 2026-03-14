"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Home,
  Calendar,
  GraduationCap,
  Palette,
  Handshake,
  ShoppingCart,
  Newspaper,
  MessageCircle,
  Tag,
  FolderTree,
  Users,
  Settings,
  Leaf,
  PlusCircle,
  School,
  BarChart3,
  UserPlus,
  ClipboardList,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commandGroups = [
  {
    heading: "Dashboard",
    items: [
      {
        label: "Dashboard Overview",
        description: "Main admin dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        keywords: ["home", "overview", "stats"],
      },
    ],
  },
  {
    heading: "Products",
    items: [
      {
        label: "All Products",
        description: "Browse and manage products",
        href: "/admin/products",
        icon: Package,
        keywords: ["products", "list", "inventory"],
      },
      {
        label: "Create New Product",
        description: "Add a new product to the store",
        href: "/admin/products/create",
        icon: PlusCircle,
        keywords: ["add product", "new product", "create product"],
      },
    ],
  },
  {
    heading: "Tours",
    items: [
      {
        label: "All Tours",
        description: "Browse and manage tours",
        href: "/admin/tours",
        icon: MapPin,
        keywords: ["tours", "list", "trips"],
      },
      {
        label: "Create New Tour",
        description: "Add a new tour experience",
        href: "/admin/tours/create-tour",
        icon: PlusCircle,
        keywords: ["add tour", "new tour", "create tour"],
      },
    ],
  },
  {
    heading: "Accommodations",
    items: [
      {
        label: "All Accommodations",
        description: "Manage accommodation listings",
        href: "/admin/accommodations",
        icon: Home,
        keywords: ["accommodations", "rooms", "lodging", "stay"],
      },
      {
        label: "Create Accommodation",
        description: "Add a new accommodation option",
        href: "/admin/accommodations/create",
        icon: PlusCircle,
        keywords: ["add accommodation", "new accommodation"],
      },
    ],
  },
  {
    heading: "Bookings & Orders",
    items: [
      {
        label: "Bookings",
        description: "View and manage tour bookings",
        href: "/admin/bookings",
        icon: Calendar,
        keywords: ["bookings", "reservations", "appointments"],
      },
      {
        label: "Orders",
        description: "View and manage shop orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        keywords: ["orders", "purchases", "sales", "transactions"],
      },
    ],
  },
  {
    heading: "Education",
    items: [
      {
        label: "Education Overview",
        description: "Education programs & visits",
        href: "/admin/education",
        icon: GraduationCap,
        keywords: ["education", "programs", "learning"],
      },
      {
        label: "Create Program",
        description: "Add a new education program",
        href: "/admin/education/create-program",
        icon: PlusCircle,
        keywords: ["create program", "new program", "add education"],
      },
      {
        label: "School Visit Requests",
        description: "Manage school visit applications",
        href: "/admin/education/school-visit",
        icon: School,
        keywords: ["school", "visits", "field trips"],
      },
      {
        label: "School Settings",
        description: "Configure school visit options",
        href: "/admin/education/school-settings",
        icon: Settings,
        keywords: ["school settings", "visit config"],
      },
      {
        label: "Education Stats",
        description: "View education program statistics",
        href: "/admin/education/stats",
        icon: BarChart3,
        keywords: ["stats", "statistics", "education metrics"],
      },
    ],
  },
  {
    heading: "Artisans & Partners",
    items: [
      {
        label: "Artisans",
        description: "Manage artisan profiles",
        href: "/admin/artisans",
        icon: Palette,
        keywords: ["artisans", "crafts", "makers", "handmade"],
      },
      {
        label: "Partners",
        description: "Browse partner businesses",
        href: "/admin/partners",
        icon: Handshake,
        keywords: ["partners", "collaborators", "businesses"],
      },
      {
        label: "New Partner",
        description: "Add a new partner",
        href: "/admin/partners/new",
        icon: UserPlus,
        keywords: ["add partner", "new partner", "create partner"],
      },
      {
        label: "Partner Applications",
        description: "Review partnership applications",
        href: "/admin/partners/application",
        icon: ClipboardList,
        keywords: ["applications", "applications review", "partner requests"],
      },
    ],
  },
  {
    heading: "Content",
    items: [
      {
        label: "Blog Posts",
        description: "Manage blog articles",
        href: "/admin/blog",
        icon: Newspaper,
        keywords: ["blog", "articles", "posts", "news"],
      },
      {
        label: "Create Blog Post",
        description: "Write a new blog article",
        href: "/admin/blog/create",
        icon: PlusCircle,
        keywords: ["write blog", "new post", "create article"],
      },
    ],
  },
  {
    heading: "Community & Feedback",
    items: [
      {
        label: "Feedback",
        description: "View customer feedback & reviews",
        href: "/admin/feedback",
        icon: MessageCircle,
        keywords: ["feedback", "reviews", "ratings", "comments"],
      },
      {
        label: "Members",
        description: "Manage registered members",
        href: "/admin/members",
        icon: Users,
        keywords: ["members", "users", "customers", "accounts"],
      },
    ],
  },
  {
    heading: "Catalogue",
    items: [
      {
        label: "Categories",
        description: "Manage product categories",
        href: "/admin/categories",
        icon: FolderTree,
        keywords: ["categories", "taxonomy", "classification"],
      },
      {
        label: "Discounts & Deals",
        description: "Manage promotions and discounts",
        href: "/admin/discounts",
        icon: Tag,
        keywords: ["discounts", "deals", "coupons", "promotions"],
      },
    ],
  },
  {
    heading: "Settings & Site",
    items: [
      {
        label: "Settings",
        description: "Admin & system settings",
        href: "/admin/settings",
        icon: Settings,
        keywords: ["settings", "config", "preferences"],
      },
      {
        label: "About Page",
        description: "Edit the public about page content",
        href: "/admin/about",
        icon: Leaf,
        keywords: ["about", "company", "story", "mission"],
      },
    ],
  },
];

export function AdminCommandPalette({
  open,
  onOpenChange,
}: AdminCommandPaletteProps) {
  const router = useRouter();

  const runCommand = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [router, onOpenChange],
  );

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {commandGroups.map((group, gIdx) => (
          <span key={group.heading}>
            {gIdx > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.description} ${item.keywords.join(" ")}`}
                  onSelect={() => runCommand(item.href)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium leading-tight">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </span>
        ))}
      </CommandList>

      <div className="border-t px-3 py-2 flex items-center justify-end gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ↑↓
          </kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ↵
          </kbd>
          open
        </span>
        <span className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Esc
          </kbd>
          close
        </span>
      </div>
    </CommandDialog>
  );
}
