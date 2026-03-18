"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Newspaper,
  Upload,
  Image as ImageIcon,
  Loader2,
  CalendarClock,
  Tag,
} from "lucide-react";
import {
  createCmsPage,
  fetchAdminCmsPageById,
  updateCmsPage,
  type CmsPageType,
  type CmsStatus,
  type MultiLangText,
  type UpsertCmsPagePayload,
} from "@/lib/api/cms";
import { fetchAdminCategories } from "@/lib/api/categories";
import { uploadSingleImage } from "@/lib/api/uploads";

function toIsoFromDateTimeLocal(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toDateTimeLocal(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toCmsMultiLang(value: MultiLangValue): MultiLangText {
  const en = value.en.trim();
  return {
    en,
    ...(value.rw.trim() ? { rw: value.rw.trim() } : {}),
    ...(value.fr.trim() ? { fr: value.fr.trim() } : {}),
    ...(value.sw.trim() ? { sw: value.sw.trim() } : {}),
  };
}

function toAbsoluteImage(url?: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id") || undefined;
  const isEditing = Boolean(editingId);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formTitle, setFormTitle] = useState<MultiLangValue>(emptyLangValue());
  const [formExcerpt, setFormExcerpt] =
    useState<MultiLangValue>(emptyLangValue());
  const [formContent, setFormContent] =
    useState<MultiLangValue>(emptyLangValue());
  const [formPageType, setFormPageType] = useState<CmsPageType>("blog");
  const [formStatus, setFormStatus] = useState<CmsStatus>("draft");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState<string>("none");
  const [formTags, setFormTags] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formScheduledAt, setFormScheduledAt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hydratedFromEdit, setHydratedFromEdit] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories", "cms-form"],
    queryFn: () =>
      fetchAdminCategories({ page: 1, limit: 100, isActive: "true" }),
  });

  const { data: editingPost, isLoading: loadingPost } = useQuery({
    queryKey: ["cms-page", editingId],
    queryFn: () => fetchAdminCmsPageById(editingId as string),
    enabled: !!editingId,
  });

  useEffect(() => {
    if (!editingPost || hydratedFromEdit) return;
    setFormTitle({
      en: editingPost.title.en ?? "",
      rw: editingPost.title.rw ?? "",
      fr: editingPost.title.fr ?? "",
      sw: editingPost.title.sw ?? "",
    });
    setFormExcerpt({
      en: editingPost.excerpt?.en ?? "",
      rw: editingPost.excerpt?.rw ?? "",
      fr: editingPost.excerpt?.fr ?? "",
      sw: editingPost.excerpt?.sw ?? "",
    });
    setFormContent({
      en: editingPost.content.en ?? "",
      rw: editingPost.content.rw ?? "",
      fr: editingPost.content.fr ?? "",
      sw: editingPost.content.sw ?? "",
    });
    setFormPageType(editingPost.pageType);
    setFormStatus(editingPost.status);
    setFormFeatured(editingPost.featured);
    setFormCategoryId(editingPost.categoryId ?? "none");
    setFormTags(editingPost.tags.join(", "));
    setFormCoverImage(editingPost.coverImage ?? "");
    setFormScheduledAt(toDateTimeLocal(editingPost.scheduledAt));
    setHydratedFromEdit(true);
  }, [editingPost, hydratedFromEdit]);

  const saveMutation = useMutation({
    mutationFn: async (payload: UpsertCmsPagePayload) => {
      if (editingId) {
        return updateCmsPage(editingId, payload);
      }
      return createCmsPage(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cms-pages"] });
      queryClient.invalidateQueries({ queryKey: ["cms-stats"] });
      queryClient.invalidateQueries({ queryKey: ["cms-page", editingId] });
      toast.success(isEditing ? "Article updated" : "Article created");
      router.push("/admin/blog");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to save article";
      toast.error(message);
    },
  });

  const tagsArray = useMemo(
    () =>
      formTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [formTags],
  );

  const previewTitle = formTitle.en.trim() || "Untitled article";
  const previewExcerpt = formExcerpt.en.trim() || "No excerpt yet.";

  async function handleUploadImage(file?: File) {
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploaded = await uploadSingleImage(file);
      setFormCoverImage(uploaded.path);
      toast.success("Cover image uploaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed";
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  }

  function validateForm(): boolean {
    if (!formTitle.en.trim()) {
      toast.error("Title (English) is required");
      return false;
    }
    if (!formContent.en.trim()) {
      toast.error("Content (English) is required");
      return false;
    }
    if (formStatus !== "draft" && formScheduledAt) {
      toast.error("Scheduled date is only allowed when status is Draft");
      return false;
    }
    return true;
  }

  function handleSave() {
    if (!validateForm()) return;

    const title = toCmsMultiLang(formTitle);
    const content = toCmsMultiLang(formContent);
    const excerptValue = toCmsMultiLang(formExcerpt);
    const hasExcerpt = Object.values(excerptValue).some(
      (v) => v?.trim().length > 0,
    );

    const payload: UpsertCmsPagePayload = {
      title,
      content,
      excerpt: hasExcerpt ? excerptValue : undefined,
      pageType: formPageType,
      status: formStatus,
      tags: tagsArray,
      featured: formFeatured,
      coverImage: formCoverImage.trim() || undefined,
      categoryId: formCategoryId !== "none" ? formCategoryId : undefined,
      scheduledAt:
        formStatus === "draft"
          ? toIsoFromDateTimeLocal(formScheduledAt)
          : undefined,
    };

    saveMutation.mutate(payload);
  }

  if (isEditing && loadingPost) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading article...
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-32 rounded-md bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="px-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Blog
          </Button>
          <h1 className="text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            {isEditing ? "Edit Article" : "Create New Article"}
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Use multilingual content fields and publish workflow controls.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/blog")}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Update Article"
            ) : (
              "Create Article"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-black font-heading">
                Article Content
              </CardTitle>
              <CardDescription>
                English is required. Other language fields are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <MultiLangInput
                label="Title"
                value={formTitle}
                onChange={setFormTitle}
                placeholder="Article title"
                required
              />
              <MultiLangInput
                label="Excerpt"
                value={formExcerpt}
                onChange={setFormExcerpt}
                placeholder="Short description"
                type="textarea"
                rows={3}
              />
              <MultiLangInput
                label="Content"
                value={formContent}
                onChange={setFormContent}
                placeholder="Full article content"
                type="textarea"
                rows={10}
                required
              />
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-black font-heading">
                Meta & Publishing
              </CardTitle>
              <CardDescription>
                Category, status, type and scheduling controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Type</Label>
                  <Select
                    value={formPageType}
                    onValueChange={(v) => setFormPageType(v as CmsPageType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formStatus}
                    onValueChange={(v) => setFormStatus(v as CmsStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formCategoryId}
                    onValueChange={setFormCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {(categoriesData?.data ?? []).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                    Scheduled At (draft only)
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formScheduledAt}
                    onChange={(e) => setFormScheduledAt(e.target.value)}
                    disabled={formStatus !== "draft"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  Tags (comma separated)
                </Label>
                <Input
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="organic, farming, tips"
                />
                {tagsArray.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tagsArray.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formFeatured}
                  onCheckedChange={setFormFeatured}
                />
                <Label className="cursor-pointer">Mark as featured</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-black font-heading flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Cover Image
              </CardTitle>
              <CardDescription>
                Upload an image or paste a URL. Video fields are not available
                in the backend CMS model.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Input
                placeholder="Paste image URL or /uploads path"
                value={formCoverImage}
                onChange={(e) => setFormCoverImage(e.target.value)}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUploadImage(e.target.files?.[0])}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload from device
                  </>
                )}
              </Button>

              {formCoverImage && (
                <div className="rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={toAbsoluteImage(formCoverImage)}
                    alt="Cover preview"
                    className="w-full h-56 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-base font-black font-heading">
                Live Summary
              </CardTitle>
              <CardDescription>
                Read-only preview of the outbound payload.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-muted relative">
                {formCoverImage ? (
                  <img
                    src={toAbsoluteImage(formCoverImage)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground/60 text-xs">
                    <ImageIcon className="h-6 w-6 mr-2" />
                    No cover image
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Title
                </p>
                <p className="text-sm font-semibold line-clamp-2">
                  {previewTitle}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Excerpt
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {previewExcerpt}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Status & type
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {formStatus} · {formPageType}
                  {formFeatured ? " · featured" : ""}
                </p>
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                {isEditing ? "Save Changes" : "Create Article"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
