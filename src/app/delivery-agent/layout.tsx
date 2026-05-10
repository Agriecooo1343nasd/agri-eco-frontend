import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DeliveryAgentSidebar } from "@/components/delivery-agent/DeliveryAgentSidebar";
import { DeliveryAgentHeader } from "@/components/delivery-agent/DeliveryAgentHeader";
import { DeliveryAgentAccessGuard } from "@/components/auth/DeliveryAgentAccessGuard";

export default function DeliveryAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeliveryAgentAccessGuard>
      <SidebarProvider>
        <DeliveryAgentSidebar />
        <SidebarInset>
          <div className="min-h-screen flex flex-col">
            <DeliveryAgentHeader />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DeliveryAgentAccessGuard>
  );
}
