"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  fetchTrainingProgramBySlug,
  enrollInProgram,
  fetchMyEnrollments,
} from "@/lib/api/education";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
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



export default function ProgramDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice } = usePricing();
  const { isAuthenticated, user: authUser } = useAuth();

  const { data: apiProgram, isLoading, isError } = useQuery({
    queryKey: ["trainingProgram", slug],
    queryFn: () => fetchTrainingProgramBySlug(slug as string),
    enabled: !!slug,
  });

  const { data: myEnrollments } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: () => fetchMyEnrollments(),
    enabled: isAuthenticated,
  });


  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [enrolling, setEnrolling] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated && myEnrollments?.data && apiProgram) {
      const isEnrolledBackend = myEnrollments.data.some(
        (e: any) =>
          e.trainingProgramId === apiProgram.id &&
          ["approved", "completed"].includes(e.status),
      );
      setIsEnrolled(isEnrolledBackend);
    } else if (!isAuthenticated && typeof window !== "undefined") {
      const enrolled = JSON.parse(
        localStorage.getItem("enrolledPrograms") || "[]",
      );
      setIsEnrolled(enrolled.includes(slug));
    }
  }, [isAuthenticated, myEnrollments, apiProgram, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading program details...</p>
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
            Program Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The training program you&apos;re looking for doesn&apos;t exist or something went wrong.
          </p>
          <Button asChild>
            <Link href="/education">Back to Education</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const program = {
    ...apiProgram,
    price: apiProgram.priceRwf,
    image: apiProgram.heroImage || apiProgram.coverImage || "/assets/tours/educational.jpg",
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
    enrolled: 0, 
    status: "open", 
    topics: (apiProgram.topics || []).map((t: any) => t.name),
    description: apiProgram.shortDescription || apiProgram.fullDescription,
    longDescription: apiProgram.fullDescription,
    certificateTemplate: apiProgram.certificateTemplate || null,
    instructor: apiProgram.instructor || { en: "", rw: "" },
    instructorBio: apiProgram.instructorBio || { en: "", rw: "" },
    requirements: apiProgram.requirements || [],
    whatYouGet: apiProgram.whatYouGet || [],
    certificate: apiProgram.type === "certification",
    location: apiProgram.location || { en: "", rw: "" },
    language: { 
      en: apiProgram.language === "en" ? "English" : apiProgram.language === "rw" ? "Kinyarwanda" : apiProgram.language,
      rw: apiProgram.language === "en" ? "Icyongereza" : apiProgram.language === "rw" ? "Ikinyarwanda" : apiProgram.language
    },
  };

  const sortedModules = [...program.modules].sort((a, b) => a.order - b.order);
  const isFree = program.price === 0;

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
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

      await enrollInProgram(apiProgram.id, payload);

      if (!isAuthenticated) {
        const enrolled = JSON.parse(localStorage.getItem("enrolledPrograms") || "[]");
        if (!enrolled.includes(slug)) enrolled.push(slug);
        localStorage.setItem("enrolledPrograms", JSON.stringify(enrolled));
        setIsEnrolled(true);
      }

      setEnrollDialogOpen(false);
      toast.success(isFree ? "Enrollment Successful!" : "Enrollment Pending", {
        description: isFree
          ? `You're now enrolled in "${t(program.title)}".`
          : "Your enrollment is being processed. Please proceed with payment if required.",
      });

      // Refresh enrollments if authenticated
      if (isAuthenticated) {
        // queryClient.invalidateQueries(["myEnrollments"]) would be better here
        // for now we just rely on the next poll or navigation
      }
    } catch (err: any) {
      toast.error("Enrollment Failed", {
        description: err.message || "An error occurred during enrollment.",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyDialogOpen(false);
    toast.success("Notification Set!", {
      description: `We'll notify you when "${t(program.title)}" opens for enrollment.`,
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

  const handleDownloadCertificate = () => {
    const certHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Certificate - ${t(program.title)}</title>
<style>
  body { font-family: Georgia, serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f9f9f6; }
  .cert { border: 6px double ${program?.certificateTemplate?.badgeColor || "#16a34a"}; border-radius: 16px; padding: 60px; max-width: 800px; text-align: center; background: white; position: relative; }
  .logo-img { height: 64px; width: auto; margin-bottom: 20px; }
  .subtitle { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 30px; }
  h1 { font-size: 32px; color: #333; margin: 0 0 8px; }
  .certifies { font-size: 14px; color: #666; margin: 20px 0 6px; }
  .name { font-size: 28px; color: ${program?.certificateTemplate?.badgeColor || "#16a34a"}; font-weight: bold; margin: 10px 0 20px; }
  .desc { font-size: 13px; color: #666; max-width: 500px; margin: 0 auto 30px; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; }
  .sig { text-align: center; }
  .sig .line { border-top: 1px solid #333; padding-top: 4px; font-size: 12px; min-width: 150px; }
  .sig .title { font-size: 10px; color: #888; margin-bottom: 4px; }
  .qr { width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #aaa; }
</style></head><body>
<div class="cert">
  <img src="/assets/logo/logo.png" class="logo-img" alt="Agri-Eco Connect">
  <div class="subtitle">${t({ en: "Certificate of Completion", rw: "Icyemezo cy'uko wasoje inyigisho" })}</div>
  <h1>${t(program?.certificateTemplate?.title) || "Certificate of Achievement"}</h1>
  <p class="certifies">${t({ en: "This certifies that", rw: "Ibi biremeza ko" })}</p>
  <p class="name">${authUser?.name || "[Your Name]"}</p>
  <p class="desc">${t(program?.certificateTemplate?.description) || t({ en: `Has successfully completed all modules of "${t(program.title)}"`, rw: `Yasoje neza inyigisho zose za "${t(program.title)}"` })}</p>
  <div class="footer">
    <div class="sig"><div class="title">${t({ en: "Date of Completion", rw: "Itariki yuzuyeho" })}</div><div class="line">${new Date().toLocaleDateString()}</div></div>
    <div class="qr">QR Code</div>
    <div class="sig"><div class="title">${t(program?.certificateTemplate?.signatoryTitle) || "Director"}</div><div class="line">${t(program?.certificateTemplate?.signatoryName) || "Agri-Eco Connect"}</div></div>
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
            alt={t(program.title)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
          <div className="relative container h-full flex flex-col justify-end pb-8">
            <Link
              href="/education"
              className="inline-flex items-center gap-1.5 text-card/70 hover:text-card text-sm mb-4 transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" /> {t({ en: "Back to Education", rw: "Subira kuri Education" })}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="capitalize text-xs border-card/30 text-card"
              >
                {t({ en: program.type, rw: program.type === "certification" ? "Impamyabumenyi" : program.type })}
              </Badge>
              <Badge
                variant="outline"
                className="capitalize text-xs border-card/30 text-card"
              >
                {t(program.level)}
              </Badge>
              <Badge
                className={`${statusColors[program.status]} border text-xs capitalize`}
              >
                {t({ en: program.status, rw: program.status === "open" ? "Bifunguye" : program.status })}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-card mb-2">
              {t(program.title)}
            </h1>
            {program.instructor && (
              <p className="text-card/70 flex items-center gap-2 text-sm">
                <User className="h-4 w-4" /> {t({ en: "Instructor", rw: "Umuhazabumenyi" })}: {t(program.instructor)}
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
                    {t({ en: "About This Program", rw: "Ibihereranye n'iyi gahunda" })}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {t(program.longDescription) || t(program.description)}
                  </p>
                  {program.topics.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        {t({ en: "Topics Covered", rw: "Ibizigwa" })}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {program.topics.map((topicName: any, tidx: number) => (
                          <span
                            key={tidx}
                            className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full"
                          >
                            {t(topicName)}
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
                      {t({ en: "What You'll Get", rw: "Icyo uzahabwa" })}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {program.whatYouGet.map((item: any, iidx: number) => (
                        <div key={iidx} className="flex items-start gap-2.5">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">
                            {t(item)}
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
                    {t({ en: "Curriculum", rw: "Intekanyanyigisho" })} ({program.modules.length} {t({ en: "Modules", rw: "Inyongerabyigwa" })})
                  </h2>

                  {!isEnrolled && (
                    <div className="bg-accent/30 border border-border rounded-xl p-5 mb-4 text-center">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {t({ en: "Course content is locked", rw: "Ibirimo birafunze" })}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {t({ 
                          en: "Enroll in this program to access all modules, videos, downloads, and materials.", 
                          rw: "Yandikishe muri iyi gahunda kugira ngo ubashe kubona amasomo, amavideo, no gukuraho ibitabo." 
                        })}
                      </p>
                      {program.status === "open" && (
                        <Button
                          size="sm"
                          onClick={() => setEnrollDialogOpen(true)}
                          className="gap-1.5 text-xs h-9"
                        >
                          <BookOpen className="h-3.5 w-3.5" /> {t({ en: "Enroll to Unlock", rw: "Yandikishe kugira ngo ufungure" })}
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {sortedModules.map((mod: any, idx) => {
                      return (
                        <div
                          key={mod.id}
                          className="border rounded-xl overflow-hidden transition-colors border-border"
                        >
                          <button
                            onClick={() =>
                              isEnrolled
                                ? toggleModule(mod.id)
                                : undefined
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
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {t(mod.duration)} • {mod.contentBlocks.length}{" "}
                                  {t({ en: "content blocks", rw: "ibice bigize isomo" })}
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
                              {mod.contentBlocks.map((block: any) => (
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
                                      <img
                                        src={t(block.content)}
                                        alt={t(block.caption)}
                                        className="mt-2 rounded-lg w-full max-h-48 object-cover"
                                      />
                                    )}
                                    {block.type === "video" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 gap-1.5 text-xs h-8"
                                      >
                                        <Play className="h-3.5 w-3.5" /> {t({ en: "Watch Video", rw: "Reba Video" })}
                                      </Button>
                                    )}
                                    {block.type === "download" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 gap-1.5 text-xs h-8"
                                      >
                                        <Download className="h-3.5 w-3.5" />{" "}
                                        {t({ en: "Download", rw: "Kuraho" })}
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Certificate Section */}
                {program.certificate && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold font-heading text-foreground">
                        <Award className="h-5 w-5 inline-block mr-2 text-primary" />
                        {t({ en: "Certificate", rw: "Impamyabumenyi" })}
                      </h2>
                    </div>

                    {!isEnrolled ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" /> {t({ en: "Enroll in this program to earn your certificate.", rw: "Yandikishe muri iyi gahunda kugira ngo uhabwe impamyabumenyi." })}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <CheckCircle className="h-4 w-4" /> {t({ en: "You're enrolled! Complete the curriculum to get your certificate.", rw: "Wiyandikishije! Reba inyigisho zose kugira ngo uhabwe impamyabumenyi." })}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            className="gap-2 text-xs h-10"
                            onClick={() => setCertDialogOpen(true)}
                          >
                            <Award className="h-4 w-4" /> {t({ en: "View Certificate Template", rw: "Reba uko impamyabumenyi isa" })}
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 text-xs h-10"
                            onClick={handleDownloadCertificate}
                          >
                            <Download className="h-4 w-4" /> {t({ en: "Download", rw: "Kuraho" })}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {program.instructor && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold font-heading text-foreground mb-4">
                      {t({ en: "Your Instructor", rw: "Umuhazabumenyi wawe" })}
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
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-5">
                  {/* Price Card */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="text-center mb-5">
                      <p className="text-3xl font-bold text-foreground">
                        {isFree ? t({ en: "FREE", rw: "UBUNTU" }) : formatPrice(program.price)}
                      </p>
                      {program.certificate && (
                        <p className="text-xs text-primary flex items-center justify-center gap-1 mt-1">
                          <Award className="h-3.5 w-3.5" /> {t({ en: "Certificate included", rw: "Harimo n'impamyabumenyi" })}
                        </p>
                      )}
                    </div>

                    {isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 justify-center text-sm text-primary font-medium">
                          <CheckCircle className="h-4 w-4" /> {t({ en: "You're Enrolled", rw: "Wiyandikishije" })}
                        </div>
                        <Button
                          className="w-full gap-2 text-xs h-10"
                          size="sm"
                          onClick={() => {
                            document
                              .getElementById("curriculum-section")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          <Play className="h-4 w-4" /> {t({ en: "View Curriculum", rw: "Reba inyigisho" })}
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
                            <BookOpen className="h-4 w-4" /> {t({ en: "Enroll Now", rw: "Iyandikishe ubu" })}
                          </Button>
                        )}
                        {program.status === "full" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            variant="secondary"
                            onClick={() => setNotifyDialogOpen(true)}
                          >
                            <Bell className="h-4 w-4" /> {t({ en: "Join Waitlist", rw: "Yiyandikishe ku rutonde" })}
                          </Button>
                        )}
                        {program.status === "upcoming" && (
                          <Button
                            className="w-full gap-2 text-xs h-10"
                            size="sm"
                            variant="outline"
                            onClick={() => setNotifyDialogOpen(true)}
                          >
                            <Bell className="h-4 w-4" /> {t({ en: "Notify Me", rw: "Unyibutse" })}
                          </Button>
                        )}
                        {program.status === "completed" && (
                          <Button
                            className="w-full text-xs h-10"
                            size="sm"
                            variant="secondary"
                            disabled
                          >
                            {t({ en: "Program Completed", rw: "Gahunda yarangiye" })}
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Details Card */}
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold text-foreground text-sm">
                      {t({ en: "Program Details", rw: "Ibisobanuro bya Gahunda" })}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            {t({ en: "Duration", rw: "Igihe kizamara" })}
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
                            {t({ en: "Starts", rw: "Itangira" })}
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
                            {t({ en: "Class Size", rw: "Ingano y'ishuri" })}
                          </p>
                          <p className="font-medium text-foreground text-sm">
                            {t({ en: "Max", rw: "Kugeza ku" })} {program.maxParticipants} {t({ en: "participants", rw: "abanyeshuri" })}
                          </p>
                        </div>
                      </div>
                      {program.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-muted-foreground text-xs">
                              {t({ en: "Location", rw: "Ahantu" })}
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
                              {t({ en: "Language", rw: "Ururimi" })}
                            </p>
                            <p className="font-medium text-foreground text-sm">
                              {t(program.language)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}                 {program.requirements && program.requirements.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground text-sm mb-3">
                        {t({ en: "Requirements", rw: "Ibisabwa" })}
                      </h3>
                      <ul className="space-y-2">
                        {program.requirements.map((req: any, ridx: number) => (
                          <li
                            key={ridx}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />{" "}
                            {t(req)}
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
              {t({ en: "Enroll in Program", rw: "Iyandikishe muri Gahunda" })}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isFree
                ? t({ en: "This is a free program. Fill in your details to enroll.", rw: "Iyi ni gahunda y'ubuntu. Uzuza neza amakuru yawe kugira ngo wiyandikishe." })
                : t({ en: `Complete your enrollment for ${formatPrice(program.price)}.`, rw: `Uzuza iyandikisha ryawe wishyura ${formatPrice(program.price)}.` })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnroll} className="space-y-4 pt-2">
            <div>
              <Label className="text-[11px] mb-1 block">{t({ en: "Full Name *", rw: "Amazina Yose *" })}</Label>
              <Input
                name="fullName"
                required
                placeholder={t({ en: "Your full name", rw: "Amazina yawe yose" })}
                className="h-9 text-xs"
                defaultValue={authUser?.name || ""}
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">{t({ en: "Email *", rw: "Imeri *" })}</Label>
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
              <Label className="text-[11px] mb-1 block">{t({ en: "Phone *", rw: "Telefoni *" })}</Label>
              <Input
                name="phone"
                required
                placeholder="+250 7XX XXX XXX"
                className="h-9 text-xs"
              />
            </div>
            {!isFree && (
              <div className="space-y-3">
                <Label className="text-[11px]">{t({ en: "Payment Method", rw: "Uburyo bwo kwishyura" })}</Label>
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
                    <Smartphone className="h-4 w-4" /> {t({ en: "Mobile Money", rw: "Momo" })}
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
                    <CreditCard className="h-4 w-4" /> {t({ en: "Card", rw: "Ikarita" })}
                  </button>
                </div>
                {paymentMethod === "momo" && (
                  <div>
                    <Label className="text-[11px] mb-1 block">
                      {t({ en: "MOMO Number *", rw: "Nimero ya MOMO *" })}
                    </Label>
                    <Input
                      name="momoNumber"
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
                        {t({ en: "Card Number *", rw: "Nimero y'ikarita *" })}
                      </Label>
                      <Input
                        name="cardNumber"
                        required
                        placeholder="4242 4242 4242 4242"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-[11px] mb-1 block">
                          {t({ en: "Expiry *", rw: "Igihe izarangirira *" })}
                        </Label>
                        <Input
                          name="expiry"
                          required
                          placeholder="MM/YY"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] mb-1 block">CVV *</Label>
                        <Input
                          name="cvv"
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
                    <span className="text-muted-foreground">{t({ en: "Program Fee", rw: "Ikiguzi cya Gahunda" })}</span>
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
                ? t({ en: "Processing...", rw: "Biracyatunganywa..." })
                : isFree
                  ? t({ en: "Complete Enrollment", rw: "Yandikishe Burundu" })
                  : `${t({ en: "Pay", rw: "Ishyura" })} ${formatPrice(program.price)}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notify Dialog */}
      <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              {program.status === "full" ? t({ en: "Join Waitlist", rw: "Yiyandikishe ku rutonde" }) : t({ en: "Get Notified", rw: "Unyibutse" })}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {program.status === "full"
                ? t({ en: "We'll contact you when a spot opens up.", rw: "Tuzakumenyesha umwanya niboneka." })
                : t({ en: "We'll notify you when enrollment opens.", rw: "Tuzakumenyesha kwiyandikisha nibitangira." })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNotify} className="space-y-4 pt-2">
            <div>
              <Label className="text-[11px] mb-1 block">{t({ en: "Full Name *", rw: "Amazina Yose *" })}</Label>
              <Input
                required
                placeholder={t({ en: "Your full name", rw: "Amazina yawe yose" })}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">{t({ en: "Email *", rw: "Imeri *" })}</Label>
              <Input
                type="email"
                required
                placeholder="you@example.com"
                className="h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-[11px] mb-1 block">{t({ en: "Phone (optional)", rw: "Telefoni (niba uayifite)" })}</Label>
              <Input placeholder="+250 7XX XXX XXX" className="h-9 text-xs" />
            </div>
            <Button type="submit" className="w-full text-xs h-10">
              {program.status === "full" ? t({ en: "Join Waitlist", rw: "Yiyandikishe ku rutonde" }) : t({ en: "Notify Me", rw: "Unyibutse" })}
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
                {t({ en: "Your Certificate", rw: "Impamyabumenyi Yawe" })}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t({ en: "Congratulations on completing the program!", rw: "Urashimwa ko wasoje iyi gahunda!" })}
              </DialogDescription>
            </DialogHeader>
            <div
              ref={certRef}
              className="border-4 border-double rounded-xl p-8 text-center space-y-4 bg-card"
              style={{ borderColor: program.certificateTemplate.badgeColor }}
            >
              <div className="flex justify-center items-center gap-2 mb-6">
                <img
                  src="/assets/logo/logo.png"
                  alt="Company Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <div className="flex justify-center">
                <Award
                  className="h-12 w-12"
                  style={{ color: program.certificateTemplate.badgeColor }}
                />
              </div>
              <h2 className="text-2xl font-bold font-heading text-foreground">
                {t(program.certificateTemplate.title)}
              </h2>
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                {t(program.certificateTemplate.subtitle)}
              </p>
              <div className="py-4">
                <p className="text-lg text-foreground font-medium">
                  {t({ en: "This certifies that", rw: "Ibi biremeza ko" })}
                </p>
                <p className="text-2xl font-bold text-primary my-2 font-heading">
                  {authUser?.name || "[Your Name]"}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t(program.certificateTemplate.description)}
                </p>
              </div>
              <div className="pt-6 border-t border-border">
                <div className="flex justify-between items-end px-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t({ en: "Date of Completion", rw: "Itariki yuzuyeho" })}
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
                      {t({ en: "Verify", rw: "Check" })}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t(program.certificateTemplate.signatoryTitle)}
                    </p>
                    <p className="text-sm font-medium text-foreground border-t border-foreground pt-1 px-4 italic">
                      {t(program.certificateTemplate.signatoryName)}
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
                <Download className="h-4 w-4" /> {t({ en: "Download Certificate", rw: "Kuraho Impamyabumenyi" })}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
