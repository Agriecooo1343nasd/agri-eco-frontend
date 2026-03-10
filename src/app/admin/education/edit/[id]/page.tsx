"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  trainingPrograms,
  type ProgramModule,
  type ContentBlock,
  type CertificateTemplate,
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

export default function Page() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params.id || "";
  const program = trainingPrograms.find((p) => p.id === id);

  const [formTitle, setFormTitle] = useState<MultiLangValue>(
    toML(program?.title),
  );
  const [formDesc, setFormDesc] = useState<MultiLangValue>(
    toML(program?.description),
  );
  const [formLongDesc, setFormLongDesc] = useState<MultiLangValue>(
    toML(program?.longDescription),
  );
  const [formType, setFormType] = useState<
    "workshop" | "course" | "certification"
  >(program?.type || "course");
  const [formLevel, setFormLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >(
    (program?.level.en as "beginner" | "intermediate" | "advanced") ||
      "beginner",
  );
  const [formPrice, setFormPrice] = useState(program?.price?.toString() || "");
  const [formMaxParticipants, setFormMaxParticipants] = useState(
    program?.maxParticipants?.toString() || "",
  );
  const [formDuration, setFormDuration] = useState(program?.duration.en || "");
  const [formStartDate, setFormStartDate] = useState(
    program?.startDate.en || "",
  );
  const [formTopics, setFormTopics] = useState(
    program?.topics?.map((t) => t.en).join(", ") || "",
  );
  const [formInstructor, setFormInstructor] = useState(
    program?.instructor?.en || "",
  );
  const [formInstructorBio, setFormInstructorBio] = useState<MultiLangValue>(
    toML(program?.instructorBio),
  );
  const [formRequirements, setFormRequirements] = useState<MultiLangValue>(
    toML(program?.requirements?.map((r) => r.en).join("\n")),
  );
  const [formWhatYouGet, setFormWhatYouGet] = useState<MultiLangValue>(
    toML(program?.whatYouGet?.map((w) => w.en).join("\n")),
  );
  const [formLanguage, setFormLanguage] = useState(program?.language?.en || "");
  const [formLocation, setFormLocation] = useState(program?.location?.en || "");
  const [formStatus, setFormStatus] = useState<
    "open" | "upcoming" | "full" | "completed"
  >(
    (["open", "upcoming", "full", "completed"].includes(program?.status ?? "")
      ? program?.status
      : "upcoming") as "open" | "upcoming" | "full" | "completed",
  );

  const [modules, setModules] = useState<ProgramModule[]>(
    program?.modules || [],
  );
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [certTemplate, setCertTemplate] = useState<CertificateTemplate>(
    program?.certificateTemplate || {
      enabled: false,
      title: emptyLangValue(),
      subtitle: emptyLangValue(),
      description: emptyLangValue(),
      signatoryName: "",
      signatoryTitle: "",
      badgeColor: "#16a34a",
      logoUrl: "",
    },
  );

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Program not found.</p>
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
      // duration is a MultiLangValue in this project
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
    if (!formTitle.en || !formDesc.en) {
      toast.error("Missing fields: Title and description are required.");
      return;
    }
    toast.success(
      `Program Updated! "${formTitle.en}" has been saved successfully.`,
    );
    router.push("/admin/education");
  };

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
            Edit: {program.title.en}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update program content, curriculum, and certificate
          </p>
        </div>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="certificate">Certificate</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
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
                <Label>Instructor</Label>
                <Input
                  value={formInstructor}
                  onChange={(e) => setFormInstructor(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <MultiLangInput
              label="Instructor Bio"
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
                <Label>Location</Label>
                <Input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Topics (comma-separated)</Label>
              <Input
                value={formTopics}
                onChange={(e) => setFormTopics(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <MultiLangInput
              label="Requirements (one per line)"
              value={formRequirements}
              onChange={setFormRequirements}
              type="textarea"
              rows={3}
            />
            <MultiLangInput
              label="What Students Get (one per line)"
              value={formWhatYouGet}
              onChange={setFormWhatYouGet}
              type="textarea"
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Curriculum Tab */}
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
                        {(typeof mod.title === "string"
                          ? mod.title
                          : mod.title.en) || "Untitled Module"}
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
                            className="flex items-start gap-3 bg-card border border-border rounded-lg p-4"
                          >
                            <div className="mt-1 text-muted-foreground">
                              {blockTypeIcon(block.type)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground uppercase">
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
                                <div>
                                  <Label className="text-xs">
                                    {block.type} URL
                                  </Label>
                                  <Input
                                    value={
                                      typeof block.content === "string"
                                        ? block.content
                                        : block.content.en || ""
                                    }
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Certificate Tab */}
        <TabsContent value="certificate">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
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
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                          <Leaf className="h-6 w-6 text-primary-foreground" />
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

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-foreground">
              Program Settings
            </h2>
            <div>
              <Label>Status</Label>
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
