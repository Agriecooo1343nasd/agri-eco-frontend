"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createDeliveryZone,
  deleteDeliveryZone,
  fetchAdminDeliveryZones,
  updateDeliveryZone,
  type CreateDeliveryZonePayload,
  type DeliveryZone,
  type FetchAdminDeliveryZonesParams,
  type UpdateDeliveryZonePayload,
} from "@/lib/api/delivery-zones";

// ─── constants ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ─── helpers ───────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

type JsonParseResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

function tryParseJson(str: string): JsonParseResult {
  try {
    const parsed = JSON.parse(str);
    if (
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      parsed === null
    ) {
      return {
        ok: false,
        error: "Must be a JSON object (not an array or null)",
      };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, error: "Invalid JSON syntax" };
  }
}

// ─── form types ────────────────────────────────────────────────────────────

type ZoneFormState = {
  name: string;
  code: string;
  isActive: boolean;
  minDeliveryHours: string;
  maxDeliveryHours: string;
  feeRwf: string;
  freeFromRwf: string;
  coverageJson: string;
};

type FormErrors = Partial<Record<keyof ZoneFormState, string>>;

function emptyForm(): ZoneFormState {
  return {
    name: "",
    code: "",
    isActive: true,
    minDeliveryHours: "4",
    maxDeliveryHours: "48",
    feeRwf: "0",
    freeFromRwf: "0",
    coverageJson: "{}",
  };
}

function formFromZone(zone: DeliveryZone): ZoneFormState {
  return {
    name: zone.name,
    code: zone.code,
    isActive: zone.isActive,
    minDeliveryHours: String(zone.minDeliveryHours),
    maxDeliveryHours: String(zone.maxDeliveryHours),
    feeRwf: String(zone.feeRwf),
    freeFromRwf: String(zone.freeFromRwf),
    coverageJson: JSON.stringify(zone.coverage ?? {}, null, 2),
  };
}

function validateForm(form: ZoneFormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (form.name.trim().length > 120) {
    errors.name = "Name must be 120 characters or fewer";
  }

  if (!form.code.trim() || form.code.trim().length < 2) {
    errors.code = "Code must be at least 2 characters";
  } else if (form.code.trim().length > 50) {
    errors.code = "Code must be 50 characters or fewer";
  }

  const minHours = Number(form.minDeliveryHours);
  const maxHours = Number(form.maxDeliveryHours);

  if (!Number.isInteger(minHours) || minHours < 1) {
    errors.minDeliveryHours = "Must be a whole number ≥ 1";
  }
  if (!Number.isInteger(maxHours) || maxHours < 1) {
    errors.maxDeliveryHours = "Must be a whole number ≥ 1";
  }
  if (
    Number.isInteger(minHours) &&
    Number.isInteger(maxHours) &&
    minHours >= maxHours
  ) {
    errors.maxDeliveryHours = "Maximum must be greater than minimum";
  }

  const fee = Number(form.feeRwf);
  if (isNaN(fee) || fee < 0) {
    errors.feeRwf = "Fee must be 0 or greater";
  }

  const freeFrom = Number(form.freeFromRwf);
  if (isNaN(freeFrom) || freeFrom < 0) {
    errors.freeFromRwf = "Threshold must be 0 or greater";
  }

  const jsonResult = tryParseJson(form.coverageJson);
  if (!jsonResult.ok) {
    errors.coverageJson = jsonResult.error;
  }

  return errors;
}

function buildPayload(form: ZoneFormState): CreateDeliveryZonePayload {
  const coverage = tryParseJson(form.coverageJson);
  return {
    name: form.name.trim(),
    code: form.code.trim(),
    isActive: form.isActive,
    minDeliveryHours: parseInt(form.minDeliveryHours, 10),
    maxDeliveryHours: parseInt(form.maxDeliveryHours, 10),
    feeRwf: parseFloat(form.feeRwf) || 0,
    freeFromRwf: parseFloat(form.freeFromRwf) || 0,
    coverage: coverage.ok ? coverage.value : {},
  };
}

