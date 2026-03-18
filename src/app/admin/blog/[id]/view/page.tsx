"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getML } from "@/components/admin/MultiLangInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  BookOpen,
  Eye,
  Edit,
  Star,
  Tag,
  Layers,
} from "lucide-react";
import { fetchAdminCmsPageById, type CmsStatus } from "@/lib/api/cms";

const LANGS = ["en", "rw", "fr", "sw"] as const;
const LANG_LABELS: Record<string, string> = {
  en: "English",
  rw: "Kinyarwanda",
  fr: "Français",
  sw: "Swahili",
};

const statusColors: Record<CmsStatus, string> = {
  published: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border",
};

export default function AdminBlogViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lang, setLang] = useState<"en" | "rw" | "fr" | "sw">("en");

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cms-page", id],
    queryFn: () => fetchAdminCmsPageById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !post) {
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

  const titleText = getML(post.title, lang);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
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
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight flex items-start gap-2">
            <BookOpen className="h-6 w-6 text-primary mt-1 shrink-0" />
            {titleText || (
              <span className="text-muted-foreground italic">
                No {lang.toUpperCase()} title
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              Slug:{" "}
              <code className="font-mono bg-muted px-1 rounded">
                {post.slug}
              </code>
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] capitalize ${statusColors[post.status]}`}
            >
              {post.status}
            </Badge>
            {post.featured && (
              <Badge
                variant="outline"
                className="text-[10px] gap-1 text-amber-600 border-amber-500/30"
              >
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          {post.status === "published" && (
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                View Public
              </Button>
            </Link>
          )}
          <Link href={`/admin/blog/create?id=${post.id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-1" />
              Edit Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Language tabs */}
      <Tabs value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
        <TabsList>
          {LANGS.map((l) => (
            <TabsTrigger key={l} value={l}>
              {LANG_LABELS[l]}
            </TabsTrigger>
          ))}
        </TabsList>

        {LANGS.map((l) => (
          <TabsContent key={l} value={l} className="space-y-6 mt-6">
            {/* Hero image + meta */}
            <Card className="overflow-hidden border-border">
              <div className="relative h-56 md:h-72 overflow-hidden bg-muted">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={getML(post.title, l)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground/30">
                    <BookOpen className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mb-2">
                    {post.author && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    )}
                    {post.readTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime} min read
                      </span>
                    )}
                    {post.category && (
                      <Badge
                        variant="outline"
                        className="bg-white/10 border-white/30 text-[10px] uppercase tracking-widest"
                      >
                        {post.category.name}
                      </Badge>
                    )}
                  </div>
                  {getML(post.excerpt ?? { en: "" }, l) && (
                    <p className="max-w-2xl text-sm text-white/90 line-clamp-2">
                      {getML(post.excerpt ?? { en: "" }, l)}
                    </p>
                  )}
                </div>
              </div>
              <CardContent className="p-6 md:p-8 space-y-6">
                {/* Content body */}
                <article className="space-y-4">
                  {getML(post.content, l) ? (
                    getML(post.content, l)
                      .split("\n")
                      .map((paragraph, i) =>
                        paragraph.trim() ? (
                          <p
                            key={i}
                            className="text-sm md:text-base text-foreground/80 leading-relaxed"
                          >
                            {paragraph}
                          </p>
                        ) : null,
                      )
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No content in {LANG_LABELS[l]} yet.
                    </p>
                  )}
                </article>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Metadata sidebar strip */}
      <Card className="border-border">
        <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Type
            </p>
            <p className="text-sm font-bold capitalize flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-primary" />
              {post.pageType}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Category
            </p>
            <p className="text-sm font-bold">{post.category?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Scheduled At
            </p>
            <p className="text-sm font-bold">
              {post.scheduledAt
                ? new Date(post.scheduledAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              Read Time
            </p>
            <p className="text-sm font-bold">
              {post.readTime ? `${post.readTime} min` : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
