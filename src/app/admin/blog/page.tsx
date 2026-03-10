"use client";

import { useState } from "react";
import { blogPosts, blogCategories, type BlogPost } from "@/data/blog";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
  getML,
} from "@/components/admin/MultiLangInput";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Newspaper, Plus, Edit, Trash2, Search } from "lucide-react";

const statusColors: Record<string, string> = {
  published: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export default function BlogManagementPage() {
  const [posts, setPosts] = useState(blogPosts);
  const [showEditor, setShowEditor] = useState(false);
  const [search, setSearch] = useState("");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form state
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

  const openNew = () => {
    setEditingPost(null);
    setFormTitle(emptyLangValue());
    setFormExcerpt(emptyLangValue());
    setFormContent(emptyLangValue());
    setFormCategory("Farming Tips");
    setFormAuthor("");
    setFormTags("");
    setFormStatus("draft");
    setFormFeatured(false);
    setShowEditor(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormCategory(post.category);
    setFormAuthor(post.author);
    setFormTags(post.tags.join(", "));
    setFormStatus(post.status === "archived" ? "draft" : post.status);
    setFormFeatured(post.featured);
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!formTitle.en.trim() || !formAuthor.trim()) {
      toast.error("Error", {
        description: "Title (EN) and Author are required",
      });
      return;
    }
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
      image: editingPost?.image || "/placeholder.svg",
      publishedAt: new Date().toISOString().split("T")[0],
      readTime: Math.ceil(formContent.en.split(" ").length / 200) || 3,
      status: formStatus,
      featured: formFeatured,
    };

    if (editingPost) {
      setPosts(posts.map((p) => (p.id === editingPost.id ? newPost : p)));
    } else {
      setPosts([newPost, ...posts]);
    }
    setShowEditor(false);
    toast.success(editingPost ? "Post updated" : "Post created");
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
    toast.success("Post deleted");
  };

  const filtered = posts.filter(
    (p) =>
      getML(p.title, "en").toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Blog Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {posts.length} articles total
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={post.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground line-clamp-1">
                          {getML(post.title, "en")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {post.publishedAt} · {post.readTime} min
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {post.author}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-[10px]">
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusColors[post.status]}`}
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEdit(post)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Editor dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Article" : "New Article"}
            </DialogTitle>
            <DialogDescription>
              Fill in the article details in all supported languages.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
              rows={2}
            />
            <MultiLangInput
              label="Content"
              value={formContent}
              onChange={setFormContent}
              placeholder="Full article content"
              type="textarea"
              rows={8}
              required
            />

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
                <Select value={formCategory} onValueChange={setFormCategory}>
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

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Status:</Label>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPost ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
