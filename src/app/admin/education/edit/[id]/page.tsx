"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Save,
  Leaf,
  QrCode,
  Brain,
  Trash2,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MultiLangInput,
  emptyLangValue,
  type MultiLangValue,
} from "@/components/admin/MultiLangInput";
import { MediaUploader } from "@/components/admin/MediaUploader";
import {
  fetchAdminTrainingProgramById,
  updateAdminTrainingProgram,
  type CreateAdminTrainingProgramPayload,
  type MultiLangText,
} from "@/lib/api/education";

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

const toML = (val: string | MultiLangValue | undefined): MultiLangValue => {
  if (!val) return emptyLangValue();
  if (typeof val === "string") return { ...emptyLangValue(), en: val };
  return val;
};

const isMultiLangText = (value: unknown): value is MultiLangText => {
  return Boolean(
    value &&
    typeof value === "object" &&
    "en" in value &&
    typeof (value as { en: unknown }).en === "string",
  );
};

const toMultiLangFromUnknown = (value: unknown): MultiLangValue => {
  if (isMultiLangText(value)) {
    return {
      en: value.en,
      rw: value.rw ?? "",
      fr: value.fr ?? "",
      sw: value.sw ?? "",
    };
  }

  if (typeof value === "string") {
    return { ...emptyLangValue(), en: value };
  }

  return emptyLangValue();
};

const toOptionalML = (
  value?: MultiLangValue,
): CreateAdminTrainingProgramPayload["shortDescription"] => {
  if (!value) return undefined;

  const en = value.en.trim();
  if (!en) return undefined;

  const rw = value.rw?.trim();
  const fr = value.fr?.trim();
  const sw = value.sw?.trim();

  return {
    en,
    ...(rw ? { rw } : {}),
    ...(fr ? { fr } : {}),
    ...(sw ? { sw } : {}),
  };
};

const toRequiredML = (
  value: MultiLangValue,
): CreateAdminTrainingProgramPayload["title"] => {
  const rw = value.rw?.trim();
  const fr = value.fr?.trim();
  const sw = value.sw?.trim();

  return {
    en: value.en.trim(),
    ...(rw ? { rw } : {}),
    ...(fr ? { fr } : {}),
    ...(sw ? { sw } : {}),
  };
};

const parseDurationWeeks = (value: string): number => {
  const matched = value.match(/\d+/);
  if (!matched) return 4;

  const weeks = Number.parseInt(matched[0], 10);
  if (!Number.isFinite(weeks) || weeks < 1) return 4;

  return weeks;
};

const normalizeImageValue = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim();
  if (!normalized || normalized === "null") return undefined;

  return normalized;
};

const isLocalImageData = (value?: string): boolean => {
  return Boolean(value && value.startsWith("data:"));
};

const MEDIA_SOURCE_MAX_CHARS = 96;

const formatMediaSourceLabel = (
  source: string,
  maxChars = MEDIA_SOURCE_MAX_CHARS,
): string => {
  const value = source.trim();
  if (value.length <= maxChars) return value;

  const headChars = Math.max(30, Math.floor(maxChars * 0.7));
  const tailChars = Math.max(12, maxChars - headChars - 3);
  return `${value.slice(0, headChars)}...${value.slice(-tailChars)}`;
};

function MediaSourceLink({ source }: { source: string }) {
  return (
    <div className="mt-2 rounded-md border border-border/70 bg-background/80 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Source
      </p>
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        title={source}
        className="mt-1 block w-full max-w-130 truncate text-xs text-primary underline"
      >
        {formatMediaSourceLabel(source)}
      </a>
    </div>
  );
}

function NotPersistedBadge() {
  return (
    <span className="ml-2 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
      Not Persisted Yet
    </span>
  );
}

