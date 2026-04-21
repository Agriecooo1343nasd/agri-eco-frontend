"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SortMode = "fewest" | "most" | "name";

export type DeliveryAgentStat = {
  agent: string;
  assignments: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  agents: DeliveryAgentStat[];
  onPick: (agent: string) => void | Promise<void>;
  picking?: boolean;
  pickedAgent?: string | null;
};

export function DeliveryAgentPickerDialog({
  open,
  onOpenChange,
  title,
  agents,
  onPick,
  picking,
  pickedAgent,
}: Props) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("fewest");

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    let rows = agents.filter((a) => !query || a.agent.toLowerCase().includes(query));
    if (sort === "fewest") rows = [...rows].sort((a, b) => a.assignments - b.assignments);
    if (sort === "most") rows = [...rows].sort((a, b) => b.assignments - a.assignments);
    if (sort === "name") rows = [...rows].sort((a, b) => a.agent.localeCompare(b.agent));
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
              placeholder="Search agents by name…"
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

        <div className="grid gap-2 max-h-[50vh] overflow-auto pr-1">
          {visible.map((a) => {
            const selected = !!pickedAgent && pickedAgent === a.agent;
            return (
              <Card
                key={a.agent}
                className={cn(
                  "p-3 flex items-center justify-between gap-3",
                  selected && "border-primary/40 bg-primary/[0.03]",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{a.agent}</p>
                    {selected && (
                      <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                        Assigned
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active assignments: <span className="font-medium text-foreground">{a.assignments}</span>
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onPick(a.agent)}
                  disabled={picking || selected}
                  variant={selected ? "outline" : "default"}
                >
                  {selected ? "Selected" : "Assign"}
                </Button>
              </Card>
            );
          })}

          {!visible.length && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No agents match your search.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

