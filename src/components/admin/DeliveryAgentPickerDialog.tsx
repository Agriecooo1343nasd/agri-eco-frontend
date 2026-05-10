"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, User } from "lucide-react";

type SortMode = "fewest" | "most" | "name";

export type DeliveryAgentOption = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  assignments: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  agents: DeliveryAgentOption[];
  loading?: boolean;
  onPick: (agentId: string, notes?: string) => void | Promise<void>;
  picking?: boolean;
  pickedAgentId?: string | null;
};

export function DeliveryAgentPickerDialog({
  open,
  onOpenChange,
  title,
  agents,
  loading,
  onPick,
  picking,
  pickedAgentId,
}: Props) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("fewest");
  const [notes, setNotes] = useState("");

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    let rows = agents.filter((a) => !query || a.name.toLowerCase().includes(query) || a.email?.toLowerCase().includes(query));
    if (sort === "fewest") rows = [...rows].sort((a, b) => a.assignments - b.assignments);
    if (sort === "most") rows = [...rows].sort((a, b) => b.assignments - a.assignments);
    if (sort === "name") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [agents, q, sort]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title ?? "Assign delivery agent"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search agents by name or email…"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fewest">Fewest assignments</SelectItem>
              <SelectItem value="most">Most assignments</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-2 max-h-[40vh] overflow-auto pr-1">
            {visible.map((a) => {
              const selected = !!pickedAgentId && pickedAgentId === a.id;
              return (
                <Card
                  key={a.id}
                  className={cn(
                    "p-3 flex items-center justify-between gap-3",
                    selected && "border-primary/40 bg-primary/[0.03]",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate">{a.name}</p>
                        {selected && (
                          <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.email && <span>{a.email} · </span>}
                        Active: <span className="font-medium text-foreground">{a.assignments}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onPick(a.id, notes.trim() || undefined)}
                    disabled={picking || selected}
                    variant={selected ? "outline" : "default"}
                  >
                    {picking ? <Loader2 className="h-3 w-3 animate-spin" /> : selected ? "Selected" : "Assign"}
                  </Button>
                </Card>
              );
            })}

            {!visible.length && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground text-center">
                No delivery agents found.
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Assignment notes (optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fragile items, call before delivery…"
            className="h-20"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
