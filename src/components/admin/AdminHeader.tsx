"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";

export function AdminHeader() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-foreground" />

          {/* Search bar — click opens palette */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 hover:bg-accent transition-colors group"
            aria-label="Open search (Ctrl+K)"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-48 text-left">
              Search…
            </span>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-auto">
              Ctrl K
            </kbd>
          </button>
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

      {/* Command palette — also listens for Ctrl+K globally */}
      <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
