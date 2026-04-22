"use client";

import { useMemo, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Minus, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appealReturn,
  cancelReturnAppeal,
  getReturnById,
} from "@/lib/api/operations";
import type { ReturnRequest } from "@/data/operations-mock";

type EditableItem = {
  id: string;
  name: string;
  maxQty: number;
  qty: number;
  included: boolean;
  image?: string;
  price?: number;
  reason?: string;
};

export default function ReturnDetailsPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = use(params);
  const queryClient = useQueryClient();

  const [appealOpen, setAppealOpen] = useState(false);
  const [appealNote, setAppealNote] = useState("");
  const [appealImages, setAppealImages] = useState<File[]>([]);
  const [editItems, setEditItems] = useState<EditableItem[]>([]);

  const { data: row, isLoading, isError } = useQuery({
    queryKey: ["return", returnId],
    queryFn: () => getReturnById(returnId),
  });

  const submittedAppealsCount = useMemo(() => {
    const r = row as ReturnRequest | null;
    return (r?.appeals ?? []).filter((a) => a.status === "Submitted").length;
  }, [row]);

  const canAppeal = !!row && row.status === "Rejected" && submittedAppealsCount < 2;

  const openAppeal = () => {
    if (!row) return;
    const base = (row.items ?? []).map((it) => ({
      id: it.id,
      name: it.name,
      maxQty: it.qty,
      qty: it.qty,
      included: true,
      image: it.image,
      price: it.price,
      reason: it.reason,
    }));
    setEditItems(base);
    setAppealNote("");
    setAppealImages([]);
    setAppealOpen(true);
  };

  const appealMutation = useMutation({
    mutationFn: async () => {
      if (!row) throw new Error("Return not loaded.");
      const selected = editItems.filter((i) => i.included && i.qty > 0);
      if (!appealNote.trim()) throw new Error("Please add an appeal note.");
      if (!selected.length) throw new Error("Select at least one product to appeal.");
      await appealReturn(returnId, {
        note: appealNote.trim(),
        items: selected.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          image: i.image,
          price: i.price,
          reason: i.reason,
        })),
        images: appealImages,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return", returnId] });
      toast.success("Appeal submitted");
      setAppealOpen(false);
    },
    onError: (e: any) => toast.error("Unable to appeal", { description: e?.message || "Try again." }),
  });

  const cancelAppealMutation = useMutation({
    mutationFn: async (appealId: string) => cancelReturnAppeal(returnId, appealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return", returnId] });
      toast.success("Appeal cancelled");
    },
    onError: (e: any) =>
      toast.error("Unable to cancel", { description: e?.message || "Try again." }),
  });

  const lastSubmittedAppeal = useMemo(() => {
    const r = row as ReturnRequest | null;
    const list = (r?.appeals ?? []).filter((a) => a.status === "Submitted");
    return list.length ? list[list.length - 1] : null;
  }, [row]);

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Loading return…</div>;
  }

  if (isError || !row) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold">Return not found</p>
        <Button asChild variant="outline">
          <Link href="/account/returns">Back to returns</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <Link
            href="/account/returns"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to returns
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-heading">{row.id}</h1>
            <Badge variant="outline">{row.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Order:{" "}
            <Link href={`/account/orders/${row.orderId}`} className="text-primary hover:underline font-medium">
              {row.orderId}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline">
            <Link href={`/account/orders/${row.orderId}`}>View order</Link>
          </Button>
          {canAppeal && (
            <Button onClick={openAppeal}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create appeal ({submittedAppealsCount}/2)
            </Button>
          )}
          {!canAppeal && row.status === "Rejected" && (
            <Button variant="outline" disabled>
              Appeals limit reached (2/2)
            </Button>
          )}
          {lastSubmittedAppeal && row.status === "Appealed" && (
            <Button
              variant="destructive"
              onClick={() => cancelAppealMutation.mutate(lastSubmittedAppeal.id)}
              disabled={cancelAppealMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel last appeal
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-md border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black">Return items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(row.items ?? []).map((it) => (
                <div key={it.id} className="flex items-center gap-3 border rounded-md p-3">
                  <div className="w-14 h-14 rounded-md overflow-hidden border bg-muted shrink-0">
                    <img
                      src={it.image || "/assets/products/placeholder.jpg"}
                      alt={it.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: <span className="font-medium text-foreground">{it.qty}</span>
                    </p>
                    {it.reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reason: <span className="text-foreground">{it.reason}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {!!row.requestImages?.length && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 inline-flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Attached images
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {row.requestImages.map((img) => (
                      <div key={img.name} className="border rounded-md overflow-hidden bg-muted">
                        <img src={img.dataUrl} alt={img.name} className="w-full h-28 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-md border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black">Appeals history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(row.appeals ?? []).length ? (
                (row.appeals ?? []).map((a) => (
                  <div key={a.id} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-medium text-sm">Appeal {a.id}</p>
                      <Badge variant="outline">{a.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.note}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Items in this appeal:{" "}
                      <span className="text-foreground font-medium">
                        {a.items.reduce((s, it) => s + (it.qty || 0), 0)}
                      </span>
                    </div>
                    {!!a.images?.length && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {a.images.map((img) => (
                          <div key={img.name} className="border rounded-md overflow-hidden bg-muted">
                            <img src={img.dataUrl} alt={img.name} className="w-full h-24 object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    {a.status === "Submitted" && (
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelAppealMutation.mutate(a.id)}
                          disabled={cancelAppealMutation.isPending}
                        >
                          Cancel appeal
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No appeals yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-md border-border shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black">Return info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <span className="text-muted-foreground">Order:</span>{" "}
                <span className="font-medium">{row.orderId}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Created:</span>{" "}
                <span className="font-medium">{row.date}</span>
              </p>
              {row.adminNote && (
                <div className="rounded-md border p-3 bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Admin note</p>
                  <p className="text-sm">{row.adminNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={appealOpen} onOpenChange={setAppealOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create an appeal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Choose items to appeal (you can remove items or reduce quantity)
              </p>
              <div className="space-y-2 max-h-[30vh] overflow-auto pr-1">
                {editItems.map((it, idx) => (
                  <div key={it.id} className="border rounded-md p-3 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={it.included}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditItems((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, included: checked } : p)),
                        );
                      }}
                    />
                    <div className="w-12 h-12 rounded-md overflow-hidden border bg-muted shrink-0">
                      <img src={it.image || "/assets/products/placeholder.jpg"} alt={it.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{it.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Max: {it.maxQty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setEditItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, qty: Math.max(1, p.qty - 1) } : p,
                            ),
                          )
                        }
                        disabled={!it.included || it.qty <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="w-[80px]"
                        value={it.qty}
                        min={1}
                        max={it.maxQty}
                        onChange={(e) => {
                          const next = Math.min(it.maxQty, Math.max(1, Number(e.target.value || 1)));
                          setEditItems((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, qty: next } : p)),
                          );
                        }}
                        disabled={!it.included}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setEditItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, qty: Math.min(p.maxQty, p.qty + 1) } : p,
                            ),
                          )
                        }
                        disabled={!it.included || it.qty >= it.maxQty}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Appeal note</p>
              <Textarea value={appealNote} onChange={(e) => setAppealNote(e.target.value)} placeholder="Explain what changed and provide extra details…" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Attach images (optional)</p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setAppealImages(Array.from(e.target.files ?? []))}
              />
              {!!appealImages.length && (
                <p className="text-xs text-muted-foreground">{appealImages.length} file(s) selected</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setAppealOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => appealMutation.mutate()} disabled={appealMutation.isPending}>
                Submit appeal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

