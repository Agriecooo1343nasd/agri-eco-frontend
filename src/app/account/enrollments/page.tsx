"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  GraduationCap,
  BookOpen,
  Award,
  Search,
  Filter,
  Loader2,
  Calendar,
  User as UserIcon,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  fetchMyEnrollments,
  fetchCertificate,
  toAbsoluteEducationImage,
} from "@/lib/api/education";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { translations } from "@/i18n/translations";


const statusConfig: Record<
  string,
  { label: string; className: string; textColor: string }
> = {
  pending: {
    label: "pending",
    className: "bg-yellow-500/10 border-yellow-500/20",
    textColor: "text-yellow-600",
  },
  approved: {
    label: "confirmed",
    className: "bg-green-500/10 border-green-500/20",
    textColor: "text-green-600",
  },
  rejected: {
    label: "failed",
    className: "bg-destructive/10 border-destructive/20",
    textColor: "text-destructive",
  },
  completed: {
    label: "completed",
    className: "bg-primary/10 border-primary/20",
    textColor: "text-primary",
  },
};

export default function Enrollments() {
  const { t } = useLanguage();
  const { isAuthenticated, isInitialized } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 5;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myEnrollments", debouncedSearch, status, page],
    queryFn: () =>
      fetchMyEnrollments({
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : (status as any),
        page,
        limit,
      }),
    enabled: isInitialized && isAuthenticated,
  });

  const handleDownloadCertificate = async (enrollmentId: string) => {
    try {
      const cert = await fetchCertificate(enrollmentId);
      if (cert.fileUrl) {
        window.open(cert.fileUrl, "_blank");
      } else {
        toast.error(t(translations.enrollmentsPage.noEnrollments));
      }
    } catch (err: any) {
      toast.error(t(translations.common.errorLoading), {
        description: err.message,
      });
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold">
            {t(translations.auth.required)}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
            {t(translations.auth.loginDescription)}
          </p>
          <Button asChild className="mt-6 h-9 text-xs">
            <Link href="/auth/login">{t(translations.auth.login)}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          {t(translations.enrollmentsPage.myEnrollments)}
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t(translations.enrollmentsPage.searchPrograms)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-[130px] h-9 text-xs gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <SelectValue placeholder={t(translations.common.status)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                {t(translations.enrollmentsPage.allStatuses)}
              </SelectItem>
              <SelectItem value="pending" className="text-xs">
                {t((translations.statuses as any).pending)}
              </SelectItem>
              <SelectItem value="approved" className="text-xs">
                {t((translations.statuses as any).confirmed)}
              </SelectItem>
              <SelectItem value="completed" className="text-xs">
                {t((translations.statuses as any).completed)}
              </SelectItem>
              <SelectItem value="rejected" className="text-xs">
                {t((translations.statuses as any).failed)}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm">{t(translations.enrollmentsPage.loadingEnrollments)}</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 rounded-2xl border border-dashed border-destructive/20 text-destructive text-center px-6">
          <p className="text-sm font-medium mb-2">
            {t(translations.common.errorLoading)}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 text-[10px] mt-2 border-destructive/20 text-destructive hover:bg-destructive/10">
            {t(translations.common.retry)}
          </Button>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border border-dashed text-muted-foreground text-center px-6">
          <BookOpen className="h-10 w-10 opacity-20 mb-4" />
          <h3 className="text-sm font-semibold text-foreground">
            {t(translations.enrollmentsPage.noEnrollments)}
          </h3>
          <p className="text-xs max-w-[200px] mt-2 mb-6">
            {debouncedSearch || status !== "all" 
              ? t(translations.common.noResults)
              : t({ en: "You haven't enrolled in any training programs yet.", rw: "Nturiyandikisha muri gahunda n'imwe yo guhugurwa.", fr: "Vous n'êtes pas encore inscrit à des programmes.", sw: "Bado haujajiandikisha katika programu zozote." })}
          </p>
          {!debouncedSearch && status === "all" && (
            <Button asChild variant="outline" className="h-9 text-xs">
              <Link href="/education">{t(translations.enrollmentsPage.browsePrograms)}</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((item) => {
              const program = item.trainingProgram;
              const status = statusConfig[item.status] || statusConfig.pending;
              
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-md transition-shadow group border-border/50"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-32 sm:h-auto shrink-0 relative overflow-hidden bg-muted">
                        <img
                          src={toAbsoluteEducationImage(
                            program.coverImage || 
                            program.heroImage || 
                            program.curriculum?.find((m: any) => m.contentBlocks?.some((b: any) => b.type === "image"))
                              ?.contentBlocks?.find((b: any) => b.type === "image")?.content?.en ||
                            program.curriculum?.find((m: any) => m.contentBlocks?.some((b: any) => b.type === "image"))
                              ?.contentBlocks?.find((b: any) => b.type === "image")?.content
                          )}
                          alt={t(program.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.status === "completed" && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                            <Award className="h-10 w-10 text-primary-foreground drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
                                {t(program.title)}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`text-[10px] h-5 px-1.5 ${status.className} ${status.textColor} border-current`}
                              >
                                {t((translations.statuses as any)[status.label] || status.label)}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-medium">
                              <span className="flex items-center gap-1.5 border-r border-border pr-4 last:border-0 last:pr-0">
                                <UserIcon className="h-3 w-3" />
                                {program.instructorName || "Agri-Eco Specialist"}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                              {t(program.shortDescription || program.fullDescription)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                            {item.status === "approved" && (
                              <Button asChild size="sm" className="h-8 text-[11px] gap-1.5 px-4">
                                <Link href={`/education/program/${program.slug}`}>
                                  {t(translations.enrollmentsPage.continueLearning)}
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            )}
                            {item.status === "completed" && (
                              <div className="flex items-center gap-2">
                                <Button asChild variant="outline" size="sm" className="h-8 text-[11px] gap-1.5 px-4">
                                  <Link href={`/education/program/${program.slug}`}>
                                    {t(translations.enrollmentsPage.reviewCourse)}
                                  </Link>
                                </Button>
                                {(item.certificateNumber?.trim() ||
                                  item.certificateUrl) && (
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="h-8 text-[11px] gap-1.5 px-4"
                                    onClick={() => handleDownloadCertificate(item.id)}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    {t(translations.enrollmentsPage.certificate)}
                                  </Button>
                                )}
                              </div>
                            )}
                            {item.status === "pending" && (
                              <Button variant="outline" disabled size="sm" className="h-8 text-[11px] opacity-70">
                                {t((translations.statuses as any).pending)}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-5 pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5 font-medium">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="h-3 w-3 text-primary/70" />
                              {item.status === "completed" 
                                ? t(translations.enrollmentsPage.courseCompleted)
                                : item.status === "approved"
                                  ? t(translations.enrollmentsPage.inProgress)
                                  : t({ en: "Access granted upon approval", rw: "Uzemererwa nibimara kwemezwa", fr: "Accès accordé après approbation", sw: "Ufikiaji utatolewa baada ya kuidhinishwa" })}
                            </span>
                            {["approved", "completed"].includes(item.status) && (
                              <span className="text-primary font-bold">
                                {item.completionPercentage || 0}%
                              </span>
                            )}
                          </div>
                          <Progress value={item.completionPercentage || 0} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-50 text-[11px]" : "cursor-pointer text-[11px] h-8"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                        className="cursor-pointer text-[11px] h-8 w-8"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < data.pagination.pages) setPage(page + 1);
                      }}
                      className={page >= data.pagination.pages ? "pointer-events-none opacity-50 text-[11px]" : "cursor-pointer text-[11px] h-8"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
