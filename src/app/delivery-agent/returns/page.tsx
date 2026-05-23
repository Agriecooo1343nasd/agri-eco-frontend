"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAgentReturns } from "@/lib/api/agent";
import { Loader2, Search, RotateCcw, Package, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DeliveryReturnsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "8",
  });
  if (debouncedSearch) queryParams.append("search", debouncedSearch);

  const { data, isLoading } = useQuery({
    queryKey: ["agent-returns", debouncedSearch, page],
    queryFn: () => fetchAgentReturns(queryParams.toString()),
  });

  const returns = data?.data || [];
  const pagination = data?.pagination;
  const pages = pagination?.pages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black font-heading tracking-tight uppercase">Assigned Returns</h1>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Manage your pending return pickups</p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative max-w-sm w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search return ID or customer..." 
            value={search} 
            onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
            className="pl-9 text-[10px] tracking-widest h-10 rounded-sm font-black uppercase" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading assigned returns...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {returns.map((r) => (
            <Card key={r.id} className="group shadow-none border-border/50 hover:border-purple-500/30 transition-all rounded-sm overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-500/20 text-[9px] font-black uppercase tracking-widest h-5 px-2">
                      RTN-{r.id.slice(0, 8).toUpperCase()}
                    </Badge>
                    <Badge className="text-[9px] font-black uppercase tracking-widest h-5 px-2 bg-purple-600">
                      {r.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <p className="text-[10px] font-black uppercase tracking-widest truncate">
                        {r.user?.firstName} {r.user?.lastName} · {r.order?.orderNumber}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-1">
                         {r.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:border-l border-border/50 sm:pl-6">
                  <div className="hidden sm:block text-right space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Original Order</p>
                    <p className="text-sm font-black tracking-tight">{r.order?.orderNumber}</p>
                  </div>
                  <Button size="sm" className="rounded-sm h-10 px-6 text-[10px] font-black uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-all" asChild>
                    <Link href={`/delivery-agent/returns/${r.id}`}>Manage Pickup</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {returns.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-muted/20 rounded-sm border-2 border-dashed border-border/50">
              <RotateCcw className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No assigned returns</p>
            </div>
          )}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              disabled={page <= 1} 
              onClick={() => { setPage((p) => p - 1); window.scrollTo(0, 0); }}
              className="rounded-sm h-10 px-4 text-[10px] font-black uppercase tracking-widest"
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Previous
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              disabled={page >= pages} 
              onClick={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
              className="rounded-sm h-10 px-4 text-[10px] font-black uppercase tracking-widest"
            >
              Next <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
