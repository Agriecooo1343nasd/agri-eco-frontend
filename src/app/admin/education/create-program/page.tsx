"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ProgramModule,
  type ContentBlock,
  type CertificateTemplate,
  type ModuleQuiz,
  type ModuleQuizQuestion,
} from "@/data/education";
import {
  GraduationCap,
  Plus,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Play,
  Download,
  ListChecks,
  X,
  Grip,
  ArrowLeft,
  Check,
  Leaf,
  QrCode,
  Save,
  Brain,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";

const emptyModule = (): ProgramModule => ({
  id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  title: emptyLangValue(),
  description: emptyLangValue(),
  duration: "",
  order: 0,
  contentBlocks: [],
});

const emptyContentBlock = (
  type: ContentBlock["type"],
): ContentBlock => ({
  id: `cb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  type,
  title: emptyLangValue(),
  content: emptyLangValue(),
  caption: emptyLangValue(),
});

const defaultCertTemplate: CertificateTemplate = {
  enabled: false,
  title: emptyLangValue(),
  subtitle: emptyLangValue(),
  description: emptyLangValue(),
  signatoryName: "",
  signatoryTitle: "",
  badgeColor: "#16a34a",
  logoUrl: "",
};

const steps = [
  { label: "Basic Info", icon: FileText },
  { label: "Instructor & Details", icon: GraduationCap },
  { label: "Curriculum", icon: ListChecks },
  { label: "Certificate", icon: Award },
  { label: "Review & Publish", icon: Check },
];

export default function CreateProgramPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Form state — multi-lang fields
  const [formTitle, setFormTitle] = useState<MultiLangValue>(
    emptyLangValue(),
  );
  const [formDesc, setFormDesc] = useState<MultiLangValue>(
    emptyLangValue(),
  );
  const [formLongDesc, setFormLongDesc] = useState<MultiLangValue>(
    emptyLangValue(),
  );
  // Non-translatable fields
  const [formType, setFormType] = useState<
    "workshop" | "course" | "certification"
  >("course");
  const [formLevel, setFormLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [formPrice, setFormPrice] = useState("");
  const [formMaxParticipants, setFormMaxParticipants] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formSchedule, setFormSchedule] = useState("");
  const [formTopics, setFormTopics] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formInstructorBio, setFormInstructorBio] =
    useState<MultiLangValue>(emptyLangValue());
  const [formRequirements, setFormRequirements] =
    useState<MultiLangValue>(emptyLangValue());
  const [formWhatYouGet, setFormWhatYouGet] =
    useState<MultiLangValue>(emptyLangValue());
  const [formLanguage, setFormLanguage] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"open" | "upcoming">(
    "upcoming",
  );

  // Modules
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [expandedModuleId, setExpandedModuleId] =
    useState<string | null>(null);

  // Certificate
  const [certTemplate, setCertTemplate] =
    useState<CertificateTemplate>({ ...defaultCertTemplate });

  const addModule = () => {
    const mod = emptyModule();
    mod.order = modules.length + 1;
    setModules([...modules, mod]);
    setExpandedModuleId(mod.id);
  };

  const updateModuleML = (
    id: string,
    field: "title" | "description",
    value: MultiLangValue,
  ) => {
    setModules(
      modules.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const updateModule = (
    id: string,
    field: keyof ProgramModule,
    value: string,
  ) => {
    setModules(
      modules.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const removeModule = (id: string) => {
    setModules(
      modules
        .filter((m) => m.id !== id)
        .map((m, i) => ({ ...m, order: i + 1 })),
    );
  };

  const addContentBlock = (moduleId: string, type: ContentBlock["type"]) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, contentBlocks: [...m.contentBlocks, emptyContentBlock(type)] }
          : m,
      ),
    );
  };

  const updateContentBlockML = (
    moduleId: string,
    blockId: string,
    field: "title" | "content" | "caption",
    value: MultiLangValue,
  ) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              contentBlocks: m.contentBlocks.map((cb) =>
                cb.id === blockId ? { ...cb, [field]: value } : cb,
              ),
            }
          : m,
      ),
    );
  };

  const removeContentBlock = (moduleId: string, blockId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, contentBlocks: m.contentBlocks.filter((cb) => cb.id !== blockId) }
          : m,
      ),
    );
  };

  // Quiz helpers
  const toggleModuleQuiz = (moduleId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        if (m.quiz) return { ...m, quiz: undefined };
        return {
          ...m,
          quiz: {
            id: `quiz-${Date.now()}`,
            title: { ...emptyLangValue(), en: `${m.title.en || "Module"} Quiz` },
            passingScore: 60,
            questions: [],
          } as ModuleQuiz,
        };
      }),
    );
  };

  const updateModuleQuizML = (
    moduleId: string,
    field: "title" | "description",
    value: MultiLangValue,
  ) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId && m.quiz ? { ...m, quiz: { ...m.quiz, [field]: value } } : m,
      ),
    );
  };

  const updateModuleQuiz = (
    moduleId: string,
    field: keyof ModuleQuiz,
    value: any,
  ) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId && m.quiz ? { ...m, quiz: { ...m.quiz, [field]: value } } : m,
      ),
    );
  };

  const addQuizQuestion = (moduleId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId || !m.quiz) return m;
        const newQ: ModuleQuizQuestion = {
          id: `qq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          question: emptyLangValue(),
          options: [emptyLangValue(), emptyLangValue(), emptyLangValue(), emptyLangValue()],
          correctIndex: 0,
          explanation: emptyLangValue(),
        };
        return { ...m, quiz: { ...m.quiz, questions: [...m.quiz.questions, newQ] } };
      }),
    );
  };

  const updateQuizQuestionML = (
    moduleId: string,
    qId: string,
    field: "question" | "explanation",
    value: MultiLangValue,
  ) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId || !m.quiz) return m;
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: m.quiz.questions.map((q) =>
              q.id === qId ? { ...q, [field]: value } : q,
            ),
          },
        };
      }),
    );
  };

  const updateQuizQuestion = (
    moduleId: string,
    qId: string,
    field: keyof ModuleQuizQuestion,
    value: any,
  ) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId || !m.quiz) return m;
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: m.quiz.questions.map((q) =>
              q.id === qId ? { ...q, [field]: value } : q,
            ),
          },
        };
      }),
    );
  };

  const updateQuizQuestionOption = (
    moduleId: string,
    qId: string,
    optIdx: number,
    value: MultiLangValue,
  ) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId || !m.quiz) return m;
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: m.quiz.questions.map((q) => {
              if (q.id !== qId) return q;
              const opts = [...q.options];
              opts[optIdx] = value;
              return { ...q, options: opts };
            }),
          },
        };
      }),
    );
  };

  const removeQuizQuestion = (moduleId: string, qId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId || !m.quiz) return m;
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: m.quiz.questions.filter((q) => q.id !== qId),
          },
        };
      }),
    );
  };

  const handleSubmit = () => {
    if (!formTitle.en || !formDesc.en) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the title and description.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Program Created!",
      description: `"${formTitle.en}" has been created successfully.`,
    });
    router.push("/admin/education");
  };

  const blockTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-3.5 w-3.5" />;
      case "image":
        return <ImageIcon className="h-3.5 w-3.5" />;
      case "video":
        return <Play className="h-3.5 w-3.5" />;
      case "download":
        return <Download className="h-3.5 w-3.5" />;
      case "checklist":
        return <ListChecks className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/education")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Create Training Program
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details to publish a new training program
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 hidden sm:flex"
          onClick={() => toast({ title: "Draft Saved" })}
        >
          <Save className="h-4 w-4" /> Save Draft
        </Button>
      </div>

      {/* Step Navigation */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-1">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isCompleted = i < activeStep;
            const isActive = i === activeStep;
            return (
              <button
                key={step.label}
                onClick={() => setActiveStep(i)}
                className={`flex-1 flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg transition-all text-center sm:text-left ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isCompleted
                    ? "text-primary/70 hover:bg-accent/50"
                    : "text-muted-foreground hover:bg-accent/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  {step.label}
                </span>
                <span className="text-[10px] font-medium sm:hidden">
                  {step.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {/* Step 0: Basic Info */}
        {activeStep === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            <MultiLangInput
              label="Program Title"
              value={formTitle}
              onChange={setFormTitle}
              placeholder="e.g., Organic Farming Basics"
              required
            />
            <MultiLangInput
              label="Short Description"
              value={formDesc}
              onChange={setFormDesc}
              placeholder="Brief description shown on cards..."
              required
              type="textarea"
              rows={2}
            />
            <MultiLangInput
              label="Full Description"
              value={formLongDesc}
              onChange={setFormLongDesc}
              placeholder="Detailed description shown on the program page..."
              type="textarea"
              rows={5}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as typeof formType)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select value={formLevel} onValueChange={(v) => setFormLevel(v as typeof formLevel)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (RWF)</Label>
                <Input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0 for free"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={formMaxParticipants}
                  onChange={(e) => setFormMaxParticipants(e.target.value)}
                  placeholder="30"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="e.g., 4 weeks"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v) => setFormStatus(v as typeof formStatus)}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="open">Open for Enrollment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Topics (comma-separated)</Label>
              <Input
                value={formTopics}
                onChange={(e) => setFormTopics(e.target.value)}
                placeholder="Soil prep, Composting, Crop rotation"
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {/* Step 1: Instructor & Details */}
        {activeStep === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">
              Instructor & Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Instructor Name</Label>
                <Input
                  value={formInstructor}
                  onChange={(e) => setFormInstructor(e.target.value)}
                  placeholder="Jane Doe"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Instructor Photo URL</Label>
                <Input
                  value={formInstructorBio.en}
                  onChange={(e) =>
                    setFormInstructorBio({ ...formInstructorBio, en: e.target.value })
                  }
                  placeholder="https://example.com/photo.jpg"
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <MultiLangInput
                  label="Instructor Bio"
                  value={formInstructorBio}
                  onChange={setFormInstructorBio}
                  placeholder="Short biography..."
                  type="textarea"
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2">
                <MultiLangInput
                  label="Requirements"
                  value={formRequirements}
                  onChange={setFormRequirements}
                  placeholder="What attendees should know or bring..."
                  type="textarea"
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2">
                <MultiLangInput
                  label="What You’ll Learn"
                  value={formWhatYouGet}
                  onChange={setFormWhatYouGet}
                  placeholder="Outcomes, skills, takeaways..."
                  type="textarea"
                  rows={3}
                />
              </div>
              <div>
                <Label>Language</Label>
                <Input
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  placeholder="English, Kinyarwanda, etc."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="City or online"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Curriculum */}
        {activeStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Curriculum</h2>
            <div className="space-y-4">
              {modules.map((m, idx) => (
                <div
                  key={m.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Grip className="h-5 w-5 cursor-move" />
                      <div className="flex-1">
                        <MultiLangInput
                          label={`Module ${idx + 1} Title`}
                          value={m.title}
                          onChange={(v) => updateModuleML(m.id, "title", v)}
                          placeholder="e.g., Introduction to Organic Farming"
                        />
                        <MultiLangInput
                          label={`Module ${idx + 1} Description`}
                          value={m.description}
                          onChange={(v) => updateModuleML(m.id, "description", v)}
                          placeholder="Brief overview of this module"
                          type="textarea"
                          rows={2}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Duration</Label>
                            <Input
                              value={m.duration}
                              onChange={(e) => updateModule(m.id, "duration", e.target.value)}
                              placeholder="e.g., 45 min"
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={m.order}
                              onChange={(e) => updateModule(m.id, "order", e.target.value)}
                              className="mt-1.5 w-20"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleModuleQuiz(m.id)}
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeModule(m.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedModuleId(expandedModuleId === m.id ? null : m.id)
                      }
                    >
                      {expandedModuleId === m.id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>
                  {expandedModuleId === m.id && (
                    <div className="mt-4 space-y-4">
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium">Content Blocks</h3>
                        {m.contentBlocks.map((cb) => (
                          <div
                            key={cb.id}
                            className="border border-border rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {blockTypeIcon(cb.type)}
                                <span className="text-sm font-medium capitalize">
                                  {cb.type}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeContentBlock(m.id, cb.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-2 space-y-2">
                              <MultiLangInput
                                label="Title"
                                value={cb.title}
                                onChange={(v) =>
                                  updateContentBlockML(m.id, cb.id, "title", v)
                                }
                                placeholder="Block title..."
                              />
                              <MultiLangInput
                                label="Content"
                                value={cb.content}
                                onChange={(v) =>
                                  updateContentBlockML(m.id, cb.id, "content", v)
                                }
                                placeholder="Main content..."
                                type="textarea"
                                rows={3}
                              />
                              <MultiLangInput
                                label="Caption (optional)"
                                value={cb.caption}
                                onChange={(v) =>
                                  updateContentBlockML(m.id, cb.id, "caption", v)
                                }
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addContentBlock(m.id, "text")}
                          >
                            + Text
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addContentBlock(m.id, "image")}
                          >
                            + Image
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addContentBlock(m.id, "video")}
                          >
                            + Video
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addContentBlock(m.id, "download")}
                          >
                            + Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addContentBlock(m.id, "checklist")}
                          >
                            + Checklist
                          </Button>
                        </div>
                      </div>
                      {/* Quiz Section */}
                      {m.quiz && (
                        <div className="pt-4">
                          <Separator />
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Quiz</h3>
                            <MultiLangInput
                              label="Quiz Title"
                              value={m.quiz.title}
                              onChange={(v) => updateModuleQuizML(m.id, "title", v)}
                              placeholder="Optional quiz title..."
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>Passing Score (%)</Label>
                                <Input
                                  type="number"
                                  value={m.quiz.passingScore}
                                  onChange={(e) => updateModuleQuiz(m.id, "passingScore", Number(e.target.value))} className="mt-1 h-9" />
                            </div>
                            <MultiLangInput label="Description (optional)" value={m.quiz.description || emptyLangValue()} onChange={v => updateModuleQuizML(m.id, "description", v)} placeholder="Test your understanding..." />

                            {/* Questions */}
                            <div className="space-y-3">
                              {m.quiz.questions.map((q, qi) => (
                                <div key={q.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-primary">Question {qi + 1}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeQuizQuestion(m.id, q.id)}>
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                  <MultiLangInput label="Question Text *" value={q.question} onChange={v => updateQuizQuestionML(m.id, q.id, "question", v)} placeholder="Enter your question..." type="textarea" rows={2} />
                                  <div>
                                    <Label className="text-xs">Question Image URL (optional)</Label>
                                    <Input value={q.questionImage || ""} onChange={e => updateQuizQuestion(m.id, q.id, "questionImage", e.target.value)} placeholder="https://..." className="mt-1 h-9" />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Answer Options</Label>
                                    <div className="space-y-2 mt-1">
                                      {q.options.map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => updateQuizQuestion(m.id, q.id, "correctIndex", oi)}
                                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                                              q.correctIndex === oi ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"
                                            }`}
                                          >
                                            {String.fromCharCode(65 + oi)}
                                          </button>
                                          <MultiLangInput
                                            label=""
                                            value={opt}
                                            onChange={v => updateQuizQuestionOption(m.id, q.id, oi, v)}
                                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                            className="flex-1"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">Click the letter to mark the correct answer</p>
                                  </div>
                                  <MultiLangInput label="Explanation (shown after answering)" value={q.explanation} onChange={v => updateQuizQuestionML(m.id, q.id, "explanation", v)} placeholder="Explain why this is the correct answer..." type="textarea" rows={2} />
                                </div>
                              ))}
                            </div>

                            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => addQuizQuestion(m.id)}>
                              <Plus className="h-3.5 w-3.5" /> Add Question
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Certificate */}
        {activeStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Certificate Designer</h2>
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
              <div>
                <Label>Enable Certificate</Label>
                <p className="text-xs text-muted-foreground">Issue a certificate upon program completion</p>
              </div>
              <Switch checked={certTemplate.enabled} onCheckedChange={v => setCertTemplate({ ...certTemplate, enabled: v })} />
            </div>

            {certTemplate.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fields */}
                <div className="space-y-4">
                  <MultiLangInput label="Certificate Title" value={certTemplate.title} onChange={v => setCertTemplate({ ...certTemplate, title: v })} placeholder="Certificate of Completion" />
                  <MultiLangInput label="Subtitle" value={certTemplate.subtitle} onChange={v => setCertTemplate({ ...certTemplate, subtitle: v })} placeholder="Program name on certificate" />
                  <MultiLangInput label="Description Text" value={certTemplate.description} onChange={v => setCertTemplate({ ...certTemplate, description: v })} placeholder="Has successfully completed..." type="textarea" rows={3} />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Signatory Name</Label>
                      <Input value={certTemplate.signatoryName} onChange={e => setCertTemplate({ ...certTemplate, signatoryName: e.target.value })} placeholder="Jean-Pierre Habimana" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Signatory Title</Label>
                      <Input value={certTemplate.signatoryTitle} onChange={e => setCertTemplate({ ...certTemplate, signatoryTitle: e.target.value })} placeholder="Director of Education" className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label>Company Logo URL</Label>
                    <Input value={certTemplate.logoUrl || ""} onChange={e => setCertTemplate({ ...certTemplate, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Badge / Border Color</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <input type="color" value={certTemplate.badgeColor} onChange={e => setCertTemplate({ ...certTemplate, badgeColor: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer" />
                      <Input value={certTemplate.badgeColor} onChange={e => setCertTemplate({ ...certTemplate, badgeColor: e.target.value })} className="max-w-32" />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <Label className="mb-3 block">Live Preview</Label>
                  <div className="border-4 border-double rounded-xl p-8 text-center space-y-3 bg-card" style={{ borderColor: certTemplate.badgeColor }}>
                    <div className="flex justify-center">
                      {certTemplate.logoUrl ? (
                        <img src={certTemplate.logoUrl} alt="Logo" className="h-12 object-contain" />
                      ) : (
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                          <Leaf className="h-6 w-6 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <Award className="h-8 w-8 mx-auto" style={{ color: certTemplate.badgeColor }} />
                    <h3 className="text-lg font-bold font-heading text-foreground">{certTemplate.title.en || "Certificate Title"}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{certTemplate.subtitle.en || "Program Name"}</p>
                    <div className="py-3">
                      <p className="text-sm text-foreground">This certifies that</p>
                      <p className="text-xl font-bold text-primary my-1 font-heading">[Student Name]</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">{certTemplate.description.en || "Description text..."}</p>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Date</p>
                        <p className="text-xs font-medium text-foreground border-t border-foreground pt-1 px-3">[Date]</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">{certTemplate.signatoryTitle || "Title"}</p>
                        <p className="text-xs font-medium text-foreground border-t border-foreground pt-1 px-3 italic">{certTemplate.signatoryName || "Name"}</p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 border-2 border-border rounded-lg flex items-center justify-center bg-accent/30">
                          <QrCode className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-[9px] text-muted-foreground">Scan to verify</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">A unique QR code will be auto-generated for each certificate to verify authenticity</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {activeStep === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Review & Publish</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-accent/30 border border-border rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-lg">{formTitle.en || "Untitled Program"}</h3>
                  <p className="text-sm text-muted-foreground">{formDesc.en || "No description"}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">{formType}</Badge>
                    <Badge variant="outline" className="capitalize">{formLevel}</Badge>
                    <Badge variant="outline" className="capitalize">{formStatus}</Badge>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Program Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Price:</span> <span className="font-medium text-foreground">{formPrice ? `${Number(formPrice).toLocaleString()} RWF` : "Free"}</span></div>
                    <div><span className="text-muted-foreground">Duration:</span> <span className="font-medium text-foreground">{formDuration || "—"}</span></div>
                    <div><span className="text-muted-foreground">Max:</span> <span className="font-medium text-foreground">{formMaxParticipants || "—"}</span></div>
                    <div><span className="text-muted-foreground">Instructor:</span> <span className="font-medium text-foreground">{formInstructor || "—"}</span></div>
                    <div><span className="text-muted-foreground">Language:</span> <span className="font-medium text-foreground">{formLanguage || "—"}</span></div>
                    <div><span className="text-muted-foreground">Location:</span> <span className="font-medium text-foreground">{formLocation || "—"}</span></div>
                    <div><span className="text-muted-foreground">Modules:</span> <span className="font-medium text-foreground">{modules.length}</span></div>
                    <div><span className="text-muted-foreground">Certificate:</span> <span className="font-medium text-foreground">{certTemplate.enabled ? "Yes" : "No"}</span></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {modules.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Curriculum Overview</h4>
                    <ol className="space-y-2">
                      {modules.map((m, i) => (
                        <li key={m.id} className="flex items-start gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{m.title.en || "Untitled"}</p>
                            <p className="text-xs text-muted-foreground">{m.duration} · {m.contentBlocks.length} blocks{m.quiz ? ` · ${m.quiz.questions.length} quiz questions` : ""}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {formTopics && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Topics</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {formTopics.split(",").map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{t.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <Button variant="outline" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Step {activeStep + 1} of {steps.length}
        </div>
        {activeStep < steps.length - 1 ? (
          <Button onClick={() => setActiveStep(activeStep + 1)}>
            Next: {steps[activeStep + 1].label}
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-2">
            <Check className="h-4 w-4" /> Publish Program
          </Button>
        )}
      </div>
    </div>
  );
}
