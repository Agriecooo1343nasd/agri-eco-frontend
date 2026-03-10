"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blog";
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
import { getML } from "@/components/admin/MultiLangInput";

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const post = blogPosts.find((p) => p.id === id);
  const relatedPosts = blogPosts
    .filter((p) => p.id !== id && p.status === "published")
    .slice(0, 3);

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

  const title = getML(post.title, "en");
  const content = getML(post.content, "en");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={post.image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-card/80 hover:text-card text-sm mb-3 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Blog
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold font-heading text-card max-w-3xl">
              {title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.publishedAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
            <Badge variant="outline">{post.category}</Badge>
          </div>

          {/* Content */}
          <article className="prose prose-lg max-w-none">
            {content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i} className="text-foreground/80 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ) : null,
            )}
          </article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            <Button variant="outline" size="sm" className="ml-auto gap-1.5">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>

        {/* Related */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold font-heading text-foreground mb-5">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <Link href={`/blog/${rp.id}`} key={rp.id}>
                  <Card className="overflow-hidden group hover:shadow-md transition-all h-full">
                    <div className="h-32 overflow-hidden">
                      <img
                        src={rp.image}
                        alt={getML(rp.title, "en")}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {getML(rp.title, "en")}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {rp.readTime} min · {rp.publishedAt}
                      </p>
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
