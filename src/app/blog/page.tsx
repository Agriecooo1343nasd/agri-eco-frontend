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
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function DatePickerButton({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : undefined;

  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {label}
      </p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full h-11 rounded-md border border-border bg-muted/30 px-3 text-left text-sm flex items-center justify-between gap-2 hover:bg-accent transition-colors",
              !value && "text-muted-foreground"
            )}
          >
            <span className="truncate">{value ? format(new Date(value), "dd MMM yyyy") : placeholder}</span>
            {value ? (
              <X
                className="w-3.5 h-3.5 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setOpen(false);
                }}
              />
            ) : (
              <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : "");
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default function Blog() {
  const { locale: language, t } = useLanguage();
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

  const hasActiveFilters = fromDate || toDate || search;

  const resetAll = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setSort("publishedAt");
    setOrder("desc");
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary/5 border-b border-border py-14">
        <div className="container px-4 text-center">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 border-primary/20 text-primary bg-primary/5">
            <Newspaper className="w-4 h-4 mr-2" />
            {t(translations.blogPage.badge)}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black font-heading text-foreground mb-4">
            {t(translations.blogPage.titlePrefix)}{" "}
            <span className="text-primary tracking-tight">{t(translations.blogPage.titleSuffix)}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            {t(translations.blogPage.heroDesc)}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-10">

        {/* ── Filter Panel ── */}
        <div className="bg-card border border-border rounded-xl shadow-sm mb-10 overflow-hidden">
          {/* Top row */}
          <div className="px-6 pt-6 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] gap-4 items-end">
            {/* Search */}
            <div className="relative group sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
                <Search className="w-3 h-3" />
                {t(translations.blogPage.sortBy)}
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={t(translations.blogPage.searchPlaceholder)}
                  className="pl-10 h-11 rounded-md bg-muted/30 border-border focus:bg-background transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                {t(translations.blogPage.sortBy)}
              </p>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-11 rounded-md bg-muted/30 min-w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishedAt">{t(translations.blogPage.publishDate)}</SelectItem>
                  <SelectItem value="createdAt">{t(translations.blogPage.createDate)}</SelectItem>
                  <SelectItem value="title">{t(translations.blogPage.sortTitle)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {t(translations.blogPage.order)}
              </p>
              <Select value={order} onValueChange={(v: any) => setOrder(v)}>
                <SelectTrigger className="h-11 rounded-md bg-muted/30 min-w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">{t(translations.blogPage.newest)}</SelectItem>
                  <SelectItem value="asc">{t(translations.blogPage.oldest)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bottom row — date range + actions */}
          <div className="px-6 pb-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row gap-4 items-end">
            <DatePickerButton
              label={t(translations.blogPage.fromDate)}
              value={fromDate}
              onChange={setFromDate}
              placeholder={t(translations.blogPage.pickDate)}
            />
            <DatePickerButton
              label={t(translations.blogPage.toDate)}
              value={toDate}
              onChange={setToDate}
              placeholder={t(translations.blogPage.pickDate)}
            />

            <div className="flex gap-2 shrink-0 sm:pb-0 pb-0">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="h-11 rounded-md gap-1.5"
                  onClick={resetAll}
                >
                  <X className="w-3.5 h-3.5" />
                  {t(translations.blogPage.resetFilters)}
                </Button>
              )}
              <Button
                className="h-11 rounded-md px-6"
                onClick={() => { setPage(1); loadBlogs(); }}
              >
                {t(translations.blogPage.applyFilters)}
              </Button>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[450px] rounded-xl" />
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group h-full bg-card border-border/50 overflow-hidden rounded-xl hover:shadow-lg hover:border-primary/20 transition-all duration-500 flex flex-col">
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
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : t(translations.blogPage.noDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime || 5} {t(translations.blogPage.readTime)}
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
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                          {post.author?.avatar ? (
                            <img src={post.author.avatar} alt={t(translations.blogPage.author)} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {post.author ? `${post.author.firstName} ${post.author.lastName}` : t(translations.blogPage.team)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
              <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">{t(translations.blogPage.noArticles)}</h3>
              <p className="text-muted-foreground">{t(translations.blogPage.adjustSearch)}</p>
              <Button variant="link" onClick={resetAll} className="mt-4 text-primary font-bold">
                {t(translations.blogPage.clearAll)}
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
              className="rounded-lg h-12 w-12"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 px-5 shadow-sm border border-border bg-card rounded-lg h-12 text-sm font-bold">
              <span>{t(translations.blogPage.page)}</span>
              <span className="text-primary">{page}</span>
              <span className="text-muted-foreground">{t(translations.blogPage.of)}</span>
              <span>{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-lg h-12 w-12"
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
