"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createAuditLog,
  deleteAuditLog,
  fetchAdminAuditLogs,
  updateAuditLog,
  type AdminAuditLog,
  type CreateAuditLogPayload,
  type FetchAdminAuditLogsParams,
} from "@/lib/api/audit-logs";

type MetadataPair = { id: string; key: string; value: string };

type LogFormState = {
  action: string;
  entityType: string;
  entityId: string;
  metadataPairs: MetadataPair[];
  useAdvancedJson: boolean;
  metadataJson: string;
};

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string): string {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-RW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function newPairId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyPair(): MetadataPair {
  return { id: newPairId(), key: "", value: "" };
}

function pairsFromMetadata(
  meta: Record<string, unknown> | null | undefined,
): MetadataPair[] {
  if (!meta || typeof meta !== "object") return [emptyPair()];
  const keys = Object.keys(meta);
  if (keys.length === 0) return [emptyPair()];
  return keys.map((key) => {
    const raw = meta[key];
    let valueStr = "";
    if (raw === undefined || raw === null) valueStr = "";
    else if (typeof raw === "string") valueStr = raw;
    else valueStr = JSON.stringify(raw);
    return { id: newPairId(), key, value: valueStr };
  });
}

function metadataFromPairs(pairs: MetadataPair[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of pairs) {
    const k = p.key.trim();
    if (!k) continue;
    const v = p.value.trim();
    if (!v) {
      out[k] = "";
      continue;
    }
    if (v === "true") out[k] = true;
    else if (v === "false") out[k] = false;
    else if (/^-?\d+(\.\d+)?$/.test(v)) out[k] = Number(v);
    else if (
      (v.startsWith("{") && v.endsWith("}")) ||
      (v.startsWith("[") && v.endsWith("]"))
    ) {
      try {
        out[k] = JSON.parse(v) as unknown;
      } catch {
        out[k] = v;
      }
    } else out[k] = v;
  }
  return out;
}

function emptyForm(): LogFormState {
  return {
    action: "",
    entityType: "",
    entityId: "",
    metadataPairs: [emptyPair()],
    useAdvancedJson: false,
    metadataJson: "{}",
  };
}

function formFromLog(log: AdminAuditLog): LogFormState {
  return {
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId ?? "",
    metadataPairs: pairsFromMetadata(log.metadata ?? undefined),
    useAdvancedJson: false,
    metadataJson: JSON.stringify(log.metadata ?? {}, null, 2),
  };
}

function tryParseMetadata(
  json: string,
):
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; message: string } {
  if (!json.trim()) return { ok: true, value: {} };

  try {
    const parsed = JSON.parse(json);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return { ok: false, message: "Metadata must be a JSON object." };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, message: "Invalid JSON in metadata." };
  }
}