const mapCurriculumToModules = (
  curriculum: Record<string, unknown>[],
): ProgramModule[] => {
  return curriculum.map((item, index) => {
    const moduleRecord =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : ({} as Record<string, unknown>);

    const rawBlocks = Array.isArray(moduleRecord.contentBlocks)
      ? moduleRecord.contentBlocks
      : [];

    const contentBlocks: ContentBlock[] = rawBlocks.map((block, blockIndex) => {
      const blockRecord =
        block && typeof block === "object"
          ? (block as Record<string, unknown>)
          : ({} as Record<string, unknown>);

      const type =
        blockRecord.type === "text" ||
        blockRecord.type === "image" ||
        blockRecord.type === "video" ||
        blockRecord.type === "download" ||
        blockRecord.type === "checklist"
          ? blockRecord.type
          : "text";

      return {
        id: String(blockRecord.id ?? `cb-${Date.now()}-${index}-${blockIndex}`),
        type,
        title: toMultiLangFromUnknown(blockRecord.title),
        content: toMultiLangFromUnknown(blockRecord.content),
        caption: toMultiLangFromUnknown(blockRecord.caption),
      };
    });

    return {
      id: String(moduleRecord.id ?? `m-${Date.now()}-${index}`),
      title: toMultiLangFromUnknown(moduleRecord.title),
      description: toMultiLangFromUnknown(moduleRecord.description),
      duration: toMultiLangFromUnknown(moduleRecord.duration),
      order:
        typeof moduleRecord.order === "number" &&
        Number.isFinite(moduleRecord.order)
          ? moduleRecord.order
          : index + 1,
      contentBlocks,
      quiz:
        moduleRecord.quiz && typeof moduleRecord.quiz === "object"
          ? (moduleRecord.quiz as ProgramModule["quiz"])
          : undefined,
    };
  });
};

