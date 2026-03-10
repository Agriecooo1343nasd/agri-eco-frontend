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
  QrCode,
  Save,
  Brain,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MediaUploader } from "@/components/admin/MediaUploader";

const emptyModule = (): ProgramModule => ({
  id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  title: emptyLangValue(),
  description: emptyLangValue(),
  duration: emptyLangValue(),
  order: 0,
  contentBlocks: [],
});

const emptyContentBlock = (type: ContentBlock["type"]): ContentBlock => ({
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
  const [formTitle, setFormTitle] = useState<MultiLangValue>(emptyLangValue());
  const [formDesc, setFormDesc] = useState<MultiLangValue>(emptyLangValue());
  const [formLongDesc, setFormLongDesc] =
    useState<MultiLangValue>(emptyLangValue());
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
  const [formStatus, setFormStatus] = useState<
    "open" | "upcoming" | "hidden" | "disabled"
  >("upcoming");

  // Modules
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  // Certificate
  const [certTemplate, setCertTemplate] = useState<CertificateTemplate>({
    ...defaultCertTemplate,
  });

  const addModule = () => {
    const mod = emptyModule();
    mod.order = modules.length + 1;
    setModules([...modules, mod]);
    setExpandedModuleId(mod.id);
  };

  const updateModuleML = (
    id: string,
    field: "title" | "description" | "duration",
    value: MultiLangValue,
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
          ? {
              ...m,
              contentBlocks: [...m.contentBlocks, emptyContentBlock(type)],
            }
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
          ? {
              ...m,
              contentBlocks: m.contentBlocks.filter((cb) => cb.id !== blockId),
            }
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
            title: {
              ...emptyLangValue(),
              en: `${m.title.en || "Module"} Quiz`,
            },
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
        m.id === moduleId && m.quiz
          ? { ...m, quiz: { ...m.quiz, [field]: value } }
          : m,
      ),
    );
  };

  const updateModuleQuiz = (
    moduleId: string,
    field: keyof ModuleQuiz,
    value: ModuleQuiz[keyof ModuleQuiz],
  ) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId && m.quiz
          ? { ...m, quiz: { ...m.quiz, [field]: value } }
          : m,
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
          options: [
            emptyLangValue(),
            emptyLangValue(),
            emptyLangValue(),
            emptyLangValue(),
          ],
          correctIndex: 0,
          explanation: emptyLangValue(),
        };
        return {
          ...m,
          quiz: { ...m.quiz, questions: [...m.quiz.questions, newQ] },
        };
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
    value: ModuleQuizQuestion[keyof ModuleQuizQuestion],
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
      toast.error("Missing required fields", {
        description: "Please fill in the title and description.",
      });
      return;
    }
    toast.success("Program Created!", {
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
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
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
          onClick={() => toast.success("Draft Saved")}
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
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
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
            <h2 className="text-lg font-semibold text-foreground">
              Basic Information
            </h2>
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
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Type
                </Label>
                <Select
                  value={formType}
                  onValueChange={(v) => setFormType(v as typeof formType)}
                >
                  <SelectTrigger className="h-10 text-xs shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop" className="text-xs">
                      Workshop
                    </SelectItem>
                    <SelectItem value="course" className="text-xs">
                      Course
                    </SelectItem>
                    <SelectItem value="certification" className="text-xs">
                      Certification
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Level
                </Label>
                <Select
                  value={formLevel}
                  onValueChange={(v) => setFormLevel(v as typeof formLevel)}
                >
                  <SelectTrigger className="h-10 text-xs shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner" className="text-xs">
                      Beginner
                    </SelectItem>
                    <SelectItem value="intermediate" className="text-xs">
                      Intermediate
                    </SelectItem>
                    <SelectItem value="advanced" className="text-xs">
                      Advanced
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Price (RWF)
                </Label>
                <Input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0 for free"
                  className="h-10 text-xs shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Max Participants
                </Label>
                <Input
                  type="number"
                  value={formMaxParticipants}
                  onChange={(e) => setFormMaxParticipants(e.target.value)}
                  placeholder="30"
                  className="h-10 text-xs shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Duration
                </Label>
                <Input
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  placeholder="e.g., 4 weeks"
                  className="h-10 text-xs shadow-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Status
                </Label>
                <Select
                  value={formStatus}
                  onValueChange={(v) => setFormStatus(v as typeof formStatus)}
                >
                  <SelectTrigger className="h-10 text-xs shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming" className="text-xs">
                      Upcoming
                    </SelectItem>
                    <SelectItem value="open" className="text-xs">
                      Open for Enrollment
                    </SelectItem>
                    <SelectItem value="hidden" className="text-xs">
                      Hidden
                    </SelectItem>
                    <SelectItem value="disabled" className="text-xs">
                      Disabled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <MediaUploader
              label="Cover Image"
              value={formImageUrl}
              onChange={setFormImageUrl}
              description="A high-quality image representing the program"
            />
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Topics (comma-separated)
              </Label>
              <Input
                value={formTopics}
                onChange={(e) => setFormTopics(e.target.value)}
                placeholder="Soil prep, Composting, Crop rotation"
                className="h-10 text-xs shadow-sm"
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
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Instructor Name
              </Label>
              <Input
                value={formInstructor}
                onChange={(e) => setFormInstructor(e.target.value)}
                placeholder="Jean-Pierre Habimana"
                className="h-10 text-xs shadow-sm"
              />
            </div>
            <MultiLangInput
              label="Instructor Bio"
              value={formInstructorBio}
              onChange={setFormInstructorBio}
              placeholder="Experience and qualifications..."
              type="textarea"
              rows={3}
            />
            <div className="space-y-1 max-w-sm">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Start Date
              </Label>
              <Input
                type="date"
                value={formStartDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="h-10 text-xs shadow-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Language
                </Label>
                <Input
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  placeholder="Kinyarwanda & English"
                  className="h-10 text-xs shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Location
                </Label>
                <Input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Agri-Eco Farm, Musanze"
                  className="h-10 text-xs shadow-sm"
                />
              </div>
            </div>
            <MultiLangInput
              label="Requirements (one per line)"
              value={formRequirements}
              onChange={setFormRequirements}
              placeholder="No prior experience needed"
              type="textarea"
              rows={3}
            />
            <MultiLangInput
              label="What Students Get (one per line)"
              value={formWhatYouGet}
              onChange={setFormWhatYouGet}
              placeholder="Certificate of Completion"
              type="textarea"
              rows={3}
            />
          </div>
        )}

        {/* Step 2: Curriculum */}
        {activeStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Curriculum Builder
                </h2>
                <p className="text-sm text-muted-foreground">
                  {modules.length} module(s) added
                </p>
              </div>
              <Button
                className="gap-1.5 h-10 text-xs font-bold shadow-sm"
                onClick={addModule}
              >
                <Plus className="h-4 w-4" /> Add Module
              </Button>
            </div>

            {modules.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  No modules yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click &quot;Add Module&quot; to start building your curriculum
                </p>
              </div>
            )}

            <div className="space-y-3">
              {modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="border border-border rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() =>
                      setExpandedModuleId(
                        expandedModuleId === mod.id ? null : mod.id,
                      )
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Grip className="h-4 w-4 text-muted-foreground" />
                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-foreground">
                          {mod.title.en || "Untitled Module"}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground ml-2">
                          ({mod.contentBlocks.length} blocks)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeModule(mod.id);
                        }}
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                      {expandedModuleId === mod.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {expandedModuleId === mod.id && (
                    <div className="border-t border-border p-5 bg-accent/5 space-y-4">
                      <MultiLangInput
                        label="Module Title *"
                        value={mod.title}
                        onChange={(v) => updateModuleML(mod.id, "title", v)}
                        placeholder="e.g., Introduction"
                      />
                      <MultiLangInput
                        label="Duration"
                        value={mod.duration || emptyLangValue()}
                        onChange={(v) => updateModuleML(mod.id, "duration", v)}
                        placeholder="e.g., 3 hours"
                      />
                      <MultiLangInput
                        label="Description"
                        value={mod.description}
                        onChange={(v) =>
                          updateModuleML(mod.id, "description", v)
                        }
                        placeholder="What this module covers..."
                        type="textarea"
                        rows={2}
                      />

                      <Separator />

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Content Blocks
                          </Label>
                          <div className="flex gap-1.5">
                            {(
                              [
                                "text",
                                "image",
                                "video",
                                "download",
                                "checklist",
                              ] as const
                            ).map((type) => (
                              <Button
                                key={type}
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-[10px] px-2.5 font-bold shadow-xs hover:bg-card"
                                onClick={() => addContentBlock(mod.id, type)}
                              >
                                {blockTypeIcon(type)}
                                <span className="hidden sm:inline capitalize">
                                  {type}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {mod.contentBlocks.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg bg-card/50">
                            Add content blocks using the buttons above
                          </p>
                        )}

                        <div className="space-y-3">
                          {mod.contentBlocks.map((block) => (
                            <div
                              key={block.id}
                              className="flex items-start gap-4 bg-card border border-border rounded-lg p-4 shadow-sm border-l-4 border-l-primary/30"
                            >
                              <div className="mt-1 text-primary">
                                {blockTypeIcon(block.type)}
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {block.type}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      removeContentBlock(mod.id, block.id)
                                    }
                                  >
                                    <X className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                                <MultiLangInput
                                  label="Block Title"
                                  value={block.title || emptyLangValue()}
                                  onChange={(v) =>
                                    updateContentBlockML(
                                      mod.id,
                                      block.id,
                                      "title",
                                      v,
                                    )
                                  }
                                  placeholder="Block title (optional)"
                                />
                                {block.type === "text" ? (
                                  <MultiLangInput
                                    label="Text Content"
                                    value={block.content}
                                    onChange={(v) =>
                                      updateContentBlockML(
                                        mod.id,
                                        block.id,
                                        "content",
                                        v,
                                      )
                                    }
                                    placeholder="Enter text content..."
                                    type="textarea"
                                    rows={4}
                                  />
                                ) : block.type === "checklist" ? (
                                  <MultiLangInput
                                    label="Checklist Items"
                                    value={block.content}
                                    onChange={(v) =>
                                      updateContentBlockML(
                                        mod.id,
                                        block.id,
                                        "content",
                                        v,
                                      )
                                    }
                                    placeholder="Item 1|Item 2|Item 3 (separate with |)"
                                    type="textarea"
                                    rows={3}
                                  />
                                ) : block.type === "image" ||
                                  block.type === "video" ? (
                                  <MediaUploader
                                    label={
                                      block.type === "image"
                                        ? "Image Media"
                                        : "Video Media"
                                    }
                                    value={block.content.en || ""}
                                    onChange={(val: string) =>
                                      updateContentBlockML(
                                        mod.id,
                                        block.id,
                                        "content",
                                        {
                                          ...block.content,
                                          en: val,
                                        },
                                      )
                                    }
                                  />
                                ) : (
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                      Download URL
                                    </Label>
                                    <Input
                                      value={block.content.en || ""}
                                      onChange={(e) =>
                                        updateContentBlockML(
                                          mod.id,
                                          block.id,
                                          "content",
                                          {
                                            ...block.content,
                                            en: e.target.value,
                                          },
                                        )
                                      }
                                      placeholder="Download URL"
                                      className="h-9 text-xs shadow-sm mt-1"
                                    />
                                  </div>
                                )}
                                <MultiLangInput
                                  label="Caption"
                                  value={block.caption || emptyLangValue()}
                                  onChange={(v) =>
                                    updateContentBlockML(
                                      mod.id,
                                      block.id,
                                      "caption",
                                      v,
                                    )
                                  }
                                  placeholder="Caption (optional)"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Module Quiz Section */}
                      <Separator />
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                              Module Quiz
                            </Label>
                          </div>
                          <Switch
                            checked={!!mod.quiz}
                            onCheckedChange={() => toggleModuleQuiz(mod.id)}
                          />
                        </div>

                        {mod.quiz && (
                          <div className="space-y-4 bg-primary/5 border border-primary/20 rounded-xl p-5 shadow-xs">
                            <MultiLangInput
                              label="Quiz Title"
                              value={mod.quiz.title}
                              onChange={(v) =>
                                updateModuleQuizML(mod.id, "title", v)
                              }
                              placeholder="Module Quiz"
                            />
                            <div className="space-y-1">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                Passing Score (%)
                              </Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={mod.quiz.passingScore}
                                onChange={(e) =>
                                  updateModuleQuiz(
                                    mod.id,
                                    "passingScore",
                                    Number(e.target.value),
                                  )
                                }
                                className="h-9 text-xs shadow-sm mt-1"
                              />
                            </div>
                            <MultiLangInput
                              label="Description (optional)"
                              value={mod.quiz.description || emptyLangValue()}
                              onChange={(v) =>
                                updateModuleQuizML(mod.id, "description", v)
                              }
                              placeholder="Test your understanding..."
                            />

                            {/* Questions */}
                            <div className="space-y-4">
                              {mod.quiz.questions.map((q, qi) => (
                                <div
                                  key={q.id}
                                  className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-sm border-l-4 border-l-amber-500/30"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                                      Question {qi + 1}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() =>
                                        removeQuizQuestion(mod.id, q.id)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                  <MultiLangInput
                                    label="Question Text *"
                                    value={q.question}
                                    onChange={(v) =>
                                      updateQuizQuestionML(
                                        mod.id,
                                        q.id,
                                        "question",
                                        v,
                                      )
                                    }
                                    placeholder="Enter your question..."
                                    type="textarea"
                                    rows={2}
                                  />
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                      Question Image URL (optional)
                                    </Label>
                                    <Input
                                      value={q.questionImage || ""}
                                      onChange={(e) =>
                                        updateQuizQuestion(
                                          mod.id,
                                          q.id,
                                          "questionImage",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="https://..."
                                      className="h-9 text-xs shadow-sm mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                                      Answer Options
                                    </Label>
                                    <div className="space-y-3 mt-2">
                                      {q.options.map((opt, oi) => (
                                        <div
                                          key={oi}
                                          className="flex items-center gap-3"
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateQuizQuestion(
                                                mod.id,
                                                q.id,
                                                "correctIndex",
                                                oi,
                                              )
                                            }
                                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold transition-all shadow-sm ${
                                              q.correctIndex === oi
                                                ? "border-primary bg-primary text-primary-foreground scale-110"
                                                : "border-border text-muted-foreground hover:border-primary/50"
                                            }`}
                                          >
                                            {String.fromCharCode(65 + oi)}
                                          </button>
                                          <MultiLangInput
                                            label=""
                                            value={opt}
                                            onChange={(v) =>
                                              updateQuizQuestionOption(
                                                mod.id,
                                                q.id,
                                                oi,
                                                v,
                                              )
                                            }
                                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                            className="flex-1"
                                            hideLabel
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 font-medium italic opacity-70">
                                      Click the letter to mark the correct
                                      answer
                                    </p>
                                  </div>
                                  <MultiLangInput
                                    label="Explanation (shown after answering)"
                                    value={q.explanation}
                                    onChange={(v) =>
                                      updateQuizQuestionML(
                                        mod.id,
                                        q.id,
                                        "explanation",
                                        v,
                                      )
                                    }
                                    placeholder="Explain why this is the correct answer..."
                                    type="textarea"
                                    rows={2}
                                  />
                                </div>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-1.5 h-9 text-xs font-bold shadow-xs hover:bg-card"
                              onClick={() => addQuizQuestion(mod.id)}
                            >
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
            <h2 className="text-lg font-semibold text-foreground">
              Certificate Designer
            </h2>
            <div className="flex items-center justify-between p-5 bg-primary/5 border border-primary/20 rounded-xl shadow-xs">
              <div>
                <Label className="text-sm font-bold">Enable Certificate</Label>
                <p className="text-xs text-muted-foreground font-medium">
                  Issue a certificate upon program completion
                </p>
              </div>
              <Switch
                checked={certTemplate.enabled}
                onCheckedChange={(v) =>
                  setCertTemplate({ ...certTemplate, enabled: v })
                }
              />
            </div>

            {certTemplate.enabled && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fields */}
                <div className="space-y-5">
                  <MultiLangInput
                    label="Certificate Title"
                    value={certTemplate.title}
                    onChange={(v) =>
                      setCertTemplate({ ...certTemplate, title: v })
                    }
                    placeholder="Certificate of Completion"
                  />
                  <MultiLangInput
                    label="Subtitle"
                    value={certTemplate.subtitle}
                    onChange={(v) =>
                      setCertTemplate({ ...certTemplate, subtitle: v })
                    }
                    placeholder="Program name on certificate"
                  />
                  <MultiLangInput
                    label="Description Text"
                    value={certTemplate.description}
                    onChange={(v) =>
                      setCertTemplate({ ...certTemplate, description: v })
                    }
                    placeholder="Has successfully completed..."
                    type="textarea"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                        Signatory Name
                      </Label>
                      <Input
                        value={certTemplate.signatoryName}
                        onChange={(e) =>
                          setCertTemplate({
                            ...certTemplate,
                            signatoryName: e.target.value,
                          })
                        }
                        placeholder="Jean-Pierre Habimana"
                        className="h-10 text-xs shadow-sm mt-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                        Signatory Title
                      </Label>
                      <Input
                        value={certTemplate.signatoryTitle}
                        onChange={(e) =>
                          setCertTemplate({
                            ...certTemplate,
                            signatoryTitle: e.target.value,
                          })
                        }
                        placeholder="Director of Education"
                        className="h-10 text-xs shadow-sm mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <Label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Live Preview
                  </Label>
                  <div
                    className="border-8 border-double rounded-2xl p-8 text-center space-y-4 bg-card shadow-lg relative overflow-hidden"
                    style={{ borderColor: "#16a34a" }}
                  >
                    <div className="flex justify-center mb-6">
                      <img
                        src="/assets/logo/logo.png"
                        alt="Company Logo"
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold font-heading text-foreground tracking-tight">
                      {certTemplate.title.en || "Certificate Title"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                      {certTemplate.subtitle.en || "Program Name"}
                    </p>
                    <div className="py-4">
                      <p className="text-xs text-muted-foreground italic font-serif">
                        This certifies that
                      </p>
                      <p className="text-2xl font-bold text-primary my-2 font-heading tracking-tight">
                        [Student Name]
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm mx-auto font-medium">
                        {certTemplate.description.en || "Description text..."}
                      </p>
                    </div>
                    <div className="flex justify-between items-end pt-6 border-t border-border mt-2">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          Issue Date
                        </p>
                        <p className="text-xs font-bold text-foreground border-t border-border pt-1.5 px-4 font-mono">
                          [MAR 10, 2026]
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          {certTemplate.signatoryTitle || "Title"}
                        </p>
                        <p className="text-xs font-bold text-foreground border-t border-border pt-1.5 px-4 italic serif tracking-tight">
                          {certTemplate.signatoryName || "Name"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-4">
                      <div className="flex flex-col items-center gap-1.5 opacity-60">
                        <div className="w-16 h-16 border-2 border-border rounded-xl flex items-center justify-center bg-muted/30 shadow-inner">
                          <QrCode className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                          SECURE VERIFICATION
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4 text-center font-medium italic">
                    A unique verification code will be generated for each
                    certificate.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
              Final Review
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4 shadow-xs">
                  <h3 className="font-bold text-foreground text-xl tracking-tight font-heading">
                    {formTitle.en || "Untitled Program"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {formDesc.en || "No short description provided."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="capitalize text-[10px] font-bold px-3 border border-border"
                    >
                      {formType}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="capitalize text-[10px] font-bold px-3 border border-border"
                    >
                      {formLevel}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="capitalize text-[10px] font-bold px-3 border border-border bg-amber-50 text-amber-600 border-amber-200"
                    >
                      {formStatus}
                    </Badge>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-5">
                    Program Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Price
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px]">
                        {formPrice
                          ? `${Number(formPrice).toLocaleString()} RWF`
                          : "Free"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Duration
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px]">
                        {formDuration || "Not Set"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Participants
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px]">
                        {formMaxParticipants || "No Cap"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Instructor
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px]">
                        {formInstructor || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Language
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px]">
                        {formLanguage || "English"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Location
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px] text-primary">
                        {formLocation || "TBD"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Modules
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px]">
                        {modules.length} modules
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                        Certificate
                      </span>{" "}
                      <span className="font-bold text-foreground text-[13px]">
                        {certTemplate.enabled ? "Available" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                {modules.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm border-t-4 border-t-primary">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-5">
                      Curriculum Path
                    </h4>
                    <ol className="space-y-4">
                      {modules.map((m, i) => (
                        <li key={m.id} className="flex items-start gap-3 group">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20">
                            {i + 1}
                          </span>
                          <div className="border-b border-border pb-3 flex-1 group-last:border-0 group-last:pb-0">
                            <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">
                              {m.title.en || "Untitled Module"}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-tight mt-1">
                              {m.duration.en || "Self-paced"} ·{" "}
                              {m.contentBlocks.length} content blocks
                              {m.quiz ? ` · Includes Quiz` : ""}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {formTopics && (
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                      Core Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formTopics.split(",").map((t, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[10px] font-bold px-3 py-0.5 bg-muted/50 border-border capitalize"
                        >
                          {t.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                    <Check className="h-4 w-4 text-amber-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-tight">
                      Ready for Launch
                    </p>
                    <p className="text-[10px] text-amber-700 font-medium">
                      Review all details carefully. Once published, the program
                      will be visible to all farm visitors and potential
                      students.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-md sticky bottom-6 z-10 mx-2 sm:mx-0">
        <Button
          variant="outline"
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="h-10 px-6 text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          Previous
        </Button>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:block">
          Step {activeStep + 1} of {steps.length}
        </div>
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={() => setActiveStep(activeStep + 1)}
            className="h-10 px-8 text-xs font-bold shadow-md transition-all active:scale-95 bg-primary hover:bg-primary/90"
          >
            Continue to {steps[activeStep + 1].label}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="gap-2 h-10 px-10 text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 bg-primary hover:bg-primary/90"
          >
            <Check className="h-4 w-4" /> Publish Program Now
          </Button>
        )}
      </div>
    </div>
  );
}
