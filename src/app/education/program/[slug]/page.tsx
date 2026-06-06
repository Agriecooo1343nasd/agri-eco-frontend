"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Type definitions for program modules and content blocks
type MultiLangText = { en: string; rw?: string } | string;

type ContentBlock = {
  id: string;
  type: "text" | "image" | "video" | "download" | "checklist";
  title?: MultiLangText;
  content: MultiLangText;
  caption?: MultiLangText;
};

type Module = {
  id: string;
  title: MultiLangText;
  description?: MultiLangText;
  duration?: MultiLangText;
  contentBlocks: ContentBlock[];
  quiz?: {
    id: string;
    title?: MultiLangText;
    description?: MultiLangText;
    questions?: unknown[];
  };
};

type Program = {
  id: string;
  title: MultiLangText;
  description?: MultiLangText;
  longDescription?: MultiLangText;
  image?: string;
  type: string;
  level: string;
  status: string;
  instructor?: MultiLangText;
  instructorBio?: MultiLangText;
  topics: MultiLangText[];
  whatYouGet?: MultiLangText;
  requirements?: MultiLangText;
  modules: Module[];
  certificate?: boolean;
  certificateTemplate?: string;
  price?: number;
  duration?: MultiLangText;
  startDate?: MultiLangText;
  enrolled?: number;
  maxParticipants?: number;
  location?: MultiLangText;
  language?: MultiLangText;
};

type ModuleProgress = {
  moduleId: string;
  completed: boolean;
};

type ProgressData = {
  completionPercentage: number;
  moduleProgress: ModuleProgress[];
  quizScores?: Array<{
    quizId: string;
    title: string;
    score: number;
    maxScore: number;
    attemptedAt: string;
  }>;
};
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  fetchTrainingProgramBySlug,
  enrollInProgram,
  fetchMyEnrollments,
  fetchProgress,
  updateProgress,
  startQuizAttempt,
  listQuizAttempts,
  submitQuizAttempt,
  type QuizScoreItem,
} from "@/lib/api/education";
import {
  initiatePayment,
  isPaymentSuccessful,
  normalizeRwandaPhone,
  type PaymentProvider,
} from "@/lib/api/payments";
import { MoMoPaymentFields } from "@/components/payment/MoMoPaymentFields";
import { PaymentProcessingDialog } from "@/components/payment/PaymentProcessingDialog";
import { getMediaUrl } from "@/lib/config/api";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { TrainingCertificateVisual } from "@/components/certificate/TrainingCertificateVisual";
import {
  mergeTemplateWithDefaults,
  exportCertificateToPng,
} from "@/lib/certificate-template";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  MapPin,
  Globe,
  Award,
  CheckCircle,
  BookOpen,
  Play,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ListChecks,
  User,
  Bell,
  Lock,
  Brain,
  Star,
  Loader2,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePricing } from "@/context/PricingContext";
import { createProgramReview, fetchProgramReviews } from "@/lib/api/reviews";
import { translations } from "@/i18n/translations";

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  full: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  completed: "bg-muted text-muted-foreground border-border",
};

import { notFound } from "next/navigation";
import { useFeatures } from "@/context/FeatureContext";