// ─── sub-components ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-1.5">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconClass: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm text-muted-foreground font-medium truncate">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground truncate">{sub}</p>
            )}
          </div>
          <div className={cn("p-2.5 rounded-xl shrink-0", iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── main component ────────────────────────────────────────────────────────

export default function DeliveryZonesPage() {
  const queryClient = useQueryClient();

  // Filters & pagination
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "feeRwf" | "createdAt">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState<ZoneFormState>(emptyForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // List query
  const params = useMemo<FetchAdminDeliveryZonesParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sort: sortBy,
      order: sortOrder,
    }),
    [page, debouncedSearch, sortBy, sortOrder],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-delivery-zones", params],
    queryFn: () => fetchAdminDeliveryZones(params),
    placeholderData: (prev) => prev,
  });

  // Stats query — fetch all zones to compute counts & avg fee
  const { data: allData } = useQuery({
    queryKey: ["admin-delivery-zones-all"],
    queryFn: () =>
      fetchAdminDeliveryZones({ limit: 500, sort: "createdAt", order: "desc" }),
    staleTime: 30_000,
  });

  const totalZones = allData?.pagination.total ?? 0;
  const activeCount = allData?.data.filter((z) => z.isActive).length ?? 0;
  const inactiveCount = allData?.data.filter((z) => !z.isActive).length ?? 0;
  const avgFee = allData?.data.length
    ? allData.data.reduce((sum, z) => sum + z.feeRwf, 0) / allData.data.length
    : 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: CreateDeliveryZonePayload) =>
      createDeliveryZone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("Delivery zone created successfully");
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create delivery zone"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDeliveryZonePayload;
    }) => updateDeliveryZone(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("Delivery zone updated successfully");
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update delivery zone"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDeliveryZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("Delivery zone deleted");
      setDeleteTarget(null);
    },
    onError: (error) => {
      console.error(getErrorMessage(error, "Failed to delete delivery zone"));
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateDeliveryZone(id, { isActive }),
    onSuccess: (zone) => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success(zone.isActive ? "Zone activated" : "Zone deactivated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update zone status"));
    },
  });

  // Dialog handlers
  function openCreateDialog() {
    setEditingZone(null);
    setForm(emptyForm());
    setFormErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(zone: DeliveryZone) {
    setEditingZone(zone);
    setForm(formFromZone(zone));
    setFormErrors({});
    setDialogOpen(true);
  }

  function setField<K extends keyof ZoneFormState>(
    key: K,
    value: ZoneFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleSubmit() {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const payload = buildPayload(form);
    if (editingZone) {
      updateMutation.mutate({ id: editingZone.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const zones = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Delivery Zones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage coverage areas, delivery fees, and time windows for customer
            orders.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Zone
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={Truck}
          label="Total Zones"
          value={totalZones}
          iconClass="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active"
          value={activeCount}
          sub="Visible to customers"
          iconClass="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          icon={XCircle}
          label="Inactive"
          value={inactiveCount}
          sub="Hidden from checkout"
          iconClass="bg-rose-500/10 text-rose-600"
        />
        <StatCard
          icon={Tag}
          label="Avg. Delivery Fee"
          value={formatCurrency(Math.round(avgFee))}
          sub="Across all zones"
          iconClass="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or code…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v as typeof sortBy);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="feeRwf">Delivery Fee</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(v) => {
            setSortOrder(v as typeof sortOrder);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-52">Zone</TableHead>
                <TableHead className="min-w-28">Status</TableHead>
                <TableHead className="min-w-32">Delivery Window</TableHead>
                <TableHead className="min-w-32">Delivery Fee</TableHead>
                <TableHead className="min-w-36">Free Delivery From</TableHead>
                <TableHead className="min-w-28">Created</TableHead>
                <TableHead className="w-24 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <MapPin className="h-10 w-10 opacity-25" />
                      <div className="space-y-1">
                        <p className="font-medium">No delivery zones found</p>
                        <p className="text-sm">
                          {debouncedSearch
                            ? "Try a different search term."
                            : "Create your first delivery zone to get started."}
                        </p>
                      </div>
                      {!debouncedSearch && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openCreateDialog}
                          className="gap-2 mt-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Create Zone
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone.id} className="group">
                    {/* Zone name + code */}
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm leading-tight">
                          {zone.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs px-1.5 py-0 h-5"
                        >
                          {zone.code}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Status toggle */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={zone.isActive}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({
                              id: zone.id,
                              isActive: checked,
                            })
                          }
                          disabled={toggleMutation.isPending}
                          aria-label={`Toggle ${zone.name}`}
                          className="scale-90"
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            zone.isActive
                              ? "text-emerald-600"
                              : "text-muted-foreground",
                          )}
                        >
                          {zone.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Delivery window */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {zone.minDeliveryHours}–{zone.maxDeliveryHours}h
                        </span>
                      </div>
                    </TableCell>

                    {/* Fee */}
                    <TableCell>
                      {zone.feeRwf === 0 ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/10 font-medium">
                          Free
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(zone.feeRwf)}
                        </span>
                      )}
                    </TableCell>

                    {/* Free from */}
                    <TableCell>
                      {zone.freeFromRwf === 0 ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <span className="text-sm tabular-nums">
                          ≥&nbsp;{formatCurrency(zone.freeFromRwf)}
                        </span>
                      )}
                    </TableCell>

                    {/* Created */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(zone.createdAt)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(zone)}
                          aria-label={`Edit ${zone.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(zone)}
                          aria-label={`Delete ${zone.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col gap-2 px-4 py-3 border-t border-border sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.pages} &middot;{" "}
              {pagination.total} zone
              {pagination.total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrev}
                className="gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Create / Edit Dialog ── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !isPending && setDialogOpen(open)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "Edit Delivery Zone" : "Create Delivery Zone"}
            </DialogTitle>
            <DialogDescription>
              {editingZone
                ? "Update the details of this delivery zone. Changes apply immediately."
                : "Define a new delivery area with its fee, time window, and coverage."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* Name & Code */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dz-name">
                  Zone Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dz-name"
                  placeholder="e.g. Kigali Central"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={cn(formErrors.name && "border-destructive")}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dz-code">
                  Zone Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dz-code"
                  placeholder="e.g. KGL-C"
                  value={form.code}
                  onChange={(e) =>
                    setField("code", e.target.value.toUpperCase())
                  }
                  className={cn(
                    "font-mono",
                    formErrors.code && "border-destructive",
                  )}
                />
                {formErrors.code ? (
                  <p className="text-xs text-destructive">{formErrors.code}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Unique identifier slug (auto-uppercased)
                  </p>
                )}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="dz-active"
                  className="text-sm font-medium cursor-pointer"
                >
                  Active Zone
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive zones are hidden from customers and checkout.
                </p>
              </div>
              <Switch
                id="dz-active"
                checked={form.isActive}
                onCheckedChange={(v) => setField("isActive", v)}
              />
            </div>

            {/* Delivery time window */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium leading-none">
                Delivery Time Window
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dz-min-hours"
                    className="text-xs text-muted-foreground"
                  >
                    Minimum Hours
                  </Label>
                  <Input
                    id="dz-min-hours"
                    type="number"
                    min={1}
                    placeholder="4"
                    value={form.minDeliveryHours}
                    onChange={(e) =>
                      setField("minDeliveryHours", e.target.value)
                    }
                    className={cn(
                      formErrors.minDeliveryHours && "border-destructive",
                    )}
                  />
                  {formErrors.minDeliveryHours && (
                    <p className="text-xs text-destructive">
                      {formErrors.minDeliveryHours}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dz-max-hours"
                    className="text-xs text-muted-foreground"
                  >
                    Maximum Hours
                  </Label>
                  <Input
                    id="dz-max-hours"
                    type="number"
                    min={1}
                    placeholder="48"
                    value={form.maxDeliveryHours}
                    onChange={(e) =>
                      setField("maxDeliveryHours", e.target.value)
                    }
                    className={cn(
                      formErrors.maxDeliveryHours && "border-destructive",
                    )}
                  />
                  {formErrors.maxDeliveryHours && (
                    <p className="text-xs text-destructive">
                      {formErrors.maxDeliveryHours}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Pricing */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium leading-none">
                Pricing (RWF)
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dz-fee"
                    className="text-xs text-muted-foreground"
                  >
                    Delivery Fee
                  </Label>
                  <Input
                    id="dz-fee"
                    type="number"
                    min={0}
                    step={100}
                    placeholder="1500"
                    value={form.feeRwf}
                    onChange={(e) => setField("feeRwf", e.target.value)}
                    className={cn(formErrors.feeRwf && "border-destructive")}
                  />
                  {formErrors.feeRwf ? (
                    <p className="text-xs text-destructive">
                      {formErrors.feeRwf}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Set 0 for always-free delivery
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dz-free-from"
                    className="text-xs text-muted-foreground"
                  >
                    Free Delivery From
                  </Label>
                  <Input
                    id="dz-free-from"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="25000"
                    value={form.freeFromRwf}
                    onChange={(e) => setField("freeFromRwf", e.target.value)}
                    className={cn(
                      formErrors.freeFromRwf && "border-destructive",
                    )}
                  />
                  {formErrors.freeFromRwf ? (
                    <p className="text-xs text-destructive">
                      {formErrors.freeFromRwf}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Min. order amount for free delivery (0 = disabled)
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Coverage JSON */}
            <div className="space-y-1.5">
              <Label htmlFor="dz-coverage" className="text-sm font-medium">
                Coverage Data{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (JSON, optional)
                </span>
              </Label>
              <Textarea
                id="dz-coverage"
                rows={5}
                placeholder="{}"
                value={form.coverageJson}
                onChange={(e) => setField("coverageJson", e.target.value)}
                className={cn(
                  "font-mono text-xs resize-none",
                  formErrors.coverageJson && "border-destructive",
                )}
              />
              {formErrors.coverageJson ? (
                <p className="text-xs text-destructive">
                  {formErrors.coverageJson}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Arbitrary JSON for geographic data (districts, coordinates,
                  etc.). Leave as{" "}
                  <code className="bg-muted px-1 rounded">{"{}"}</code> if not
                  needed.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="gap-2 min-w-28"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingZone ? "Save Changes" : "Create Zone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Delivery Zone?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">{deleteTarget?.name}</span>{" "}
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                {deleteTarget?.code}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete Zone
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
