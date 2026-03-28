"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchPublicCmsPages, type CmsPage } from "@/lib/api/cms";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  Clock,
  User,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Blog() {
  const { locale: language } = useLanguage();
  const [blogs, setBlogs] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState<string>("publishedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const result = await fetchPublicCmsPages({
        pageType: "blog",
        status: "published",
        page,
        limit,
        search: search || undefined,
        language: language,
        sort: sort as any,
        order,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setBlogs(result.data);
      setTotalPages(result.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [page, language, sort, order, fromDate, toDate]);

  // Handle search with a slight delay or on Enter
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPage(1);
      loadBlogs();
    }
  };

  const getLangText = (text: any, lang: string) => {
    if (!text) return "";
    if (typeof text === "string") return text;
    return text[lang] || text["en"] || "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary/5 border-b border-border py-12">
        <div className="container px-4 text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 border-primary/20 text-primary bg-primary/5">
            <Newspaper className="w-4 h-4 mr-2" />
            Our Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black font-heading text-foreground mb-4">
            Organic <span className="text-primary tracking-tight">Insights</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Discover the latest stories from the farm, organic lifestyle tips, and artisanal wisdom.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-10">
        {/* Toolbar */}
        <div className="bg-card border border-border rounded-md p-6 mb-10 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative group lg:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search articles and press Enter..."
                className="pl-12 h-12 rounded-md bg-muted/30 border-border focus:bg-background transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyPress}
              />
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
               <ArrowUpDown className="w-5 h-5 text-muted-foreground shrink-0" />
               <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-12 rounded-md bg-muted/30">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publishedAt">Published Date</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
               </Select>
            </div>

             {/* Order */}
             <div className="flex items-center gap-2">
               <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
               <Select value={order} onValueChange={(v: any) => setOrder(v)}>
                  <SelectTrigger className="h-12 rounded-md bg-muted/30">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
               </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-border">
             {/* Date From */}
             <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1">From Date</p>
                   <Input 
                     type="date" 
                     className="h-11 rounded-md bg-muted/30 border-border"
                     value={fromDate}
                     onChange={(e) => setFromDate(e.target.value)}
                   />
                </div>
             </div>

             {/* Date To */}
             <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 ml-1">To Date</p>
                   <Input 
                     type="date" 
                     className="h-11 rounded-md bg-muted/30 border-border"
                     value={toDate}
                     onChange={(e) => setToDate(e.target.value)}
                   />
                </div>
             </div>
             
             <div className="lg:col-span-2 flex items-end justify-end gap-3">
                <Button 
                  variant="outline" 
                  className="rounded-md h-11"
                  onClick={() => {
                    setSearch("");
                    setFromDate("");
                    setToDate("");
                    setSort("publishedAt");
                    setOrder("desc");
                    setPage(1);
                  }}
                >
                  Reset Filters
                </Button>
                <Button 
                  className="rounded-md h-11 px-8"
                  onClick={() => { setPage(1); loadBlogs(); }}
                >
                  Apply Filters
                </Button>
             </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[450px] rounded-md" />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group h-full bg-card border-border/50 overflow-hidden rounded-md hover:shadow-md hover:border-primary/20 transition-all duration-500 flex flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={post.coverImage || "https://images.unsplash.com/photo-1500651230702-0e2d8a4934af?auto=format&fit=crop&q=80"}
                        alt={getLangText(post.title, language)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-background/90 backdrop-blur-md text-foreground border-none font-bold px-3 py-1">
                          {post.category?.name || "Life"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "No Date"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime || 5} min read
                          </span>
                        </div>
                        <h3 className="text-xl font-black font-heading text-foreground mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {getLangText(post.title, language)}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-6">
                          {getLangText(post.excerpt, language)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-6 border-t border-border/50">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                          {post.author?.avatar ? (
                              <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
                          ) : (
                              <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Agri-Eco Team"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/20 rounded-[40px] border-2 border-dashed border-border/50">
              <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filters.</p>
              <Button variant="link" onClick={() => { setSearch(""); setFromDate(""); setToDate(""); setPage(1); }} className="mt-4 text-primary font-bold">
                 Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-md h-12 w-12"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 px-4 shadow-sm border border-border bg-card rounded-md h-12 text-sm font-bold">
              <span>Page</span>
              <span className="text-primary">{page}</span>
              <span className="text-muted-foreground">of</span>
              <span>{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-md h-12 w-12"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
