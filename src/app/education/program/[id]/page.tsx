"use client";

import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trainingPrograms } from "@/data/education";
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
  CreditCard,
  Smartphone,
  Lock,
  Brain,
  ChevronRight,
  RotateCcw,
  QrCode,
  Leaf,
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

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  full: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  completed: "bg-muted text-muted-foreground border-border",
};

// Helper to get stored module completion state
const getModuleCompletions = (programId: string): Record<string, boolean> => {
  try {
    return JSON.parse(
      typeof window !== "undefined"
        ? localStorage.getItem(`moduleCompletions_${programId}`) || "{}"
        : "{}",
    );
  } catch {
    return {};
  }
};

const setModuleCompletion = (programId: string, moduleId: string) => {
  if (typeof window !== "undefined") {
    const current = getModuleCompletions(programId);
    current[moduleId] = true;
    localStorage.setItem(
      `moduleCompletions_${programId}`,
      JSON.stringify(current),
    );
  }
};

export default function ProgramDetail() {
  const { id } = useParams();
  const program = trainingPrograms.find((p) => p.id === id);
  const { formatPrice } = usePricing();

  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [enrolling, setEnrolling] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Module completion tracking
  const [moduleCompletions, setModuleCompletionsState] = useState<
    Record<string, boolean>
  >(() => (id ? getModuleCompletions(id as string) : {}));

  // Quiz state per module
  const [activeQuizModule, setActiveQuizModule] = useState<string | null>(null);
  const [quizCurrentQ, setQuizCurrentQ] = useState(0);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(
    null,
  );
  const [quizShowExplanation, setQuizShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Track which module quizzes have been passed
  const [quizPassed, setQuizPassed] = useState<Record<string, boolean>>(() => {
    try {
      return typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem(`quizPassed_${id}`) || "{}")
        : {};
    } catch {
      return {};
    }
  });

  const [isEnrolled, setIsEnrolled] = useState(() => {
    if (typeof window !== "undefined") {
      const enrolled = JSON.parse(
        localStorage.getItem("enrolledPrograms") || "[]",
      );
      return enrolled.includes(id);
    }
    return false;
  });

  if (!program) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Program Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The training program you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/education">Back to Education</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const sortedModules = [...program.modules].sort((a, b) => a.order - b.order);
  const enrollmentPercent = Math.round(
    (program.enrolled / program.maxParticipants) * 100,
  );
  const isFree = program.price === 0;
  const spotsLeft = program.maxParticipants - program.enrolled;

  // Check if a module is accessible (sequential: previous must be completed)
  const isModuleAccessible = (idx: number) => {
    if (idx === 0) return true;
    const prevMod = sortedModules[idx - 1];
    return !!moduleCompletions[prevMod.id];
  };

  const isModuleCompleted = (modId: string) => !!moduleCompletions[modId];

  const allModulesCompleted = sortedModules.every(
    (m) => moduleCompletions[m.id],
  );

  const completedCount = sortedModules.filter(
    (m) => moduleCompletions[m.id],
  ).length;
  const progressPercent =
    sortedModules.length > 0
      ? Math.round((completedCount / sortedModules.length) * 100)
      : 0;

  const markModuleComplete = (moduleId: string) => {
    if (!id) return;
    setModuleCompletion(id as string, moduleId);
    setModuleCompletionsState((prev) => ({ ...prev, [moduleId]: true }));
    toast.success("Module Completed!", {
      description: "Great progress! Move on to the next module.",
    });
  };

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setEnrollDialogOpen(false);
      const enrolled = JSON.parse(
        localStorage.getItem("enrolledPrograms") || "[]",
      );
      if (!enrolled.includes(id)) enrolled.push(id);
      localStorage.setItem("enrolledPrograms", JSON.stringify(enrolled));
      setIsEnrolled(true);
      toast.success(isFree ? "Enrollment Successful!" : "Payment Processing", {
        description: isFree
          ? `You're now enrolled in "${program.title}". Check your email for details.`
          : "Your enrollment is being processed. You'll receive a confirmation shortly.",
      });
    }, 1500);
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyDialogOpen(false);
    toast.success("Notification Set!", {
      description: `We'll notify you when "${program.title}" opens for enrollment.`,
    });
  };

  const startModuleQuiz = (moduleId: string) => {
    setActiveQuizModule(moduleId);
    setQuizCurrentQ(0);
    setQuizSelectedAnswer(null);
    setQuizShowExplanation(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const submitQuizAnswer = () => {
    if (quizSelectedAnswer === null || !activeQuizModule) return;
    const mod = program.modules.find((m) => m.id === activeQuizModule);
    if (!mod?.quiz) return;
    if (quizSelectedAnswer === mod.quiz.questions[quizCurrentQ].correctIndex)
      setQuizScore((s) => s + 1);
    setQuizShowExplanation(true);
  };

  const nextQuizQuestion = () => {
    if (!activeQuizModule) return;
    const mod = program.modules.find((m) => m.id === activeQuizModule);
    if (!mod?.quiz) return;
    if (quizCurrentQ + 1 >= mod.quiz.questions.length) {
      setQuizFinished(true);
      return;
    }
    setQuizCurrentQ((c) => c + 1);
    setQuizSelectedAnswer(null);
    setQuizShowExplanation(false);
  };

  const handleQuizFinish = (
    moduleId: string,
    score: number,
    total: number,
    passingScore: number,
  ) => {
    const pct = Math.round((score / total) * 100);
    if (pct >= passingScore) {
      // Mark quiz as passed and module as completed
      const newPassed = { ...quizPassed, [moduleId]: true };
      setQuizPassed(newPassed);
      localStorage.setItem(`quizPassed_${id}`, JSON.stringify(newPassed));
      markModuleComplete(moduleId);
    }
    setActiveQuizModule(null);
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

  const handleDownloadCertificate = () => {
    const certHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Certificate - ${program.title}</title>
<style>
  body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9f9f6; }
  .cert { border: 6px double #2d5016; border-radius: 16px; padding: 60px; max-width: 800px; text-align: center; background: white; position: relative; }
  .logo { font-size: 28px; font-weight: bold; color: #2d5016; margin-bottom: 8px; }
  .subtitle { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 30px; }
  h1 { font-size: 32px; color: #333; margin: 0 0 8px; }
  .certifies { font-size: 14px; color: #666; margin: 20px 0 6px; }
  .name { font-size: 28px; color: #2d5016; font-weight: bold; margin: 10px 0 20px; }
  .desc { font-size: 13px; color: #666; max-width: 500px; margin: 0 auto 30px; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; }
  .sig { text-align: center; }
  .sig .line { border-top: 1px solid #333; padding-top: 4px; font-size: 12px; min-width: 150px; }
  .sig .title { font-size: 10px; color: #888; margin-bottom: 4px; }
  .qr { width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #aaa; }
</style></head><body>
<div class="cert">
  <div class="logo">🌿 Agri-Eco Connect</div>
  <div class="subtitle">Certificate of Completion</div>
  <h1>${program.certificateTemplate?.title || "Certificate of Achievement"}</h1>
  <p class="certifies">This certifies that</p>
  <p class="name">[Your Name]</p>
  <p class="desc">${program.certificateTemplate?.description || `Has successfully completed all modules of "${program.title}"`}</p>
  <div class="footer">
    <div class="sig"><div class="title">Date of Completion</div><div class="line">${new Date().toLocaleDateString()}</div></div>
    <div class="qr">QR Code</div>
    <div class="sig"><div class="title">${program.certificateTemplate?.signatoryTitle || "Director"}</div><div class="line">${program.certificateTemplate?.signatoryName || "Agri-Eco Connect"}</div></div>
  </div>
</div></body></html>`;
    const blob = new Blob([certHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${program.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate Downloaded!", {
      description:
        "Open the HTML file in your browser to print or save as PDF.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-xs">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative h-[40vh] min-h-[320px] overflow-hidden">
          <img
            src={program.image}
            alt={program.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
          <div className="relative container h-full flex flex-col justify-end pb-8">
            <Link
              href="/education"
              className="inline-flex items-center gap-1.5 text-card/70 hover:text-card text-sm mb-4 transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Education
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="capitalize text-xs border-card/30 text-card"
              >
                {program.type}
              </Badge>
              <Badge
                variant="outline"
                className="capitalize text-xs border-card/30 text-card"
              >
                {program.level}
              </Badge>
              <Badge
                className={`${statusColors[program.status]} border text-xs capitalize`}
              >
                {program.status}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-card mb-2">
              {program.title}
            </h1>
            {program.instructor && (
              <p className="text-card/70 flex items-center gap-2 text-sm">
                <User className="h-4 w-4" /> Instructor: {program.instructor}
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
                    About This Program
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {program.longDescription || program.description}
                  </p>
                  {program.topics.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        Topics Covered
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {program.topics.map((t) => (
                          <span
                            key={t}
                            className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* What You Get */}
                {program.whatYouGet && program.whatYouGet.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold font-heading text-foreground mb-4">
                      What You&apos;ll Get
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {program.whatYouGet.map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar (enrolled only) */}
                {isEnrolled && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold font-heading text-foreground">
                        Your Progress
                      </h2>
                      <span className="text-sm font-semibold text-primary">
                        {completedCount}/{sortedModules.length} modules
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-3 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {allModulesCompleted
                        ? "🎉 Congratulations! You've completed all modules. Your certificate is ready!"
                        : `Complete all modules${sortedModules.some((m) => m.quiz) ? " and pass their quizzes" : ""} to earn your certificate.`}
                    </p>
                  </div>
                )}

                {/* Curriculum / Modules */}
                <div
                  id="curriculum-section"
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold font-heading text-foreground mb-4">
                    <BookOpen className="h-5 w-5 inline-block mr-2 text-primary" />
                    Curriculum ({program.modules.length} Modules)
                  </h2>

                  {!isEnrolled && (
                    <div className="bg-accent/30 border border-border rounded-xl p-5 mb-4 text-center">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        Course content is locked
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Enroll in this program to access all modules, videos,
                        downloads, and materials.
                      </p>
                      {program.status === "open" && (
                        <Button
                          size="sm"
                          onClick={() => setEnrollDialogOpen(true)}
                          className="gap-1.5 text-xs h-9"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> Enroll to Unlock
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {sortedModules.map((mod, idx) => {
                      const accessible = isModuleAccessible(idx);
                      const completed = isModuleCompleted(mod.id);
                      const hasQuiz = mod.quiz && mod.quiz.questions.length > 0;
                      const quizIsPassed = !!quizPassed[mod.id];

                      return (
                        <div
                          key={mod.id}
                          className={`border rounded-xl overflow-hidden transition-colors ${
                            completed
                              ? "border-primary/30 bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <button
                            onClick={() =>
                              isEnrolled && accessible
                                ? setExpandedModule(
                                    expandedModule === mod.id ? null : mod.id,
                                  )
                                : undefined
                            }
                            className={`w-full flex items-center justify-between p-4 transition-colors text-left ${
                              isEnrolled && accessible
                                ? "hover:bg-accent/50 cursor-pointer"
                                : "cursor-default opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0 ${
                                  completed
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  idx + 1
                                )}
                              </span>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                  {mod.title}
                                  {completed && (
                                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] py-0">
                                      Completed
                                    </Badge>
                                  )}
                                  {hasQuiz && !completed && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] py-0 gap-0.5"
                                    >
                                      <Brain className="h-2.5 w-2.5" />
                                      Quiz
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {mod.duration} • {mod.contentBlocks.length}{" "}
                                  content blocks
                                </p>
                              </div>
                            </div>
                            {isEnrolled ? (
                              accessible ? (
                                expandedModule === mod.id ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          {isEnrolled &&
                            accessible &&
                            expandedModule === mod.id && (
                              <div className="border-t border-border p-4 bg-accent/20 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  {mod.description}
                                </p>

                                {/* Content blocks */}
                                {mod.contentBlocks.map((block) => (
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
                                          {block.title}
                                        </h5>
                                      )}
                                      {block.type === "text" && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {block.content}
                                        </p>
                                      )}
                                      {block.type === "image" && (
                                        <img
                                          src={block.content}
                                          alt={block.caption}
                                          className="mt-2 rounded-lg w-full max-h-48 object-cover"
                                        />
                                      )}
                                      {block.type === "video" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="mt-2 gap-1.5 text-xs h-8"
                                        >
                                          <Play className="h-3.5 w-3.5" /> Watch
                                          Video
                                        </Button>
                                      )}
                                      {block.type === "download" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="mt-2 gap-1.5 text-xs h-8"
                                        >
                                          <Download className="h-3.5 w-3.5" />{" "}
                                          Download
                                        </Button>
                                      )}
                                      {block.type === "checklist" && (
                                        <ul className="mt-2 space-y-1">
                                          {block.content
                                            .split("|")
                                            .map((item) => (
                                              <li
                                                key={item}
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
                                            {block.caption}
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                ))}

                                {/* Module Quiz */}
                                {hasQuiz && !completed && (
                                  <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 mt-2">
                                    {activeQuizModule !== mod.id ? (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Brain className="h-5 w-5 text-primary" />
                                          </div>
                                          <div>
                                            <h5 className="text-sm font-semibold text-foreground">
                                              {mod.quiz!.title}
                                            </h5>
                                            <p className="text-xs text-muted-foreground">
                                              {mod.quiz!.questions.length}{" "}
                                              questions · Pass:{" "}
                                              {mod.quiz!.passingScore}%
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          className="gap-1.5 text-xs h-9"
                                          onClick={() =>
                                            startModuleQuiz(mod.id)
                                          }
                                        >
                                          <Brain className="h-3.5 w-3.5" /> Take
                                          Quiz
                                        </Button>
                                      </div>
                                    ) : !quizFinished ? (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h5 className="text-sm font-semibold text-primary">
                                            {mod.quiz!.title}
                                          </h5>
                                          <span className="text-xs text-muted-foreground">
                                            Q{quizCurrentQ + 1}/
                                            {mod.quiz!.questions.length}
                                          </span>
                                        </div>
                                        <Progress
                                          value={
                                            ((quizCurrentQ + 1) /
                                              mod.quiz!.questions.length) *
                                            100
                                          }
                                          className="h-1.5"
                                        />
                                        {mod.quiz!.questions[quizCurrentQ]
                                          .questionImage && (
                                          <img
                                            src={
                                              mod.quiz!.questions[quizCurrentQ]
                                                .questionImage
                                            }
                                            alt=""
                                            className="w-full max-h-40 object-cover rounded-lg"
                                          />
                                        )}
                                        <p className="text-sm font-medium text-foreground">
                                          {
                                            mod.quiz!.questions[quizCurrentQ]
                                              .question
                                          }
                                        </p>
                                        <div className="space-y-2">
                                          {mod.quiz!.questions[
                                            quizCurrentQ
                                          ].options.map((opt, oi) => (
                                            <button
                                              key={oi}
                                              onClick={() =>
                                                !quizShowExplanation &&
                                                setQuizSelectedAnswer(oi)
                                              }
                                              className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                                                quizShowExplanation
                                                  ? oi ===
                                                    mod.quiz!.questions[
                                                      quizCurrentQ
                                                    ].correctIndex
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : oi === quizSelectedAnswer
                                                      ? "border-destructive bg-destructive/10 text-destructive"
                                                      : "border-border text-muted-foreground"
                                                  : quizSelectedAnswer === oi
                                                    ? "border-primary bg-primary/5 text-foreground"
                                                    : "border-border text-foreground hover:bg-accent"
                                              }`}
                                            >
                                              <span className="font-semibold mr-2">
                                                {String.fromCharCode(65 + oi)}.
                                              </span>
                                              {opt}
                                            </button>
                                          ))}
                                        </div>
                                        {quizShowExplanation && (
                                          <div className="bg-accent/50 border border-border rounded-lg p-3 text-xs text-foreground">
                                            <strong>Explanation:</strong>{" "}
                                            {
                                              mod.quiz!.questions[quizCurrentQ]
                                                .explanation
                                            }
                                          </div>
                                        )}
                                        <div className="flex justify-end gap-2">
                                          {!quizShowExplanation ? (
                                            <Button
                                              size="sm"
                                              onClick={submitQuizAnswer}
                                              disabled={
                                                quizSelectedAnswer === null
                                              }
                                              className="text-xs h-9"
                                            >
                                              Submit
                                            </Button>
                                          ) : (
                                            <Button
                                              size="sm"
                                              onClick={nextQuizQuestion}
                                              className="gap-1 text-xs h-9"
                                            >
                                              {quizCurrentQ + 1 >=
                                              mod.quiz!.questions.length
                                                ? "See Results"
                                                : "Next"}{" "}
                                              <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 space-y-3">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                          <Award className="h-7 w-7 text-primary" />
                                        </div>
                                        <h5 className="text-lg font-bold text-foreground">
                                          {quizScore}/
                                          {mod.quiz!.questions.length}
                                        </h5>
                                        {(() => {
                                          const pct = Math.round(
                                            (quizScore /
                                              mod.quiz!.questions.length) *
                                              100,
                                          );
                                          const passed =
                                            pct >= mod.quiz!.passingScore;
                                          return (
                                            <>
                                              <p className="text-xs text-muted-foreground">
                                                {passed
                                                  ? "🎉 You passed! Module completed!"
                                                  : `You need ${mod.quiz!.passingScore}% to pass. Keep studying!`}
                                              </p>
                                              <div className="flex gap-2 justify-center">
                                                {passed ? (
                                                  <Button
                                                    size="sm"
                                                    onClick={() =>
                                                      handleQuizFinish(
                                                        mod.id,
                                                        quizScore,
                                                        mod.quiz!.questions
                                                          .length,
                                                        mod.quiz!.passingScore,
                                                      )
                                                    }
                                                    className="text-xs h-9"
                                                  >
                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                                    Complete Module
                                                  </Button>
                                                ) : (
                                                  <>
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() =>
                                                        setActiveQuizModule(
                                                          null,
                                                        )
                                                      }
                                                      className="text-xs h-9"
                                                    >
                                                      Close
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      className="gap-1 text-xs h-9"
                                                      onClick={() =>
                                                        startModuleQuiz(mod.id)
                                                      }
                                                    >
                                                      <RotateCcw className="h-3.5 w-3.5" />{" "}
                                                      Retry
                                                    </Button>
                                                  </>
                                                )}
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Mark as complete button (only for modules without quiz) */}
                                {!hasQuiz && !completed && (
                                  <Button
                                    className="w-full gap-2 mt-2 text-xs h-10"
                                    onClick={() => markModuleComplete(mod.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" /> Mark as
                                    Completed
                                  </Button>
                                )}

                                {completed && (
                                  <div className="flex items-center gap-2 justify-center text-xs text-primary font-medium py-2">
                                    <CheckCircle className="h-4 w-4" /> Module
                                    Completed
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
                {program.certificate && (
                  <div
                    className={`border rounded-2xl p-6 ${
                      allModulesCompleted && isEnrolled
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold font-heading text-foreground">
                        <Award className="h-5 w-5 inline-block mr-2 text-primary" />
                        Certificate
                      </h2>
                    </div>

                    {!isEnrolled ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" /> Enroll and complete all
                        modules to earn your certificate.
                      </div>
                    ) : !allModulesCompleted ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Complete all {sortedModules.length} modules to unlock
                          your certificate. You&apos;ve completed {completedCount} so
                          far.
                        </p>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <CheckCircle className="h-4 w-4" /> 🎉 All modules
                          completed! Your certificate is ready.
                        </div>
                        <div className="flex gap-3">
                          <Button
                            className="gap-2 text-xs h-10"
                            onClick={() => setCertDialogOpen(true)}
                          >
                            <Award className="h-4 w-4" /> View Certificate
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 text-xs h-10"
                            onClick={handleDownloadCertificate}
                          >
                            <Download className="h-4 w-4" /> Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructor */}
                {program.instructor && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold font-heading text-foreground mb-4">
                      Your Instructor
                    </h2>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {program.instructor}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {program.instructorBio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-5">
                  {/* Price Card */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="text-center mb-5">
                      <p className="text-3xl font-bold text-foreground">
                        {isFree ? "FREE" : formatPrice(program.price)}
                      </p>
                      {program.certificate && (
                        <p className="text-xs text-primary flex items-center justify-center gap-1 mt-1">
                          <Award className="h-3.5 w-3.5" /> Certificate included
                        </p>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{program.enrolled} enrolled</span>
                        <span>{spotsLeft} spots left</span>
                      </div>
                      <Progress value={enrollmentPercent} className="h-2" />
                    </div>

                    {isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-center text-sm text-primary font-medium">
                          <CheckCircle className="h-4 w-4" /> You&apos;re Enrolled
                        </div>
                        {isEnrolled && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <Progress
                              value={progressPercent}
                              className="h-1.5"
                            />
                          </div>
                        )}
                        <Button
                          className="w-full gap-2 text-xs h-10"
                          size="sm"
                          onClick={() => {
                            const nextIncomplete = sortedModules.find(
                              (m) => !moduleCompletions[m.id],
                            );
                            if (nextIncomplete)
                              setExpandedModule(nextIncomplete.id);
                            document
                              .getElementById("curriculum-section")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          <Play className="h-4 w-4" /> Continue Learning
                        </Button>
                      </div>
                    ) : (
                      <>
                        {program.status === "open" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            onClick={() => setEnrollDialogOpen(true)}
                          >
                            <BookOpen className="h-4 w-4" /> Enroll Now
                          </Button>
                        )}
                        {program.status === "full" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            variant="secondary"
                            onClick={() => setNotifyDialogOpen(true)}
                          >
                            <Bell className="h-4 w-4" /> Join Waitlist
                          </Button>
                        )}
                        {program.status === "upcoming" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            variant="outline"
                            onClick={() => setNotifyDialogOpen(true)}
                          >
                            <Bell className="h-4 w-4" /> Notify Me
                          </Button>
                        )}
                        {program.status === "completed" && (
                          <Button
                            className="w-full text-xs h-10"
                            size="sm"
                            variant="secondary"
                            disabled
                          >
                            Program Completed
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Details Card */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-foreground text-sm">
                      Program Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Duration
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {program.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Starts
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {program.startDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Class Size
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            Max {program.maxParticipants} participants
                          </p>
                        </div>
                      </div>
                      {program.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Location
                            </p>
                            <p className="font-medium text-foreground text-sm">
                              {program.location}
                            </p>
                          </div>
                        </div>
                      )}
                      {program.language && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Language
                            </p>
                            <p className="font-medium text-foreground text-sm">
                              {program.language}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Schedule
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {program.schedule}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  {program.requirements && program.requirements.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground text-sm mb-3">
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {program.requirements.map((req) => (
                          <li
                            key={req}
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
              Enroll in Program
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isFree
                ? "This is a free program. Fill in your details to enroll."
                : `Complete your enrollment for ${formatPrice(program.price)}.`}
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
            {!isFree && (
              <div className="space-y-3">
                <Label className="text-[11px]">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors h-10 justify-center ${
                      paymentMethod === "momo"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" /> Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors h-10 justify-center ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Card
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
                ? "Processing..."
                : isFree
                  ? "Complete Enrollment"
                  : `Pay ${formatPrice(program.price)}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {program.status === "full" ? "Join Waitlist" : "Get Notified"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {program.status === "full"
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
              {program.status === "full" ? "Join Waitlist" : "Notify Me"}
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
                Your Certificate
              </DialogTitle>
              <DialogDescription className="text-xs">
                Congratulations on completing the program!
              </DialogDescription>
            </DialogHeader>
            <div
              ref={certRef}
              className="border-4 border-double rounded-xl p-8 text-center space-y-4 bg-card"
              style={{ borderColor: program.certificateTemplate.badgeColor }}
            >
              {/* Company Logo */}
              <div className="flex justify-center items-center gap-2 mb-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold font-heading text-primary">
                  Agri-Eco Connect
                </span>
              </div>
              <div className="flex justify-center">
                <Award
                  className="h-12 w-12"
                  style={{ color: program.certificateTemplate.badgeColor }}
                />
              </div>
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {program.certificateTemplate.title}
              </h2>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                {program.certificateTemplate.subtitle}
              </p>
              <div className="py-4">
                <p className="text-lg text-foreground font-medium">
                  This certifies that
                </p>
                <p className="text-2xl font-bold text-primary my-2 font-heading">
                  [Your Name]
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {program.certificateTemplate.description}
                </p>
              </div>
              <div className="pt-6 border-t border-border">
                <div className="flex justify-between items-end px-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Date of Completion
                    </p>
                    <p className="text-sm font-medium text-foreground border-t border-foreground pt-1 px-4">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  {/* QR Code placeholder */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 border-2 border-border rounded-lg flex items-center justify-center bg-accent/30">
                      <QrCode className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Verify
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {program.certificateTemplate.signatoryTitle}
                    </p>
                    <p className="text-sm font-medium text-foreground border-t border-foreground pt-1 px-4 italic">
                      {program.certificateTemplate.signatoryName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <Button
                className="gap-2 text-xs h-10"
                onClick={handleDownloadCertificate}
              >
                <Download className="h-4 w-4" /> Download Certificate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
