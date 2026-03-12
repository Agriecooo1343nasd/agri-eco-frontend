"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";
import { blogPosts, blogCategories, type BlogPost } from "@/data/blog";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Newspaper,
  Upload,
  Image as ImageIcon,
  Film,
} from "lucide-react";

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("id") || undefined;

  const editingPost: BlogPost | undefined = useMemo(
    () => (editingId ? blogPosts.find((p) => p.id === editingId) : undefined),
    [editingId],
  );

  const [formTitle, setFormTitle] = useState<MultiLangValue>(emptyLangValue());
  const [formExcerpt, setFormExcerpt] =
    useState<MultiLangValue>(emptyLangValue());
  const [formContent, setFormContent] =
    useState<MultiLangValue>(emptyLangValue());
  const [formCategory, setFormCategory] = useState("Farming Tips");
  const [formAuthor, setFormAuthor] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("draft");
  const [formFeatured, setFormFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (editingPost) {
      setFormTitle(editingPost.title);
      setFormExcerpt(editingPost.excerpt);
      setFormContent(editingPost.content);
      setFormCategory(editingPost.category);
      setFormAuthor(editingPost.author);
      setFormTags(editingPost.tags.join(", "));
      setFormStatus(editingPost.status === "archived" ? "draft" : editingPost.status);
      setFormFeatured(editingPost.featured);
      setImageUrl(editingPost.image);
      setImagePreview(editingPost.image);
      setVideoUrl(editingPost.videoUrl || "");
    }
  }, [editingPost]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageUrl(result);
      setImagePreview(result);
      toast.success("Cover image attached");
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setVideoUrl(result);
      toast.success("Video attached");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formTitle.en.trim() || !formAuthor.trim()) {
      toast.error("Error", {
        description: "Title (EN) and Author are required",
      });
      return;
    }

    const baseImage = imageUrl || editingPost?.image || "/placeholder.svg";
    const words = formContent.en.trim().split(/\s+/).filter(Boolean);
    const readTime = Math.max(1, Math.ceil(words.length / 200));

    const newPost: BlogPost = {
      id: editingPost?.id || Date.now().toString(),
      title: formTitle,
      excerpt: formExcerpt,
      content: formContent,
      author: formAuthor,
      category: formCategory,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: baseImage,
      videoUrl: videoUrl || undefined,
      publishedAt: editingPost?.publishedAt ||
        new Date().toISOString().split("T")[0],
      readTime,
      status: formStatus,
      featured: formFeatured,
      authorAvatar: editingPost?.authorAvatar,
    };

    // NOTE: We only simulate saving here. The seed data remains static.
    console.debug("Blog post payload", newPost);

    toast.success(editingPost ? "Article updated (mock)" : "Article created (mock)", {
      description: "This demo updates only the current session.",
    });
    router.push("/admin/blog");
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push("/admin/blog")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Blog
          </Button>
          <h1 className="text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            {editingPost ? "Edit Article" : "Create New Article"}
          </h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            Configure the content and media for your blog article.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/blog")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
          >
            {editingPost ? "Update Article" : "Publish Article"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-black font-heading">
                Article Content
              </CardTitle>
              <CardDescription>
                These fields will appear on the public blog page.
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
                placeholder="Short description shown in the list"
                type="textarea"
                rows={2}
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
                Meta & Categorization
              </CardTitle>
              <CardDescription>
                Author, category, visibility and discoverability.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Author <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Author name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={formCategory}
                    onValueChange={setFormCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Tags (comma separated)
                </Label>
                <Input
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="organic, farming, tips"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={formStatus}
                    onValueChange={(v) => setFormStatus(v as any)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Featured</Label>
                  <Switch
                    checked={formFeatured}
                    onCheckedChange={setFormFeatured}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-lg font-black font-heading flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Media Attachments
              </CardTitle>
              <CardDescription>
                Cover image and an optional video to enrich the story.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    Cover Image
                  </Label>
                  <Input
                    placeholder="Paste image URL..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value || null);
                    }}
                  />
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/30 transition-all">
                    <span className="text-xs font-medium text-muted-foreground mb-1">
                      Or upload from device
                    </span>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFile}
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Film className="h-4 w-4 text-muted-foreground" />
                    Optional Video
                  </Label>
                  <Input
                    placeholder="Paste video URL or embed link..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/30 transition-all">
                    <span className="text-xs font-medium text-muted-foreground mb-1">
                      Or upload video file
                    </span>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoFile}
                    />
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="mt-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Live Cover Preview
                  </Label>
                  <div className="mt-2 rounded-xl overflow-hidden border border-border bg-muted">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side summary */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="p-6 border-b border-border">
              <CardTitle className="text-base font-black font-heading">
                At a glance
              </CardTitle>
              <CardDescription>
                Quick summary of what readers will see.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-muted relative">
                {imagePreview || imageUrl ? (
                  <img
                    src={imagePreview || imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/60 text-xs">
                    <ImageIcon className="h-6 w-6" />
                    No cover image yet
                  </div>
                )}
                {formCategory && (
                  <div className="absolute bottom-2 left-2 bg-background/90 text-xs px-2 py-1 rounded-md font-medium">
                    {formCategory}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Title
                </p>
                <p className="text-sm font-semibold line-clamp-2">
                  {formTitle.en || "Untitled article"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Author & status
                </p>
                <p className="text-xs text-muted-foreground">
                  {formAuthor || "No author set"} ·{" "}
                  {formStatus === "published" ? "Published" : "Draft"}
                  {formFeatured ? " · Featured" : ""}
                </p>
              </div>
              <Button
                type="button"
                onClick={handleSave}
              >
                {editingPost ? "Save Changes" : "Create Article"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

