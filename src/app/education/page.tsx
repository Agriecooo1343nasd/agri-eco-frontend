"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trainingPrograms, learningResources, quizzes } from "@/data/education";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  full: "bg-destructive/10 text-destructive border-destructive/20",
  upcoming: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  completed: "bg-muted text-muted-foreground border-border",
};

const typeIcons: Record<string, string> = {
  article: "📄",
  video: "🎬",
  guide: "📖",
  worksheet: "📝",
};

export default function EducationPage() {
  const { formatPrice } = usePricing();
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<(typeof quizzes)[0] | null>(
    null,
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [resourceFilter, setResourceFilter] = useState("all");

  const startQuiz = (quiz: (typeof quizzes)[0]) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
    setQuizDialogOpen(true);
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

  const filteredResources =
    resourceFilter === "all"
      ? learningResources
      : learningResources.filter((r) => r.type === resourceFilter);

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
                <GraduationCap className="h-3.5 w-3.5" /> Educational Hub
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-white leading-tight">
                Learn, Grow, Thrive
              </h1>
              <p className="text-card/80 text-lg mb-6 text-white/90">
                Training programs for farmers, school visits for students, and
                learning resources for everyone passionate about sustainable
                agriculture.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  size="lg"
                  className="gap-2 text-sm"
                  onClick={() => setSchoolDialogOpen(true)}
                >
                  <School className="h-4 w-4" /> Book School Visit
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-card/30 text-white bg-card/10 hover:bg-card/40 gap-2 text-sm"
                >
                  <BookOpen className="h-4 w-4" /> Browse Resources
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container">
            <Tabs defaultValue="training" className="space-y-8">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 h-auto p-1 bg-card border border-border">
                <TabsTrigger
                  value="training"
                  className="gap-1 text-[10px] sm:text-xs py-2"
                >
                  <GraduationCap className="h-3.5 w-3.5 hidden sm:block" />
                  Training
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="gap-1 text-[10px] sm:text-xs py-2"
                >
                  <BookOpen className="h-3.5 w-3.5 hidden sm:block" />
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  value="quizzes"
                  className="gap-1 text-[10px] sm:text-xs py-2"
                >
                  <Brain className="h-3.5 w-3.5 hidden sm:block" />
                  Quizzes
                </TabsTrigger>
                <TabsTrigger
                  value="schools"
                  className="gap-1 text-[10px] sm:text-xs py-2"
                >
                  <School className="h-3.5 w-3.5 hidden sm:block" />
                  Schools
                </TabsTrigger>
              </TabsList>

              {/* Training Programs */}
              <TabsContent value="training" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="section-heading text-xl">
                    Farmer Training Programs
                  </h2>
                  <p className="section-subheading text-muted-foreground text-sm">
                    Build your skills with hands-on courses and workshops
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {trainingPrograms.map((p) => (
                    <div
                      key={p.id}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
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
                            {p.level}
                          </Badge>
                          <Badge
                            className={`${statusColors[p.status]} border text-[10px] py-0 px-2 capitalize`}
                          >
                            {p.status}
                          </Badge>
                        </div>
                        <h3 className="font-bold font-heading text-foreground text-lg mb-2">
                          {p.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {p.description}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {p.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {p.startDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {p.enrolled}/{p.maxParticipants}
                          </span>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Enrollment</span>
                            <span>
                              {Math.round(
                                (p.enrolled / p.maxParticipants) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={(p.enrolled / p.maxParticipants) * 100}
                            className="h-1.5"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {p.topics.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                          {p.topics.length > 4 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{p.topics.length - 4} more
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <div>
                            <span className="text-lg font-bold text-foreground">
                              {formatPrice(p.price)}
                            </span>
                            {p.certificate && (
                              <span className="flex items-center gap-1 text-[10px] text-primary mt-0.5 font-semibold">
                                <Award className="h-3 w-3" />
                                Certificate included
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="text-xs"
                            disabled={
                              p.status === "full" || p.status === "completed"
                            }
                          >
                            {p.status === "full"
                              ? "Full"
                              : p.status === "upcoming"
                                ? "Notify Me"
                                : "Enroll Now"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Learning Resources */}
              <TabsContent value="resources" className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="section-heading text-xl">
                    Learning Resources
                  </h2>
                  <p className="section-subheading text-muted-foreground text-sm">
                    Articles, videos, guides, and worksheets on sustainable
                    agriculture
                  </p>
                </div>
                <div className="flex justify-center gap-2 flex-wrap mb-6">
                  {["all", "article", "video", "guide", "worksheet"].map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setResourceFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs capitalize transition-colors ${resourceFilter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-accent"}`}
                      >
                        {f === "all" ? "All Types" : f + "s"}
                      </button>
                    ),
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((r) => (
                    <div
                      key={r.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={r.image}
                          alt={r.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-2 py-1 rounded-lg">
                          {typeIcons[r.type]} {r.type}
                        </span>
                        {r.duration && (
                          <span className="absolute bottom-3 right-3 bg-foreground/70 text-card text-[10px] px-2 py-1 rounded-lg">
                            {r.duration}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="capitalize text-[10px] py-0 px-2"
                          >
                            {r.category.replace("-", " ")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="capitalize text-[10px] py-0 px-2"
                          >
                            {r.difficulty}
                          </Badge>
                        </div>
                        <h3 className="font-bold font-heading text-foreground mb-2 text-sm">
                          {r.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {r.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-xs"
                        >
                          {r.type === "video" ? (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              Watch
                            </>
                          ) : r.downloadUrl ? (
                            <>
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </>
                          ) : (
                            <>
                              <FileText className="h-3.5 w-3.5" />
                              Read
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Quizzes */}
              <TabsContent value="quizzes" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="section-heading text-xl">
                    Test Your Knowledge
                  </h2>
                  <p className="section-subheading text-muted-foreground text-sm">
                    Take a quiz to reinforce what you've learned
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {quizzes.map((q) => (
                    <div
                      key={q.id}
                      className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                    >
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-bold font-heading text-foreground text-lg mb-1">
                        {q.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        {q.description}
                      </p>
                      <div className="flex justify-center gap-3 text-[10px] text-muted-foreground mb-5 font-semibold">
                        <span>{q.questionCount} questions</span>
                        <span>•</span>
                        <span>{q.duration}</span>
                        <span>•</span>
                        <span className="capitalize">{q.difficulty}</span>
                      </div>
                      <Button
                        className="w-full gap-2 text-xs"
                        onClick={() => startQuiz(q)}
                      >
                        Start Quiz <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Schools */}
              <TabsContent value="schools" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="section-heading text-xl">
                    School Visit Programs
                  </h2>
                  <p className="section-subheading text-muted-foreground text-sm">
                    Curriculum-aligned farm visits for primary and secondary
                    schools
                  </p>
                </div>
                <div className="max-w-3xl mx-auto">
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="font-bold font-heading text-foreground text-lg mb-4">
                          What's Included
                        </h3>
                        <ul className="space-y-3">
                          {[
                            "Curriculum-aligned activities",
                            "Student workbooks",
                            "Organic lunch for all",
                            "Teacher resource packs",
                            "Certificates of participation",
                            "Pre & post-visit materials",
                          ].map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm text-foreground"
                            >
                              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold font-heading text-foreground text-lg mb-4">
                          Program Details
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Duration
                            </span>
                            <span className="font-bold text-foreground">
                              Full day (6 hours)
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-bold text-foreground">
                              {formatPrice(5000)}/student
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Group Size
                            </span>
                            <span className="font-bold text-foreground">
                              10 - 50 students
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">
                              Levels
                            </span>
                            <span className="font-bold text-foreground">
                              Primary & Secondary
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              Advance Booking
                            </span>
                            <span className="font-bold text-foreground font-semibold">
                              2 weeks required
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="w-full gap-2 text-sm"
                      onClick={() => setSchoolDialogOpen(true)}
                    >
                      <School className="h-4 w-4" /> Book a School Visit
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />

      {/* School Visit Booking Dialog */}
      <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading border-b pb-2">
              Book a School Visit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fill in your school details and we'll confirm your visit within 48
              hours.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Visit Request Submitted!", {
                description: "We'll confirm your booking within 48 hours.",
              });
              setSchoolDialogOpen(false);
            }}
            className="space-y-4 pt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">School Name *</Label>
                <Input
                  required
                  placeholder="e.g. Green Hills Academy"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">
                  Contact Person *
                </Label>
                <Input
                  required
                  placeholder="Teacher name"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Email *</Label>
                <Input
                  type="email"
                  required
                  placeholder="contact@school.rw"
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
              <div>
                <Label className="text-[11px] mb-1 block">
                  Number of Students *
                </Label>
                <Input
                  type="number"
                  required
                  min={10}
                  max={50}
                  placeholder="e.g. 35"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">Grade Level *</Label>
                <Select required>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary-lower" className="text-xs">
                      Primary 1-3
                    </SelectItem>
                    <SelectItem value="primary-upper" className="text-xs">
                      Primary 4-6
                    </SelectItem>
                    <SelectItem value="secondary-lower" className="text-xs">
                      Secondary 1-3
                    </SelectItem>
                    <SelectItem value="secondary-upper" className="text-xs">
                      Secondary 4-6
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] mb-1 block">
                  Preferred Date *
                </Label>
                <Input type="date" required className="h-9 text-xs" />
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Curriculum Alignment
                </Label>
                <Select>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="science" className="text-xs">
                      Science & Environment
                    </SelectItem>
                    <SelectItem value="biology" className="text-xs">
                      Biology & Agriculture
                    </SelectItem>
                    <SelectItem value="geography" className="text-xs">
                      Geography
                    </SelectItem>
                    <SelectItem value="general" className="text-xs">
                      General Knowledge
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-[11px] mb-1 block">
                  Special Requirements
                </Label>
                <Textarea
                  placeholder="Dietary needs, etc."
                  className="text-xs"
                  rows={2}
                />
              </div>
            </div>
            <Button type="submit" className="w-full text-xs h-10">
              Submit Booking Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg border-b pb-2">
              {activeQuiz?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {quizFinished
                ? "Quiz Complete!"
                : `Question ${currentQ + 1} of ${activeQuiz?.questions.length}`}
            </DialogDescription>
          </DialogHeader>
          {activeQuiz && !quizFinished && (
            <div className="space-y-4 pt-2">
              <Progress
                value={((currentQ + 1) / activeQuiz.questions.length) * 100}
                className="h-1.5"
              />
              <p className="font-bold text-foreground text-sm leading-relaxed">
                {activeQuiz.questions[currentQ].question}
              </p>
              <div className="space-y-2">
                {activeQuiz.questions[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => !showExplanation && setSelectedAnswer(i)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors font-medium ${
                      showExplanation
                        ? i === activeQuiz.questions[currentQ].correctIndex
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : i === selectedAnswer
                            ? "border-destructive bg-destructive/10 text-destructive font-bold"
                            : "border-border text-muted-foreground opacity-60"
                        : selectedAnswer === i
                          ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                          : "border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {showExplanation && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-[11px] text-foreground leading-relaxed">
                  <strong className="text-primary block mb-1 uppercase tracking-wider">
                    Explanation:
                  </strong>{" "}
                  {activeQuiz.questions[currentQ].explanation}
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
    </div>
  );
}