function buildCreatePayload(
  form: LogFormState,
):
  | { ok: true; payload: CreateAuditLogPayload }
  | { ok: false; message: string } {
  if (!form.action.trim() || form.action.trim().length < 2) {
    return { ok: false, message: "Action must be at least 2 characters." };
  }
  if (!form.entityType.trim() || form.entityType.trim().length < 2) {
    return { ok: false, message: "Entity type must be at least 2 characters." };
  }

  let metadata: Record<string, unknown> | undefined;

  if (form.useAdvancedJson) {
    const parsed = tryParseMetadata(form.metadataJson);
    if (!parsed.ok) return { ok: false, message: parsed.message };
    metadata =
      Object.keys(parsed.value).length > 0 ? parsed.value : undefined;
  } else {
    const built = metadataFromPairs(form.metadataPairs);
    metadata = Object.keys(built).length > 0 ? built : undefined;
  }

  const payload: CreateAuditLogPayload = {
    action: form.action.trim(),
    entityType: form.entityType.trim(),
    ...(form.entityId.trim() ? { entityId: form.entityId.trim() } : {}),
    ...(metadata ? { metadata } : {}),
  };

  return { ok: true, payload };
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <Skeleton className="h-5 w-36" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-44" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function AdminLogsPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "action" | "entityType">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<AdminAuditLog | null>(null);
  const [form, setForm] = useState<LogFormState>(emptyForm());

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAuditLog | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo<FetchAdminAuditLogsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      action: actionFilter || undefined,
      entityType: entityTypeFilter || undefined,
      sort: sortBy,
      order: sortOrder,
    }),
    [page, debouncedSearch, actionFilter, entityTypeFilter, sortBy, sortOrder],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", params],
    queryFn: () => fetchAdminAuditLogs(params),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAuditLogPayload) => createAuditLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      toast.success("Audit log created successfully");
      setDialogOpen(false);
      setEditingLog(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create audit log"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateAuditLogPayload;
    }) => updateAuditLog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      toast.success("Audit log updated");
      setDialogOpen(false);
      setEditingLog(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update audit log"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAuditLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
      toast.success("Audit log deleted");
      setDeleteTarget(null);
    },
    onError: (error) => {
      console.error(getErrorMessage(error, "Failed to delete audit log"));
    },
  });

  const savePending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const logs = useMemo(() => data?.data ?? [], [data?.data]);
  const pagination = data?.pagination;

  const uniqueActions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.action))).slice(0, 6),
    [logs],
  );

  const uniqueEntities = useMemo(
    () => Array.from(new Set(logs.map((log) => log.entityType))).slice(0, 6),
    [logs],
  );

  const totalLogs = pagination?.total ?? 0;

  function openCreateDialog() {
    setEditingLog(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openUpdateDialog(log: AdminAuditLog) {
    setEditingLog(log);
    setForm(formFromLog(log));
    setDialogOpen(true);
  }

  function handleSubmitDialog() {
    const built = buildCreatePayload(form);
    if (!built.ok) {
      toast.error(built.message);
      return;
    }

    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, payload: built.payload });
    } else {
      createMutation.mutate(built.payload);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track administrative activities with search, filters, and structured
            metadata.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Log
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{totalLogs}</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Action Types</p>
              <p className="text-2xl font-bold">{uniqueActions.length}</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Entity Types</p>
              <p className="text-2xl font-bold">{uniqueEntities.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
              <Filter className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Page</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-600">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            placeholder="Search by action, entity type, or entity ID"
          />
        </div>

        <Input
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter action"
        />

        <Input
          value={entityTypeFilter}
          onChange={(e) => {
            setEntityTypeFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter entity type"
        />

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value as typeof sortBy);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="entityType">Entity Type</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value as typeof sortOrder);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Desc</SelectItem>
              <SelectItem value="asc">Asc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-44">Action</TableHead>
                <TableHead className="min-w-32">Entity Type</TableHead>
                <TableHead className="min-w-32">Entity ID</TableHead>
                <TableHead className="min-w-24">Actor</TableHead>
                <TableHead className="min-w-52">Created</TableHead>
                <TableHead className="min-w-32 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton />
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-30" />
                      <p className="font-medium">No logs found</p>
                      <p className="text-sm">
                        Try changing filters or create a new audit log.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{log.action}</p>
                        {log.metadata && (
                          <Badge variant="secondary" className="text-[11px]">
                            metadata
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.entityType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-56 truncate">
                      {log.entityId || "-"}
                    </TableCell>
                    <TableCell>
                      {log.actorRole ? (
                        <Badge
                          className={cn(
                            "capitalize",
                            "bg-slate-500/10 text-slate-700 border border-slate-500/20",
                          )}
                        >
                          {log.actorRole}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openUpdateDialog(log)}
                          title="Edit log"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(log)}
                          title="Delete log"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.pages} · {pagination.total}{" "}
              logs
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((prev) => prev - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={!pagination.hasNext}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLog ? "Update Audit Log" : "Create Audit Log"}
            </DialogTitle>
            <DialogDescription>
              {editingLog
                ? "Adjust action, entity, or metadata. Actor and timestamps are unchanged."
                : "Add an audit entry with optional structured details (no raw JSON required)."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 max-h-[min(70vh,520px)] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  value={form.action}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, action: e.target.value }))
                  }
                  placeholder="e.g. manual_correction"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="entityType">Entity type</Label>
                <Input
                  id="entityType"
                  value={form.entityType}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, entityType: e.target.value }))
                  }
                  placeholder="e.g. order, product, booking"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="entityId">Entity ID (optional)</Label>
              <Input
                id="entityId"
                value={form.entityId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, entityId: e.target.value }))
                }
                placeholder="UUID or reference the admin relates this log to"
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Checkbox
                id="useAdvancedJson"
                checked={form.useAdvancedJson}
                onCheckedChange={(checked) => {
                  const on = checked === true;
                  setForm((prev) => {
                    if (on) {
                      return {
                        ...prev,
                        useAdvancedJson: true,
                        metadataJson: JSON.stringify(
                          metadataFromPairs(prev.metadataPairs),
                          null,
                          2,
                        ),
                      };
                    }
                    const parsed = tryParseMetadata(prev.metadataJson);
                    if (parsed.ok) {
                      return {
                        ...prev,
                        useAdvancedJson: false,
                        metadataPairs: pairsFromMetadata(parsed.value),
                      };
                    }
                    toast.error(
                      "Fix JSON before switching back to key–value fields.",
                    );
                    return prev;
                  });
                }}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="useAdvancedJson"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Edit metadata as raw JSON
                </Label>
                <p className="text-xs text-muted-foreground">
                  Leave off to use simple key–value rows below. Turn on only if
                  you need nested objects.
                </p>
              </div>
            </div>

            {form.useAdvancedJson ? (
              <div className="space-y-1.5">
                <Label htmlFor="metadata">Metadata (JSON object)</Label>
                <Textarea
                  id="metadata"
                  rows={10}
                  className="font-mono text-xs"
                  value={form.metadataJson}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metadataJson: e.target.value,
                    }))
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Label className="m-0">Extra details (optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 shrink-0"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        metadataPairs: [...prev.metadataPairs, emptyPair()],
                      }))
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add field
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Plain text stays as text. Whole numbers and decimals become
                  numbers; <code className="text-foreground">true</code> /{" "}
                  <code className="text-foreground">false</code> become
                  booleans. Put JSON objects or arrays in a value to store
                  structured data.
                </p>
                <div className="space-y-2">
                  {form.metadataPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="flex flex-col gap-2 sm:flex-row sm:items-start"
                    >
                      <Input
                        placeholder="Field name"
                        value={pair.key}
                        className="sm:max-w-[40%]"
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            metadataPairs: prev.metadataPairs.map((row) =>
                              row.id === pair.id
                                ? { ...row, key: v }
                                : row,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={pair.value}
                        className="min-w-0 flex-1"
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            metadataPairs: prev.metadataPairs.map((row) =>
                              row.id === pair.id
                                ? { ...row, value: v }
                                : row,
                            ),
                          }));
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={form.metadataPairs.length <= 1}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            metadataPairs: prev.metadataPairs.filter(
                              (row) => row.id !== pair.id,
                            ),
                          }))
                        }
                        title="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={savePending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDialog}
              disabled={savePending}
              className="gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingLog ? "Save changes" : "Create log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Full payload and actor context for the selected log entry.
            </DialogDescription>
          </DialogHeader>

          {selectedLog ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">Entity Type</p>
                  <p className="font-medium">{selectedLog.entityType}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">Entity ID</p>
                  <p className="font-mono text-xs break-all">
                    {selectedLog.entityId || "-"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">Actor User ID</p>
                  <p className="font-mono text-xs break-all">
                    {selectedLog.actorUserId || "-"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">Role</p>
                  <p>{selectedLog.actorRole || "-"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">IP Address</p>
                  <p>{selectedLog.ip || "-"}</p>
                </div>
                <div className="rounded-lg border p-3 md:col-span-2">
                  <p className="text-muted-foreground text-xs">User Agent</p>
                  <p className="break-all text-xs">
                    {selectedLog.userAgent || "-"}
                  </p>
                </div>
                <div className="rounded-lg border p-3 md:col-span-2">
                  <p className="text-muted-foreground text-xs">Created At</p>
                  <p>{formatDate(selectedLog.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Metadata</Label>
                <pre className="rounded-lg border bg-muted/40 p-3 text-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
                  {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this audit log?</AlertDialogTitle>
            <AlertDialogDescription>
              The entry for action &quot;{deleteTarget?.action}&quot; will be
              removed permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