export default function ProgramDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice } = usePricing();
  const { isAuthenticated, user: authUser } = useAuth();
  const { isFeatureEnabled } = useFeatures();
  const pathname = usePathname()

  if (!isFeatureEnabled("training")) {
    notFound();
  }

  const {
    data: apiProgram,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trainingProgram", slug],
    queryFn: () => fetchTrainingProgramBySlug(slug as string),
    enabled: !!slug,
  });

  const { data: myEnrollments } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: () => fetchMyEnrollments(),
    enabled: isAuthenticated,
  });

  const activeEnrollment = myEnrollments?.data?.find(
    (e: any) =>
      e.trainingProgramId === apiProgram?.id &&
      ["approved", "completed"].includes(e.status),
  );

  const pendingEnrollment = myEnrollments?.data?.find(
    (e: any) =>
      e.trainingProgramId === apiProgram?.id && e.status === "pending",
  );

  const { data: progressData, refetch: refetchProgress } = useQuery({
    queryKey: ["programProgress", activeEnrollment?.id],
    queryFn: () => fetchProgress(activeEnrollment!.id),
    enabled: !!activeEnrollment?.id,
  });

  const queryClient = useQueryClient();
  const updateProgressMutation = useMutation({
    mutationFn: (payload: any) => updateProgress(activeEnrollment!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programProgress", activeEnrollment?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
    },
  });

  const handleModuleComplete = (
    module: Module,
    currentlyCompleted: boolean,
  ) => {
    const moduleId = module.id;
    const title = t(module.title);
    if (!activeEnrollment?.id || !progressData) return;

    if (currentlyCompleted) {
      toast.info(
        t(translations.common.errorLoading),
      );
      return;
    }

    const quizQuestions = module.quiz?.questions;
    const nq = Array.isArray(quizQuestions) ? quizQuestions.length : 0;
    if (!currentlyCompleted && nq > 0) {
      const passNeed = Math.max(1, Math.ceil(nq * 0.6));
      const scoreEntry = progressData.quizScores?.find(
        (q) => q.quizId === moduleId,
      );
      if (!scoreEntry || scoreEntry.score < passNeed) {
        toast.error(
        t(translations.common.errorLoading),
      );
      return;
    }
    }

    const currentProgress = progressData.moduleProgress || [];
    let updatedProgress = [...currentProgress];

    const existingIdx = updatedProgress.findIndex(
      (p) => p.moduleId === moduleId,
    );
    if (existingIdx >= 0) {
      updatedProgress[existingIdx].completed = !currentlyCompleted;
      updatedProgress[existingIdx].completedAt = new Date().toISOString();
    } else {
      updatedProgress.push({
        moduleId,
        title,
        completed: !currentlyCompleted,
        completedAt: new Date().toISOString(),
      });
    }

    updateProgressMutation.mutate({ moduleProgress: updatedProgress });
  };

  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [activeQuizModuleId, setActiveQuizModuleId] = useState<string | null>(
    null,
  );
  const [momoProvider, setMomoProvider] = useState<PaymentProvider>("mtn");
  const [momoPhone, setMomoPhone] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<"processing" | "success" | "failed">("processing");
  const [paymentError, setPaymentError] = useState<string | undefined>();
  const [pendingEnrollmentId, setPendingEnrollmentId] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  // Quiz state
  const [quizStep, setQuizStep] = useState(0); // current question index
  const [quizAnswers, setQuizAnswers] = useState<any>({}); // { [questionIdx]: optionIdx }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutSubmittedRef = useRef(false);

  // Timer effect
  useEffect(() => {
    if (quizDialogOpen && remainingSeconds !== null && remainingSeconds > 0 && !quizSubmitted && !quizError) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timerRef.current!);
            handleQuizTimeout();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizDialogOpen, remainingSeconds, quizSubmitted, quizError]);

  const handleQuizTimeout = async () => {
    if (timeoutSubmittedRef.current) return;
    timeoutSubmittedRef.current = true;

    setQuizError("Quiz time limit elapsed. Please start a new attempt.");
    setQuizSubmitted(true);
    setQuizScore(0);
    
    if (quizAttemptId) {
       try {
         await submitQuizAttempt(quizAttemptId, { score: 0, maxScore: activeQuiz?.questions?.length || 0 });
       } catch (err) {
         console.error("Failed to submit timed-out quiz", err);
       }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Helper: get correct index (backend may use correctIndex or correctOption)
  const getCorrectIndex = (q: any) =>
    typeof q.correctIndex === "number"
      ? q.correctIndex
      : typeof q.correctOption === "number"
        ? q.correctOption
        : undefined;

  const startQuiz = async (quiz: any, moduleId: string) => {
    if (!quiz) {
      console.warn("No quiz data found for this module.", quiz);
      return;
    }

    if (!activeEnrollment?.id) {
      toast.error("You must be enrolled to take the quiz");
      return;
    }

    try {
      const { attempt, remainingSeconds: backendRemaining } = await startQuizAttempt(activeEnrollment.id, moduleId);
      setQuizAttemptId(attempt.id);
      setRemainingSeconds(backendRemaining);
      
      setActiveQuizModuleId(moduleId);
      setActiveQuiz(quiz);
      setQuizDialogOpen(true);
      setQuizStep(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
      setQuizError(null);
      timeoutSubmittedRef.current = false;
    } catch (err: any) {
      toast.error("Failed to start quiz", { description: err.message });
    }
  };

  // Handle answer selection
  const handleQuizAnswer = (qIdx: number, oIdx: number) => {
    setQuizAnswers((prev: any) => ({ ...prev, [qIdx]: oIdx }));
  };

  // Handle quiz submission (compare answers, persist to backend)
  const handleSubmitQuiz = async () => {
    if (!activeQuiz?.questions) return;
    let score = 0;
    activeQuiz.questions.forEach((q: any, idx: number) => {
      const correctIdx = getCorrectIndex(q);
      if (
        quizAnswers[idx] !== undefined &&
        correctIdx !== undefined &&
        quizAnswers[idx] === correctIdx
      ) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    if (quizAttemptId) {
      try {
        await submitQuizAttempt(quizAttemptId, { 
          score, 
          maxScore: activeQuiz.questions.length,
          answers: quizAnswers 
        });
        
        // Refresh progress to show new score
        refetchProgress();
      } catch (err: any) {
        if (err.status === 422 || err.message?.includes("timed_out") || err.message?.includes("elapsed")) {
           setQuizError(err.message || "Time limit elapsed.");
           setQuizSubmitted(true);
           setQuizScore(0);
        } else {
           toast.error("Failed to submit results", { description: err.message });
        }
      }
    }
  };

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (isAuthenticated && myEnrollments?.data && apiProgram) {
      setIsEnrolled(!!activeEnrollment);
      setIsPending(!!pendingEnrollment);
    } else if (!isAuthenticated) {
      setIsEnrolled(false);
      setIsPending(false);
    }
  }, [
    isAuthenticated,
    myEnrollments,
    apiProgram,
    slug,
    activeEnrollment,
    pendingEnrollment,
  ]);

  // Resume check
  useEffect(() => {
    const checkResume = async () => {
      if (activeEnrollment?.id && apiProgram && !quizDialogOpen && !quizSubmitted) {
        try {
          const attempts = await listQuizAttempts(activeEnrollment.id);
          const active = attempts.find((a) => a.status === "in_progress");
          if (active) {
             // Find module
             const moduleId = active.quizId || (active as any).moduleId;
             const module = apiProgram.curriculum?.find((m: any) => m.id === moduleId);
             if (module && module.quiz) {
               // Calculate remaining time
               const remaining = active.expiresAt 
                 ? Math.max(0, Math.floor((new Date(active.expiresAt).getTime() - Date.now()) / 1000))
                 : null;
               
               if (remaining === null || remaining > 0) {
                  setQuizAttemptId(active.id);
                  setRemainingSeconds(remaining);
                  setActiveQuizModuleId(moduleId);
                  setActiveQuiz(module.quiz);
                  setQuizDialogOpen(true);
                  setQuizStep(0);
                  setQuizAnswers({});
                  setQuizSubmitted(false);
               }
             }
          }
        } catch (err) {
          console.error("Failed to check resume attempts", err);
        }
      }
    };
    checkResume();
  }, [activeEnrollment?.id, apiProgram]);

  const {
    data: programReviewsResult,
    isLoading: isLoadingReviews,
    isError: isErrorReviews,
  } = useQuery({
    queryKey: ["program-reviews", apiProgram?.id],
    queryFn: () =>
      fetchProgramReviews(apiProgram!.id, {
        page: 1,
        limit: 50,
      }),
    enabled: !!apiProgram?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      createProgramReview(apiProgram!.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      }),
    onSuccess: () => {
      toast.success("Review submitted", {
        description: "Thanks for reviewing this program.",
      });
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["program-reviews", apiProgram?.id] });
    },
    onError: (err: Error) => {
      toast.error("Failed to submit review", {
        description: err.message || "Please try again.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">
            {t(translations.common.loading)}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !apiProgram) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t(translations.common.noResults)}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t(translations.common.errorLoading)}
          </p>
          <Button asChild>
            <Link href="/education">{t({ en: "Back to Education", rw: "Subira kuri Education", fr: "Retour à l'Éducation", sw: "Rudi kwenye Elimu" })}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const program = {
    ...apiProgram,
    price: apiProgram.priceRwf,
    image:
      apiProgram.heroImage ||
      apiProgram.coverImage ||
      "/assets/tours/educational.jpg",
    heroVideo: apiProgram.heroVideo || apiProgram.videoUrl,
    modules: (apiProgram.curriculum || []).map((m: any, idx: number) => ({
      ...m,
      order: m.order || idx + 1,
      id: m.id || `m-${idx}`,
    })),
    duration: { en: `${apiProgram.durationWeeks} Weeks` },
    level: { en: apiProgram.level },
    startDate: {
      en: apiProgram.startDate
        ? new Date(apiProgram.startDate).toLocaleDateString()
        : "TBD",
    },
    maxParticipants: apiProgram.capacity || 0,
    enrolled: apiProgram.enrolledCount || 0,
    status:
      apiProgram.status === "completed"
        ? "completed"
        : apiProgram.status === "upcoming"
          ? "upcoming"
          : apiProgram.capacity &&
              apiProgram.enrolledCount &&
              apiProgram.enrolledCount >= apiProgram.capacity
            ? "full"
            : "open",
    topics: (apiProgram.topics || []).map((t: any) => t.name),
    description: apiProgram.shortDescription || apiProgram.fullDescription,
    longDescription: apiProgram.fullDescription,
    certificateTemplate: apiProgram.certificateTemplate
      ? (function () {
          try {
            return JSON.parse(apiProgram.certificateTemplate);
          } catch {
            return null;
          }
        })()
      : null,
    instructor: apiProgram.instructorName || { en: "", rw: "" },
    instructorBio: apiProgram.instructorBio || { en: "", rw: "" },
    requirements: apiProgram.requirements || { en: "" },
    whatYouGet: apiProgram.whatStudentsGet || { en: "" },
    certificate:
      apiProgram.type === "certification" || !!apiProgram.certificateTemplate,
    location: apiProgram.location || { en: "", rw: "" },
    language: {
      en:
        apiProgram.language === "en"
          ? "English"
          : apiProgram.language === "rw"
            ? "Kinyarwanda"
            : apiProgram.language,
      rw:
        apiProgram.language === "en"
          ? "Icyongereza"
          : apiProgram.language === "rw"
            ? "Ikinyarwanda"
            : apiProgram.language,
    },
  };

  const sortedModules = [...program.modules].sort((a, b) => a.order - b.order);
  const isFree = program.price === 0;
  const programReviews = programReviewsResult?.data ?? [];
  const myProgramReview = programReviews.find((review) => review.userId === authUser?.id);
  const publicProgramReviews = programReviews.filter(
    (review) => review.userId !== authUser?.id,
  );
  const isCourseCompleted =
    (typeof progressData?.completionPercentage === "number" &&
      progressData.completionPercentage >= 100) ||
    activeEnrollment?.status === "completed";

  const canAccessCertificateUi =
    activeEnrollment?.status === "completed" ||
    Boolean(activeEnrollment?.certificateNumber?.trim());

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast.error(t(translations.auth.required), {
        description: t(translations.auth.loginDescription),
      });
      setTimeout(() => {
        router.push("/login?redirect=" + pathname);
      }, 1500);
      return;
    }
    setEnrollDialogOpen(true);
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiProgram) return;

    setEnrolling(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const payload = {
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        notes: (formData.get("notes") as string) || "",
      };

      const enrollment = await enrollInProgram(apiProgram.id, payload);

      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
      }

      if (isFree) {
        setIsEnrolled(true);
        setIsPending(false);
        setEnrollDialogOpen(false);
        toast.success(t(translations.common.success), {
          description: `${t(translations.common.success)} "${t(program.title)}".`,
        });
        return;
      }

      setEnrollDialogOpen(false);
      setIsPending(true);
      setPendingEnrollmentId(enrollment?.id ?? null);

      if (!enrollment?.id) {
        toast.success("Enrollment submitted", {
          description: "Complete payment from your enrollments when available.",
        });
        return;
      }

      setPaymentDialogOpen(true);
      setPaymentPhase("processing");
      setPaymentError(undefined);

      try {
        const payPhone = normalizeRwandaPhone(
          momoPhone || (payload.phone as string) || "",
        );
        const pay = await initiatePayment({
          provider: momoProvider,
          method: "mobile_money",
          phone: payPhone,
          trainingEnrollmentId: enrollment.id,
        });
        if (isPaymentSuccessful(pay)) {
          setPaymentPhase("success");
          setIsPending(false);
          toast.success("Payment successful", {
            description: "Your enrollment is being processed.",
          });
        } else {
          setPaymentPhase("failed");
          setPaymentError("Payment not confirmed. You can retry from enrollments.");
        }
      } catch (payErr: any) {
        setPaymentPhase("failed");
        setPaymentError(payErr?.response?.data?.message || payErr?.message);
      }
    } catch (err: any) {
      toast.error(t(translations.common.errorLoading), {
        description: err.message || t(translations.common.errorLoading),
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyDialogOpen(false);
    toast.success(t(translations.common.success), {
      description: t(translations.common.success),
    });
  };

  const contentBlockIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4 text-primary" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-primary" />;
      case "video":
        return <Play className="h-4 w-4 text-primary" />;
      case "download":
        return <Download className="h-4 w-4 text-primary" />;
      case "checklist":
        return <ListChecks className="h-4 w-4 text-primary" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certRef.current) return;
    try {
      const dataUrl = await exportCertificateToPng(certRef.current);
      const a = document.createElement("a");
      a.href = dataUrl;
      const certKey =
        activeEnrollment?.certificateNumber?.trim() ||
        activeEnrollment?.id ||
        String(program.id);
      a.download = `certificate-${certKey}.png`;
      a.click();
      toast.success(t(translations.common.success));
    } catch (err) {
      toast.error(t(translations.common.errorLoading), { description: String(err) });
    }
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[40vh] min-h-[320px] overflow-hidden">
          {program.heroVideo ? (
            <video
              src={getMediaUrl(program.heroVideo)}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster={program.image}
            />
          ) : (
            <img
              src={program.image}
              alt={t(program.title)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
          <div className="relative container h-full flex flex-col justify-end pb-8">
            <Link
              href="/education"
              className="inline-flex items-center gap-1.5 text-card/70 hover:text-card text-sm mb-4 transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" />{" "}
              {t({ en: "Back to Education", rw: "Subira kuri Education", fr: "Retour à l'Éducation", sw: "Rudi kwenye Elimu" })}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="capitalize text-xs border-card/30 text-card"
              >
                {t({
                  en: program.type,
                  rw:
                    program.type === "certification"
                      ? "Impamyabumenyi"
                      : program.type,
                })}
              </Badge>
              <Badge
                variant="outline"
                className="capitalize text-xs border-card/30 text-card"
              >
                {t(program.level)}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs border-card/30 text-card"
              >
                {(Number((apiProgram as any).averageRating || 0)).toFixed(1)} / 5 ({(apiProgram as any).reviewCount ?? 0})
              </Badge>
              <Badge
                className={`${statusColors[program.status]} border text-xs capitalize`}
              >
                {t({
                  en: program.status,
                  rw: program.status === "open" ? "Bifunguye" : program.status,
                })}
              </Badge>
              {isEnrolled &&
                progressData &&
                typeof progressData.completionPercentage === "number" && (
                  <Badge
                    variant="outline"
                    className="text-xs border-card/40 text-card gap-1.5"
                  >
                    <span className="text-card/80">
                      {t({ en: "Your progress", rw: "Intambwe yawe", fr: "Votre progression", sw: "Maendeleo yako" })}
                    </span>
                    <span className="font-bold text-primary-foreground tabular-nums">
                      {Math.round(
                        Math.min(100, Math.max(0, progressData.completionPercentage)),
                      )}
                      %
                    </span>
                  </Badge>
                )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-card mb-2">
              {t(program.title)}
            </h1>
            {program.instructor && (
              <p className="text-card/70 flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />{" "}
                {t({ en: "Instructor", rw: "Umuhazabumenyi", fr: "Instructeur", sw: "Mwalimu" })}:{" "}
                {t(program.instructor)}
              </p>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="py-10">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold font-heading text-foreground mb-3">
                    {t({
                      en: "About This Program",
                      rw: "Ibihereranye n'iyi gahunda",
                      fr: "À propos de ce programme",
                      sw: "Kuhusu Programu Hii"
                    })}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {t(program.longDescription) || t(program.description)}
                  </p>
                  {program.topics.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        {t({ en: "Topics Covered", rw: "Ibizigwa", fr: "Sujets abordés", sw: "Mada Zinazoshughulikiwa" })}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {program.topics.map(
                          (topicName: MultiLangText, tidx: number) => (
                            <span
                              key={tidx}
                              className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full"
                            >
                              {t(topicName)}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                

                {/* What You Get */}
                {program.whatYouGet &&
                  t(program.whatYouGet) &&
                  t(program.whatYouGet).length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h2 className="text-xl font-bold font-heading text-foreground mb-4">
                        {t({ en: "What You'll Get", rw: "Icyo uzahabwa", fr: "Ce que vous obtiendrez", sw: "Utakachopata" })}
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(t(program.whatYouGet) || "")
                          .split("\n")
                          .filter(Boolean)
                          .map((item: string, iidx: number) => (
                            <div
                              key={iidx}
                              className="flex items-start gap-2.5"
                            >
                              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground">
                                {item}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Curriculum / Modules */}
                <div
                  id="curriculum-section"
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold font-heading text-foreground mb-4">
                    <BookOpen className="h-5 w-5 inline-block mr-2 text-primary" />
                    {t({ en: "Curriculum", rw: "Intekanyanyigisho", fr: "Programme d'études", sw: "Mtaala" })} (
                    {program.modules.length}{" "}
                    {t({ en: "Modules", rw: "Inyongerabyigwa", fr: "Modules", sw: "Moduli" })})
                  </h2>

                  {!isEnrolled && (
                    <div className="bg-accent/30 border border-border rounded-xl p-5 mb-4 text-center">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {t({
                          en: "Course content is locked",
                          rw: "Ibirimo birafunze",
                          fr: "Le contenu est verrouillé",
                          sw: "Maudhui ya kozi yamefungwa"
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {t({
                          en: "Enroll in this program to access all modules, videos, downloads, and materials.",
                          rw: "Yandikishe muri iyi gahunda kugira ngo ubashe kubona amasomo, amavideo, no gukuraho ibitabo.",
                          fr: "Inscrivez-vous à ce programme pour accéder à tous les modules, vidéos, téléchargements et supports.",
                          sw: "Jiandikishe katika programu hii ili kufikia moduli zote, video, upakuaji, na nyenzo."
                        })}
                      </p>
                      {program.status === "open" && (
                        <Button
                          size="sm"
                          onClick={() => setEnrollDialogOpen(true)}
                          className="gap-1.5 text-xs h-9"
                        >
                          <BookOpen className="h-3.5 w-3.5" />{" "}
                           {t({
                             en: "Enroll to Unlock",
                             rw: "Yandikishe kugira ngo ufungure",
                             fr: "S'inscrire pour débloquer",
                             sw: "Jiandikishe ili Kufungua"
                           })}
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {sortedModules.map((mod: Module, idx: number) => {
                      return (
                        <div
                          key={mod.id}
                          className="border rounded-xl overflow-hidden transition-colors border-border"
                        >
                          <button
                            onClick={() =>
                              isEnrolled ? toggleModule(mod.id) : undefined
                            }
                            className={`w-full flex items-center justify-between p-4 transition-colors text-left ${
                              isEnrolled
                                ? "hover:bg-accent/50 cursor-pointer"
                                : "cursor-default opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                  {t(mod.title)}
                                  {isEnrolled &&
                                    activeEnrollment &&
                                    progressData?.moduleProgress?.find(
                                      (p: ModuleProgress) =>
                                        p.moduleId === mod.id,
                                    )?.completed && (
                                      <CheckCircle
                                        className="h-4 w-4 text-green-500 shrink-0"
                                        aria-hidden
                                      />
                                    )}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {t(mod.duration)} • {mod.contentBlocks.length}{" "}
                                  {t({
                                    en: "content blocks",
                                    rw: "ibice bigize isomo",
                                    fr: "blocs de contenu",
                                    sw: "vitalu vya maudhui"
                                  })}
                                </p>
                              </div>
                            </div>
                            {isEnrolled ? (
                              expandedModule === mod.id ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          {isEnrolled && expandedModule === mod.id && (
                            <div className="border-t border-border p-4 bg-accent/20 space-y-4">
                              <p className="text-sm text-muted-foreground">
                                {t(mod.description)}
                              </p>

                              {/* Content blocks */}
                              {mod.contentBlocks.map((block: ContentBlock) => (
                                <div
                                  key={block.id}
                                  className="flex items-start gap-3 bg-card border border-border rounded-lg p-3"
                                >
                                  <div className="mt-0.5">
                                    {contentBlockIcon(block.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {block.title && (
                                      <h5 className="text-sm font-medium text-foreground">
                                        {t(block.title)}
                                      </h5>
                                    )}
                                    {block.type === "text" && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {t(block.content)}
                                      </p>
                                    )}
                                    {block.type === "image" && (
                                      <Image
                                        src={
                                          t(block.content) ||
                                          "/assets/placeholder.png"
                                        }
                                        alt={
                                          t(block.caption) || "Program image"
                                        }
                                        width={800}
                                        height={300}
                                        className="mt-2 rounded-lg w-full max-h-48 object-cover"
                                        style={{
                                          width: "100%",
                                          height: "auto",
                                        }}
                                        unoptimized
                                      />
                                    )}
                                    {block.type === "video" && (
                                      <div className="mt-3 rounded-xl overflow-hidden bg-black/5 border border-border shadow-inner">
                                        <video
                                          src={t(block.content)}
                                          controls
                                          playsInline
                                          className="w-full aspect-video object-contain bg-black"
                                          poster={t(program.image)}
                                        >
                                          {t({
                                            en: "Your browser does not support the video tag.",
                                            rw: "Mushakisha yawe ntigushobora kureba amashusho.",
                                            fr: "Votre navigateur ne supporte pas la balise vidéo.",
                                            sw: "Kivinjari chako hakiauni lebo ya video."
                                          })}
                                        </video>
                                      </div>
                                    )}
                                    {block.type === "download" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 gap-1.5 text-xs h-8"
                                        onClick={async () => {
                                          const url = t(block.content);
                                          if (!url) {
                                            toast.error(
                                              t({
                                                en: "Download link is broken",
                                                rw: "Irohereza ntirikora",
                                                fr: "Le lien de téléchargement est rompu",
                                                sw: "Kiungo cha kupakua kimevunjika"
                                              })
                                            );
                                            return;
                                          }
                                          try {
                                            const response = await fetch(url);
                                            if (!response.ok)
                                              throw new Error("File not found");
                                            const blob = await response.blob();
                                            const fileName =
                                              url.split("/").pop() ||
                                              "resource";
                                            const a =
                                              document.createElement("a");
                                            a.href = URL.createObjectURL(blob);
                                            a.download = fileName;
                                            a.click();
                                            URL.revokeObjectURL(a.href);
                                            toast.success(t(translations.common.success));
                                          } catch (err) {
                                            window.open(url, "_blank");
                                            toast.error(
                                              t({
                                                en: "Direct download failed, opened in new tab.",
                                                rw: "Gukuraho byanze, bifunguwe ahandi.",
                                                fr: "Le téléchargement direct a échoué, ouvert dans un nouvel onglet.",
                                                sw: "Upakuaji wa moja kwa moja umefeli, umefunguliwa kwenye kichupo kipya."
                                              }),
                                            );
                                          }
                                        }}
                                      >
                                        <Download className="h-3.5 w-3.5" />{" "}
                                        {t({
                                          en: "Download Resource",
                                          rw: "Kuraho ibikoresho",
                                          fr: "Télécharger la ressource",
                                          sw: "Pakua Rasilimali"
                                        })}
                                      </Button>
                                    )}
                                    {block.type === "checklist" && (
                                      <ul className="mt-2 space-y-1">
                                        {(t(block.content) || "")
                                          .split("|")
                                          .map((item: string, cidx: number) => (
                                            <li
                                              key={cidx}
                                              className="flex items-center gap-2 text-xs text-foreground"
                                            >
                                              <CheckCircle className="h-3 w-3 text-primary" />{" "}
                                              {item}
                                            </li>
                                          ))}
                                      </ul>
                                    )}
                                    {block.caption &&
                                      block.type !== "checklist" && (
                                        <p className="text-[11px] text-muted-foreground mt-1 italic">
                                          {t(block.caption)}
                                        </p>
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {isEnrolled &&
                            expandedModule === mod.id &&
                            mod.quiz && (
                              <div className="border-t border-border p-4 bg-muted/30">
                                <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                                  <div className="mt-0.5">
                                    <Brain className="h-4 w-4 text-green-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-foreground">
                                      {t(mod.quiz.title) ||
                                        t({
                                          en: "Module Quiz",
                                          rw: "Isuzumabumenyi",
                                        })}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {t(mod.quiz.description) ||
                                        t({
                                          en: "Test your knowledge on this module.",
                                          rw: "Gerageza ubumenyi bwawe",
                                        })}
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        startQuiz(mod.quiz, mod.id)
                                      }
                                      className="mt-3 gap-1.5 text-xs h-8 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900/50 dark:hover:bg-green-900/20"
                                    >
                                      <Brain className="h-3.5 w-3.5" />
                                      {t({
                                        en: "Take Quiz",
                                        rw: "Kora Isuzuma",
                                      })}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                          {isEnrolled && expandedModule === mod.id && (
                            <div className="border-t border-border p-4 bg-card/50">
                              {progressData?.moduleProgress?.find(
                                (p: ModuleProgress) => p.moduleId === mod.id,
                              )?.completed ? (
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                  <CheckCircle className="h-4 w-4 shrink-0" />
                                  {t({
                                    en: "Module completed",
                                    rw: "Isomo ryarangiye",
                                  })}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {(() => {
                                    const nq = Array.isArray(mod.quiz?.questions)
                                      ? mod.quiz!.questions!.length
                                      : 0;
                                    const passNeed = Math.max(
                                      1,
                                      Math.ceil(nq * 0.6),
                                    );
                                    const scoreEntry =
                                      progressData?.quizScores?.find(
                                        (q) => q.quizId === mod.id,
                                      );
                                    const quizPassed =
                                      nq === 0 ||
                                      (scoreEntry &&
                                        scoreEntry.score >= passNeed);
                                    return nq > 0 && !quizPassed ? (
                                      <p className="text-[11px] text-muted-foreground">
                                        {t({
                                          en: `Pass the module quiz (at least ${passNeed}/${nq} correct) to unlock completion.`,
                                          rw: "Suzuma neza mbere yo kwemeza isomo.",
                                        })}
                                      </p>
                                    ) : null;
                                  })()}
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="w-full sm:w-auto gap-2 text-xs h-9"
                                    disabled={(() => {
                                      const nq = Array.isArray(
                                        mod.quiz?.questions,
                                      )
                                        ? mod.quiz!.questions!.length
                                        : 0;
                                      if (nq === 0) return false;
                                      const passNeed = Math.max(
                                        1,
                                        Math.ceil(nq * 0.6),
                                      );
                                      const scoreEntry =
                                        progressData?.quizScores?.find(
                                          (q) => q.quizId === mod.id,
                                        );
                                      return (
                                        !scoreEntry ||
                                        scoreEntry.score < passNeed
                                      );
                                    })()}
                                    onClick={() =>
                                      handleModuleComplete(mod, false)
                                    }
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    {t({
                                      en: "Mark module as complete",
                                      rw: "Emeza ko wasoje isomo",
                                    })}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Certificate Section */}
                {program.certificate && canAccessCertificateUi && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold font-heading text-foreground">
                          <Award className="h-5 w-5 inline-block mr-2 text-primary" />
                          {t({ en: "Certificate", rw: "Impamyabumenyi", fr: "Certificat", sw: "Cheti" })}
                        </h2>
                      </div>

                      {!isEnrolled ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />{" "}
                          {t({
                            en: "Enroll in this program to earn your certificate.",
                            rw: "Yandikishe muri iyi gahunda kugira ngo uhabwe impamyabumenyi.",
                            fr: "Inscrivez-vous à ce programme pour obtenir votre certificat.",
                            sw: "Jiandikishe katika programu hii ili upate cheti chako."
                          })}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-primary font-medium">
                            <CheckCircle className="h-4 w-4" />{" "}
                            {t({
                              en: "You're enrolled! Complete the curriculum to get your certificate.",
                              rw: "Wiyandikishije! Reba inyigisho zose kugira ngo uhabwe impamyabumenyi.",
                              fr: "Vous êtes inscrit ! Terminez le programme pour obtenir votre certificat.",
                              sw: "Umejiandikisha! Kamilisha mtaala ili upate cheti chako."
                            })}
                          </div>
                          <div className="flex gap-3">
                            <Button
                              className="gap-2 text-xs h-10"
                              onClick={() => setCertDialogOpen(true)}
                            >
                              <Award className="h-4 w-4" />{" "}
                              {t({
                                en: "View Certificate",
                                rw: "Reba Impamyabumenyi",
                                fr: "Voir le certificat",
                                sw: "Tazama Cheti"
                              })}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {program.instructor && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold font-heading text-foreground mb-4">
                      {t({ en: "Your Instructor", rw: "Umuhazabumenyi wawe", fr: "Votre Instructeur", sw: "Mkufunzi Wako" })}
                    </h2>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {t(program.instructor)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t(program.instructorBio)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    {t({ en: "Program Reviews", rw: "Ibyavuzwe kuri gahunda", sw:"Mapitio ya Programu", fr: "Évaluations de programmes"})}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {(apiProgram as any).reviewCount ?? 0} {t({ en: "total reviews, average", rw: "ibitekerezo byose, impuzandengo", fr: "avis au total, moyenne", sw: "hakiki jumla, wastani" })} {(Number((apiProgram as any).averageRating || 0)).toFixed(1)}/5
                  </p>

                  {isEnrolled && isCourseCompleted && !myProgramReview ? (
                    <div className="rounded-xl border border-border p-4 space-y-3">
                      <p className="text-sm font-medium text-foreground">
                        {t({ en: "Share your learning experience", rw: "Sangiza uko wiyumva nyuma yo kwiga", fr: "Partagez votre expérience d'apprentissage", sw: "Shiriki uzoefu wako wa kujifunza" })}
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 rounded hover:bg-accent"
                          >
                            <Star
                              className={`h-4 w-4 ${star <= reviewRating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"}`}
                            />
                          </button>
                        ))}
                      </div>
                      <Input
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        placeholder={t({ en: "Write your review...", rw: "Andika igitekerezo cyawe...", fr: "Écrivez votre avis...", sw: "Andika maoni yako..." })}
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        className="text-xs"
                        disabled={reviewMutation.isPending || !reviewComment.trim()}
                        onClick={() => reviewMutation.mutate()}
                      >
                        {reviewMutation.isPending ? t({ en: "Submitting...", rw: "Birimo koherezwa...", fr: "Envoi en cours...", sw: "Inatuma..." }) : t({ en: "Submit review", rw: "Ohereza igitekerezo", fr: "Envoyer l'avis", sw: "Wasilisha hakiki" })}
                      </Button>
                    </div>
                  ) : null}

                  {myProgramReview ? (
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-sm font-semibold text-foreground">
                        {t({ en: "Your review", rw: "Igitekerezo cyawe", fr: "Votre avis", sw: "Hakiki yako" })} ({myProgramReview.rating}/5)
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= myProgramReview.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                      {[myProgramReview.title, myProgramReview.comment].filter(Boolean)
                        .length > 0 ? (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {[myProgramReview.title, myProgramReview.comment]
                            .filter(Boolean)
                            .join(" — ")}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    {isLoadingReviews ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t({ en: "Loading reviews…", rw: "Dushakisha ibitekerezo…", fr: "Chargement des avis…", sw: "Inapakia hakiki…" })}
                      </div>
                    ) : isErrorReviews ? (
                      <p className="text-xs text-muted-foreground">
                        {t({ en: "Could not load reviews right now.", rw: "Ntibyashobotse kuzana ibitekerezo ubu.", fr: "Impossible de charger les avis pour le moment.", sw: "Haikuweza kupakia hakiki sasa hivi." })}
                      </p>
                    ) : publicProgramReviews.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t({ en: "No public reviews yet.", rw: "Nta bitekerezo bihari.", fr: "Aucun avis public pour le moment.", sw: "Hakuna hakiki za umma bado." })}</p>
                    ) : (
                      publicProgramReviews.slice(0, 6).map((review) => (
                        <div key={review.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {review.user?.username || t({ en: "Student", rw: "Umunyeshuri", fr: "Étudiant", sw: "Mwanafunzi" })}
                            </p>
                            <div className="flex items-center gap-1 shrink-0">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3.5 w-3.5 ${
                                    star <= review.rating
                                      ? "fill-amber-500 text-amber-500"
                                      : "text-muted-foreground/40"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {[review.title, review.comment].filter(Boolean).length > 0 ? (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {[review.title, review.comment].filter(Boolean).join(" — ")}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground/80 mt-1 italic">
                              {t({ en: "Rating only", rw: "Inyenyeri gusa", fr: "Note uniquement", sw: "Ukadiriaji tu" })} ({review.rating}/5)
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-5">
                  {/* Price Card */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="text-center mb-5">
                      <p className="text-3xl font-bold text-foreground">
                        {isFree
                          ? t({ en: "FREE", rw: "UBUNTU" })
                          : formatPrice(program.price)}
                      </p>
                      {program.certificate && (
                        <p className="text-xs text-primary flex items-center justify-center gap-1 mt-1">
                          <Award className="h-3.5 w-3.5" />{" "}
                          {t({
                            en: "Certificate included",
                            rw: "Harimo n'impamyabumenyi",
                            fr: "Certificat inclus",
                            sw: "Cheti kimejumuishwa"
                          })}
                        </p>
                      )}
                    </div>

                    {isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-center text-sm text-primary font-medium">
                          <CheckCircle className="h-4 w-4" />{" "}
                          {t({ en: "You're Enrolled", rw: "Wiyandikishije", fr: "Inscrit", sw: "Umejiandikisha" })}
                        </div>
                        {progressData &&
                          typeof progressData.completionPercentage ===
                            "number" && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[11px] text-muted-foreground">
                                <span>
                                  {t({
                                    en: "Course progress",
                                    rw: "Inyigisho",
                                    fr: "Progression du cours",
                                    sw: "Maendeleo ya kozi"
                                  })}
                                </span>
                                <span className="font-semibold text-primary tabular-nums">
                                  {Math.round(
                                    Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        progressData.completionPercentage,
                                      ),
                                    ),
                                  )}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    progressData.completionPercentage,
                                  ),
                                )}
                                className="h-2"
                              />
                            </div>
                          )}
                        <Button
                          className="w-full gap-2 text-xs h-10"
                          size="sm"
                          onClick={() => {
                            document
                              .getElementById("curriculum-section")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          <Play className="h-4 w-4" />{" "}
                          {t({ en: "View Curriculum", rw: "Reba inyigisho", fr: "Voir le programme", sw: "Tazama Mtaala" })}
                        </Button>
                      </div>
                    ) : isPending ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-center text-sm text-yellow-500 font-medium">
                          <Clock className="h-4 w-4" />{" "}
                          {t({
                            en: "Enrollment Pending",
                            rw: "Itagereje Kwemezwa",
                            fr: "Inscription en attente",
                            sw: "Uandikishaji Unasubiri"
                          })}
                        </div>
                        <Button
                          className="w-full gap-2 text-xs h-10"
                          size="sm"
                          variant="secondary"
                          disabled
                        >
                          {t({
                            en: "Awaiting Approval",
                            rw: "Itegereje Kwemezwa",
                            fr: "En attente d'approbation",
                            sw: "Inasubiri Idhini"
                          })}
                        </Button>
                      </div>
                    ) : (
                      <>
                        {program.status === "open" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            onClick={handleEnrollClick}
                          >
                            <BookOpen className="h-4 w-4" />{" "}
                            {t({ en: "Enroll Now", rw: "Iyandikishe ubu", fr: "S'inscrire maintenant", sw: "Jiandikishe Sasa" })}
                          </Button>
                        )}
                        {program.status === "full" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            variant="secondary"
                            onClick={() => setNotifyDialogOpen(true)}
                          >
                            <Bell className="h-4 w-4" />{" "}
                            {t({
                              en: "Join Waitlist",
                              rw: "Yiyandikishe ku rutonde",
                              fr: "Rejoindre la liste d'attente",
                              sw: "Jiunge na Orodha ya Kusubiri"
                            })}
                          </Button>
                        )}
                        {program.status === "upcoming" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            variant="outline"
                            onClick={() => setNotifyDialogOpen(true)}
                          >
                            <Bell className="h-4 w-4" />{" "}
                            {t({ en: "Notify Me", rw: "Unyibutse", fr: "M'avertir", sw: "Nijulishe" })}
                          </Button>
                        )}
                        {program.status === "completed" && (
                          <Button
                            className="w-full text-xs h-10"
                            size="sm"
                            variant="secondary"
                            disabled
                          >
                            {t({
                              en: "Program Completed",
                              rw: "Gahunda yarangiye",
                              fr: "Programme terminé",
                              sw: "Programu Imekamilika"
                            })}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Details Card */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-foreground text-sm">
                      {t({
                        en: "Program Details",
                        rw: "Ibisobanuro bya Gahunda",
                        fr: "Détails du Programme",
                        sw: "Maelezo ya Programu"
                      })}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            {t({ en: "Duration", rw: "Igihe kizamara", fr: "Durée", sw: "Muda" })}
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {t(program.duration)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            {t({ en: "Starts", rw: "Itangira", fr: "Commence le", sw: "Inaanza" })}
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {t(program.startDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            {t({ en: "Class Size", rw: "Ingano y'ishuri", fr: "Taille de la classe", sw: "Idadi ya Wanafunzi" })}
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {program.enrolled} / {program.maxParticipants}{" "}
                            {t({ en: "enrolled", rw: "biyandikishije", fr: "inscrits", sw: "wamejiandikisha" })}
                          </p>
                        </div>
                      </div>
                      {program.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-muted-foreground text-xs">
                              {t({ en: "Location", rw: "Ahantu", fr: "Lieu", sw: "Mahali" })}
                            </p>
                            <p className="font-medium text-foreground text-sm">
                              {t(program.location)}
                            </p>
                          </div>
                        </div>
                      )}
                      {program.language && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-muted-foreground text-xs">
                              {t({ en: "Language", rw: "Ururimi", fr: "Langue", sw: "Lugha" })}
                            </p>
                            <p className="font-medium text-foreground text-sm">
                              {t(program.language)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  {program.requirements &&
                    t(program.requirements) &&
                    t(program.requirements).length > 0 && (
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-semibold text-foreground text-sm mb-3">
                          {t({ en: "Requirements", rw: "Ibisabwa", fr: "Exigences", sw: "Mahitaji" })}
                        </h3>
                        <ul className="space-y-2">
                          {(t(program.requirements) || "")
                            .split("\n")
                            .filter(Boolean)
                            .map((req: string, ridx: number) => (
                              <li
                                key={ridx}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />{" "}
                                {req}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Enrollment Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {t({ en: "Enroll in Program", rw: "Iyandikishe muri Gahunda", fr: "S'inscrire au programme", sw: "Jiandikishe katika Programu" })}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isFree
                ? t({
                    en: "This is a free program. Fill in your details to enroll.",
                    rw: "Iyi ni gahunda y'ubuntu. Uzuza neza amakuru yawe kugira ngo wiyandikishe.",
                    fr: "Ce programme est gratuit. Remplissez vos coordonnées pour vous inscrire.",
                    sw: "Hii ni programu ya bure. Jaza maelezo yako ili ujiandikishe."
                  })
                : t({
                    en: `Complete your enrollment for ${formatPrice(program.price)}.`,
                    rw: `Uzuza iyandikisha ryawe wishyura ${formatPrice(program.price)}.`,
                    fr: `Finalisez votre inscription pour ${formatPrice(program.price)}.`,
                    sw: `Kamilisha uandikishaji wako kwa ${formatPrice(program.price)}.`
                  })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4 pt-2">
            <div>
              <Label className="text-[11px] mb-1 block">
                {t({ en: "Full Name *", rw: "Amazina Yose *", fr: "Nom Complet *", sw: "Jina Kamili *" })}
              </Label>
              <Input
                name="fullName"
                required
                placeholder={t({
                  en: "Your full name",
                  rw: "Amazina yawe yose",
                  fr: "Votre nom complet",
                  sw: "Jina lako kamili"
                })}
                className="h-9 text-xs"
                defaultValue={authUser?.name || ""}
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">
                {t({ en: "Email *", rw: "Imeri *", fr: "E-mail *", sw: "Barua pepe *" })}
              </Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="h-9 text-xs"
                defaultValue={authUser?.email || ""}
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">
                {t({ en: "Phone *", rw: "Telefoni *", fr: "Téléphone *", sw: "Simu *" })}
              </Label>
              <Input
                name="phone"
                required
                placeholder="+250 7XX XXX XXX"
                className="h-9 text-xs"
              />
            </div>
            {!isFree && (
              <div className="space-y-3">
                <MoMoPaymentFields
                  provider={momoProvider}
                  onProviderChange={setMomoProvider}
                  phone={momoPhone}
                  onPhoneChange={setMomoPhone}
                  compact
                  phoneLabel={t({ en: "MOMO Number *", rw: "Nimero ya MOMO *", fr: "Numéro MOMO *", sw: "Namba ya MOMO *" })}
                />
                <div className="bg-accent/50 border border-border rounded-lg p-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t({ en: "Program Fee", rw: "Ikiguzi cya Gahunda", fr: "Frais de programme", sw: "Ada ya Programu" })}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(program.price)}
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
                ? t({ en: "Processing...", rw: "Biracyatunganywa...", fr: "Traitement en cours...", sw: "Inachakata..." })
                : isFree
                  ? t({ en: "Complete Enrollment", rw: "Yandikishe Burundu", fr: "Finaliser l'inscription", sw: "Kamilisha Uandikishaji" })
                  : `${t({ en: "Pay", rw: "Ishyura", fr: "Payer", sw: "Lipa" })} ${formatPrice(program.price)}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {program.status === "full"
                ? t({ en: "Join Waitlist", rw: "Yiyandikishe ku rutonde", fr: "Rejoindre la liste d'attente", sw: "Jiunge na Orodha ya Kusubiri" })
                : t({ en: "Get Notified", rw: "Unyibutse", fr: "Être notifié", sw: "Pata Arifa" })}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {program.status === "full"
                ? t({
                    en: "We'll contact you when a spot opens up.",
                    rw: "Tuzakumenyesha umwanya niboneka.",
                    fr: "Nous vous contacterons lorsqu'une place se libérera.",
                    sw: "Tutawasiliana nawe wakati nafasi itakapopatikana."
                  })
                : t({
                    en: "We'll notify you when enrollment opens.",
                    rw: "Tuzakumenyesha kwiyandikisha nibitangira.",
                    fr: "Nous vous informerons de l'ouverture des inscriptions.",
                    sw: "Tutakujulisha uandikishaji utakapofunguliwa."
                  })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNotify} className="space-y-4 pt-2">
            <div>
              <Label className="text-[11px] mb-1 block">
                {t({ en: "Full Name *", rw: "Amazina Yose *", fr: "Nom Complet *", sw: "Jina Kamili *" })}
              </Label>
              <Input
                required
                placeholder={t({
                  en: "Your full name",
                  rw: "Amazina yawe yose",
                  fr: "Votre nom complet",
                  sw: "Jina lako kamili"
                })}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">
                {t({ en: "Email *", rw: "Imeri *", fr: "E-mail *", sw: "Barua pepe *" })}
              </Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">
                {t({ en: "Phone (optional)", rw: "Telefoni (niba uayifite)", fr: "Téléphone (facultatif)", sw: "Simu (hiari)" })}
              </Label>
              <Input placeholder="+250 7XX XXX XXX" className="h-9 text-xs" />
            </div>
            <Button type="submit" className="w-full text-xs h-10">
              {program.status === "full"
                ? t({ en: "Join Waitlist", rw: "Yiyandikishe ku rutonde", fr: "Rejoindre la liste", sw: "Jiunge na Orodha" })
                : t({ en: "Notify Me", rw: "Unyibutse", fr: "M'avertir", sw: "Nijulishe" })}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      {program.certificateTemplate && (
        <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">
                {t({ en: "Your Certificate", rw: "Impamyabumenyi Yawe", fr: "Votre Certificat", sw: "Cheti Chako" })}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t({
                  en: "Congratulations on completing the program!",
                  rw: "Urashimwa ko wasoje iyi gahunda!",
                  fr: "Félicitations pour avoir terminé le programme !",
                  sw: "Hongera kwa kukamilisha programu!"
                })}
              </DialogDescription>
            </DialogHeader>
            {!activeEnrollment?.certificateNumber?.trim() ? (
              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-3">
                {t({
                  en: "Your official certificate ID will appear here once the program is marked complete and issued by the platform.",
                  rw: "Indangamuntu y'impamyabumenyi izagaragara iyi namara gahunda koherewe kandi yatangwa.",
                  fr: "L'ID officiel de votre certificat apparaîtra ici une fois le programme marqué comme terminé et délivré.",
                  sw: "Kitambulisho chako rasmi cha cheti kitaonekana hapa pindi programu itakapokamilika na kutolewa."
                })}
              </p>
            ) : null}
            <TrainingCertificateVisual
              ref={certRef}
              template={mergeTemplateWithDefaults(program.certificateTemplate)}
              recipientName={
                authUser?.name ||
                activeEnrollment?.fullName ||
                t({ en: "[Your Name]", rw: "[Amazina]", fr: "[Votre Nom]", sw: "[Jina Lako]" })
              }
              issueDate={
                activeEnrollment?.certificateIssuedAt
                  ? new Date(
                      activeEnrollment.certificateIssuedAt,
                    ).toLocaleDateString()
                  : new Date().toLocaleDateString()
              }
              certificateId={(
                activeEnrollment?.certificateNumber?.trim() ||
                activeEnrollment?.id ||
                program.id
              ).trim()}
              t={t}
            />
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                className="gap-2 text-xs h-10"
                onClick={handleDownloadCertificate}
              >
                <Download className="h-4 w-4" />{" "}
                {t({ en: "Download", rw: "Kuraho", fr: "Télécharger", sw: "Pakua" })}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={quizDialogOpen}
        onOpenChange={(open) => {
          setQuizDialogOpen(open);
          if (!open) setActiveQuizModuleId(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border bg-card">
          <div className="p-6 bg-green-50/50 dark:bg-green-950/20 border-b border-border">
            <h2 className="text-lg font-bold font-heading flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
              {activeQuiz
                ? t(activeQuiz.title)
                : t({ en: "Module Quiz", rw: "Isuzumabumenyi", fr: "Quiz du module", sw: "Maswali ya Moduli" })}
              {remainingSeconds !== null && (
                <Badge variant="outline" className={`ml-auto font-mono text-xs ${remainingSeconds < 60 ? "text-destructive border-destructive animate-pulse" : "text-primary border-primary"}`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(remainingSeconds)}
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t({
                en: "To complete this module, you need a passing score.",
                rw: "Gutsinda neza ni ngombwa ngo wemerewe gukomeza.",
                fr: "Pour terminer ce module, vous devez obtenir la moyenne.",
                sw: "Ili kukamilisha moduli hii, unahitaji alama ya ufaulu."
              })}
            </p>
          </div>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {(!activeQuiz?.questions || activeQuiz.questions.length === 0) && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No questions available for this quiz yet.
              </div>
            )}
            {activeQuiz?.questions && activeQuiz.questions.length > 0 && (
              <>
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-foreground">
                    {quizStep + 1}. {t(activeQuiz.questions[quizStep].question)}
                  </h3>
                  <div className="space-y-2">
                    {activeQuiz.questions[quizStep].options?.map(
                      (opt: any, oIdx: number) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 border border-border rounded-lg bg-background hover:bg-muted/50 cursor-pointer transition-colors ${quizAnswers[quizStep] === oIdx ? "ring-2 ring-primary" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`q-${quizStep}`}
                            className="text-primary focus:ring-primary"
                            checked={quizAnswers[quizStep] === oIdx}
                            onChange={() => handleQuizAnswer(quizStep, oIdx)}
                            disabled={quizSubmitted}
                          />
                          <span className="text-sm">{t(opt)}</span>
                        </label>
                      ),
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setQuizStep((s) => Math.max(0, s - 1))}
                    disabled={quizStep === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Question {quizStep + 1} of {activeQuiz.questions.length}
                  </span>
                  {quizStep < activeQuiz.questions.length - 1 ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setQuizStep((s) =>
                          Math.min(activeQuiz.questions.length - 1, s + 1),
                        )
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <span style={{ width: 75 }} />
                  )}
                </div>
              </>
            )}

            {quizError && (
               <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center space-y-4">
                 <Clock className="h-10 w-10 text-destructive mx-auto animate-pulse" />
                 <div className="space-y-1">
                   <h3 className="text-lg font-bold text-destructive">
                     {t({ en: "Session Expired", rw: "Igihe cyarangiye", fr: "Session expirée", sw: "Muda Umeisha" })}
                   </h3>
                   <p className="text-sm text-muted-foreground">
                     {quizError}
                   </p>
                 </div>
                 <Button 
                   className="gap-2" 
                   onClick={() => startQuiz(activeQuiz, activeQuizModuleId!)}
                 >
                   <Plus className="h-4 w-4" />
                   {t({ en: "Retry Quiz", rw: "Gerageza nanone", fr: "Réessayer le quiz", sw: "Jaribu Tena" })}
                 </Button>
               </div>
            )}

            {quizSubmitted && !quizError && (
              <div className="mt-6 text-center">
                <div className="text-lg font-bold">
                  Score: {quizScore} / {activeQuiz.questions.length}
                </div>
                <div
                  className={`mt-2 text-${quizScore && quizScore >= Math.ceil(activeQuiz.questions.length * 0.6) ? "green-600" : "red-600"} font-semibold`}
                >
                  {quizScore !== null &&
                  quizScore >= Math.ceil(activeQuiz.questions.length * 0.6)
                    ? t({ en: "Passed!", rw: "Watsinze!", fr: "Réussi !", sw: "Umefaulu!" })
                    : t({ en: "Failed", rw: "Ntiwatsinze", fr: "Échoué", sw: "Umefeli" })}
                </div>
                {(quizScore === null || quizScore < Math.ceil(activeQuiz.questions.length * 0.6)) && (
                   <Button 
                     variant="outline" 
                     className="mt-4 gap-2 text-xs" 
                     onClick={() => startQuiz(activeQuiz, activeQuizModuleId!)}
                   >
                     <Plus className="h-4 w-4" />
                     {t({ en: "Retry Quiz", rw: "Gerageza nanone", fr: "Réessayer le quiz", sw: "Jaribu Tena" })}
                   </Button>
                )}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setQuizDialogOpen(false)}>
              Cancel
            </Button>
            {!quizSubmitted &&
              activeQuiz?.questions &&
              activeQuiz.questions.length > 0 &&
              quizStep === activeQuiz.questions.length - 1 && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSubmitQuiz}
                >
                  Submit Quiz
                </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>

      <PaymentProcessingDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        phase={paymentPhase}
        errorMessage={paymentError}
        onRetry={async () => {
          if (!pendingEnrollmentId) return;
          setPaymentPhase("processing");
          try {
            const pay = await initiatePayment({
              provider: momoProvider,
              method: "mobile_money",
              phone: normalizeRwandaPhone(momoPhone),
              trainingEnrollmentId: pendingEnrollmentId,
            });
            if (isPaymentSuccessful(pay)) {
              setPaymentPhase("success");
              setIsPending(false);
            } else {
              setPaymentPhase("failed");
            }
          } catch (e: any) {
            setPaymentPhase("failed");
            setPaymentError(e?.response?.data?.message || e?.message);
          }
        }}
        onDone={() => {
          setPaymentDialogOpen(false);
          if (paymentPhase === "success") {
            queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
          }
        }}
      />
    </div>
  );
}