export default function Page() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params.id || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState<MultiLangValue>(emptyLangValue());
  const [formDesc, setFormDesc] = useState<MultiLangValue>(emptyLangValue());
  const [formLongDesc, setFormLongDesc] =
    useState<MultiLangValue>(emptyLangValue());
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
  const [formStatus, setFormStatus] = useState<
    "open" | "upcoming" | "full" | "completed"
  >("upcoming");

  const [heroImageUrl, setHeroImageUrl] = useState<string | undefined>();
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [isFeatured, setIsFeatured] = useState(false);

  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [expandedContentBlocks, setExpandedContentBlocks] = useState<
    Record<string, boolean>
  >({});
  const [contentInputMode, setContentInputMode] = useState<
    Record<string, "url" | "upload">
  >({});
  const [expandedQuizQuestions, setExpandedQuizQuestions] = useState<
    Record<string, boolean>
  >({});

  const [certTemplate, setCertTemplate] = useState<CertificateTemplate>({
    enabled: false,
    title: emptyLangValue(),
    subtitle: emptyLangValue(),
    description: emptyLangValue(),
    signatoryName: "",
    signatoryTitle: "",
    badgeColor: "#16a34a",
    logoUrl: "",
  });

  useEffect(() => {
    let mounted = true;

    const loadProgram = async () => {
      if (!id) {
        setLoadError("Program ID is missing");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const program = await fetchAdminTrainingProgramById(id);
        if (!mounted) return;

        setFormTitle(toMultiLangFromUnknown(program.title));
        setFormDesc(toMultiLangFromUnknown(program.shortDescription));
        setFormLongDesc(toMultiLangFromUnknown(program.fullDescription));
        setFormType(program.type);
        setFormLevel(program.level);
        setFormPrice(String(program.priceRwf ?? 0));
        setFormMaxParticipants(String(program.capacity ?? 30));
        setFormDuration(`${program.durationWeeks ?? 4} weeks`);
        setFormStartDate(
          program.startDate ? program.startDate.split("T")[0] : "",
        );
        setFormTopics(
          Array.isArray(program.topics)
            ? program.topics
                .map((topic) => topic?.name?.en?.trim())
                .filter(Boolean)
                .join(", ")
            : "",
        );
        setFormLanguage(program.language || "en");
        setFormStatus(program.isPublished ? "open" : "upcoming");
        setModules(
          Array.isArray(program.curriculum)
            ? mapCurriculumToModules(program.curriculum)
            : [],
        );

        const heroImage = normalizeImageValue(program.heroImage);
        const coverImage = normalizeImageValue(program.coverImage) ?? heroImage;
        setHeroImageUrl(heroImage ?? coverImage);
        setCoverImageUrl(coverImage);
        setIsFeatured(Boolean(program.isFeatured));
      } catch (error) {
        if (!mounted) return;

        const message =
          error instanceof Error ? error.message : "Failed to load program";
        setLoadError(message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadProgram();

    return () => {
      mounted = false;
    };
  }, [id]);

  const addModule = () => {
    const mod = emptyModule();
    mod.order = modules.length + 1;
    setModules([...modules, mod]);
    setExpandedModuleId(mod.id);
  };

  const updateModuleML = (
    mid: string,
    field: "title" | "description",
    value: MultiLangValue,
  ) => {
    setModules(
      modules.map((m) => (m.id === mid ? { ...m, [field]: value } : m)),
    );
  };

  const updateModule = (
    mid: string,
    field: keyof ProgramModule,
    value: string,
  ) => {
    if (field === "duration") {
      setModules(
        modules.map((m) =>
          m.id === mid
            ? { ...m, duration: { ...emptyLangValue(), en: value } }
            : m,
        ),
      );
    } else {
      setModules(
        modules.map((m) => (m.id === mid ? { ...m, [field]: value } : m)),
      );
    }
  };

  const removeModule = (mid: string) => {
    setModules(
      modules
        .filter((m) => m.id !== mid)
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

  const toggleContentBlockExpanded = (blockId: string) => {
    setExpandedContentBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const handleBlockFileUpload = (
    moduleId: string,
    blockId: string,
    file: File,
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;

      const current = modules
        .find((m) => m.id === moduleId)
        ?.contentBlocks.find((cb) => cb.id === blockId)?.content;

      updateContentBlockML(moduleId, blockId, "content", {
        ...toML(current),
        en: result,
      });
    };
    reader.readAsDataURL(file);
  };

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
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId || !m.quiz) return m;
        return {
          ...m,
          quiz: { ...m.quiz, questions: [...m.quiz.questions, newQ] },
        };
      }),
    );
    setExpandedQuizQuestions((prev) => ({ ...prev, [newQ.id]: true }));
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

  const handleSave = () => {
    if (!formTitle.en.trim() || !formLongDesc.en.trim()) {
      toast.error("Missing fields: Title and full description are required.");
      return;
    }

    const topics = formTopics
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean)
      .map((topic, index) => ({
        name: { en: topic },
        sortOrder: index,
      }));

    const curriculum = modules.map((module, index) => ({
      order: index + 1,
      title: toRequiredML(module.title),
      description: toOptionalML(module.description),
      duration: toOptionalML(module.duration),
      contentBlocks: module.contentBlocks.map((block) => ({
        type: block.type,
        title: toOptionalML(block.title),
        content: toOptionalML(block.content),
        caption: toOptionalML(block.caption),
      })),
      quiz: module.quiz,
    }));

    const normalizedHeroImage = normalizeImageValue(heroImageUrl);
    const normalizedCoverImage = normalizeImageValue(coverImageUrl);
    const hasLocalImage =
      isLocalImageData(normalizedHeroImage) ||
      isLocalImageData(normalizedCoverImage);

    const payload: Partial<CreateAdminTrainingProgramPayload> = {
      title: toRequiredML(formTitle),
      shortDescription: toOptionalML(formDesc),
      fullDescription: toRequiredML(formLongDesc),
      type: formType,
      level: formLevel,
      priceRwf: Number.parseFloat(formPrice || "0") || 0,
      durationWeeks: parseDurationWeeks(formDuration),
      capacity: Number.parseInt(formMaxParticipants || "30", 10) || 30,
      language: formLanguage.trim() || "en",
      isPublished: formStatus === "open",
      isFeatured,
      heroImage: isLocalImageData(normalizedHeroImage)
        ? undefined
        : normalizedHeroImage,
      coverImage: isLocalImageData(normalizedCoverImage)
        ? undefined
        : normalizedCoverImage,
      topics,
      curriculum,
      startDate: formStartDate
        ? new Date(`${formStartDate}T00:00:00.000Z`).toISOString()
        : undefined,
    };

    setIsSaving(true);

    void updateAdminTrainingProgram(id, payload)
      .then(() => {
        if (hasLocalImage) {
          toast.warning("Local image not persisted", {
            description:
              "Use the URL mode for cover image to persist it to backend fields.",
          });
        }

        toast.success(
          `Program Updated! \"${formTitle.en}\" has been saved successfully.`,
        );
        toast.warning("Some fields are not persisted by backend yet", {
          description:
            "Instructor details, requirements, outcomes, location, certificate template, and rich status are currently frontend-only.",
        });
        router.push("/admin/education");
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to update program";
        toast.error("Update failed", { description: message });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading program...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{loadError}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/education")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            Edit: {formTitle.en || "Training Program"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update program content, curriculum, and certificate
          </p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="certificate">Certificate</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <MultiLangInput
              label="Program Title *"
              value={formTitle}
              onChange={setFormTitle}
              required
            />
            <MultiLangInput
              label="Short Description *"
              value={formDesc}
              onChange={setFormDesc}
              type="textarea"
              rows={2}
              required
            />
            <MultiLangInput
              label="Full Description"
              value={formLongDesc}
              onChange={setFormLongDesc}
              type="textarea"
              rows={5}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={formType}
                  onValueChange={(v) => setFormType(v as typeof formType)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select
                  value={formLevel}
                  onValueChange={(v) => setFormLevel(v as typeof formLevel)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
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
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={formMaxParticipants}
                  onChange={(e) => setFormMaxParticipants(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>
                  Instructor <NotPersistedBadge />
                </Label>
                <Input
                  value={formInstructor}
                  onChange={(e) => setFormInstructor(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <MultiLangInput
              label="Instructor Bio (Not persisted yet)"
              value={formInstructorBio}
              onChange={setFormInstructorBio}
              type="textarea"
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Language</Label>
                <Input
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>
                  Location <NotPersistedBadge />
                </Label>
                <Input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <MediaUploader
              label="Cover Image"
              value={coverImageUrl || heroImageUrl || ""}
              onChange={(value) => {
                setCoverImageUrl(value);
                setHeroImageUrl(value);
              }}
              description="Persisted when entered as URL. Local uploads are preview-only until backend media upload is added."
            />

            <div>
              <Label>Topics (comma-separated)</Label>
              <Input
                value={formTopics}
                onChange={(e) => setFormTopics(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <MultiLangInput
              label="Requirements (one per line) (Not persisted yet)"
              value={formRequirements}
              onChange={setFormRequirements}
              type="textarea"
              rows={3}
            />
            <MultiLangInput
              label="What Students Get (one per line) (Not persisted yet)"
              value={formWhatYouGet}
              onChange={setFormWhatYouGet}
              type="textarea"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="curriculum">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Curriculum
                </h2>
                <p className="text-sm text-muted-foreground">
                  {modules.length} module(s)
                </p>
              </div>
              <Button className="gap-1.5" onClick={addModule}>
                <Plus className="h-4 w-4" /> Add Module
              </Button>
            </div>

            {modules.length === 0 && (
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No modules yet</p>
              </div>
            )}

            <div className="space-y-3">
              {modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="border border-border rounded-xl overflow-hidden"
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
                      <span className="text-sm font-medium text-foreground">
                        {mod.title.en || "Untitled Module"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({mod.contentBlocks.length} blocks)
                      </span>
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
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {expandedModuleId === mod.id && (
                    <div className="border-t border-border p-5 bg-accent/10 space-y-4">
                      <MultiLangInput
                        label="Module Title *"
                        value={toML(mod.title)}
                        onChange={(v) => updateModuleML(mod.id, "title", v)}
                        placeholder="e.g., Introduction"
                      />

                      <div>
                        <Label className="text-xs">Duration</Label>
                        <Input
                          value={mod.duration.en}
                          onChange={(e) =>
                            updateModule(mod.id, "duration", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <MultiLangInput
                        label="Description"
                        value={toML(mod.description)}
                        onChange={(v) =>
                          updateModuleML(mod.id, "description", v)
                        }
                        placeholder="What this module covers..."
                        type="textarea"
                        rows={2}
                      />

                      <Separator />

                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold">
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
                              className="h-8 gap-1.5 text-xs px-2.5"
                              onClick={() => addContentBlock(mod.id, type)}
                            >
                              {blockTypeIcon(type)}{" "}
                              <span className="hidden sm:inline capitalize">
                                {type}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {mod.contentBlocks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                          Add content blocks above
                        </p>
                      )}

                      <div className="space-y-2">
                        {mod.contentBlocks.map((block) => (
                          <div
                            key={block.id}
                            className="bg-card border border-border rounded-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleContentBlockExpanded(block.id)
                              }
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-accent/40"
                            >
                              <div className="flex items-center gap-2">
                                <div className="text-muted-foreground">
                                  {blockTypeIcon(block.type)}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                  {block.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeContentBlock(mod.id, block.id);
                                  }}
                                >
                                  <X className="h-3 w-3 text-destructive" />
                                </Button>
                                {expandedContentBlocks[block.id] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </div>
                            </button>

                            {expandedContentBlocks[block.id] && (
                              <div className="p-4 border-t border-border space-y-3">
                                <MultiLangInput
                                  label="Block Title"
                                  value={toML(block.title)}
                                  onChange={(v) =>
                                    updateContentBlockML(
                                      mod.id,
                                      block.id,
                                      "title",
                                      v,
                                    )
                                  }
                                  placeholder="Block title"
                                />

                                {block.type === "text" ||
                                block.type === "checklist" ? (
                                  <MultiLangInput
                                    label={
                                      block.type === "text"
                                        ? "Text Content"
                                        : "Checklist Items"
                                    }
                                    value={toML(block.content)}
                                    onChange={(v) =>
                                      updateContentBlockML(
                                        mod.id,
                                        block.id,
                                        "content",
                                        v,
                                      )
                                    }
                                    placeholder={
                                      block.type === "checklist"
                                        ? "Item 1|Item 2|Item 3"
                                        : "Enter text content..."
                                    }
                                    type="textarea"
                                    rows={block.type === "text" ? 4 : 3}
                                  />
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant={
                                          (contentInputMode[block.id] ??
                                            "url") === "url"
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() =>
                                          setContentInputMode((prev) => ({
                                            ...prev,
                                            [block.id]: "url",
                                          }))
                                        }
                                      >
                                        Use URL
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={
                                          (contentInputMode[block.id] ??
                                            "url") === "upload"
                                            ? "default"
                                            : "outline"
                                        }
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() =>
                                          setContentInputMode((prev) => ({
                                            ...prev,
                                            [block.id]: "upload",
                                          }))
                                        }
                                      >
                                        Upload File
                                      </Button>
                                    </div>

                                    {(contentInputMode[block.id] ?? "url") ===
                                    "url" ? (
                                      <div>
                                        <Label className="text-xs">
                                          {block.type} URL
                                        </Label>
                                        <Input
                                          value={toML(block.content).en || ""}
                                          onChange={(e) =>
                                            updateContentBlockML(
                                              mod.id,
                                              block.id,
                                              "content",
                                              {
                                                ...toML(block.content),
                                                en: e.target.value,
                                              },
                                            )
                                          }
                                          placeholder={`${block.type} URL`}
                                          className="h-9 mt-1"
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <Label className="text-xs">
                                          Upload {block.type} file
                                        </Label>
                                        <Input
                                          type="file"
                                          accept={
                                            block.type === "image"
                                              ? "image/*"
                                              : block.type === "video"
                                                ? "video/*"
                                                : "*/*"
                                          }
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            handleBlockFileUpload(
                                              mod.id,
                                              block.id,
                                              file,
                                            );
                                          }}
                                          className="h-9"
                                        />
                                        <p className="text-[11px] text-muted-foreground">
                                          Uploaded files are stored as encoded
                                          data in current backend contract.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {(block.type === "image" ||
                                  block.type === "video" ||
                                  block.type === "download") &&
                                  toML(block.content).en && (
                                    <div className="rounded-lg overflow-hidden border border-border bg-muted/20">
                                      {block.type === "image" && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={toML(block.content).en}
                                          alt={
                                            toML(block.title).en || "Preview"
                                          }
                                          className="w-full max-h-48 object-contain"
                                        />
                                      )}
                                      {block.type === "video" && (
                                        <video
                                          src={toML(block.content).en}
                                          controls
                                          className="w-full max-h-48"
                                        />
                                      )}
                                      {block.type === "download" && (
                                        <div className="flex items-center gap-2 p-3">
                                          <Download className="h-4 w-4 text-primary shrink-0" />
                                          <div className="min-w-0">
                                            <MediaSourceLink
                                              source={toML(block.content).en}
                                            />
                                          </div>
                                        </div>
                                      )}
                                      {(block.type === "image" ||
                                        block.type === "video") && (
                                        <MediaSourceLink
                                          source={toML(block.content).en}
                                        />
                                      )}
                                    </div>
                                  )}

                                <MultiLangInput
                                  label="Caption"
                                  value={toML(block.caption)}
                                  onChange={(v) =>
                                    updateContentBlockML(
                                      mod.id,
                                      block.id,
                                      "caption",
                                      v,
                                    )
                                  }
                                  placeholder="Caption"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

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

                            <div className="space-y-4">
                              {mod.quiz.questions.map((q, qi) => (
                                <div
                                  key={q.id}
                                  className="bg-card border border-border rounded-lg overflow-hidden shadow-sm border-l-4 border-l-amber-500/30"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedQuizQuestions((prev) => ({
                                        ...prev,
                                        [q.id]: !prev[q.id],
                                      }))
                                    }
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-accent/30 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest shrink-0">
                                        Question {qi + 1}
                                      </span>
                                      {q.question.en && (
                                        <span className="text-xs text-muted-foreground truncate">
                                          — {q.question.en}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeQuizQuestion(mod.id, q.id);
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                      {expandedQuizQuestions[q.id] ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </button>

                                  {expandedQuizQuestions[q.id] && (
                                    <div className="p-4 border-t border-border space-y-4">
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
                                  )}
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
        </TabsContent>

        <TabsContent value="certificate">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Certificate settings are currently not persisted by backend
              program DTO.
            </div>

            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl">
              <div>
                <Label>Enable Certificate</Label>
                <p className="text-xs text-muted-foreground">
                  Issue a certificate upon completion
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                    placeholder="Program name"
                  />
                  <MultiLangInput
                    label="Description"
                    value={certTemplate.description}
                    onChange={(v) =>
                      setCertTemplate({ ...certTemplate, description: v })
                    }
                    placeholder="Has successfully completed..."
                    type="textarea"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Signatory Name</Label>
                      <Input
                        value={certTemplate.signatoryName}
                        onChange={(e) =>
                          setCertTemplate({
                            ...certTemplate,
                            signatoryName: e.target.value,
                          })
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Signatory Title</Label>
                      <Input
                        value={certTemplate.signatoryTitle}
                        onChange={(e) =>
                          setCertTemplate({
                            ...certTemplate,
                            signatoryTitle: e.target.value,
                          })
                        }
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Logo URL</Label>
                    <Input
                      value={certTemplate.logoUrl || ""}
                      onChange={(e) =>
                        setCertTemplate({
                          ...certTemplate,
                          logoUrl: e.target.value,
                        })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Badge / Border Color</Label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <input
                        type="color"
                        value={certTemplate.badgeColor}
                        onChange={(e) =>
                          setCertTemplate({
                            ...certTemplate,
                            badgeColor: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={certTemplate.badgeColor}
                        onChange={(e) =>
                          setCertTemplate({
                            ...certTemplate,
                            badgeColor: e.target.value,
                          })
                        }
                        className="max-w-32"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Live Preview</Label>
                  <div
                    className="border-4 border-double rounded-xl p-8 text-center space-y-3 bg-card"
                    style={{ borderColor: certTemplate.badgeColor }}
                  >
                    <div className="flex justify-center">
                      {certTemplate.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={certTemplate.logoUrl}
                          alt="Logo"
                          className="h-12 object-contain"
                        />
                      ) : (
                        <div>
                        </div>
                      )}
                    </div>
                    <Award
                      className="h-8 w-8 mx-auto"
                      style={{ color: certTemplate.badgeColor }}
                    />
                    <h3 className="text-lg font-bold font-heading text-foreground">
                      {certTemplate.title.en || "Certificate Title"}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                      {certTemplate.subtitle.en || "Program Name"}
                    </p>
                    <div className="py-3">
                      <p className="text-sm text-foreground">
                        This certifies that
                      </p>
                      <p className="text-xl font-bold text-primary my-1 font-heading">
                        [Student Name]
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {certTemplate.description.en || "Description..."}
                      </p>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">
                          Date
                        </p>
                        <p className="text-xs font-medium text-foreground border-t border-foreground pt-1 px-3">
                          [Date]
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">
                          {certTemplate.signatoryTitle || "Title"}
                        </p>
                        <p className="text-xs font-medium text-foreground border-t border-foreground pt-1 px-3 italic">
                          {certTemplate.signatoryName || "Name"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 border-2 border-border rounded-lg flex items-center justify-center bg-accent/30">
                          <QrCode className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-[9px] text-muted-foreground">
                          Scan to verify
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-foreground">
              Program Settings
            </h2>
            <div>
              <Label>
                Status
              </Label>
              <Select
                value={formStatus}
                onValueChange={(v) => setFormStatus(v as typeof formStatus)}
              >
                <SelectTrigger className="mt-1.5 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="open">Open for Enrollment</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
              <h3 className="text-sm font-semibold text-destructive mb-1">
                Danger Zone
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Permanently delete this program and all associated data.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  toast.error("Program Deleted");
                  router.push("/admin/education");
                }}
              >
                Delete Program
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
