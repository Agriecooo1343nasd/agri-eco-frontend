import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, Search } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {/* Admin top bar */}
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-foreground" />
              <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-48"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">
                    A
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  Admin
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6 opacity-100 transition-opacity duration-300">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
