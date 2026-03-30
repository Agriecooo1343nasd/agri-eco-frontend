"use client";

import { useParams, useRouter } from "next/navigation";
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
  Globe,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;

  const [post, setPost] = useState<CmsPage | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<CmsPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "rw" | "fr" | "sw">("en");

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPublicCmsPageBySlug(idOrSlug);
        setPost(data);
        
        // Fetch related posts from same category
        if (data.categoryId) {
          const related = await fetchPublicCmsPages({
            pageType: "blog",
            categoryId: data.categoryId,
            limit: 4
          });
          setRelatedPosts(related.data.filter(p => p.id !== data.id).slice(0, 3));
        } else {
          const related = await fetchPublicCmsPages({
            pageType: "blog",
            limit: 4
          });
          setRelatedPosts(related.data.filter(p => p.id !== data.id).slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [idOrSlug]);

  // Helper to get text in current language with fallback to English
  const getLangText = (obj: any, currentLang: string) => {
    if (!obj) return "";
    return obj[currentLang] || obj["en"] || Object.values(obj)[0] || "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container py-8 flex-1">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-64 w-full rounded-2xl mb-8" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
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
              Article not found
            </h2>
            <Link href="/blog">
              <Button variant="outline">Back to Blog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = getLangText(post.title, lang);
  const content = getLangText(post.content, lang);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero image — pure thumbnail, no text overlay */}
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
      </div>

      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm mb-4 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Blog list
          </Link>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-6">
            {title}
          </h1>

          {/* Controls & Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-border">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Agri-Eco Team"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime || 5} min read
              </span>
              {post.category && (
                <Badge variant="secondary" className="font-medium">
                  {post.category.name}
                </Badge>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex gap-1 bg-muted p-1 rounded-md border border-border">
                {(["en", "rw", "fr", "sw"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      "px-2 py-1 text-[10px] uppercase font-bold rounded transition-colors",
                      lang === l
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent text-muted-foreground"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
            {content.split("\n\n").map((chunk: string, i: number) => (
               <div 
                 key={i} 
                 className="mb-6 text-foreground/90 leading-relaxed text-lg whitespace-pre-wrap"
                 dangerouslySetInnerHTML={{ __html: chunk.replace(/\n/g, '<br />') }}
               />
            ))}
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 py-6 border-y border-border mb-12">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs hover:bg-accent transition-colors cursor-default capitalize">
                  #{tag.replace(/^#/, '')}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="ml-auto gap-1.5 h-8 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                Share Article
              </Button>
            </div>
          )}
        </div>

        {/* Related */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-heading text-foreground">
                Related Articles
              </h2>
              <Link href="/blog" className="text-sm text-primary hover:underline font-medium">
                View All
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
                          alt={getLangText(rp.title, lang)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <BookOpen className="h-10 w-10 text-muted-foreground/10" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {getLangText(rp.title, lang)}
                      </h3>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-[11px] text-muted-foreground">
                          {rp.readTime || 5} min read
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