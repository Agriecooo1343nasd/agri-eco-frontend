"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts, blogCategories } from "@/data/blog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Clock, User, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const published = blogPosts.filter((p) => p.status === "published");
  const filtered = published.filter((post) => {
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || post.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const featured = filtered.filter((p) => p.featured);
  const regular = filtered.filter((p) => !p.featured);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-primary/5 border-b border-border">
        <div className="container py-10 md:py-14">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Newspaper className="h-4 w-4" />
              Blog & Content Hub
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
              Stories, Tips & Insights
            </h1>
            <p className="text-muted-foreground mt-3">
              Explore farming wisdom, sustainability practices, and community
              stories from our network.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-lg mx-auto mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="border-b border-border bg-card">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {["All", ...blogCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Featured posts */}
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold font-heading text-foreground mb-4">
              Featured
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {featured.map((post) => (
                <Link href={`/blog/${post.id}`} key={post.id}>
                  <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-[10px]">
                        Featured
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="outline" className="text-[10px] mb-2">
                        {post.category}
                      </Badge>
                      <h3 className="font-bold font-heading text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular posts */}
        {regular.length > 0 && (
          <div>
            <h2 className="text-lg font-bold font-heading text-foreground mb-4">
              Latest Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {regular.map((post) => (
                <Link href={`/blog/${post.id}`} key={post.id}>
                  <Card className="overflow-hidden group hover:shadow-md transition-all h-full">
                    <div className="h-40 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="text-[10px] mb-2">
                        {post.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground text-sm mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                        <span>{post.author}</span>
                        <span>{post.publishedAt}</span>
                        <span>{post.readTime} min read</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No articles found matching your search.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
