"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function DeliveryAgentHeader() {
  return (
    <header className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <p className="text-sm font-semibold">Delivery Agent Workspace</p>
      </div>
      <div className="text-xs text-muted-foreground">Agent Thierry</div>
    </header>
  );
}
