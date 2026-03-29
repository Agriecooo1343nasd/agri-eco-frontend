"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Ticket,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createDiscount,
  deleteDiscount,
  fetchAdminDiscounts,
  fetchDiscountStats,
  toggleDiscountStatus,
  updateDiscount,
  type AdminDiscount,
  type CreateDiscountPayload,
  type DiscountStatus,
  type DiscountType,
  type FetchAdminDiscountsParams,
  type UpdateDiscountPayload,
} from "@/lib/api/discounts";
import { toDisplayableMediaSrc } from "@/lib/media-url";

type FilterStatus = "all" | DiscountStatus;
type FilterType = "all" | DiscountType;

type DiscountFormState = {
  code: string;
  name: string;
  description: string;
  image: string;
  type: DiscountType;
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  perUserLimit: string;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
};

const PAGE_SIZE = 9;

const TYPE_LABELS: Record<DiscountType, string> = {
  percentage: "Percentage",
  fixed: "Fixed Amount",
  bogo: "BOGO",
  flash_sale: "Flash Sale",
};

const STATUS_COLORS: Record<DiscountStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  inactive: "bg-muted text-muted-foreground border-border",
  scheduled: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  expired: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

function getErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

function toDateTimeLocal(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value: string): string {
  return new Date(value).toISOString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatValue(type: DiscountType, value: number): string {
  if (type === "percentage" || type === "flash_sale" || type === "bogo") {
    return `${value}%`;
  }
  return formatCurrency(value);
}

function emptyForm(): DiscountFormState {
  const now = new Date();
  const later = new Date(now);
  later.setDate(later.getDate() + 7);

  return {
    code: "",
    name: "",
    description: "",
    image: "",
    type: "percentage",
    value: "",
    minOrderAmount: "0",
    maxDiscountAmount: "",
    usageLimit: "",
    perUserLimit: "1",
    startDate: toDateTimeLocal(now.toISOString()),
    endDate: toDateTimeLocal(later.toISOString()),
    status: "active",
  };
}

function formFromDiscount(discount: AdminDiscount): DiscountFormState {
  return {
    code: discount.code,
    name: discount.name,
    description: discount.description ?? "",
    image: discount.image ?? "",
    type: discount.type,
    value: String(discount.value),
    minOrderAmount: String(discount.minOrderAmount),
    maxDiscountAmount:
      typeof discount.maxDiscountAmount === "number"
        ? String(discount.maxDiscountAmount)
        : "",
    usageLimit: discount.usageLimit > 0 ? String(discount.usageLimit) : "",
    perUserLimit: String(discount.perUserLimit),
    startDate: toDateTimeLocal(discount.startDate),
    endDate: toDateTimeLocal(discount.endDate),
    status: discount.status,
  };
}

function RowSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export default function DiscountsPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<AdminDiscount | null>(
    null,
  );
  const [form, setForm] = useState<DiscountFormState>(emptyForm());

  const [deleteTarget, setDeleteTarget] = useState<AdminDiscount | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo<FetchAdminDiscountsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      sort: "createdAt",
      order: "desc",
    }),
    [page, debouncedSearch, statusFilter, typeFilter, fromDate, toDate],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-discounts", params],
    queryFn: () => fetchAdminDiscounts(params),
    placeholderData: (previousData) => previousData,
  });

  const { data: stats } = useQuery({
    queryKey: ["discount-stats"],
    queryFn: fetchDiscountStats,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateDiscountPayload) => createDiscount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-stats"] });
      toast.success("Discount created successfully");
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create discount"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateDiscountPayload;
    }) => updateDiscount(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-stats"] });
      toast.success("Discount updated successfully");
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update discount"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-stats"] });
      toast.success("Discount deleted successfully");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete discount"));
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleDiscountStatus(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["discount-stats"] });
      toast.success(
        updated.status === "active"
          ? "Discount activated"
          : "Discount deactivated",
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to toggle discount status"));
    },
  });

  const discounts = data?.data ?? [];
  const pagination = data?.pagination;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreateDialog() {
    setEditingDiscount(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(discount: AdminDiscount) {
    setEditingDiscount(discount);
    setForm(formFromDiscount(discount));
    setDialogOpen(true);
  }

  function validateForm(): boolean {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error("Code and name are required");
      return false;
    }

    const valueNum = Number(form.value);
    if (!(valueNum > 0)) {
      toast.error("Discount value must be a positive number");
      return false;
    }

    if (
      (form.type === "percentage" || form.type === "flash_sale") &&
      valueNum > 100
    ) {
      toast.error("Percentage discount cannot exceed 100%");
      return false;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Start date and end date are required");
      return false;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error("End date must be after start date");
      return false;
    }

    if (form.image.trim()) {
      try {
        new URL(form.image.trim());
      } catch {
        toast.error("Image URL must be a valid URL");
        return false;
      }
    }

    return true;
  }

  function buildCreatePayload(): CreateDiscountPayload {
    const payload: CreateDiscountPayload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount || 0),
      startDate: toIso(form.startDate),
      endDate: toIso(form.endDate),
      status: form.status,
    };

    if (form.maxDiscountAmount.trim()) {
      payload.maxDiscountAmount = Number(form.maxDiscountAmount);
    }
    if (form.usageLimit.trim()) {
      payload.usageLimit = Number(form.usageLimit);
    }
    if (form.perUserLimit.trim()) {
      payload.perUserLimit = Number(form.perUserLimit);
    }

    return payload;
  }

  function buildUpdatePayload(): UpdateDiscountPayload {
    const payload: UpdateDiscountPayload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      image: form.image.trim() || null,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount || 0),
      startDate: toIso(form.startDate),
      endDate: toIso(form.endDate),
      status: form.status,
      maxDiscountAmount: form.maxDiscountAmount.trim()
        ? Number(form.maxDiscountAmount)
        : null,
      usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : null,
      perUserLimit: form.perUserLimit.trim() ? Number(form.perUserLimit) : null,
    };

    return payload;
  }

  function handleSave() {
    if (!validateForm()) return;

    if (editingDiscount) {
      updateMutation.mutate({
        id: editingDiscount.id,
        payload: buildUpdatePayload(),
      });
      return;
    }

    createMutation.mutate(buildCreatePayload());
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Discounts & Deals
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Display, create, update and delete discount deals from backend data.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Discount
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active",
            value: stats?.active ?? 0,
            icon: CheckCircle2,
          },
          {
            label: "Scheduled",
            value: stats?.scheduled ?? 0,
            icon: Clock,
          },
          {
            label: "Expired",
            value: stats?.expired ?? 0,
            icon: AlertCircle,
          },
          {
            label: "Total Usage",
            value: stats?.totalUsage ?? 0,
            icon: Ticket,
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
              placeholder="Search by name or code"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as FilterStatus);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as FilterType);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="bogo">BOGO</SelectItem>
              <SelectItem value="flash_sale">Flash Sale</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <Card className="border-border border-dashed">
          <CardContent className="py-16 text-center">
            <Ticket className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-bold">No discounts found</p>
            <p className="text-sm text-muted-foreground">
              Adjust your filters or create a new discount.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => {
            const usagePercent =
              discount.usageLimit > 0
                ? Math.min(
                    100,
                    (discount.usageCount / discount.usageLimit) * 100,
                  )
                : 0;

            return (
              <Card
                key={discount.id}
                className="border-border overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="relative h-40 bg-muted/40">
                  {discount.image ? (
                    <img
                      src={toDisplayableMediaSrc(discount.image)}
                      alt={discount.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Ticket className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase",
                        STATUS_COLORS[discount.status],
                      )}
                    >
                      {discount.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase bg-white/90"
                    >
                      {TYPE_LABELS[discount.type]}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                      {discount.code}
                    </p>
                    <p className="text-white text-2xl font-black">
                      {formatValue(discount.type, discount.value)}
                    </p>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg leading-tight">
                    {discount.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 min-h-10">
                    {discount.description || "No description"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground uppercase font-bold tracking-wide">
                        Date Range
                      </p>
                      <p className="font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(
                          discount.startDate,
                        ).toLocaleDateString()} -{" "}
                        {new Date(discount.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase font-bold tracking-wide">
                        Min Order
                      </p>
                      <p className="font-semibold">
                        {formatCurrency(discount.minOrderAmount)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-semibold">
                        Usage
                      </span>
                      <span className="font-semibold">
                        {discount.usageCount}
                        {discount.usageLimit > 0
                          ? ` / ${discount.usageLimit}`
                          : " / Unlimited"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          usagePercent > 80 ? "bg-rose-500" : "bg-primary",
                        )}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(discount)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggleMutation.mutate(discount.id)}
                      disabled={toggleMutation.isPending}
                    >
                      <Power className="h-3.5 w-3.5 mr-1" />
                      {discount.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(discount)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-20 text-center text-sm font-medium">
              {pagination.page} / {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? "Edit Discount" : "Create New Discount"}
            </DialogTitle>
            <DialogDescription>
              Submit values in the backend format expected by `/discounts`.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 max-h-[65vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="SAVE25"
              />
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Summer Saving"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, type: v as DiscountType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="bogo">BOGO</SelectItem>
                  <SelectItem value="flash_sale">Flash Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Value *</Label>
              <Input
                type="number"
                min="0"
                value={form.value}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, value: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Min Order Amount</Label>
              <Input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minOrderAmount: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Max Discount Amount</Label>
              <Input
                type="number"
                min="0"
                value={form.maxDiscountAmount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maxDiscountAmount: e.target.value,
                  }))
                }
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, usageLimit: e.target.value }))
                }
                placeholder="Optional (0/unset = unlimited)"
              />
            </div>

            <div className="space-y-2">
              <Label>Per User Limit</Label>
              <Input
                type="number"
                min="1"
                value={form.perUserLimit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, perUserLimit: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, status: v as DiscountStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingDiscount ? (
                "Update Discount"
              ) : (
                "Create Discount"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discount?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {deleteTarget?.name ?? "this discount"}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
