import { headers } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminAccessGuard } from "@/components/auth/AdminAccessGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Accept-invite is a standalone public page — no sidebar, no auth guard
  if (pathname === "/admin/accept-invite") {
    return <>{children}</>;
  }

  return (
    <AdminAccessGuard>
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
    </AdminAccessGuard>
  );
}
