"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FolderTree,
  ImageIcon,
  Link as LinkIcon,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  toAbsoluteCategoryImage,
  updateAdminCategory,
  type AdminCategory,
  type UpsertCategoryPayload,
} from "@/lib/api/categories";

const ITEMS_PER_PAGE = 12;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type ImageMode = "url" | "upload";

type CategoryFormState = {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  parentId: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
};

const createEmptyForm = (): CategoryFormState => ({
  name: "",
  description: "",
  imageUrl: "",
  parentId: "none",
  isFeatured: false,
  isActive: true,
  sortOrder: "0",
});

const normalizeSearch = (value: string): string => value.trim();

const toFormState = (category: AdminCategory): CategoryFormState => ({
  id: category.id,
  name: category.name,
  description: category.description ?? "",
  imageUrl: category.image ?? "",
  parentId: category.parentId ?? "none",
  isFeatured: category.isFeatured,
  isActive: category.isActive,
  sortOrder: String(category.sortOrder ?? 0),
});

function buildPayload(form: CategoryFormState, imageMode: ImageMode) {
  const payload: UpsertCategoryPayload = {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    parentId: form.parentId !== "none" ? form.parentId : undefined,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    sortOrder: Number.parseInt(form.sortOrder || "0", 10) || 0,
  };

  if (imageMode === "url") {
    payload.image = form.imageUrl.trim() || "";
  }

  return payload;
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(createEmptyForm());
  const [imageMode, setImageMode] = useState<ImageMode>("url");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>("");
  const [categoryToDelete, setCategoryToDelete] =
    useState<AdminCategory | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(normalizeSearch(searchQuery));
      setPage(1);
    }, 300);

    return () => window.clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  const listQuery = useQuery({
    queryKey: ["admin-categories", page, debouncedSearch],
    queryFn: () =>
      fetchAdminCategories({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        sort: "name",
        order: "asc",
      }),
  });

  const parentOptionsQuery = useQuery({
    queryKey: ["admin-categories-parent-options"],
    queryFn: () =>
      fetchAdminCategories({
        page: 1,
        limit: 200,
        sort: "name",
        order: "asc",
      }),
  });

  const rows = listQuery.data?.data ?? [];
  const pagination =
    listQuery.data?.pagination ??
    ({
      total: 0,
      page: 1,
      pages: 1,
      limit: ITEMS_PER_PAGE,
      hasNext: false,
      hasPrev: false,
    } as const);

  const parentOptions = useMemo(
    () => parentOptionsQuery.data?.data ?? [],
    [parentOptionsQuery.data?.data],
  );

  const parentNameMap = useMemo(
    () =>
      new Map(parentOptions.map((category) => [category.id, category.name])),
    [parentOptions],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(form, imageMode);

      if (form.id) {
        return updateAdminCategory(
          form.id,
          payload,
          selectedImageFile ?? undefined,
        );
      }

      return createAdminCategory(payload, selectedImageFile ?? undefined);
    },
    onSuccess: (category) => {
      toast.success(form.id ? "Category updated" : "Category created", {
        description: `\"${category.name}\" has been saved successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-categories-parent-options"],
      });

      closeDialog();
    },
    onError: (error: Error) => {
      toast.error("Unable to save category", {
        description: error.message || "Please review the form and try again.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCategory(id),
    onSuccess: () => {
      toast.success("Category deleted", {
        description: `\"${categoryToDelete?.name}\" was removed successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-categories-parent-options"],
      });
      setCategoryToDelete(null);
    },
    onError: (error: Error) => {
      toast.error("Unable to delete category", {
        description:
          error.message || "This category may still be in use by products.",
      });
      setCategoryToDelete(null);
    },
  });

  function resetImageState() {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setSelectedImagePreview("");
    setSelectedImageFile(null);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setForm(createEmptyForm());
    setImageMode("url");
    resetImageState();
  }

  function openCreateDialog() {
    setForm(createEmptyForm());
    setImageMode("url");
    resetImageState();
    setIsDialogOpen(true);
  }

  function openEditDialog(category: AdminCategory) {
    setForm(toFormState(category));
    setImageMode("url");
    resetImageState();
    setIsDialogOpen(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload a valid image file.",
      });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image is too large", {
        description: "Maximum allowed image size is 5MB.",
      });
      return;
    }

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    const preview = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setSelectedImagePreview(preview);

    toast.success("Image ready", {
      description: "The image will be uploaded when you save the category.",
    });
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required", {
        description: "Please provide a category name.",
      });
      return;
    }

    saveMutation.mutate();
  }

  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const visibleParentOptions = parentOptions.filter(
    (category) => category.id !== form.id,
  );

  const displayImage = (category: AdminCategory) =>
    toAbsoluteCategoryImage(category.image);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Taxonomy & Categories
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Manage category creation, updates, discovery, and cleanup.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-5 w-5" /> Add Category
        </Button>
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="group relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all group-focus-within:text-primary" />
          <Input
            placeholder="Search by category name or description..."
            className="h-12 border-none bg-muted/20 pl-12 font-semibold transition-all focus:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[100px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Image
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Category Info
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Products
                </TableHead>
                <TableHead className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-[100px] px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((category) => (
                  <TableRow
                    key={category.id}
                    className="group border-border transition-colors hover:bg-muted/5"
                  >
                    <TableCell className="px-8 py-5">
                      <div className="h-16 w-16 overflow-hidden rounded-md border border-border bg-muted/20">
                        {category.image ? (
                          <img
                            src={displayImage(category)}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-heading text-lg font-black leading-tight text-foreground">
                          {category.name}
                        </span>
                        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          /{category.slug}
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {category.parentId && (
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase"
                            >
                              Parent:{" "}
                              {parentNameMap.get(category.parentId) ??
                                "Unknown"}
                            </Badge>
                          )}
                          {category.isFeatured && (
                            <Badge className="bg-primary/10 text-[9px] uppercase text-primary shadow-none">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md px-6 py-5">
                      <p className="line-clamp-2 text-sm italic leading-relaxed text-muted-foreground">
                        {category.description || "No description provided."}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-1.5 text-foreground">
                        <Package className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-black tracking-tight">
                          {category.productCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center">
                      <Badge
                        className={
                          category.isActive
                            ? "bg-primary/10 text-primary shadow-none"
                            : "bg-destructive/10 text-destructive shadow-none"
                        }
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-10 w-10 rounded-xl p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[180px] rounded-md border-border p-2"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-xl px-3 py-2.5 font-bold focus:bg-primary/10 focus:text-primary"
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-xl px-3 py-2.5 font-bold text-rose-600 focus:bg-rose-50"
                            onClick={() => setCategoryToDelete(category)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs font-medium text-muted-foreground">
          Showing page {pagination.page} of {pagination.pages} (
          {pagination.total} total categories)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!pagination.hasPrev || listQuery.isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!pagination.hasNext || listQuery.isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {listQuery.isError && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          Failed to load categories. Please refresh or verify your admin
          authorization.
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
            return;
          }
          setIsDialogOpen(true);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md border-none p-0 shadow-2xl sm:max-w-[560px]">
          <div className="relative bg-primary p-8 text-white">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full text-white hover:bg-white/10"
              onClick={closeDialog}
              disabled={isSaving}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-white/20 shadow-lg shadow-white/10">
              <FolderTree className="h-6 w-6 text-white" />
            </div>
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="font-heading text-3xl font-black leading-tight">
                {form.id ? "Modify Category" : "New Category"}
              </DialogTitle>
              <DialogDescription className="font-medium text-white/70">
                Create and maintain category metadata with optional image
                upload.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 p-8">
            <div className="space-y-2">
              <label className="pl-1 text-xs font-black uppercase tracking-widest text-muted-foreground">
                Name*
              </label>
              <Input
                placeholder="e.g. Organic Fruits"
                className="h-11 rounded-xl border-border font-semibold"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label className="pl-1 text-xs font-black uppercase tracking-widest text-muted-foreground">
                Description
              </label>
              <Textarea
                placeholder="What defines this category?"
                className="min-h-[90px] rounded-xl border-border font-medium"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="pl-1 text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Parent Category
                </label>
                <Select
                  value={form.parentId}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, parentId: value }))
                  }
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="None (Top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-level)</SelectItem>
                    {visibleParentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="pl-1 text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Sort Order
                </label>
                <Input
                  type="number"
                  min={0}
                  className="h-11 rounded-xl border-border"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                  }
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span className="text-sm font-semibold">Active</span>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isActive: checked }))
                  }
                  disabled={isSaving}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
                <span className="text-sm font-semibold">Featured</span>
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isFeatured: checked }))
                  }
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Cover Image
                </label>
                <div className="flex items-center rounded-lg bg-muted p-1">
                  <Button
                    type="button"
                    variant={imageMode === "url" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 rounded-md text-[10px] font-black uppercase"
                    onClick={() => {
                      setImageMode("url");
                      resetImageState();
                    }}
                    disabled={isSaving}
                  >
                    <LinkIcon className="mr-1 h-3 w-3" /> URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageMode === "upload" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 rounded-md text-[10px] font-black uppercase"
                    onClick={() => {
                      setImageMode("upload");
                    }}
                    disabled={isSaving}
                  >
                    <Upload className="mr-1 h-3 w-3" /> Upload
                  </Button>
                </div>
              </div>

              {imageMode === "url" ? (
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Paste image URL here..."
                    className="h-11 rounded-xl border-border pl-10"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                    }
                    disabled={isSaving}
                  />
                </div>
              ) : (
                <div className="relative">
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/10 transition-all hover:border-primary/50 hover:bg-muted/30">
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      {selectedImagePreview ? (
                        <div className="mb-2 h-20 w-20 overflow-hidden rounded-xl">
                          <img
                            src={selectedImagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                      )}
                      <p className="text-xs font-bold text-muted-foreground">
                        Click to upload image (max 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isSaving}
                    />
                  </label>
                </div>
              )}

              {(selectedImagePreview || form.imageUrl) && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Current preview:
                  </span>
                  <div className="h-20 w-20 overflow-hidden rounded-md border border-border">
                    <img
                      src={
                        selectedImagePreview ||
                        toAbsoluteCategoryImage(form.imageUrl)
                      }
                      alt="Category preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-0 gap-3 border-t border-border bg-muted/5 p-6 sm:justify-end">
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : form.id
                  ? "Update Category"
                  : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={categoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete
              <span className="font-semibold text-foreground">
                {` ${categoryToDelete?.name ?? "this category"}`}
              </span>
              . If products are still linked to it, the backend will block this
              deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => {
                if (categoryToDelete) {
                  deleteMutation.mutate(categoryToDelete.id);
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
