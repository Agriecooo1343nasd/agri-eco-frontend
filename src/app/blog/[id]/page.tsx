"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPublicCmsPageBySlug, fetchPublicCmsPages, type CmsPage } from "@/lib/api/cms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Share2,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";

export default function BlogPost() {
  const params = useParams();
  const { locale: lang, t } = useLanguage();
  const idOrSlug = params.id as string;

  const [post, setPost] = useState<CmsPage | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<CmsPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPublicCmsPageBySlug(idOrSlug);
        setPost(data);

        const fallback = { pageType: "blog" as const, limit: 4 };
        const related = await fetchPublicCmsPages(
          data.categoryId ? { ...fallback, categoryId: data.categoryId } : fallback
        );
        setRelatedPosts(related.data.filter((p) => p.id !== data.id).slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [idOrSlug]);

  const getLangText = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj["en"] || Object.values(obj)[0] || "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8 flex-1">
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold font-heading text-foreground mb-2">
              {t(translations.blogPage.noArticles)}
            </h2>
            <Link href="/blog">
              <Button variant="outline">{t(translations.blogPage.backToBlog)}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = getLangText(post.title);
  const content = getLangText(post.content);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Cover image */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-muted flex items-center justify-center">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="h-24 w-24 text-muted-foreground/10" />
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      </div>

      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm mb-6 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t(translations.blogPage.backToBlog)}
          </Link>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-6 leading-tight">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author
                ? `${post.author.firstName} ${post.author.lastName}`
                : t(translations.blogPage.team)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime || 5} {t(translations.blogPage.readTime)}
            </span>
            {post.category && (
              <Badge variant="secondary" className="font-medium">
                {post.category.name}
              </Badge>
            )}
          </div>

          {/* Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
            {content.split("\n\n").map((chunk: string, i: number) => (
              <div
                key={i}
                className="mb-6 text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: chunk.replace(/\n/g, "<br />") }}
              />
            ))}
          </article>

          {/* Tags + share */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 py-6 border-y border-border mb-12">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs hover:bg-accent transition-colors cursor-default capitalize"
                >
                  #{tag.replace(/^#/, "")}
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto gap-1.5 h-8 text-xs"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          )}
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {t(translations.blogPage.related)}
              </h2>
              <Link href="/blog" className="text-sm text-primary hover:underline font-medium">
                {t(translations.blogPage.backToBlog)}
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rp) => (
                <Link href={`/blog/${rp.slug}`} key={rp.id}>
                  <Card className="overflow-hidden group hover:shadow-md transition-all h-full border-border/50">
                    <div className="h-40 overflow-hidden bg-muted flex items-center justify-center">
                      {rp.coverImage ? (
                        <img
                          src={rp.coverImage}
                          alt={getLangText(rp.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <BookOpen className="h-10 w-10 text-muted-foreground/10" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {getLangText(rp.title)}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">
                          {rp.readTime || 5} {t(translations.blogPage.readTime)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {rp.publishedAt ? new Date(rp.publishedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}