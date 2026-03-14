import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

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
          <AdminHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6 opacity-100 transition-opacity duration-300">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
