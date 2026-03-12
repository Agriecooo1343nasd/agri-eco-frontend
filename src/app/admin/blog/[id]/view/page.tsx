"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import { getML } from "@/components/admin/MultiLangInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  BookOpen,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminBlogViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-bold mb-2">Article not found</p>
        <Button variant="outline" onClick={() => router.push("/admin/blog")}>
          Back to Blog Management
        </Button>
      </div>
    );
  }

  const title = getML(post.title, "en");
  const content = getML(post.content, "en");

  return (
    <div className="space-y-6 pb-10">
      {/* Header / actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="px-0 h-auto mb-1 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Blog List
          </Button>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            ID: {post.id} · {post.status.toUpperCase()}
            {post.featured ? " · Featured" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/blog/${post.id}`} target="_blank">
            <Button variant="outline" >
              <Eye className="h-4 w-4" />
              View Public Page
            </Button>
          </Link>
          <Link href={`/admin/blog/create?id=${post.id}`}>
            <Button>
              Edit Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <Card className="overflow-hidden border-border">
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img
            src={post.image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mb-2">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {post.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime} min read
              </span>
              <Badge
                variant="outline"
                className="bg-white/10 border-white/30 text-[10px] uppercase tracking-widest"
              >
                {post.category}
              </Badge>
            </div>
            <p className="max-w-2xl text-sm text-white/90 line-clamp-2">
              {getML(post.excerpt, "en")}
            </p>
          </div>
        </div>
        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Optional video */}
          {post.videoUrl && (
            <div className="rounded-2xl overflow-hidden border border-border bg-black">
              <video
                src={post.videoUrl}
                controls
                className="w-full h-auto max-h-[420px] bg-black"
              />
            </div>
          )}

          {/* Content */}
          <article className="space-y-4">
            {content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? (
                <p
                  key={i}
                  className="text-sm md:text-base text-foreground/80 leading-relaxed"
                >
                  {paragraph}
                </p>
              ) : null,
            )}
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

