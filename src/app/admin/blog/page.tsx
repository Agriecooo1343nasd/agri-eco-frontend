"use client";

import { useState } from "react";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import { getML } from "@/components/admin/MultiLangInput";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Newspaper, Plus, Edit, Trash2, Search, Eye } from "lucide-react";

const statusColors: Record<string, string> = {
  published: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export default function BlogManagementPage() {
  const [posts, setPosts] = useState(blogPosts);
  const [search, setSearch] = useState("");

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
        <Button className="gap-2 rounded-xl h-10 px-5" asChild>
          <Link href="/admin/blog/create">
            <Plus className="h-4 w-4" />
            New Article
          </Link>
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
                        asChild
                      >
                        <Link href={`/admin/blog/create?id=${post.id}`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        asChild
                      >
                        <Link href={`/admin/blog/${post.id}/view`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
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
    </div>
  );
}
