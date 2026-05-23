"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  learningResources,
  quizzes,
  schoolVisitConfig,
} from "@/data/education";
import { fetchPublicSchoolVisitSettings, fetchTrainingPrograms } from "@/lib/api/education";
import { mergeSchoolVisitSettings } from "@/lib/school-visit-settings";
import {
  GraduationCap,
  BookOpen,
  School,
  Brain,
  Calendar,
  Clock,
  Users,
  Award,
  Download,
  Play,
  FileText,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { usePricing } from "@/context/PricingContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/i18n/translations";
import { useAuth } from "@/context/AuthContext";

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  full: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  completed: "bg-muted text-muted-foreground border-border",
};

import { notFound } from "next/navigation";
import { useFeatures } from "@/context/FeatureContext";

export default function EducationPage() {
  const { formatPrice } = usePricing();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { isFeatureEnabled } = useFeatures();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "all";

  if (!isFeatureEnabled("training")) {
    notFound();
  }

  const [trainingSearch, setTrainingSearch] = useState(searchParam);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageParam);

  const [trainingStatus, setTrainingStatus] = useState(statusParam);
  const [schoolVisitView, setSchoolVisitView] = useState(schoolVisitConfig);

  useEffect(() => {
    let ignore = false;
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const res = await fetchTrainingPrograms({
          search: trainingSearch || undefined,
          page: currentPage,
          limit: 6,
        });
        if (!ignore) {
          const mapped = res.data.map((p) => {
            const enrolled = 0; // Backend doesn't provide enrollment count yet
            let status = "open";
            if (p.startDate && new Date(p.startDate) > new Date())
              status = "upcoming";
            if (p.endDate && new Date(p.endDate) < new Date())
              status = "completed";
            if (enrolled >= (p.capacity || 0)) status = "full";

            return {
              id: p.id,
              title: p.title,
              description: p.shortDescription || p.fullDescription,
              image:
                p.coverImage || p.heroImage || "/assets/tours/educational.jpg",
              type: p.type,
              level: p.level,
              status,
              duration: { en: p.durationWeeks ? `${p.durationWeeks} Weeks` : "Self-paced" },
              startDate: {
                en: p.startDate
                  ? new Date(p.startDate).toLocaleDateString()
                  : "TBD",
              },
              enrolled,
              maxParticipants: p.capacity || 0,
              topics: (p.topics || []).map((t: any) => ({ en: t.name?.en || "" })),
              price: p.priceRwf,
              priceRwf: p.priceRwf,
              slug: p.slug,
              certificate: p.type === "certification",
              averageRating: p.averageRating ?? 0,
              reviewCount: p.reviewCount ?? 0,
            };
          });
          setTrainingPrograms(mapped);
          setTotalPages(res.pagination.pages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPrograms();
    return () => {
      ignore = true;
    };
  }, [trainingSearch, currentPage]);

  useEffect(() => {
    let ignore = false;
    async function loadSchoolVisitSettings() {
      try {
        const settings = await fetchPublicSchoolVisitSettings();
        if (ignore) return;
        setSchoolVisitView(mergeSchoolVisitSettings(settings));
      } catch {
        // Keep static fallback configuration.
      }
    }
    void loadSchoolVisitSettings();
    return () => {
      ignore = true;
    };
  }, []);

  // Sync state with URL params
  useEffect(() => {
    if (searchParam !== trainingSearch) setTrainingSearch(searchParam);
    if (statusParam !== trainingStatus) setTrainingStatus(statusParam);
    if (pageParam !== currentPage) setCurrentPage(pageParam);
    // eslint-disable-next-line
  }, [searchParam, statusParam, pageParam]);

  // Update URL params
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // If updating filters, reset page to 1
    if (key !== "page") params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateParam("page", String(page));
  };
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [enrolling, setEnrolling] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<(typeof quizzes)[0] | null>(
    null,
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = (quiz: (typeof quizzes)[0]) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
    setQuizDialogOpen(true);
  };

  const handleEnrollClick = (program: any) => {
    if (!isAuthenticated) {
      toast.error("Authentication required");
      router.push(`/login?redirect=${pathname}`);
      return;
    }
    setSelectedProgram(program);
    setEnrollDialogOpen(true);
  };

  const handleNotifyClick = (program: any) => {
    setSelectedProgram(program);
    setNotifyDialogOpen(true);
  };

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setEnrollDialogOpen(false);
      toast.success("Enrollment Successful!", {
        description: selectedProgram
          ? `You're now enrolled in "${selectedProgram.title.en}". Check your email for details.`
          : "You're now enrolled. Check your email for details.",
      });
    }, 1500);
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyDialogOpen(false);
    toast.success("Notification Set!", {
      description: selectedProgram
        ? `We'll notify you when "${selectedProgram.title.en}" opens for enrollment.`
        : "We'll notify you when programs open for enrollment.",
    });
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !activeQuiz) return;
    if (selectedAnswer === activeQuiz.questions[currentQ].correctIndex)
      setScore((s) => s + 1);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQ + 1 >= activeQuiz.questions.length) {
      setQuizFinished(true);
      return;
    }
    setCurrentQ((c) => c + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const educationalImg = "/assets/tours/educational.jpg";

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[45vh] min-h-[380px] overflow-hidden">
          <img
            src={educationalImg}
            alt="Education at Agri-Eco"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/30" />
          <div className="relative container h-full flex items-center">
            <div className="max-w-xl text-card">
              <Badge className="bg-secondary text-secondary-foreground mb-4 gap-1.5 text-[10px] py-0 px-2">
                <GraduationCap className="h-3.5 w-3.5" /> {t(translations.educationPage.hub)}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white leading-tight">
                {t(translations.educationPage.title)}
              </h1>
              <p className="text-white/90 text-lg mb-6">
                {t(translations.educationPage.desc)}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/education/school-visit">
                  <Button size="lg" className="gap-2 text-sm">
                    <School className="h-4 w-4" /> {t(translations.educationPage.bookSchool)}
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-card/30 text-white bg-card/10 hover:bg-card/40 gap-2 text-sm"
                >
                  <BookOpen className="h-4 w-4" /> {t(translations.educationPage.browseRes)}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container">
            <Tabs defaultValue="training" className="space-y-8">
              <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 h-auto p-1">
                <TabsTrigger
                  value="training"
                  className="gap-1 text-xs sm:text-sm py-2"
                >
                  <GraduationCap className="h-3.5 w-3.5 hidden sm:block" />
                  {t(translations.educationPage.trainingTabs)}
                </TabsTrigger>

                <TabsTrigger
                  value="schools"
                  className="gap-1 text-xs sm:text-sm py-2"
                >
                  <School className="h-3.5 w-3.5 hidden sm:block" />
                  {t(translations.educationPage.schoolsTabs)}
                </TabsTrigger>
              </TabsList>

              {/* Training Programs */}
              <TabsContent value="training" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="section-heading text-xl">
                    {t(translations.educationPage.farmerTraining)}
                  </h2>
                  <p className="section-subheading text-muted-foreground text-sm">
                    {t(translations.educationPage.farmerTrainingSub)}
                  </p>
                </div>
                {/* Search and status filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-between">
                  <input
                    type="text"
                    placeholder={t(translations.educationPage.searchTraining)}
                    value={trainingSearch}
                    onChange={(e) => {
                      setTrainingSearch(e.target.value);
                      updateParam("search", e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        updateParam("search", trainingSearch);
                    }}
                    className="w-full sm:w-64 px-3 py-2 border border-border rounded-lg text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <select
                    value={trainingStatus}
                    onChange={(e) => {
                      setTrainingStatus(e.target.value);
                      updateParam("status", e.target.value);
                    }}
                    className="w-full sm:w-48 px-3 py-2 border border-border rounded-lg text-sm outline-none bg-background"
                  >
                    <option value="all">{t(translations.educationPage.allStatuses)}</option>
                    <option value="open">{t(translations.educationPage.statusOpen)}</option>
                    <option value="upcoming">{t(translations.educationPage.statusUpcoming)}</option>
                    <option value="full">{t(translations.educationPage.statusFull)}</option>
                    <option value="completed">{t(translations.educationPage.statusCompleted)}</option>
                  </select>
                </div>

                {loading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">{t(translations.educationPage.loadingPrograms)}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-6">
                      {trainingPrograms.length === 0 ? (
                        <div className="col-span-3 text-center py-12 bg-muted/30 rounded-2xl border border-dashed">
                          <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">{t(translations.educationPage.noPrograms)}</p>
                        </div>
                      ) : (
                        trainingPrograms.map((p) => (
                          <Card
                            key={p.id}
                            className="overflow-hidden group flex flex-col h-full bg-card hover:shadow-lg transition-all"
                          >
                            <Link href={`/education/program/${p.slug}`} className="relative h-48 block overflow-hidden">
                              <img
                                src={p.image}
                                alt={t(p.title)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge
                                  variant="outline"
                                  className="capitalize text-[10px] py-0 px-2"
                                >
                                  {p.type}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="capitalize text-[10px] py-0 px-2"
                                >
                                  {t({ en: p.level })}
                                </Badge>
                                <Badge
                                  className={`${statusColors[p.status]} border text-[10px] py-0 px-2 capitalize`}
                                >
                                  {p.status}
                                </Badge>
                              </div>
                              <Link href={`/education/program/${p.slug}`} className="hover:text-primary transition-colors">
                                <h3 className="font-bold text-foreground text-base font-sans sm:text-lg mb-2 line-clamp-2 leading-snug">
                                  {t(p.title)}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                {t(p.description)}
                              </p>
                              <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-muted-foreground sm:flex sm:flex-wrap sm:items-center">
                                <span className="flex min-w-0 items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{t(p.duration)}</span>
                                </span>
                                <span className="flex min-w-0 items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{t(p.startDate)}</span>
                                </span>
                                <span className="flex min-w-0 items-center gap-1">
                                  <Users className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {p.enrolled}/{Math.max(p.maxParticipants, 1)}
                                  </span>
                                </span>
                                <span className="flex min-w-0 items-center gap-1 col-span-2 sm:col-span-1">
                                  <Award className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">
                                    {(Number(p.averageRating || 0)).toFixed(1)} ({p.reviewCount})
                                  </span>
                                </span>
                              </div>
                              
                              <div className="mb-4">
                                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                  <span>{t(translations.educationPage.enrollment)}</span>
                                  <span>
                                    {p.maxParticipants > 0
                                      ? Math.round(
                                          (p.enrolled / p.maxParticipants) * 100,
                                        )
                                      : 0}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    p.maxParticipants > 0
                                      ? (p.enrolled / p.maxParticipants) * 100
                                      : 0
                                  }
                                  className="h-1.5"
                                />
                              </div>

                              <div className="flex flex-wrap gap-1 mb-4">
                                {p.topics.slice(0, 3).map((topic: any) => (
                                  <span
                                    key={t(topic)}
                                    className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
                                  >
                                    {t(topic)}
                                  </span>
                                ))}
                              </div>

                              <div className="mt-auto flex w-full min-w-0 flex-col gap-3 border-t border-border bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <span className="font-bold text-primary text-base sm:text-lg shrink-0">
                                  {formatPrice(p.priceRwf || 0)}
                                </span>
                                <Button
                                  size="sm"
                                  asChild
                                  className="w-full gap-2 text-xs sm:w-auto shrink-0"
                                >
                                  <Link href={`/education/program/${p.slug}`}>
                                    {t(translations.educationPage.viewDetails)}
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-12 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1) handlePageChange(currentPage - 1);
                                }}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  isActive={currentPage === page}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                  }}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                            <PaginationItem>
                              <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                }}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Schools */}
              <TabsContent value="schools" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="section-heading text-xl">
                    {t(schoolVisitView.heading)}
                  </h2>
                  <p className="section-subheading text-muted-foreground text-sm">
                    {t(schoolVisitView.subheading)}
                  </p>
                </div>
                <div className="max-w-3xl mx-auto">
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="font-bold font-heading text-foreground text-lg mb-4">
                          {t(translations.educationPage.whatsIncluded)}
                        </h3>
                        <ul className="space-y-3">
                          {schoolVisitView.whatsIncluded.map((item) => (
                            <li
                              key={t(item)}
                              className="flex items-start gap-2 text-sm text-foreground"
                            >
                              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              {t(item)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold font-heading text-foreground text-lg mb-4">
                          {t(translations.educationPage.progDetails)}
                        </h3>
                        <div className="space-y-2 text-xs">
                          {schoolVisitView.details.map((d) => (
                            <div
                              key={t(d.label)}
                              className="flex justify-between py-2 border-b border-border last:border-0"
                            >
                              <span className="text-muted-foreground">
                                {t(d.label)}
                              </span>
                              <span className="font-bold text-foreground">
                                {t(d.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Link href="/education/school-visit" className="block">
                      <Button size="lg" className="w-full gap-2 text-sm">
                        <School className="h-4 w-4" /> {t(translations.educationPage.bookSchoolVisit)}
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg border-b pb-2">
              {activeQuiz?.title.en}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {quizFinished
                ? "Quiz Complete!"
                : `Question ${currentQ + 1} of ${activeQuiz?.questions.length}`}
            </DialogDescription>
          </DialogHeader>
          {activeQuiz && !quizFinished && activeQuiz.questions && activeQuiz.questions[currentQ] && (
            <div className="space-y-4 pt-2">
              <Progress
                value={((currentQ + 1) / activeQuiz.questions.length) * 100}
                className="h-1.5"
              />
              <p className="font-bold text-foreground text-sm leading-relaxed">
                {activeQuiz.questions[currentQ].question.en}
              </p>
              <div className="space-y-2">
                {activeQuiz.questions[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => !showExplanation && setSelectedAnswer(i)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors font-medium ${
                      showExplanation
                        ? i === (activeQuiz?.questions?.[currentQ]?.correctIndex ?? -1)
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : i === selectedAnswer
                            ? "border-destructive bg-destructive/10 text-destructive font-bold"
                            : "border-border text-muted-foreground opacity-60"
                        : selectedAnswer === i
                          ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                          : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {opt.en}
                  </button>
                ))}
              </div>
              {showExplanation && activeQuiz.questions[currentQ].explanation && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-[11px] text-foreground leading-relaxed">
                  <strong className="text-primary block mb-1 uppercase tracking-wider">
                    Explanation:
                  </strong>{" "}
                  {activeQuiz.questions[currentQ].explanation.en}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                {!showExplanation ? (
                  <Button
                    onClick={submitAnswer}
                    disabled={selectedAnswer === null}
                    className="text-xs h-9"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="text-xs h-9">
                    {currentQ + 1 >= activeQuiz.questions.length
                      ? "See Results"
                      : "Next Question"}{" "}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}
          {quizFinished && activeQuiz && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground font-heading">
                Score: {score}/{activeQuiz.questions.length}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed px-6">
                {score === activeQuiz.questions.length
                  ? "Perfect score! You're an organic farming expert!"
                  : score >= activeQuiz.questions.length / 2
                    ? "Great job! You've got a strong foundation."
                    : "Sustainable farming takes practice. Try again!"}
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setQuizDialogOpen(false)}
                  className="text-xs h-9"
                >
                  Close
                </Button>
                <Button
                  onClick={() => startQuiz(activeQuiz)}
                  className="text-xs h-9"
                >
                  Retry Quiz
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Enroll in Program
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedProgram
                ? `Complete your enrollment for ${formatPrice(selectedProgram.price)}.`
                : "Fill in your details to enroll."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4 pt-2">
            <div>
              <Label className="text-[11px] mb-1 block">Full Name *</Label>
              <Input
                required
                placeholder="Your full name"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Email *</Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Phone *</Label>
              <Input
                required
                placeholder="+250 7XX XXX XXX"
                className="h-9 text-xs"
              />
            </div>
            {selectedProgram && selectedProgram.price > 0 && (
              <div className="space-y-3">
                <Label className="text-[11px]">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors h-10 ${
                      paymentMethod === "momo"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors h-10 ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    Card
                  </button>
                </div>
                {paymentMethod === "momo" && (
                  <div>
                    <Label className="text-[11px] mb-1 block">
                      MOMO Number *
                    </Label>
                    <Input
                      required
                      placeholder="07X XXX XXXX"
                      className="h-9 text-xs"
                    />
                  </div>
                )}
                {paymentMethod === "card" && (
                  <>
                    <div>
                      <Label className="text-[11px] mb-1 block">
                        Card Number *
                      </Label>
                      <Input
                        required
                        placeholder="4242 4242 4242 4242"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[11px] mb-1 block">
                          Expiry *
                        </Label>
                        <Input
                          required
                          placeholder="MM/YY"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] mb-1 block">CVV *</Label>
                        <Input
                          required
                          placeholder="123"
                          type="password"
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="bg-accent/50 border border-border rounded-lg p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Program Fee</span>
                    <span className="font-semibold text-foreground">
                      {selectedProgram && formatPrice(selectedProgram.price)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full text-xs h-10"
              disabled={enrolling}
            >
              {enrolling
                ? "Processing..."
                : selectedProgram && selectedProgram.price > 0
                  ? `Pay ${formatPrice(selectedProgram.price)}`
                  : "Complete Enrollment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notify/Waitlist Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selectedProgram?.status === "full"
                ? "Join Waitlist"
                : "Get Notified"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedProgram?.status === "full"
                ? "We'll contact you when a spot opens up."
                : "We'll notify you when enrollment opens."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNotify} className="space-y-4 pt-2">
            <div>
              <Label className="text-[11px] mb-1 block">Full Name *</Label>
              <Input
                required
                placeholder="Your full name"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Email *</Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">Phone (optional)</Label>
              <Input placeholder="+250 7XX XXX XXX" className="h-9 text-xs" />
            </div>
            <Button type="submit" className="w-full text-xs h-10">
              {selectedProgram?.status === "full"
                ? "Join Waitlist"
                : "Notify Me"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
